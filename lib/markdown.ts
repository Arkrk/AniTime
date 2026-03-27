import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDirectory = path.join(process.cwd(), "content");

export async function getMarkDownContent(fileName: string): Promise<{ contentHtml: string; [key: string]: any } | null> {
  const fullPath = path.join(contentDirectory, fileName);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // gray-matter を利用してメタデータセクションを解析
  const matterResult = matter(fileContents);

  // remark を利用して Markdown を HTML に変換
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);

  // リンクを新しいタブで開くようにする
  const contentHtml = processedContent.toString().replace(
    /<a /g,
    '<a target="_blank" rel="noopener noreferrer" '
  );

  return {
    contentHtml,
    ...(matterResult.data as { [key: string]: any }),
  };
}
