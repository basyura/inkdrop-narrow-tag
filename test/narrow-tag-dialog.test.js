import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NarrowTagDialog from "../lib/narrow-tag-dialog";
import { createInkdropMock } from "./helpers/create-inkdrop-mock";

const inkdropModule = require("inkdrop");

const input = () => screen.getByRole("textbox", { name: "Select Tag" });
const selectedOption = () => screen.getByRole("option", { selected: true });
const advanceTime = (milliseconds) => {
  act(() => jest.advanceTimersByTime(milliseconds));
};

function renderDialog(options) {
  const mock = createInkdropMock(options);
  const view = render(<NarrowTagDialog />);
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const open = () => {
    act(() => mock.registeredCommands["narrow-tag:open"]());
  };
  return { ...mock, ...view, user, open };
}

describe("表示と検索", () => {
  test("コマンドでストア順のタグを表示し、100 ms 後に入力欄へフォーカスする", () => {
    const { open } = renderDialog();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    open();

    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Beta",
      "alpha",
      "日本語",
    ]);
    expect(selectedOption()).toHaveTextContent("Beta");
    advanceTime(99);
    expect(input()).not.toHaveFocus();
    advanceTime(1);
    expect(input()).toHaveFocus();
  });

  test.each([
    ["ALP", ["alpha"]],
    ["本", ["日本語"]],
    [" beta ", []],
    [".*", []],
  ])("入力 %s を文字列として部分一致検索する", async (query, expected) => {
    const { open, user } = renderDialog();
    open();

    await user.type(input(), query);

    expect(screen.queryAllByRole("option").map((option) => option.textContent)).toEqual(
      expected
    );
    if (expected.length === 0) {
      expect(screen.getByText("No tags found")).toBeVisible();
    }
  });

  test("入力変更時に選択位置を先頭へ戻す", async () => {
    const { open, user } = renderDialog();
    open();
    fireEvent.keyDown(input(), { key: "ArrowDown" });
    expect(selectedOption()).toHaveTextContent("alpha");

    await user.type(input(), "a");

    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(selectedOption()).toHaveTextContent("Beta");
  });

  test("検索中の Ctrl-w で入力全体と選択位置をリセットする", async () => {
    const { open, user } = renderDialog();
    open();
    await user.type(input(), "alp");

    await user.keyboard("{Control>}w{/Control}");

    expect(input()).toHaveValue("");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(selectedOption()).toHaveTextContent("Beta");
  });

  test("再表示時は検索をクリアして最新のタグを取得する", async () => {
    const { open, user, setTags } = renderDialog();
    open();
    await user.type(input(), "alpha");
    await user.keyboard("{Escape}");
    setTags([{ _id: "tag:new", name: "New tag" }]);

    open();

    expect(input()).toHaveValue("");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(selectedOption()).toHaveTextContent("New tag");
  });
});

describe("候補の操作", () => {
  test.each([
    ["上下キー", "{ArrowDown}", "{ArrowUp}"],
    ["Ctrl-n / Ctrl-p", "{Control>}n{/Control}", "{Control>}p{/Control}"],
  ])("%s で候補を移動し、上下端で止まる", async (_, down, up) => {
    const { open, user } = renderDialog();
    open();
    advanceTime(100);

    await user.keyboard(up);
    expect(selectedOption()).toHaveTextContent("Beta");
    await user.keyboard(down);
    expect(selectedOption()).toHaveTextContent("alpha");
    await user.keyboard(down + down);
    expect(selectedOption()).toHaveTextContent("日本語");
    await user.keyboard(up);
    expect(selectedOption()).toHaveTextContent("alpha");
  });

  test.each(["Enter", "ArrowDown", "Escape", "w"])(
    "変換中の %s をタグ操作として処理しない",
    (key) => {
      const { open, dispatch } = renderDialog();
      open();
      fireEvent.change(input(), { target: { value: "a" } });

      fireEvent.keyDown(input(), { key, ctrlKey: key === "w", isComposing: true });
      advanceTime(300);

      expect(screen.getByRole("dialog")).toBeVisible();
      expect(input()).toHaveValue("a");
      expect(selectedOption()).toHaveTextContent("Beta");
      expect(dispatch).not.toHaveBeenCalled();
    }
  );

  test.each(["Escape", "背景クリック"])(
    "%s で絞り込みを行わず閉じ、エディターへフォーカスを戻す",
    async (action) => {
      const { open, user, dispatch } = renderDialog();
      open();
      advanceTime(100);

      if (action === "Escape") {
        await user.keyboard("{Escape}");
      } else {
        await user.click(screen.getByRole("dialog"));
      }
      advanceTime(300);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(dispatch.mock.calls).toEqual([[document.body, "editor:focus", {}]]);
    }
  );

  test.each([false, true])("タグ一覧が空か検索結果が空でも誤選択しない（一覧空: %s）", (emptyTags) => {
    const { open, dispatch } = renderDialog(emptyTags ? { tags: [] } : {});
    open();
    if (!emptyTags) {
      fireEvent.change(input(), { target: { value: "missing" } });
    }

    fireEvent.keyDown(input(), { key: "ArrowDown" });
    fireEvent.keyDown(input(), { key: "ArrowUp" });
    fireEvent.keyDown(input(), { key: "Enter" });
    advanceTime(300);

    expect(screen.getByText("No tags found")).toBeVisible();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(dispatch).not.toHaveBeenCalled();
  });

  test("マウスを重ねても選択位置を変えず、候補を押しても入力フォーカスを失わない", async () => {
    const { open, user } = renderDialog();
    open();
    advanceTime(100);
    const option = screen.getByRole("option", { name: "alpha" });

    await user.hover(option);
    expect(selectedOption()).toHaveTextContent("Beta");
    await user.pointer({ target: option, keys: "[MouseLeft>]" });

    expect(input()).toHaveFocus();
    await user.pointer({ keys: "[/MouseLeft]" });
    advanceTime(300);
  });
});

