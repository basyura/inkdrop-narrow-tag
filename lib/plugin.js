"use babel";

import NarrowTag from "./narrow-tag";

module.exports = {
  activate() {
    inkdrop.components.registerClass(NarrowTag);
    inkdrop.layouts.addComponentToLayout("modal", "NarrowTagMessageDialog");
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout(
      "modal",
      "NarrowTagMessageDialog"
    );
    inkdrop.components.deleteClass(NarrowTag);
  },
};
