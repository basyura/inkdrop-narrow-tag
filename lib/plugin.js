"use babel";

import NarrowTagDialog from "./narrow-tag-dialog";

module.exports = {
  activate() {
    inkdrop.components.registerClass(NarrowTagDialog);
    inkdrop.layouts.addComponentToLayout("modal", "NarrowTagDialog");
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout("modal", "NarrowTagDialog");
    inkdrop.components.deleteClass(NarrowTagDialog);
  },
};
