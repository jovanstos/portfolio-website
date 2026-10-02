import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
const positions = new Map<string, number>();
const titles: Record<string, string> = {
  "/": "Home",
  "/about": "About me",
  "/contact": "Contact",
  "/resume": "Résumé",
  "/projects": "Projects",
  "/junk": "Junk Yard",
  "/zipline": "Zipline",
  "/converter": "Chimp Converter",
  "/projects/live/6": "Zipline",
  "/projects/live/7": "Chimp Converter",
  "/projects/live/8": "JovanLang",
  "/projects/live/9": "SpellCaster",
  "/projects/live/10": "P.I.M.",
};
export default function RouteEffects() {
  const location = useLocation();
  const type = useNavigationType();
  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    document.title = `${titles[location.pathname] ?? "Project"} · Jovan Stosic`;
    const target = type === "POP" ? (positions.get(location.key) ?? 0) : 0;
    const content = document.getElementById("page-content");
    if (type !== "POP") content?.focus({ preventScroll: true });
    function restore() {
      window.scrollTo(0, target);
      if (window.scrollY >= target) resize?.disconnect();
    }
    let frame = requestAnimationFrame(restore);
    const resize =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(() => {
            if (target > 0 && window.scrollY < target) {
              cancelAnimationFrame(frame);
              frame = requestAnimationFrame(restore);
            }
          });
    if (content) resize?.observe(content);
    const stop = () => resize?.disconnect();
    window.addEventListener("wheel", stop, { once: true, passive: true });
    window.addEventListener("touchstart", stop, { once: true, passive: true });
    return () => {
      positions.set(location.key, window.scrollY);
      if (positions.size > 50) positions.delete(positions.keys().next().value!);
      resize?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      history.scrollRestoration = previous;
    };
  }, [location.key, location.pathname, type]);
  return null;
}
