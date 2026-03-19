"use client"

import { useProgramCardSettings } from "@/hooks/use-program-card-settings"
import { Switch } from "@/components/ui/switch"

export function ProgramCardSettings() {
  const { hoverDetails, updateHoverDetails, showOgPreview, updateShowOgPreview, loaded } = useProgramCardSettings()

  return (
    <div className="bg-primary-foreground rounded-md border overflow-hidden flex flex-col divide-y divide-border">
      <div className="p-4 flex flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="font-medium text-base">ホバー時に詳細情報を自動表示</h3>
          <p className="text-sm text-muted-foreground mt-1">
            番組カードにカーソルを合わせると自動で詳細情報を表示します。
          </p>
        </div>

        <div className="flex items-center h-9">
          {loaded ? (
            <Switch
              checked={hoverDetails}
              onCheckedChange={updateHoverDetails}
            />
          ) : (
            <div className="w-10.5 h-6 rounded-full border border-input bg-background" />
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
            <div className="w-10.5 h-6 rounded-full border border-input bg-background" />
          )}
        </div>
      </div>
    </div>
  )
}