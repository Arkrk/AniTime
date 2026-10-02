import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

const contentDirectory = path.join(process.cwd(), "content");

/**
 * Markdown ファイルを読み込み、HTMLに変換
 * @param fileName ファイル名
 * @returns 変換後のHTML、または null
 */
export async function getMarkDownContent(fileName: string): Promise<{ contentHtml: string;[key: string]: any } | null> {
  const fullPath = path.join(contentDirectory, fileName);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");

  // gray-matter を利用してメタデータセクションを解析
  const matterResult = matter(fileContents);

  // remark を利用して Markdown を HTML に変換
  const processedContent = await remark()
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
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
