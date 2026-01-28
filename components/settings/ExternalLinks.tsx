import { ExternalLink } from "lucide-react";

export function ExternalLinks() {
  return (
    <div className="rounded-md border overflow-hidden">
      <a
        href="https://arkxv.notion.site/12bc003785008090871bcde77dce5ba4"
        target="_blank"
        rel="noopener noreferrer"
        className="block border-b p-4 hover:bg-accent"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-base">情報提供フォーム</h3>
            <p className="text-sm text-muted-foreground mt-1">
              番組データの提供や修正依頼を送信できます。
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </a>

      <a
        href="https://arkxv.notion.site/programs"
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 hover:bg-accent"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-base">過去の番組表</h3>
            <p className="text-sm text-muted-foreground mt-1">
              2025年以前の番組表をスプレッドシートで確認できます。
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </a>
    </div>
  );
}
