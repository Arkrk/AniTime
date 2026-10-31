"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { toBlob } from "html-to-image";
import { ProgramData } from "@/types/schedule";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share, FileText, TableProperties, Image, Download } from "lucide-react";
import { formatTime30 } from "@/lib/format-time";
import { Season } from "@/lib/get-seasons";
import { DAYS } from "@/lib/format-days";
import { format, isValid, parseISO } from "date-fns";
import { toast } from "sonner";
import { useOs } from "@/hooks/use-os";
import { SavedTimeTableExport } from "@/components/saved/SavedTimeTableExport";

// 出力画像の最大ピクセル数（iOS Safari の Canvas 上限 16,777,216px を下回るよう設定）
const MAX_CANVAS_PIXELS = 16_000_000;
// 出力画像の最大倍率（Retina 相当）
const MAX_PIXEL_RATIO = 2;

/**
 * 次の描画フレームまで待機する
 */
const waitForNextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Web Share API でファイルを共有できるかどうかを判定する
 */
const canShareFile = (file: File) =>
  typeof navigator.share === "function" &&
  typeof navigator.canShare === "function" &&
  navigator.canShare({ files: [file] });

/**
 * 共有シートのキャンセルによるエラーかどうかを判定する
 */
const isAbortError = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

/**
 * Blob を a[download] でダウンロードする
 */
const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 画像プレビューダイアログで扱う情報
type ImagePreview = {
  file: File;
  url: string; // プレビュー表示用の Object URL
  canShare: boolean; // Web Share API で共有可能かどうか
};

