"use server";

import { requireAuth } from "@/lib/auth";

/**
 * Annict GraphQL API で作品情報を取得
 * @param titleQuery 作品タイトル（あいまい検索）
 * @returns 作品リスト
 */
export async function searchAnnictWorks(titleQuery: string) {
  await requireAuth();

  if (!titleQuery) return [];

  const token = process.env.ANNICT_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Annict のアクセストークンが設定されていません");
  }

  const query = `
    query($titles: [String!]) {
      searchWorks(titles: $titles, first: 20) {
        edges {
          node {
            annictId
            title
            titleKana
            officialSiteUrl
            twitterUsername
            wikipediaUrl
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.annict.com/graphql", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query,
      variables: {
        titles: [titleQuery]
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Annict API error: ${response.status}`);
  }

  const data = await response.json();
  const edges = data.data?.searchWorks?.edges || [];
  return edges.map((edge: any) => edge.node);
}
