import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_HOVER = 'program_card_hover_details';
const STORAGE_KEY_OG = 'program_card_show_og_preview';
const EVENT_KEY = 'program_card_settings_changed';

export function useProgramCardSettings() {
  const [hoverDetails, setHoverDetails] = useState<boolean>(true);
  const [showOgPreview, setShowOgPreview] = useState<boolean>(true);
  const [loaded, setLoaded] = useState(false);

  const loadSettings = useCallback(() => {
    if (typeof window !== 'undefined') {
      const storedHover = localStorage.getItem(STORAGE_KEY_HOVER);
      if (storedHover !== null) {
        setHoverDetails(storedHover === 'true');
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
        if (key !== STORAGE_KEY_HOVER && key !== STORAGE_KEY_OG) {
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

  const updateHoverDetails = (hover: boolean) => {
    setHoverDetails(hover);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_HOVER, String(hover));
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

  return { hoverDetails, updateHoverDetails, showOgPreview, updateShowOgPreview, loaded };
}
