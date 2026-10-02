// 曜日の定義（1:月曜 〜 7:日曜）
export const DAYS = [
  { id: 1, label: "月", en: "Mon" },
  { id: 2, label: "火", en: "Tue" },
  { id: 3, label: "水", en: "Wed" },
  { id: 4, label: "木", en: "Thu" },
  { id: 5, label: "金", en: "Fri" },
  { id: 6, label: "土", en: "Sat" },
  { id: 7, label: "日", en: "Sun" },
];

/**
 * 曜日文字列を曜日IDに変換
 * @param dayParam 曜日文字列（"mon", "tue"）
 * @param fallbackDay フォールバック用の曜日ID
 * @returns 曜日ID (1〜7)
 */
export function resolveDayId(dayParam: string | string[] | undefined, fallbackDay: number = 1): number {
  const param = Array.isArray(dayParam) ? dayParam[0] : dayParam;
  if (!param) return fallbackDay;

  const lowerParam = param.toLowerCase();
  const day = DAYS.find(d => d.en.toLowerCase() === lowerParam);
  return day ? day.id : fallbackDay;
}

/**
 * 曜日IDを曜日文字列に変換
 * @param dayId 曜日ID (1〜7)
 * @returns 曜日文字列（"mon", "tue"）
 */
export function getDayString(dayId: number): string {
  const day = DAYS.find(d => d.id === dayId);
  return day ? day.en.toLowerCase() : "mon";
}
