import { useState, useEffect } from 'react';

const STORAGE_KEY_AREAS = 'hidden_area_ids';
const STORAGE_KEY_CHANNELS = 'hidden_channel_ids';

export function useVisibilitySettings() {
  const [hiddenAreaIds, setHiddenAreaIds] = useState<number[]>([]);
  const [hiddenChannelIds, setHiddenChannelIds] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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
    setLoaded(true);
  }, []);

  const toggleArea = (id: number) => {
    setHiddenAreaIds(prev => {
      const next = prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEY_AREAS, JSON.stringify(next));
      return next;
    });
  };

  const toggleChannel = (id: number) => {
    setHiddenChannelIds(prev => {
      const next = prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(next));
      return next;
    });
  };

  const setChannelVisibility = (ids: number[], visible: boolean) => {
    setHiddenChannelIds(prev => {
      let next = [...prev];
      if (visible) {
        // Show: remove from hidden list
        next = next.filter(id => !ids.includes(id));
      } else {
        // Hide: add to hidden list if not present
        ids.forEach(id => {
          if (!next.includes(id)) next.push(id);
        });
      }
      localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(next));
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
