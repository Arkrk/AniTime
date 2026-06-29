"use client";

import { useEffect, useState } from "react";

export function SavedCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const handleCountChange = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      setCount(customEvent.detail);
    };

    window.addEventListener("saved-count-change", handleCountChange);

    return () => {
      window.removeEventListener("saved-count-change", handleCountChange);
    };
  }, []);

  if (count === null || count === undefined || count === 0) {
    return <span className="text-base font-normal text-muted-foreground"></span>;
  }

  return (
    <span className="text-base font-normal text-muted-foreground">
      {count}
    </span>
  );
}
