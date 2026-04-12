import { useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";

const STORAGE_KEY = "theme";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light" || stored === "system")
    return stored;
  return "system";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    function applyResolved(dark: boolean) {
      if (dark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    localStorage.setItem(STORAGE_KEY, theme);

    if (theme === "system") {
      applyResolved(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyResolved(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }

    applyResolved(theme === "dark");
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) =>
      t === "system" ? "dark" : t === "dark" ? "light" : "system",
    );

  return { theme, toggleTheme };
}
