import type { Metadata } from "next";
import { PersonalDataSettings } from "@/components/settings/PersonalDataSettings";
import { AdminSettings } from "@/components/settings/AdminSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { InstallApp } from "@/components/settings/InstallApp";
import { ExternalLinks } from "@/components/settings/ExternalLinks";
import { defaultOpenGraph } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "設定",
  openGraph: { ...defaultOpenGraph, title: "設定", url: "/settings" },
  twitter: { title: "設定" },
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <main className="flex-1 px-4 pt-8 pb-16 md:px-8 md:pt-16 md:pb-32 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-bold my-4">設定</h1>
        <div className="space-y-8 pt-4">
          <InstallApp />
          <section>
            <h2 className="text-lg font-bold mb-4">外観</h2>
            <AppearanceSettings />
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4">個人データ</h2>
            <PersonalDataSettings />
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4">関連リンク</h2>
            <ExternalLinks />
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4">管理者</h2>
            <AdminSettings />
          </section>
        </div>
      </main>
    </div>
  );
}
