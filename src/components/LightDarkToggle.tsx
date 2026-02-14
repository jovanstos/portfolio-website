import { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

type Theme = "light" | "dark";

// Function for getting the users system preference if they want light or dark...
// Also setting which scheme is perfered by the user so it saves on client side
function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";

  if (localStorage.getItem("theme"))
    return localStorage.getItem("theme") as Theme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function LightDarkToggle() {
  const [theme, setTheme] = useState<Theme>(getSystemTheme);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div id="lightDarkToggle">
      {theme === "dark" ? (
        <FaSun
          color="var(--color-accent"
          size={35}
          onClick={() => setTheme("light")}
        />
      ) : (
        <FaMoon
          color="var(--color-accent"
          size={35}
          onClick={() => setTheme("dark")}
        />
      )}
    </div>
  );
}

export default LightDarkToggle;
