import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

// jsdom はレイアウト計算と scrollIntoView を実装していない。
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  writable: true,
  value: vi.fn(),
});

beforeEach(() => {
  vi.useFakeTimers();
  // Testing Library のタイマー検出は jest グローバルを参照する。
  vi.stubGlobal("jest", { advanceTimersByTime: vi.advanceTimersByTime });
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete globalThis.inkdrop;
  document.body.innerHTML = "";
  document.documentElement.style.removeProperty("--narrow-tag-menu-height");
});
