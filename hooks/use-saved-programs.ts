"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "saved_program_ids";

const eventTarget = new EventTarget();

// 保存済み番組のIDをlocalStorageで管理するカスタムフック
export function useSavedPrograms() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // localStorageから保存済みIDを読み込む
  const readFromStorage = useCallback(() => {
    if (typeof window === "undefined") return [];
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.warn("Error reading localStorage", error);
      return [];
    }
  }, []);

  useEffect(() => {
    setSavedIds(readFromStorage());
    setIsLoaded(true);

    const handleStorageChange = () => {
      setSavedIds(readFromStorage());
    };

    // 同一タブ内での変更を検知
    eventTarget.addEventListener("saved-programs-change", handleStorageChange);
    // 他タブでの変更を検知
    window.addEventListener("storage", handleStorageChange);

    return () => {
      eventTarget.removeEventListener("saved-programs-change", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [readFromStorage]);

  // IDの保存/削除を切り替える
  const toggleSaved = useCallback((id: string) => {
    const current = readFromStorage();
    const newIds = current.includes(id)
      ? current.filter((i: string) => i !== id)
      : [...current, id];

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
      setSavedIds(newIds);
      eventTarget.dispatchEvent(new Event("saved-programs-change"));
    } catch (error) {
      console.warn("Error writing to localStorage", error);
    }
  }, [readFromStorage]);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  return { savedIds, toggleSaved, isSaved, isLoaded };
}
