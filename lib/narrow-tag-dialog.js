"use babel";

import React, { useState, useEffect, useRef } from "react";
import { useModal } from "inkdrop";

const NarrowTagDialog = (_) => {
  const { Dialog } = inkdrop.components.classes;

  const modal = useModal();
  const inputRef = useRef(null);
  const activeItemRef = useRef(null);
  const openRef = useRef(null);
  const isClosingRef = useRef(false);
  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  /*
   *
   */
  const open = () => {
    // set menu's height
    const height = document.querySelector(".editor").clientHeight;
    document.documentElement.style.setProperty(
      "--narrow-tag-menu-height",
      Math.max(height - 260, 180).toString(10) + "px"
    );

    // build options
    const tags = buildTags();
    setOptions(tags);
    setQuery("");
    setSelectedIndex(0);
    isClosingRef.current = false;

    modal.show();
  };
  openRef.current = open;
  /*
   *
   */
  useEffect(() => {
    const sub = inkdrop.commands.add(document.body, {
      "narrow-tag:open": () => {
        openRef.current();
      },
    });
    return () => sub.dispose();
  }, []);
  /*
   *
   */
  useEffect(() => {
    // check state
    if (!modal.state.visible) {
      return;
    }

    // how to focus? wait for ui
    const timeoutId = setTimeout(() => {
      if (inputRef.current != null) {
        inputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [modal.state.visible]);

  const filteredOptions = options.filter((option) =>
    option.text.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!modal.state.visible || activeItemRef.current == null) {
      return;
    }
    activeItemRef.current.scrollIntoView({ block: "nearest" });
  }, [modal.state.visible, selectedIndex, query]);
  /*
   *
   */
  const handleKeyDown = (ev) => {
    if (ev.nativeEvent.isComposing) {
      return;
    }
    if (ev.key == "Escape") {
      ev.preventDefault();
      ev.stopPropagation();
      close();
      return;
    }

    if (ev.key == "Enter") {
      ev.preventDefault();
      ev.stopPropagation();
      const option = filteredOptions[selectedIndex];
      if (option != null) {
        handleOnChange(null, { value: option.value });
      }
      return;
    }

    if (ev.key == "ArrowDown" || (ev.ctrlKey && ev.key == "n")) {
      ev.preventDefault();
      ev.stopPropagation();
      setSelectedIndex((index) =>
        Math.max(0, Math.min(index + 1, filteredOptions.length - 1))
      );
      return;
    }

    if (ev.key == "ArrowUp" || (ev.ctrlKey && ev.key == "p")) {
      ev.preventDefault();
      ev.stopPropagation();
      setSelectedIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (ev.ctrlKey && ev.key == "w") {
      ev.preventDefault();
      ev.stopPropagation();
      setQuery("");
      setSelectedIndex(0);
    }
  };
  /*
   *
   */
  const handleOnChange = (_, data) => {
    if (isClosingRef.current) {
      return;
    }
    isClosingRef.current = true;

    close();
    setTimeout(() => {
      invoke("core:note-list-show-all-notes");
      setTimeout(() => {
        invoke("core:find-clear", null, null);
        setTimeout(() => {
          invoke("core:filter-by-tag", { tagId: data.value });
          invoke("editor:focus");
        }, 100);
      }, 100);
    }, 100);
  };
  /*
   *
   */
  const buildTags = () => {
    const { tags } = inkdrop.store.getState();
    const options = [];
    tags.all.forEach((tag) => {
      options.push({
        key: tag._id,
        text: tag.name,
        value: tag._id,
      });
    });

    return options;
  };
  /*
   *
   */
  const close = () => {
    modal.close();
    invoke("editor:focus");
  };
  /*
   *
   */
  const invoke = (cmd, param, ele) => {
    if (ele == null) {
      ele = document.body;
    }
    if (param == null) {
      param = {};
    }
    inkdrop.commands.dispatch(ele, cmd, param);
  };
  /*
   *
   */
  return (
    <Dialog
      {...modal.state}
      onBackdropClick={close}
      className="narrow-tag-dialog"
    >
      <Dialog.Content>
        <div className="narrow-tag-dropdown">
          <input
            ref={inputRef}
            className="narrow-tag-input native-key-bindings"
            type="text"
            placeholder="Select Tag"
            aria-label="Select Tag"
            spellCheck="false"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="narrow-tag-menu" role="listbox" aria-label="Tags">
            {filteredOptions.map((option, index) => (
              <button
                key={option.key}
                ref={index === selectedIndex ? activeItemRef : null}
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                className={
                  "narrow-tag-option" +
                  (index === selectedIndex ? " is-active" : "")
                }
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleOnChange(null, { value: option.value })}
              >
                {option.text}
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <div className="narrow-tag-empty">No tags found</div>
            )}
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

export default NarrowTagDialog;
