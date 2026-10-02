import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useMediaQuery } from "../hooks/useMediaQuery";
type Theme = "light" | "dark";
function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem("theme");
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}
export default function LightDarkToggle() {
  const [choice, setChoice] = useState<Theme | null>(storedTheme);
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = choice ?? (systemDark ? "dark" : "light");
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    if (choice) {
      try {
        localStorage.setItem("theme", choice);
      } catch {
        /* Theme still works without storage. */
      }
    }
  }, [theme, choice]);
  return (
    <button
      id="lightDarkToggle"
      type="button"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      onClick={() => setChoice(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <FaSun aria-hidden="true" size={50} />
      ) : (
        <FaMoon aria-hidden="true" size={50} />
      )}
    </button>
  );
}
