import { useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";

const STORAGE_KEY = "theme";

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light" || stored === "system")
      return stored;
  } catch {
    // localStorage unavailable (e.g. private browsing restrictions)
  }
  return "system";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    function applyResolved(dark: boolean) {
      if (dark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage unavailable
    }

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
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
