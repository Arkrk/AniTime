/**
 * 番組の色IDに対応した Tailwind CSS のクラス名を返す
 */
export const getProgramColorClass = (colorId?: number | null) => {
  const colors = [
    // 1: AT-X 最速放送（1週間先行）
    "bg-purple-200 border-purple-300 text-purple-900 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-100",
    // 2: AT-X 最速放送
    "bg-red-200 border-red-300 text-red-900 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
    // 3: 最速放送
    "bg-orange-200 border-orange-300 text-orange-900 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
    // 4: 同日時差遅れ放送
    "bg-yellow-200 border-yellow-300 text-yellow-900 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-100",
    // 5: 1～6日遅れ放送
    "bg-green-200 border-green-300 text-green-900 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
    // 6: 1週以上遅れ放送
    "bg-sky-200 border-sky-300 text-sky-900 dark:bg-sky-900 dark:border-sky-700 dark:text-sky-100",
    // 7: 旧作・再放送
    "bg-slate-300 border-slate-400 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100",
    // 8: 関連番組
    "bg-muted text-foreground",
    // 9: 未確定の情報
    "bg-background border-dashed border-chart-2 text-muted-foreground",
  ];
  return colors[(colorId || 1) - 1] || colors[8];
};

/**
 * 放送開始クールごとのバッジスタイルを返す
 * @param month 放送開始月
 * @returns Tailwind CSS のクラス
 */
export const getSeasonBadgeClass = (month: number): string => {
  if (month >= 1 && month <= 3) {
    return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
  }
  if (month >= 4 && month <= 6) {
    return "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300";
  }
  if (month >= 7 && month <= 9) {
    return "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300";
  }
  if (month >= 10 && month <= 12) {
    return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
  }
  return "";
};