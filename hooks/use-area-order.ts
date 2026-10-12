import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_AREA_ORDER = 'area_order';
const EVENT_KEY = 'area_order_changed';

/**
 * 保存された並び順に従ってエリアを並べ替え
 * 並び順に含まれないエリア（新規追加など）は末尾に元の order 順で配置
 * @param areas エリアのリスト
 * @param areaOrder エリアの並び順
 * @returns 並べ替えられたエリアのリスト
 */
export function sortAreasByOrder<T extends { id: number; order: number }>(areas: T[], areaOrder: number[]): T[] {
  const indexMap = new Map<number, number>();
  areaOrder.forEach((id, index) => indexMap.set(id, index));

  return [...areas].sort((a, b) => {
    const indexA = indexMap.get(a.id);
    const indexB = indexMap.get(b.id);
    if (indexA !== undefined && indexB !== undefined) return indexA - indexB;
    if (indexA !== undefined) return -1;
    if (indexB !== undefined) return 1;
    return a.order - b.order;
  });
}

/**
 * localStorageからエリアの並び順を読み込んで更新
 */
export function useAreaOrder() {
  const [areaOrder, setAreaOrder] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 設定をlocalStorageから読み込む
  const loadSettings = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY_AREA_ORDER);
    if (!stored) {
      setAreaOrder([]);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setAreaOrder(parsed.filter((id): id is number => typeof id === 'number' && Number.isFinite(id)));
      }
    } catch (e) {
      console.error("Failed to parse area order", e);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    setLoaded(true);

    // 他のタブ・コンポーネントで設定が変更されたときに反映するためのイベントリスナー
    const handleStorageChange = (e: StorageEvent | Event) => {
      if (e.type === 'storage' && (e as StorageEvent).key !== STORAGE_KEY_AREA_ORDER) {
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

  // 並び順を更新してlocalStorageに保存
  const updateAreaOrder = (ids: number[]) => {
    setAreaOrder(ids);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_AREA_ORDER, JSON.stringify(ids));
      window.dispatchEvent(new Event(EVENT_KEY));
    }, 0);
  };

  return { areaOrder, updateAreaOrder, loaded };
}
