"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function PersonalDataSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const message = sessionStorage.getItem("settings-toast-message");
    const type = sessionStorage.getItem("settings-toast-type");

    if (message) {
      // 少し遅延させてトーストを表示 (Toasterのマウント待ち)
      setTimeout(() => {
        if (type === "error") {
          toast.error(message);
        } else {
          toast.success(message);
        }
      }, 100);
      sessionStorage.removeItem("settings-toast-message");
      sessionStorage.removeItem("settings-toast-type");
    }
  }, []);

  const handleExport = () => {
    try {
      if (typeof window === "undefined") return;
      const data: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          data[key] = localStorage.getItem(key) || "";
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `anitime-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("エクスポートが完了しました");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("エクスポートに失敗しました");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (typeof data !== "object" || data === null) {
          toast.error("無効なバックアップファイルです");
          return;
        }

        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === "string") {
            localStorage.setItem(key, value);
          }
        });

        sessionStorage.setItem("settings-toast-message", "インポートが完了しました");
        sessionStorage.setItem("settings-toast-type", "success");
        window.location.reload();
      } catch (error) {
        console.error("Import failed:", error);
        toast.error("インポートに失敗しました");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleReset = () => {
      localStorage.clear();
      sessionStorage.setItem("settings-toast-message", "リセットが完了しました");
      sessionStorage.setItem("settings-toast-type", "success");
      window.location.reload();
  }

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <div className="border-b p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-medium text-base text-gray-900">
            データをインポート
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            バックアップファイルから設定を復元します。
          </p>
        </div>
        <div>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImport}
          />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            インポート
          </Button>
        </div>
      </div>

      <div className="border-b p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-medium text-base text-gray-900">
            データをエクスポート
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            バックアップファイルをJSON形式で出力します。
          </p>
        </div>
        <div>
          <Button onClick={handleExport} variant="outline">
            エクスポート
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-none">
        <div>
          <h3 className="font-medium text-base text-gray-900">データをリセット</h3>
          <p className="text-sm text-gray-500 mt-1">
            保存した番組や設定をすべて削除します。
          </p>
        </div>
        <div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">リセット</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>データをリセットしますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  保存した番組やチャンネル設定など、すべての個人データがブラウザから削除されます。この操作は取り消せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="bg-red-600 hover:bg-red-700"
                >
                  リセット
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
