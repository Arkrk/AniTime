"use client";

import { useEffect, useState } from "react";

export type OS = "mac" | "windows" | "linux" | "other";

export function useOs() {
  const [os, setOs] = useState<OS>("other");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const { userAgent } = window.navigator;

    if (userAgent.includes("Mac")) {
      setOs("mac");
    } else if (userAgent.includes("Win")) {
      setOs("windows");
    } else if (userAgent.includes("Linux")) {
      setOs("linux");
    }
  }, []);

  return os;
}
