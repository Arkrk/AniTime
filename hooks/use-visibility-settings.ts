import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_AREAS = 'hidden_area_ids';
const STORAGE_KEY_CHANNELS = 'hidden_channel_ids';
const EVENT_KEY = 'visibility_settings_changed';

export function useVisibilitySettings() {
  const [hiddenAreaIds, setHiddenAreaIds] = useState<number[]>([]);
  const [hiddenChannelIds, setHiddenChannelIds] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadSettings = useCallback(() => {
    const storedAreas = localStorage.getItem(STORAGE_KEY_AREAS);
    const storedChannels = localStorage.getItem(STORAGE_KEY_CHANNELS);

    if (storedAreas) {
      try {
        setHiddenAreaIds(JSON.parse(storedAreas));
      } catch (e) {
        console.error("Failed to parse hidden areas", e);
      }
    }
    if (storedChannels) {
      try {
        setHiddenChannelIds(JSON.parse(storedChannels));
      } catch (e) {
        console.error("Failed to parse hidden channels", e);
      }
    }
  }, []);

  useEffect(() => {
    loadSettings();
    setLoaded(true);

    const handleStorageChange = (e: StorageEvent | Event) => {
      if (e.type === 'storage' && (e as StorageEvent).key !== STORAGE_KEY_AREAS && (e as StorageEvent).key !== STORAGE_KEY_CHANNELS) {
        return;
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

  const toggleArea = (id: number) => {
    setHiddenAreaIds(prev => {
      const next = prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id];
      
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY_AREAS, JSON.stringify(next));
        window.dispatchEvent(new Event(EVENT_KEY));
      }, 0);
      
      return next;
    });
  };

  const toggleChannel = (id: number) => {
    setHiddenChannelIds(prev => {
      const next = prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id];
      
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(next));
        window.dispatchEvent(new Event(EVENT_KEY));
      }, 0);
      
      return next;
    });
  };

  const setChannelVisibility = (ids: number[], visible: boolean) => {
    setHiddenChannelIds(prev => {
      let next = [...prev];
      if (visible) {
        // 表示: 非表示リストから削除
        next = next.filter(id => !ids.includes(id));
      } else {
        // 非表示: 非表示リストに追加
        ids.forEach(id => {
          if (!next.includes(id)) next.push(id);
        });
      }
      
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(next));
        window.dispatchEvent(new Event(EVENT_KEY));
      }, 0);

      return next;
    });
  };

  return {
    hiddenAreaIds,
    hiddenChannelIds,
    toggleArea,
    toggleChannel,
    setChannelVisibility,
    loaded
  };
}
