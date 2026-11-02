import React from "react";

function Dialog({ children, visible, className, onBackdropClick }) {
  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Tag selector"
      className={className}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onBackdropClick();
        }
      }}
    >
      {children}
    </div>
  );
}

Dialog.Content = function DialogContent({ children }) {
  return <div>{children}</div>;
};

export function createInkdropMock({
  tags = [
    { _id: "tag:beta", name: "Beta" },
    { _id: "tag:alpha", name: "alpha" },
    { _id: "tag:jp", name: "日本語" },
  ],
  editorHeight = 800,
} = {}) {
  const state = { tags: { all: tags } };
  const registeredCommands = {};
  const dispose = jest.fn(() => {
    Object.keys(registeredCommands).forEach((name) => {
      delete registeredCommands[name];
    });
  });
  const dispatch = jest.fn();
  const inkdrop = {
    components: {
      classes: { Dialog },
      registerClass: jest.fn(),
      deleteClass: jest.fn(),
    },
    layouts: {
      addComponentToLayout: jest.fn(),
      removeComponentFromLayout: jest.fn(),
    },
    commands: {
      add: jest.fn((element, commands) => {
        Object.assign(registeredCommands, commands);
        return { dispose };
      }),
      dispatch,
    },
    store: {
      getState: () => state,
    },
  };

  const editor = document.createElement("div");
  editor.className = "editor";
  Object.defineProperty(editor, "clientHeight", { value: editorHeight });
  document.body.appendChild(editor);
  globalThis.inkdrop = inkdrop;

  return {
    inkdrop,
    registeredCommands,
    dispatch,
    dispose,
    setTags: (nextTags) => {
      state.tags.all = nextTags;
    },
  };
}
