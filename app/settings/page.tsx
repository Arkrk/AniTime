"use client";

import { PersonalDataSettings } from "@/components/settings/PersonalDataSettings";
import { AdminSettings } from "@/components/settings/AdminSettings";

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <main className="flex-1 p-4 md:px-8 md:pt-16 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-bold my-4">設定</h1>
        <div className="space-y-8 pt-4">
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
