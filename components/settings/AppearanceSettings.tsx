"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="bg-primary-foreground rounded-2xl border overflow-hidden">
      <div className="p-4 flex flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="font-medium text-base">外観モード</h3>
        </div>

        <div>
          {mounted ? (
            <Tabs value={theme} onValueChange={setTheme}>
              <TabsList>
                <TabsTrigger value="light" className="flex items-center gap-2">
                  <Sun />
                </TabsTrigger>
                <TabsTrigger value="dark" className="flex items-center gap-2">
                  <Moon />
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center gap-2">
                  <Monitor />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            <div className="h-9 rounded-md bg-muted" />
          )}
        </div>
      </div>
    </div>
  )
}
