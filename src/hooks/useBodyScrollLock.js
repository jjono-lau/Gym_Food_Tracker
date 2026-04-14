"use client";

import { useEffect } from "react";

// Locks the document body scroll when `lock` is true.
// Restores the previous overflow / padding styles on cleanup.
export default function useBodyScrollLock(lock) {
  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const { overflow, paddingRight } = document.body.style;

    if (lock) {
      const scrollBarGap = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (!document.body.style.paddingRight && scrollBarGap > 0) {
        document.body.style.paddingRight = `${scrollBarGap}px`;
      }
    }

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [lock]);
}