export function ExportSavedPrograms({ 
  programs,
  currentSeason 
}: { 
  programs: ProgramData[],
  currentSeason?: Season | null 
}) {
  const { isIos, isIosPwa } = useOs();
  // 画像出力中のファイル名（null 以外の場合に出力処理を実行する）
  const [exportingFileName, setExportingFileName] = useState<string | null>(null);
  const isExportingImage = exportingFileName !== null;
  const imageRef = useRef<HTMLDivElement>(null);
  // 画像プレビューダイアログ（画像の生成完了後に表示する）
  const [preview, setPreview] = useState<ImagePreview | null>(null);

  // プレビュー用の Object URL をダイアログを閉じたときに解放する
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview.url);
  }, [preview]);

  // 画像出力用の番組表がマウントされた後に画像化し、プレビューダイアログを表示する
  useEffect(() => {
    if (exportingFileName === null) return;

    const toastId = toast.loading("画像を生成しています…");

    const exportImage = async () => {
      try {
        // Webフォントの読み込みとレイアウトの確定を待つ
        await document.fonts.ready;
        await waitForNextFrame();
        await waitForNextFrame();

        const node = imageRef.current;
        if (!node) throw new Error("Export target not found");

        // Canvas の上限を超えないよう倍率を調整する
        const width = node.offsetWidth;
        const height = node.offsetHeight;
        const pixelRatio = Math.min(MAX_PIXEL_RATIO, Math.sqrt(MAX_CANVAS_PIXELS / (width * height)));

        const blob = await toBlob(node, {
          pixelRatio,
          // 透過PNGにならないよう、テーマの背景色で塗りつぶす
          backgroundColor: getComputedStyle(node).backgroundColor,
        });
        if (!blob) throw new Error("Failed to create image blob");

        const file = new File([blob], exportingFileName, { type: "image/png" });

        toast.dismiss(toastId);
        setPreview({
          file,
          url: URL.createObjectURL(blob),
          canShare: canShareFile(file),
        });
      } catch (error) {
        console.error("Failed to export timetable image:", error instanceof Error ? error.message : error);
        toast.error("画像の生成に失敗しました", { id: toastId });
      } finally {
        setExportingFileName(null);
      }
    };

    exportImage();
  }, [exportingFileName]);

  // iOS / iPadOS の PWA かつ Web Share API が利用不可な環境かどうかを判定する
  const canSave = preview !== null && !(isIosPwa && !preview.canShare);

  // プレビューダイアログから画像を保存する（iOS / iPadOS は共有シート、それ以外は直接ダウンロード）
  const handleSavePreview = async () => {
    if (!preview) return;

    if (isIos) {
      if (preview.canShare) {
        try {
          await navigator.share({ files: [preview.file] });
          setPreview(null);
          toast.success("画像を保存しました");
        } catch (error) {
          if (isAbortError(error)) return;
          console.error("Failed to share timetable image:", error instanceof Error ? error.message : error);
          toast.error("共有に失敗しました。画像を長押しして保存してください");
        }
        return;
      }

      if (isIosPwa) {
        toast.error("この環境では保存できません。画像を長押しして保存してください");
        return;
      }
    }

    downloadBlob(preview.file, preview.file.name);
    setPreview(null);
    toast.success("画像をダウンロードしました");
  };

  const handleExportImage = () => {
    if (programs.length === 0) {
      toast.error("画像に出力する番組がありません");
      return;
    }
    if (isExportingImage) return;
    setExportingFileName(
      currentSeason ? `anitime-saved-${currentSeason.year}-${currentSeason.month}.png` : "anitime-saved.png"
    );
  };
  const handleExportText = () => {
    if (programs.length === 0) return;

    const lines = programs.map((p) => {
      let formattedDate = "開始日未定";
      if (p.start_date) {
        const parsedDate = parseISO(p.start_date);
        if (isValid(parsedDate)) {
          formattedDate = `${format(parsedDate, "yyyy年M月d日")}スタート`;
        } else {
          formattedDate = `${p.start_date}スタート`;
        }
      }

      const startTime = formatTime30(p.start_time);
      const endTime = formatTime30(p.end_time, p.start_time);

      const day = DAYS.find(d => d.id === p.day_of_the_week);
      const dayStr = day ? `${day.label}曜 ` : "";

      return [
        p.channel_name,
        formattedDate,
        `${dayStr}${startTime} - ${endTime}`,
        p.name
      ].join("\n");
    });

    const header = currentSeason ? `${currentSeason.name}\n\n` : "";
    const text = header + lines.join("\n-------------------\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const fileName = currentSeason ? `anitime-saved-${currentSeason.year}-${currentSeason.month}.txt` : "anitime-saved.txt";
    a.download = fileName;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("テキスト形式でエクスポートしました");
  };

  const handleExportCSV = () => {
    if (programs.length === 0) return;

    const header = ["放送局", "開始日", "曜日", "放送時間", "作品名"];

    const escapeCSV = (str: string) => {
      if (!str) return '""';
      const escaped = String(str).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = programs.map((p) => {
      const date = p.start_date || "TBD";
      const startTime = formatTime30(p.start_time);
      const endTime = formatTime30(p.end_time, p.start_time);
      const timeStr = `${startTime} - ${endTime}`;

      const day = DAYS.find(d => d.id === p.day_of_the_week);
      const dayStr = day ? `${day.label}曜` : "";

      return [
        escapeCSV(p.channel_name),
        escapeCSV(date),
        escapeCSV(dayStr),
        escapeCSV(timeStr),
        escapeCSV(p.name)
      ].join(",");
    });

    const csvContent = [header.join(","), ...rows].join("\n");
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const fileName = currentSeason ? `anitime-saved-${currentSeason.year}-${currentSeason.month}.csv` : "anitime-saved.csv";
    a.download = fileName;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("CSV形式でエクスポートしました");
  };

  const isDisabled = programs.length === 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" title="エクスポート" disabled={isDisabled}>
            <Share />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>一覧形式</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleExportText}>
              <FileText />
              テキストで出力
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV}>
              <TableProperties />
              CSVで出力
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>番組表形式</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleExportImage} disabled={isExportingImage}>
              <Image />
              画像で出力
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 画像出力用の番組表（出力処理中のみ画面外にマウント） */}
      {isExportingImage &&
        createPortal(
          <div
            aria-hidden="true"
            className="fixed top-0 pointer-events-none"
            style={{ left: -100000 }}
          >
            <SavedTimeTableExport ref={imageRef} programs={programs} currentSeason={currentSeason} />
          </div>,
          document.body
        )}

      {/* 画像プレビューダイアログ（画像の生成完了後に表示） */}
      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>画像のプレビュー</DialogTitle>
            <DialogDescription>
              {!canSave
                ? "画像を長押しして保存できます。"
                : "”保存” ボタンを選択して画像をダウンロードできます。"}
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="max-h-[50vh] overflow-auto rounded-lg border">
              <img
                src={preview.url}
                className="w-full h-auto"
                style={{ WebkitTouchCallout: "default" }}
              />
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <Button onClick={handleSavePreview} disabled={!canSave}>
              <Download />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
