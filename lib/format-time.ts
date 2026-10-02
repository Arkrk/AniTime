import { format, toZonedTime } from "date-fns-tz";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInMonths } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * 絶対時間を相対時間に変換
 * @param dateInput 絶対時間
 * @returns 相対時間
 */
export function formatRelativeTime(dateInput: string | Date) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);
  const diffMonths = differenceInMonths(now, date);

  if (diffMinutes <= 0) {
    return "たった今";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else if (diffDays <= 30) {
    return `${diffDays}日前`;
  } else if (diffMonths < 12) {
    return `${Math.max(1, diffMonths)}か月前`;
  } else {
    return format(toZonedTime(date, "Asia/Tokyo"), "yyyy年M月d日", { locale: ja });
  }
}

export const START_HOUR = 5; // 1日の開始時間

/**
 * 時刻の文字列 (HH:MM:SS) を30時間制の表示形式 (HH:MM) に変換
 * @param timeStr 時刻の文字列
 * @param startTimeStr 開始時刻の文字列
 * @returns 変換後の時刻文字列
 */
export const formatTime30 = (timeStr: string, startTimeStr?: string) => {
  if (!timeStr) return "";

  let { minutesFromStart: endMin } = calculatePosition(timeStr);

  if (startTimeStr) {
    const { minutesFromStart: startMin } = calculatePosition(startTimeStr);
    if (endMin < startMin) {
      endMin += 24 * 60;
    }
  }

  const hour = Math.floor(endMin / 60) + START_HOUR;
  const m = endMin % 60;

  const minStr = m.toString().padStart(2, "0");
  return `${hour}:${minStr}`;
};

/**
 * 開始時間からの経過分数と翌日かどうかを計算
 * @param timeStr 時刻の文字列
 * @returns 開始時間からの経過分数、翌日フラグ
 */
export const calculatePosition = (timeStr: string) => {
  const [h, m] = timeStr.split(":").map(Number);

  // 30時間制対応
  let hour = h;
  let isNextDay = false;
  if (hour < START_HOUR) {
    hour += 24;
    isNextDay = true;
  }

  // 開始時間からの経過分数
  const minutesFromStart = (hour - START_HOUR) * 60 + m;

  return { minutesFromStart, isNextDay };
};
