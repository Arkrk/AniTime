"use server";

import { requireAuth } from "@/lib/auth";

export async function getYoutubeVideoPublishedAt(vid: string) {
  // 権限チェック (失敗した場合はエラーがスローされる)
  await requireAuth();

  let uploadedAt = null;
  if (process.env.YOUTUBE_API_KEY) {
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${vid}&key=${process.env.YOUTUBE_API_KEY}`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length === 0) {
          return { error: "VIDEO_NOT_FOUND" };
        }
        if (data.items && data.items.length > 0) {
          uploadedAt = data.items[0].snippet.publishedAt;
        }
      }
    } catch (e) {
      console.error("YouTube API error:", e);
    }
  }

  return { uploadedAt };
}
