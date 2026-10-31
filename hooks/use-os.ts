"use client";

import { useEffect, useState } from "react";

export type OS = "mac" | "windows" | "linux" | "ios" | "ipados" | "android" | "other";

/**
 * ユーザーのOSを判定するカスタムフック
 * @returns OSの種類、iOS / iPadOS かどうか、iOS / iPadOS のPWAかどうか
 */
export function useOs() {
  const [os, setOs] = useState<OS>("other");
  const [isIosPwa, setIsIosPwa] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const { userAgent, maxTouchPoints } = window.navigator;

    let detectedOs: OS = "other";
    if (/iPad/.test(userAgent) || (userAgent.includes("Mac") && maxTouchPoints > 1)) {
      detectedOs = "ipados";
    } else if (/iPhone|iPod/.test(userAgent)) {
      detectedOs = "ios";
    } else if (userAgent.includes("Mac")) {
      detectedOs = "mac";
    } else if (/Android/.test(userAgent)) {
      detectedOs = "android";
    } else if (userAgent.includes("Win")) {
      detectedOs = "windows";
    } else if (userAgent.includes("Linux")) {
      detectedOs = "linux";
    }
    setOs(detectedOs);

    const isAppleMobile = detectedOs === "ios" || detectedOs === "ipados";
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsIosPwa(isAppleMobile && isStandalone);
  }, []);

  const isIos = os === "ios" || os === "ipados";

  return { os, isIos, isIosPwa };
}
