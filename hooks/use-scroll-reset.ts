import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

/**
 * URLのクエリパラメータ変更時に、最も近いスクロール可能な親要素 (.overflow-auto)
 * のスクロール位置を最上部にリセットするカスタムフック。
 */
export function useScrollReset<T extends HTMLElement = HTMLDivElement>() {
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      const scrollContainer = ref.current.closest(".overflow-auto");
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }
  }, [searchParamsString]);

  return ref;
}
