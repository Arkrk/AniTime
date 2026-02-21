"use server";

export async function getOGImage(url: string): Promise<string | null> {
  if (!url) return null;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒でタイムアウト

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AniTimeBot/1.0)",
      },
      signal: controller.signal,
      next: { revalidate: 3600 }, // 1時間キャッシュ
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const html = await res.text();
    
    // og:image を検索
    const match = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) 
      || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i)
      || html.match(/<meta\s+name=["']og:image["']\s+content=["']([^"']+)["']/i)
      || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']og:image["']/i);

    if (match && match[1]) {
      let imageUrl = match[1];
      
      // 相対URLを絶対URLに変換
      if (imageUrl.startsWith("/")) {
        const urlObj = new URL(url);
        imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
      }
      
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch OG image for ${url}:`, error);
    return null;
  }
}
