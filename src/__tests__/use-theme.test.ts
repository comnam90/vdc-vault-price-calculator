import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "@/hooks/use-theme";

function makeMockMq(matches: boolean) {
  const listeners: ((e: MediaQueryListEvent) => void)[] = [];
  const mq = {
    matches,
    addEventListener: vi.fn(
      (_: string, fn: (e: MediaQueryListEvent) => void) => {
        listeners.push(fn);
      },
    ),
    removeEventListener: vi.fn(
      (_: string, fn: (e: MediaQueryListEvent) => void) => {
        const idx = listeners.indexOf(fn);
        if (idx !== -1) listeners.splice(idx, 1);
      },
    ),
    dispatchChange: (newMatches: boolean) => {
      listeners.forEach((fn) =>
        fn({ matches: newMatches } as MediaQueryListEvent),
      );
    },
  };
  return mq;
}

describe("useTheme", () => {
  let mockMq: ReturnType<typeof makeMockMq>;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    mockMq = makeMockMq(false); // default: OS light
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mockMq));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("initial state", () => {
    it("defaults to 'system' when localStorage has no entry", () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe("system");
    });

    it("reads stored 'dark' preference", () => {
      localStorage.setItem("theme", "dark");
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe("dark");
    });

    it("reads stored 'light' preference", () => {
      localStorage.setItem("theme", "light");
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe("light");
    });

    it("reads stored 'system' preference", () => {
      localStorage.setItem("theme", "system");
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe("system");
    });

    it("falls back to 'system' for unrecognised stored values", () => {
      localStorage.setItem("theme", "bogus");
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe("system");
    });
  });

  describe("class application", () => {
    it("applies .dark class when theme is 'dark'", () => {
      localStorage.setItem("theme", "dark");
      renderHook(() => useTheme());
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("removes .dark class when theme is 'light'", () => {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "light");
      renderHook(() => useTheme());
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("applies .dark class when system theme is dark and no stored preference", () => {
      mockMq = makeMockMq(true); // OS dark
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mockMq));
      renderHook(() => useTheme());
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("does not apply .dark class when system theme is light and no stored preference", () => {
      // mockMq defaults to matches=false (OS light)
      renderHook(() => useTheme());
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("localStorage persistence", () => {
    it("writes 'system' to localStorage on mount with no stored preference", () => {
      renderHook(() => useTheme());
      expect(localStorage.getItem("theme")).toBe("system");
    });

    it("writes 'dark' to localStorage when theme is dark", () => {
      localStorage.setItem("theme", "dark");
      renderHook(() => useTheme());
      expect(localStorage.getItem("theme")).toBe("dark");
    });

    it("writes 'light' to localStorage when theme is light", () => {
      localStorage.setItem("theme", "light");
      renderHook(() => useTheme());
      expect(localStorage.getItem("theme")).toBe("light");
    });
  });

  describe("toggleTheme cycle", () => {
    it("cycles system → dark → light → system", () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe("system");

      act(() => result.current.toggleTheme());
      expect(result.current.theme).toBe("dark");

      act(() => result.current.toggleTheme());
      expect(result.current.theme).toBe("light");

      act(() => result.current.toggleTheme());
      expect(result.current.theme).toBe("system");
    });

    it("applies .dark class after toggling from system to dark", () => {
      const { result } = renderHook(() => useTheme());
      act(() => result.current.toggleTheme()); // system → dark
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("removes .dark class after toggling from dark to light", () => {
      localStorage.setItem("theme", "dark");
      const { result } = renderHook(() => useTheme());
      act(() => result.current.toggleTheme()); // dark → light
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("persists dark preference to localStorage after toggle", () => {
      const { result } = renderHook(() => useTheme());
      act(() => result.current.toggleTheme()); // system → dark
      expect(localStorage.getItem("theme")).toBe("dark");
    });

    it("persists light preference to localStorage after toggle", () => {
      localStorage.setItem("theme", "dark");
      const { result } = renderHook(() => useTheme());
      act(() => result.current.toggleTheme()); // dark → light
      expect(localStorage.getItem("theme")).toBe("light");
    });
  });

  describe("system mode media query reactivity", () => {
    it("updates .dark class when OS preference changes while in system mode", () => {
      mockMq = makeMockMq(false); // OS starts light
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mockMq));

      renderHook(() => useTheme());
      expect(document.documentElement.classList.contains("dark")).toBe(false);

      act(() => mockMq.dispatchChange(true)); // OS switches to dark
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      act(() => mockMq.dispatchChange(false)); // OS switches back to light
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("adds media query listener when in system mode", () => {
      renderHook(() => useTheme());
      expect(mockMq.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
    });

    it("removes media query listener when theme changes away from system", () => {
      const { result } = renderHook(() => useTheme());
      act(() => result.current.toggleTheme()); // system → dark
      expect(mockMq.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
    });

    it("does not add media query listener when theme is dark", () => {
      localStorage.setItem("theme", "dark");
      renderHook(() => useTheme());
      expect(mockMq.addEventListener).not.toHaveBeenCalled();
    });
  });
});
