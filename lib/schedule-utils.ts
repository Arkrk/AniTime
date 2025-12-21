import { ProgramData, ChannelLayout, LayoutProgram } from "@/types/schedule";

// 設定
export const START_HOUR = 20; // 20時開始
export const END_HOUR = 29;   // 29時(翌5時)終了
export const HOUR_HEIGHT = 180; // 1時間あたりの高さ(px) -> 1分 = 3px
export const COL_WIDTH = 160;   // 1列(レーン)の幅(px)
export const MIN_HEIGHT = 3; // 1分あたりのpx数

/**
 * "HH:MM:SS" 形式の文字列を、開始時刻(20:00)からの経過分等に変換する
 */
export const calculatePosition = (timeStr: string) => {
  const [h, m] = timeStr.split(":").map(Number);
  
  // 30時間制対応: 0時〜19時は「翌日」とみなして +24時間する
  // (今回の仕様では00:00〜05:00等のデータが来る想定)
  let hour = h;
  let isNextDay = false;
  if (hour < START_HOUR) {
    hour += 24;
    isNextDay = true;
  }

  // 開始時間(20:00)からの経過分数
  const minutesFromStart = (hour - START_HOUR) * 60 + m;
  
  return { minutesFromStart, isNextDay };
};

/**
 * 番組データの配列を受け取り、配置計算済みのチャンネル配列を返す
 */
export const calculateLayout = (programs: ProgramData[]): ChannelLayout[] => {
  // 1. チャンネルIDでグループ化
  const channelsMap = new Map<number, ProgramData[]>();
  
  // チャンネル名などのメタデータを保持するためのMap
  const channelMeta = new Map<number, { name: string; order: number }>();

  programs.forEach((p) => {
    if (!channelsMap.has(p.channel_id)) {
      channelsMap.set(p.channel_id, []);
      channelMeta.set(p.channel_id, { name: p.channel_name, order: p.channel_order });
    }
    channelsMap.get(p.channel_id)!.push(p);
  });

  const result: ChannelLayout[] = [];

  // 2. 各チャンネルごとに配置計算
  channelsMap.forEach((progs, channelId) => {
    // 時間順にソート（重要）
    progs.sort((a, b) => {
      const posA = calculatePosition(a.start_time).minutesFromStart;
      const posB = calculatePosition(b.start_time).minutesFromStart;
      return posA - posB;
    });

    const layoutProgs: LayoutProgram[] = [];
    const lanes: number[] = []; // 各レーンの「埋まっている最後の時間(分)」を保持

    progs.forEach((prog) => {
      const { minutesFromStart: startMin, isNextDay } = calculatePosition(prog.start_time);
      const { minutesFromStart: endMin } = calculatePosition(prog.end_time);

      // 終了時間が開始時間より前になってしまう場合（日またぎ計算ミス等）のガード
      const safeEndMin = endMin < startMin ? endMin + 24 * 60 : endMin; 
      const duration = safeEndMin - startMin;

      // 配置座標
      const top = startMin * MIN_HEIGHT;
      const height = Math.max(duration * MIN_HEIGHT, 20); // 最低高さを確保

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

    const meta = channelMeta.get(channelId)!;
    result.push({
      id: channelId,
      name: meta.name,
      order: meta.order,
      maxLanes: lanes.length > 0 ? lanes.length : 1, // 最低1列
      width: (lanes.length || 1) * COL_WIDTH,
      programs: layoutProgs,
    });
  });

  // チャンネルの表示順序(order)でソート
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

  // 20時より前（00:00〜19:59）は翌日扱いとして +24 する
  // ※ START_HOUR定数を使っても良いですが、単純化のため20未満で判定
  if (hour < 20) {
    hour += 24;
  }

  // ゼロ埋めは分のみ行い、時間はそのまま（25時など）にする
  const minStr = m.toString().padStart(2, "0");
  
  return `${hour}:${minStr}`;
};