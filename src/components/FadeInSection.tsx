import type { ReactNode } from "react";
import useIsVisible from "../hooks/useIsVisible";

type FadeInChildern = {
  children: ReactNode;
};

function FadeInSection({ children }: FadeInChildern) {
  const { ref, isVisible } = useIsVisible({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`fade-in-section ${isVisible ? "is-visible" : ""}`}
    >
      {children}
    </div>
  );
}

export default FadeInSection;
