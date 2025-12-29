"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "saved_program_ids";

// Simple event emitter for local updates to sync across components
const eventTarget = new EventTarget();

export function useSavedPrograms() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

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

    const handleStorageChange = () => {
      setSavedIds(readFromStorage());
    };

    // Listen for changes from other components/hooks
    eventTarget.addEventListener("saved-programs-change", handleStorageChange);
    // Listen for changes from other tabs
    window.addEventListener("storage", handleStorageChange);

    return () => {
      eventTarget.removeEventListener("saved-programs-change", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [readFromStorage]);

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

  return { savedIds, toggleSaved, isSaved };
}
