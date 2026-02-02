"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

export function ThemeColorManager() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const updateThemeColor = () => {
      // 現在の --background の値を取得
      // next-themes は html タグに class を付与するため、documentElement からスタイルを取得
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
      
      if (!bg) return

      // meta name="theme-color" を取得または作成
      let themeColorMeta = document.querySelector('meta[name="theme-color"]')
      
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta')
        themeColorMeta.setAttribute('name', 'theme-color')
        document.head.appendChild(themeColorMeta)
      }

      // 値を設定
      themeColorMeta.setAttribute('content', bg)
    }

    // テーマ変更直後だとスタイル適用が完了していない可能性があるため、わずかに遅延させる
    // また CSS 変数の解決を確実にする
    const timer = setTimeout(updateThemeColor, 0)
    
    return () => clearTimeout(timer)
  }, [resolvedTheme])

  return null
}
