"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  if (!mounted || !deferredPrompt) return null

  return (
    <div className="bg-primary-foreground rounded-md border overflow-hidden">
      <div className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-medium text-base">アプリとしてインストール</h3>
        </div>
        <div>
          <Button onClick={handleInstallClick} variant="outline">
            <Download />
            インストール
          </Button>
        </div>
      </div>
    </div>
  )
}
