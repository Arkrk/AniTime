import { useState, useEffect, useCallback } from 'react';

export type DetailsViewMode = 'hover' | 'popover';

const STORAGE_KEY_MODE = 'program_card_details_view_mode';
const STORAGE_KEY_OG = 'program_card_show_og_preview';
const EVENT_KEY = 'program_card_settings_changed';

export function useProgramCardSettings() {
  const [detailsViewMode, setDetailsViewMode] = useState<DetailsViewMode>('hover');
  const [showOgPreview, setShowOgPreview] = useState<boolean>(true);
  const [loaded, setLoaded] = useState(false);

  const loadSettings = useCallback(() => {
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem(STORAGE_KEY_MODE);
      if (storedMode === 'popover' || storedMode === 'hover') {
        setDetailsViewMode(storedMode);
      }
      const storedOg = localStorage.getItem(STORAGE_KEY_OG);
      if (storedOg !== null) {
        setShowOgPreview(storedOg === 'true');
      }
    }
  }, []);

  useEffect(() => {
    loadSettings();
    setLoaded(true);

    const handleStorageChange = (e: StorageEvent | Event) => {
      if (e.type === 'storage') {
        const key = (e as StorageEvent).key;
        if (key !== STORAGE_KEY_MODE && key !== STORAGE_KEY_OG) {
          return;
        }
      }
      loadSettings();
    };

    window.addEventListener(EVENT_KEY, handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(EVENT_KEY, handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSettings]);

  const updateDetailsViewMode = (mode: DetailsViewMode) => {
    setDetailsViewMode(mode);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
      window.dispatchEvent(new Event(EVENT_KEY));
    }, 0);
  };

  const updateShowOgPreview = (show: boolean) => {
    setShowOgPreview(show);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_OG, String(show));
      window.dispatchEvent(new Event(EVENT_KEY));
    }, 0);
  };

  return { detailsViewMode, updateDetailsViewMode, showOgPreview, updateShowOgPreview, loaded };
}
