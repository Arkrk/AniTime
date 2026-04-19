import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_NEW_ONLY = 'display_settings_new_only';
const EVENT_KEY = 'display_settings_changed';

export function useDisplaySettings() {
  const [showNewOnly, setShowNewOnly] = useState<boolean>(false);
  const [loaded, setLoaded] = useState(false);

  const loadSettings = useCallback(() => {
    if (typeof window !== 'undefined') {
      const storedNewOnly = localStorage.getItem(STORAGE_KEY_NEW_ONLY);
      if (storedNewOnly !== null) {
        setShowNewOnly(storedNewOnly === 'true');
      }
    }
  }, []);

  useEffect(() => {
    loadSettings();
    setLoaded(true);

    const handleStorageChange = (e: StorageEvent | Event) => {
      if (e.type === 'storage') {
        const key = (e as StorageEvent).key;
        if (key !== STORAGE_KEY_NEW_ONLY) {
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

  const updateShowNewOnly = (show: boolean) => {
    setShowNewOnly(show);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_NEW_ONLY, String(show));
      window.dispatchEvent(new Event(EVENT_KEY));
    }, 0);
  };

  return { showNewOnly, updateShowNewOnly, loaded };
}
