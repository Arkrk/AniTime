// 放送開始クールごとのバッジスタイル
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