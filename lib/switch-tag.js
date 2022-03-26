"use babel";

import SwitchTagMessageDialog from "./switch-tag-message-dialog";

module.exports = {
  activate() {
    inkdrop.components.registerClass(SwitchTagMessageDialog);
    inkdrop.layouts.addComponentToLayout("modal", "SwitchTagMessageDialog");
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout(
      "modal",
      "SwitchTagMessageDialog"
    );
    inkdrop.components.deleteClass(SwitchTagMessageDialog);
  },
};
