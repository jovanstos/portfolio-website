import { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
    if (typeof window === "undefined") return "light";

    if (localStorage.getItem("theme")) return localStorage.getItem("theme") as Theme

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
                <FaSun color="white" size={35} onClick={() => setTheme("light")} />
            ) : (
                <FaMoon color="white" size={35} onClick={() => setTheme("dark")} />
            )}
        </div>
    );
}

export default LightDarkToggle;
