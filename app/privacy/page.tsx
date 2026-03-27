export const dynamic = "force-static";

import { getMarkDownContent } from "@/lib/markdown";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { BackButton } from "@/components/layout/BackButton";
import { defaultOpenGraph } from "@/lib/metadata";
import { History } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const postData = await getMarkDownContent("privacy-policy.md");

  if (!postData) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: postData.title,
    openGraph: { ...defaultOpenGraph, title: postData.title, url: "/privacy" },
    twitter: { title: postData.title },
  };
}

export default async function PrivacyPolicyPage() {
  const postData = await getMarkDownContent("privacy-policy.md");

  if (!postData) {
    notFound();
  }

  let formattedDate = "";
  if (postData.date) {
    const d = new Date(postData.date);
    formattedDate = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <BackButton />
      <main className="flex-1 px-4 pt-16 pb-16 md:px-8 md:pt-16 md:pb-32 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-bold my-4">{postData.title}</h1>
        <article className="prose prose-zinc dark:prose-invert max-w-none pt-4 prose-h2:border-b prose-h2:pb-2 prose-h2:mt-10 prose-h2:mb-4">
          <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </article>

        {postData.date && (
          <div className="mt-16 text-right text-sm text-muted-foreground flex items-center justify-end gap-1">
            <History className="h-4 w-4" />
            {formattedDate}に更新
          </div>
        )}
      </main>
    </div>
  );
}
