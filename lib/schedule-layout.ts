import { ProgramData, ChannelLayout, LayoutProgram, LayoutMode } from "@/types/schedule";
import { calculatePosition } from "@/lib/format-time";

// デスクトップ表示用
export const HOUR_HEIGHT = 240; // 1時間あたりの高さ(px) -> 1分 = 4px
export const COL_WIDTH = 160;   // 1列(レーン)の幅(px)
export const MIN_HEIGHT = 4; // 1分あたりのpx数
export const TIME_COL_WIDTH = 35; // 時間軸列の幅
export const HEADER_HEIGHT = 35; // ヘッダー行の高さ

// モバイル表示用
export const MOBILE_HOUR_HEIGHT = 180;
export const MOBILE_COL_WIDTH = 120;
export const MOBILE_MIN_HEIGHT = 3;
export const MOBILE_TIME_COL_WIDTH = 28;
export const MOBILE_HEADER_HEIGHT = 28;

/**
 * 放送開始日の昇順で比較する（開始日未設定は末尾、同日ならID順）
 */
const compareByStartDate = (a: ProgramData, b: ProgramData): number => {
  if (a.start_date && b.start_date) {
    if (a.start_date !== b.start_date) {
      return a.start_date < b.start_date ? -1 : 1;
    }
  } else if (a.start_date) {
    return -1;
  } else if (b.start_date) {
    return 1;
  }
  return a.id - b.id;
};

type ProgramSlot = {
  programs: ProgramData[];
  startMin: number;
  endMin: number;
  isNextDay: boolean;
  channelOrder: number;
};

/**
 * チャンネル・曜日・放送時間が同じ番組を1つの枠にまとめる
 * @param programs 番組データの配列
 * @returns 表示枠の配列
 */
const groupBySlot = (programs: ProgramData[]): ProgramSlot[] => {
  const slotMap = new Map<string, ProgramSlot>();

  for (const p of programs) {
    const key = `${p.channel_id}|${p.day_of_the_week}|${p.start_time}|${p.end_time}`;
    const slot = slotMap.get(key);

    if (slot) {
      slot.programs.push(p);
    } else {
      const { minutesFromStart: startMin, isNextDay } = calculatePosition(p.start_time);
      const { minutesFromStart: endMin } = calculatePosition(p.end_time);
      slotMap.set(key, {
        programs: [p],
        startMin,
        endMin,
        isNextDay,
        channelOrder: p.area_order * 1000 + p.channel_order,
      });
    }
  }

  const slots = Array.from(slotMap.values());
  for (const slot of slots) {
    // 複数番組がある枠のみ、放送開始日の昇順に並べ替える
    if (slot.programs.length > 1) {
      slot.programs.sort(compareByStartDate);
    }
  }
  return slots;
};

/**
 * 番組データの配列を受け取り、配置計算済みのチャンネル配列を返す
 * @param programs 番組データの配列
 * @param mode レイアウトモード
 * @param options レイアウトオプション（areaOrder: エリアの表示順）
 * @returns レイアウト済みのチャンネル配列
 */
export const calculateLayout = (
  programs: ProgramData[],
  mode: LayoutMode,
  options?: { minHeight?: number; colWidth?: number; areaOrder?: number[] }
): ChannelLayout[] => {
  const minHeight = options?.minHeight ?? MIN_HEIGHT;
  const colWidth = options?.colWidth ?? COL_WIDTH;

  // ユーザー定義のエリア並び順（エリアID → 表示位置）
  const areaOrderIndex = new Map<number, number>();
  options?.areaOrder?.forEach((id, index) => areaOrderIndex.set(id, index));
  // 並び順に含まれないエリアを末尾に配置するためのオフセット
  const UNORDERED_AREA_OFFSET = 1_000_000;

  // グループ化のキーとメタデータを保持するMap
  const groupsMap = new Map<number, ProgramData[]>();
  const metaMap = new Map<number, { name: string; order: number }>();

  programs.forEach((p) => {
    // モードによってキーを切り替え
    let key: number;
    if (mode === "channel") {
      key = p.channel_id;
    } else if (mode === "area") {
      key = p.area_id;
    } else if (mode === "week") {
      key = p.day_of_the_week;
    } else { // mode === "season"
      key = p.season_id ?? 0;
    }

    if (!groupsMap.has(key)) {
      groupsMap.set(key, []);

      // メタデータもモードによって切り替え
      if (mode === "channel") {
        // チャンネルグルーピング
        const sortOrder = p.area_order * 1000 + p.channel_order;
        metaMap.set(key, { name: p.channel_name, order: sortOrder });
      } else if (mode === "area") {
        // エリアグルーピング（ユーザー定義の並び順を優先）
        const customIndex = areaOrderIndex.get(key);
        const order = customIndex !== undefined ? customIndex : UNORDERED_AREA_OFFSET + p.area_order;
        metaMap.set(key, { name: p.area_name, order });
      } else if (mode === "week") {
        // 週間番組表
        const dayLabel = ["", "月", "火", "水", "木", "金", "土", "日"][key] || "不明";
        metaMap.set(key, { name: dayLabel, order: key });
      } else { // mode === "season"
        // 前後番組表
        const order = (p.season_year ?? 2000) * 100 + (p.season_month ?? 1);
        metaMap.set(key, { name: p.season_name ?? "不明", order: -order });
      }
    }
    groupsMap.get(key)!.push(p);
  });

  const result: ChannelLayout[] = [];

  groupsMap.forEach((progs, key) => {
    // チャンネル・曜日・放送時間が同じ番組を1つの枠にまとめる
    const slots = groupBySlot(progs);

    // ソート順: 開始時間(昇順) -> チャンネル順(昇順)
    // エリア表示の場合、同じ時間に複数のチャンネルが重なるため、チャンネル順序で左詰めにする
    slots.sort((a, b) => a.startMin - b.startMin || a.channelOrder - b.channelOrder);

    const layoutProgs: LayoutProgram[] = [];
    const lanes: number[] = [];

    for (const slot of slots) {
      // 代表番組（放送開始日が最も早い番組）で配置を計算する
      const { programs: slotPrograms, startMin, endMin, isNextDay } = slot;

      // 終了時間が開始時間より前になってしまう場合（日またぎ計算ミス等）のガード
      const safeEndMin = endMin < startMin ? endMin + 24 * 60 : endMin;

      const top = startMin * minHeight;
      const height = Math.max((safeEndMin - startMin) * minHeight, 20);

      // レーン割当アルゴリズム
      // 空いている(startMinより前に終わっている)一番左のレーンを探す
      let laneIndex = -1;
      for (let i = 0; i < lanes.length; i++) {
        if (lanes[i] <= startMin) {
          laneIndex = i;
          break;
        }
      }

      // 空きがなければ新しいレーン作成
      if (laneIndex === -1) {
        laneIndex = lanes.length;
        lanes.push(safeEndMin);
      } else {
        // レーンの終了時間を更新
        lanes[laneIndex] = safeEndMin;
      }

      layoutProgs.push({
        ...slotPrograms[0],
        top,
        height,
        laneIndex,
        isNextDay,
        stackedPrograms: slotPrograms.length > 1 ? slotPrograms : undefined,
      });
    }

    const meta = metaMap.get(key)!;

    result.push({
      id: key,
      name: meta.name,
      order: meta.order,
      maxLanes: lanes.length > 0 ? lanes.length : 1, // 最低1列
      width: (lanes.length || 1) * colWidth,
      programs: layoutProgs,
    });
  });

  // 表示順(order)で列をソート
  return result.sort((a, b) => a.order - b.order);
};

