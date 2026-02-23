"use server";

import ogs from 'open-graph-scraper';

export async function getOGImage(url: string): Promise<string | null> {
  if (!url) return null;
  
  try {
    const { result } = await ogs({
      url,
      timeout: 5000,
      fetchOptions: {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AniTimeBot/1.0)",
        },
        next: { revalidate: 3600 },
      } as any,
    });

    if (result.ogImage && result.ogImage.length > 0) {
      return result.ogImage[0].url;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch OG image for ${url}:`, error);
    return null;
  }
}

