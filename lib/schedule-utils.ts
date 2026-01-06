import { ProgramData, ChannelLayout, LayoutProgram, LayoutMode } from "@/types/schedule";

// 設定
export const START_HOUR = 6; // 6時開始
export const END_HOUR = 30;   // 30時(翌6時)終了
export const HOUR_HEIGHT = 240; // 1時間あたりの高さ(px) -> 1分 = 4px
export const COL_WIDTH = 160;   // 1列(レーン)の幅(px)
export const MIN_HEIGHT = 4; // 1分あたりのpx数

/**
 * "HH:MM:SS" 形式の文字列を、開始時刻(6:00)からの経過分等に変換する
 */
export const calculatePosition = (timeStr: string) => {
  const [h, m] = timeStr.split(":").map(Number);
  
  // 30時間制対応: 0時〜5時は「翌日」とみなして +24時間する
  let hour = h;
  let isNextDay = false;
  if (hour < START_HOUR) {
    hour += 24;
    isNextDay = true;
  }

  // 開始時間(6:00)からの経過分数
  const minutesFromStart = (hour - START_HOUR) * 60 + m;
  
  return { minutesFromStart, isNextDay };
};

/**
 * 番組データの配列を受け取り、配置計算済みのチャンネル配列を返す
 */
export const calculateLayout = (programs: ProgramData[], mode: LayoutMode): ChannelLayout[] => {
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
    } else {
      // week
      key = p.day_of_the_week;
    }
    
    if (!groupsMap.has(key)) {
      groupsMap.set(key, []);
      
      // メタデータもモードによって切り替え
      if (mode === "channel") {
        // チャンネル別
        const sortOrder = p.area_order * 1000 + p.channel_order;
        metaMap.set(key, { name: p.channel_name, order: sortOrder });
      } else if (mode === "area") {
        // エリア別
        metaMap.set(key, { name: p.area_name, order: p.area_order });
      } else {
        // 週間表示: 曜日ごと
        const dayLabel = ["", "月", "火", "水", "木", "金", "土", "日"][key] || "不明";
        metaMap.set(key, { name: dayLabel, order: key });
      }
    }
    groupsMap.get(key)!.push(p);
  });

  const result: ChannelLayout[] = [];

  groupsMap.forEach((progs, key) => {
    // ソート順: 開始時間(昇順) -> チャンネル順(昇順)
    // エリア表示の場合、同じ時間に複数のチャンネルが重なるため、チャンネル順序で左詰めにする
    progs.sort((a, b) => {
      const posA = calculatePosition(a.start_time).minutesFromStart;
      const posB = calculatePosition(b.start_time).minutesFromStart;
      
      if (posA !== posB) {
        return posA - posB; // 時間優先
      }
      // 時間が同じならチャンネルオーダー順
      return (a.area_order * 1000 + a.channel_order) - (b.area_order * 1000 + b.channel_order);
    });

    const layoutProgs: LayoutProgram[] = [];
    const lanes: number[] = [];

    progs.forEach((prog) => {
      const { minutesFromStart: startMin, isNextDay } = calculatePosition(prog.start_time);
      const { minutesFromStart: endMin } = calculatePosition(prog.end_time);
      
      // 終了時間が開始時間より前になってしまう場合（日またぎ計算ミス等）のガード
      const safeEndMin = endMin < startMin ? endMin + 24 * 60 : endMin;
      
      const top = startMin * MIN_HEIGHT;
      const height = Math.max((safeEndMin - startMin) * MIN_HEIGHT, 20);

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
        ...prog,
        top,
        height,
        laneIndex,
        isNextDay,
      });
    });

    const meta = metaMap.get(key)!;
    
    result.push({
      id: key,
      name: meta.name,
      order: meta.order,
      maxLanes: lanes.length > 0 ? lanes.length : 1, // 最低1列
      width: (lanes.length || 1) * COL_WIDTH,
      programs: layoutProgs,
    });
  });

  // 表示順(order)で列をソート
  return result.sort((a, b) => a.order - b.order);
};

/**
 * 時刻文字列 (HH:MM:SS) を30時間制の表示形式 (HH:MM) に変換する
 * 例: "01:30:00" -> "25:30", "22:00:00" -> "22:00"
 */
export const formatTime30 = (timeStr: string) => {
  if (!timeStr) return "";
  
  const [h, m] = timeStr.split(":").map(Number);
  let hour = h;

  // 6時より前（00:00〜05:59）は翌日扱いとして +24 する
  if (hour < 6) {
    hour += 24;
  }

  // ゼロ埋めは分のみ行い、時間はそのまま（25時など）にする
  const minStr = m.toString().padStart(2, "0");
  
  return `${hour}:${minStr}`;
};

/**
 * 番組の色IDからTailwindのクラス名を取得する
 */
export const getProgramColorClass = (colorId?: number | null) => {
  const colors = [
    "bg-purple-100 border-purple-200 text-purple-900", // 1: 紫色
    "bg-red-100 border-red-200 text-red-900",          // 2: 赤色
    "bg-orange-100 border-orange-200 text-orange-900", // 3: オレンジ色
    "bg-yellow-100 border-yellow-200 text-yellow-900", // 4: 黄色
    "bg-green-100 border-green-200 text-green-900",    // 5: 緑色
    "bg-blue-100 border-blue-200 text-blue-900",       // 6: 青色
    "bg-gray-200 border-gray-200 text-gray-800",       // 7: 灰色
    "bg-pink-100 border-pink-200 text-pink-900",       // 8: ピンク色
  ];
  return colors[(colorId || 1) - 1] || colors[6];
};
