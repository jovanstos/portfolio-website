import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "./useMediaQuery";
export default function useIsVisible({
  threshold = 0.1,
  rootMargin = "0px",
}: IntersectionObserverInit = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const fallback = typeof IntersectionObserver === "undefined";
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || reduced || fallback || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, reduced, fallback, visible]);
  return { ref, isVisible: visible || reduced || fallback };
}
