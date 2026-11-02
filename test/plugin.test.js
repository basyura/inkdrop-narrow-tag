import NarrowTagDialog from "../lib/narrow-tag-dialog";
import plugin from "../lib/plugin";
import { createInkdropMock } from "./helpers/create-inkdrop-mock";

describe("プラグインのライフサイクル", () => {
  test("有効化するとダイアログを登録して modal レイアウトに追加する", () => {
    const { inkdrop } = createInkdropMock();

    plugin.activate();

    expect(inkdrop.components.registerClass).toHaveBeenCalledWith(NarrowTagDialog);
    expect(inkdrop.layouts.addComponentToLayout).toHaveBeenCalledWith(
      "modal",
      "NarrowTagDialog"
    );
  });

  test("無効化するとレイアウトとコンポーネントの登録を解除する", () => {
    const { inkdrop } = createInkdropMock();
    plugin.activate();

    plugin.deactivate();

    expect(inkdrop.layouts.removeComponentFromLayout).toHaveBeenCalledWith(
      "modal",
      "NarrowTagDialog"
    );
    expect(inkdrop.components.deleteClass).toHaveBeenCalledWith(NarrowTagDialog);
  });
});
