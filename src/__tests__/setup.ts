import "@testing-library/jest-dom";

// Provide a minimal matchMedia stub for jsdom, which does not implement it.
// Tests that need to control OS-preference behaviour should override this
// per-test with vi.stubGlobal("matchMedia", ...).
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

const DEFAULT_RECT = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 960,
  bottom: 320,
  width: 960,
  height: 320,
  toJSON() {
    return this;
  },
} as DOMRectReadOnly;

class ResizeObserverMock {
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    const boxSize: ResizeObserverSize = { inlineSize: 960, blockSize: 320 };
    this.callback(
      [
        {
          target,
          contentRect: DEFAULT_RECT,
          borderBoxSize: [boxSize],
          contentBoxSize: [boxSize],
          devicePixelContentBoxSize: [boxSize],
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }

  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver =
  ResizeObserverMock as unknown as typeof ResizeObserver;

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

Object.defineProperty(HTMLElement.prototype, "clientWidth", {
  configurable: true,
  get() {
    return 960;
  },
});

Object.defineProperty(HTMLElement.prototype, "clientHeight", {
  configurable: true,
  get() {
    return 320;
  },
});

if (!HTMLElement.prototype.getBoundingClientRect) {
  HTMLElement.prototype.getBoundingClientRect = () => DEFAULT_RECT;
}
