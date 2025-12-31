// DBから取得する生の番組データの型（結合済みデータを想定）
export type ProgramData = {
  id: number;
  work_id: number;
  name: string;
  start_date: string;
  start_time: string;
  end_time: string;
  channel_id: number;
  channel_name: string;
  channel_order: number;
  area_id: number;
  area_name: string;
  area_order: number;
  color?: number; // 1-8
  website_url: string | null;
  annict_url: string | null;
  wikipedia_url: string | null;
  x_username: string | null;
  tags: string[];
  version: string | null;
  note: string | null;
  day_of_the_week: number;
};

// 計算モードの型
export type LayoutMode = "channel" | "area";

// 描画用に計算された座標情報を持つ型
export type LayoutProgram = ProgramData & {
  top: number;       // CSS top (px)
  height: number;    // CSS height (px)
  laneIndex: number; // 左から何番目の列か (0〜)
  isNextDay: boolean; // 24時以降かどうか（表示上の判定用）
};

// チャンネルごとの描画データ
export type ChannelLayout = {
  id: number;
  name: string;
  order: number;
  width: number;     // チャンネル列全体の幅 (px)
  maxLanes: number;  // 最大重複数
  programs: LayoutProgram[];
};