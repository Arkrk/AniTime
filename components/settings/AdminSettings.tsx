"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/login";
import { toast } from "sonner";

export function AdminSettings() {
  const { user, loading, message, handleLogin, handleLogout } = useLogin();

  useEffect(() => {
    if (message) {
      if (message.includes("失敗") || message.includes("権限")) {
        toast.error(message);
      } else {
        toast.success(message);
      }
    }
  }, [message]);

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-medium text-base text-gray-900">管理者アカウント</h3>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? "確認中..." : user ? `ログイン中: ${user.email}` : "未ログイン"}
            </p>
          </div>
        </div>

        <div>
          {loading ? (
            <Button variant="ghost" disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              読み込み中
            </Button>
          ) : user ? (
            <Button onClick={handleLogout} variant="outline">
              ログアウト
            </Button>
          ) : (
            <Button onClick={handleLogin} variant="outline">
              Googleでログイン
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
