import { BookOpen } from "lucide-react";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { WorkSynopsisContent } from "./WorkSynopsisContent";

export async function WorkSynopsis({ synopsis }: { synopsis: string | null | undefined }) {
  if (!synopsis) return null;

  const htmlContent = (
    await remark()
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(synopsis)
  ).toString();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="text-muted-foreground" />
        <h2 className="text-lg font-bold">あらすじ</h2>
      </div>
      <WorkSynopsisContent htmlContent={htmlContent} />
    </div>
  );
}
