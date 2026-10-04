"use client";

import { useSavedPrograms } from "@/hooks/use-saved-programs";
import { ProgramData } from "@/types/schedule";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share, FileText, TableProperties } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { calculatePosition, formatTime30 } from "@/lib/format-time";
import { Season } from "@/lib/get-seasons";
import { DAYS } from "@/lib/format-days";
import { format, isValid, parseISO } from "date-fns";

export function ExportSavedPrograms({ 
  programsPromise,
  currentSeason 
}: { 
  programsPromise?: Promise<ProgramData[]>,
  currentSeason?: Season | null 
}) {
  const { isSaved, isLoaded } = useSavedPrograms();
  const [resolvedPrograms, setResolvedPrograms] = useState<ProgramData[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (programsPromise) {
      Promise.resolve(programsPromise)
        .then((data) => {
          if (isMounted) {
            setResolvedPrograms(data);
          }
        })
        .catch((error) => {
          if (isMounted) {
            console.error("Failed to load programs:", error);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [programsPromise]);

  const savedPrograms = useMemo(() => {
    if (!isLoaded || !resolvedPrograms || resolvedPrograms.length === 0) return [];
    const saved = resolvedPrograms.filter((p) => isSaved(String(p.id)));

    // 曜日・時間でソート
    saved.sort((a, b) => {
      if (a.day_of_the_week !== b.day_of_the_week) {
        return a.day_of_the_week - b.day_of_the_week;
      }
      const posA = calculatePosition(a.start_time).minutesFromStart;
      const posB = calculatePosition(b.start_time).minutesFromStart;
      return posA - posB;
    });

    return saved;
  }, [resolvedPrograms, isSaved, isLoaded]);

  const handleExportText = () => {
    if (savedPrograms.length === 0) return;

    const lines = savedPrograms.map((p) => {
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
  };

  const handleExportCSV = () => {
    if (savedPrograms.length === 0) return;

    const header = ["放送局", "開始日", "曜日", "放送時間", "作品名"];

    const escapeCSV = (str: string) => {
      if (!str) return '""';
      const escaped = String(str).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = savedPrograms.map((p) => {
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
  };

  const isDisabled = !isLoaded || savedPrograms.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" title="エクスポート" disabled={isDisabled}>
          <Share />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportText}>
          <FileText />
          テキストで出力
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <TableProperties />
          CSVで出力
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
