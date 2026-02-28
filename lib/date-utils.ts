import { format, toZonedTime } from "date-fns-tz";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInMonths } from "date-fns";
import { ja } from "date-fns/locale";

export function formatRelativeTime(dateInput: string | Date) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);
  const diffMonths = differenceInMonths(now, date);

  if (diffMinutes < 0) {
     // 未来の日付の場合
     return "たった今";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else if (diffDays < 30) {
    return `${diffDays}日前`;
  } else if (diffMonths < 12) {
    return `${diffMonths}か月前`;
  } else {
    return format(toZonedTime(date, "Asia/Tokyo"), "yyyy年M月d日", { locale: ja });
  }
}
