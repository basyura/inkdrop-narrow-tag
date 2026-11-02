import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";

jest.mock(
  "inkdrop",
  () => {
    const React = require("react");
    return {
      useModal() {
        const [visible, setVisible] = React.useState(false);
        return {
          state: { visible },
          show: () => setVisible(true),
          close: () => setVisible(false),
        };
      },
    };
  },
  { virtual: true }
);

// jsdom はレイアウト計算と scrollIntoView を実装していない。
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  writable: true,
  value: jest.fn(),
});

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  cleanup();
  jest.clearAllTimers();
  jest.useRealTimers();
  delete globalThis.inkdrop;
  document.body.innerHTML = "";
  document.documentElement.style.removeProperty("--narrow-tag-menu-height");
});
