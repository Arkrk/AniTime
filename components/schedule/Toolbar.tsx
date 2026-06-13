"use client";

import React, { useState } from "react";
import { Palette, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchDialog } from "@/components/search/SearchDialog";
import { getProgramColorClass } from "@/lib/schedule-utils";

export const Toolbar: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 md:bottom-8 md:right-8 z-50">
        <div className="flex items-center bg-background/80 backdrop-blur-md text-foreground border shadow-lg rounded-md">
          {/* モバイル用の検索ボタン */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-md h-11 w-11 hover:bg-accent/50"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <div className="w-px h-6 bg-border shrink-0" />
          </div>

          {/* 背景色の凡例 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-md h-11 w-11">
                <Palette className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">背景色の凡例</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-center border-separate border-spacing-0">
                    <thead className="text-muted-foreground">
                      <tr>
                        <th className="border-b border-r p-1.5 font-medium w-10"></th>
                        <th className="border-b border-r p-1.5 font-medium w-25">AT-X</th>
                        <th className="border-b p-1.5 font-medium w-25">地上波・BS</th>
                      </tr>
                    </thead>
                    <tbody className="leading-snug *:h-10">
                      <tr>
                        <td className="border-b border-r p-2">
                          <div className={`w-5 h-5 mx-auto border rounded-full ${getProgramColorClass(1)}`}></div>
                        </td>
                        <td className="border-b border-r p-1 text-[11px]">最速放送<br />
                          <span className="text-[10px] inline-block text-muted-foreground whitespace-nowrap">1週間先行</span>
                        </td>
                        <td className="border-b p-1"></td>
                      </tr>
                      <tr>
                        <td className="border-b border-r p-2">
                          <div className={`w-5 h-5 mx-auto border rounded-full ${getProgramColorClass(2)}`}></div>
                        </td>
                        <td className="border-b border-r p-1 text-[11px]">最速放送</td>
                        <td className="border-b p-1"></td>
                      </tr>
                      <tr>
                        <td className="border-b border-r p-2">
                          <div className={`w-5 h-5 mx-auto border rounded-full ${getProgramColorClass(3)}`}></div>
                        </td>
                        <td className="border-b border-r p-1 text-[11px]">最速放送<br />
                          <span className="text-[10px] inline-block text-muted-foreground whitespace-nowrap">地上波同時</span>
                        </td>
                        <td className="border-b p-1 text-[11px]">最速放送<br />
                          <span className="text-[10px] inline-block text-muted-foreground whitespace-nowrap">AT-Xは考慮せず</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border-b border-r p-2">
                          <div className={`w-5 h-5 mx-auto border rounded-full ${getProgramColorClass(4)}`}></div>
                        </td>
                        <td colSpan={2} className="border-b p-1 text-[11px]">同日時差遅れ放送</td>
                      </tr>
                      <tr>
                        <td className="border-b border-r p-2">
                          <div className={`w-5 h-5 mx-auto border rounded-full ${getProgramColorClass(5)}`}></div>
                        </td>
                        <td colSpan={2} className="border-b p-1 text-[11px]">1〜6日遅れ放送</td>
                      </tr>
                      <tr>
                        <td className="border-b border-r p-2">
                          <div className={`w-5 h-5 mx-auto border rounded-full ${getProgramColorClass(6)}`}></div>
                        </td>
                        <td colSpan={2} className="border-b p-1 text-[11px]">1週以上遅れ放送</td>
                      </tr>
                      <tr>
                        <td className="border-b border-r p-2">
                          <div className={`w-5 h-5 mx-auto border rounded-full ${getProgramColorClass(7)}`}></div>
                        </td>
                        <td colSpan={2} className="border-b p-1 text-[11px]">旧作・再放送</td>
                      </tr>
                      <tr>
                        <td className="border-b border-r p-2">
                          <div className={`w-5 h-5 mx-auto border rounded-full ${getProgramColorClass(8)}`}></div>
                        </td>
                        <td colSpan={2} className="border-b p-1 text-[11px]">関連番組</td>
                      </tr>
                      <tr>
                        <td className="border-r p-2">
                          <div className={`w-5 h-5 mx-auto border rounded-full ${getProgramColorClass(9)}`}></div>
                        </td>
                        <td colSpan={2} className="p-1 text-[11px]">未確定の情報</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};