describe("タグ確定と絞り込み", () => {
  test.each(["Enter", "クリック"])(
    "%s で選んだタグ ID を、検索解除後に絞り込みコマンドへ渡す",
    async (action) => {
      const { open, user, dispatch } = renderDialog();
      open();
      advanceTime(100);

      if (action === "Enter") {
        await user.keyboard("{ArrowDown}{Enter}");
      } else {
        await user.click(screen.getByRole("option", { name: "alpha" }));
      }

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(dispatch.mock.calls).toEqual([[document.body, "editor:focus", {}]]);
      advanceTime(99);
      expect(dispatch).toHaveBeenCalledTimes(1);
      advanceTime(1);
      expect(dispatch).toHaveBeenLastCalledWith(document.body, "core:note-list-show-all-notes", {});
      advanceTime(100);
      expect(dispatch).toHaveBeenLastCalledWith(document.body, "core:find-clear", {});
      advanceTime(100);
      expect(dispatch.mock.calls).toEqual([
        [document.body, "editor:focus", {}],
        [document.body, "core:note-list-show-all-notes", {}],
        [document.body, "core:find-clear", {}],
        [document.body, "core:filter-by-tag", { tagId: "tag:alpha" }],
        [document.body, "editor:focus", {}],
      ]);
    }
  );

  test("閉じるアニメーション中の再選択を抑止し、再表示後は再び選択できる", () => {
    // 終了時に DOM が残る状態を模擬し、連続した確定イベントを送る。
    const originalUseModal = inkdropModule.useModal;
    let finishClosing;
    const close = jest.fn();
    jest.spyOn(inkdropModule, "useModal").mockImplementation(() => {
      const modal = originalUseModal();
      finishClosing = modal.close;
      return { ...modal, close };
    });
    const { open, dispatch } = renderDialog();
    open();

    fireEvent.click(screen.getByRole("option", { name: "Beta" }));
    fireEvent.click(screen.getByRole("option", { name: "alpha" }));
    advanceTime(300);

    expect(close).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls.filter(([, command]) => command === "core:filter-by-tag")).toEqual([
      [document.body, "core:filter-by-tag", { tagId: "tag:beta" }],
    ]);
    act(() => finishClosing());
    open();
    fireEvent.click(screen.getByRole("option", { name: "alpha" }));
    advanceTime(300);
    expect(dispatch).toHaveBeenCalledWith(document.body, "core:filter-by-tag", { tagId: "tag:alpha" });
  });
});

describe("表示処理と終了処理", () => {
  test.each([[800, "540px"], [300, "180px"]])(
    "高さ %i のエディターでは候補一覧の最大高さを %s にする",
    (editorHeight, expected) => {
      const { open } = renderDialog({ editorHeight });

      open();

      expect(document.documentElement.style.getPropertyValue("--narrow-tag-menu-height")).toBe(expected);
    }
  );

  test("選択候補をスクロール対象にする", () => {
    const { open } = renderDialog();
    open();
    const scroll = HTMLElement.prototype.scrollIntoView;
    scroll.mockClear();

    fireEvent.keyDown(input(), { key: "ArrowDown" });

    expect(scroll).toHaveBeenCalledWith({ block: "nearest" });
    expect(scroll.mock.contexts.at(-1)).toBe(selectedOption());
  });

  test("アンマウント時にコマンド登録と入力フォーカス用タイマーを解除する", () => {
    const { open, unmount, dispose, registeredCommands, inkdrop } = renderDialog();
    open();
    const focus = jest.spyOn(input(), "focus");
    fireEvent.change(input(), { target: { value: "a" } });
    expect(inkdrop.commands.add).toHaveBeenCalledTimes(1);

    unmount();
    advanceTime(100);

    expect(dispose).toHaveBeenCalledTimes(1);
    expect(registeredCommands["narrow-tag:open"]).toBeUndefined();
    expect(focus).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });
});
