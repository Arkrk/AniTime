import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function AboutApp() {
  return (
    <div className="bg-primary-foreground rounded-md border overflow-hidden">
      <Link href="/about" className="block border-b p-4 hover:bg-accent">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-base">AniTime について</h3>
            <p className="text-sm text-muted-foreground mt-1">
              使い方や開発経緯、技術スタックなど
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </Link>
      <Link href="/privacy" className="block p-4 hover:bg-accent">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-base">プライバシーポリシー</h3>
            <p className="text-sm text-muted-foreground mt-1">
              個人情報の取り扱いに関するポリシー
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </Link>
    </div>
  );
}
