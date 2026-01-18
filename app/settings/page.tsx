"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { VisibilitySettings } from "@/components/settings/VisibilitySettings";
import { PersonalDataSettings } from "@/components/settings/PersonalDataSettings";
import { AdminSettings } from "@/components/settings/AdminSettings";

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <PageHeader title="設定" />

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="space-y-8">
          <VisibilitySettings />

          <section>
            <h2 className="text-xl font-bold mb-4">個人データ</h2>
            <PersonalDataSettings />
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">管理者</h2>
            <AdminSettings />
          </section>
        </div>
      </main>
    </div>
  );
}
