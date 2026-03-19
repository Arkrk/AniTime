"use client"

import { useProgramCardSettings } from "@/hooks/use-program-card-settings"
import { MousePointerClick, MousePointer2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function ProgramCardSettings() {
  const { detailsViewMode, updateDetailsViewMode, showOgPreview, updateShowOgPreview, loaded } = useProgramCardSettings()

  return (
    <div className="bg-primary-foreground rounded-md border overflow-hidden flex flex-col divide-y divide-border">
      <div className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-medium text-base">詳細情報を表示</h3>
          <p className="text-sm text-muted-foreground mt-1">
            番組カードをホバーまたはクリックして詳細情報を表示します。
          </p>
        </div>

        <div>
          {loaded ? (
            <Select value={detailsViewMode} onValueChange={updateDetailsViewMode}>
              <SelectTrigger className="bg-background w-32.5">
                <SelectValue placeholder="表示方法を選択" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="hover">
                  <div className="flex items-center gap-2">
                    <MousePointer2 className="h-4 w-4" />
                    <span>ホバー</span>
                  </div>
                </SelectItem>
                <SelectItem value="popover">
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4" />
                    <span>クリック</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="w-32.5 h-9 rounded-md border border-input bg-background" />
          )}
        </div>
      </div>

      <div className="p-4 flex flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="font-medium text-base">プレビュー画像を表示</h3>
          <p className="text-sm text-muted-foreground mt-1">
            番組カードの詳細情報に公式サイトのOGP画像を表示します。
          </p>
        </div>

        <div className="flex items-center h-9">
          {loaded ? (
            <Switch
              checked={showOgPreview}
              onCheckedChange={updateShowOgPreview}
            />
          ) : (
            <div className="w-[42px] h-[24px] rounded-full border border-input bg-background" />
          )}
        </div>
      </div>
    </div>
  )
}