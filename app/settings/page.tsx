"use client";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/login";
import { VisibilitySettings } from "@/components/settings/VisibilitySettings";

export default function SettingsPage() {
  const { user, loading, message, handleLogin, handleLogout } = useLogin();

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <PageHeader title="設定" />

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="space-y-8">
          <VisibilitySettings />

          <section>
            <h2 className="text-xl font-bold mb-4">管理者ログイン</h2>
            <div className="p-6 rounded-xl border bg-gray-50">
              {loading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  確認中...
                </div>
              ) : user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-600" />
                    ログイン中: {user.email}
                  </div>
                  <Button onClick={handleLogout} variant="outline">
                    ログアウト
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    管理者権限を持つGoogleアカウントでログイン
                  </p>
                  <Button onClick={handleLogin}>
                    Googleでログイン
                  </Button>
                </div>
              )}
              
              {message && (
                <p className={`mt-4 text-sm ${message.includes("権限") || message.includes("失敗") ? "text-red-500" : "text-gray-600"}`}>
                  {message}
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
