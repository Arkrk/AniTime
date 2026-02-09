"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="bg-primary-foreground rounded-md border overflow-hidden">
      <div className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-medium text-base">外観</h3>
        </div>

        <div>
          {mounted ? (
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="bg-background w-32.5">
                <SelectValue placeholder="テーマを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>ライト</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>ダーク</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>システム</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="w-32.5 h-9 rounded-md border border-input bg-background" />
          )}
        </div>
      </div>
    </div>
  )
}
