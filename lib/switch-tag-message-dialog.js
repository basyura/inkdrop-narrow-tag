"use babel";

import React from "react";
import { CompositeDisposable } from "event-kit";
import { Dropdown } from "semantic-ui-react";

export default class SwitchTagMessageDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { options: [] };
  }

  componentWillMount() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      inkdrop.commands.add(document.body, {
        "switch-tag:open": () => this.open(),
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.dispose();
  }

  open() {
    this.refs.dropdown.state.value = "";
    this.refs.dropdown.setSelectedIndex(0);
    this.buildTags();
    this.refs.dialog.showDialog();
  }

  buildTags(_options, _query) {
    const { tags } = inkdrop.store.getState();
    const options = [];
    tags.all.forEach((tag) => {
      options.push({
        key: tag._id,
        text: tag.name,
        value: tag._id,
      });
    });

    this.setState({ options });
  }

  handleOnChange = (_, data) => {
    this.refs.dialog.dismissDialog();
    setTimeout(() => {
      // to clear
      const input = document.querySelector(".note-list-search-bar input");
      inkdrop.commands.dispatch(input, "core:find-clear");
      // filter by tag
      setTimeout(() => {
        inkdrop.commands.dispatch(document.body, "core:filter-by-tag", {
          tagId: data.value,
        });
        inkdrop.commands.dispatch(document.body, "editor:focus");
      }, 100);
    }, 100);
  };

  handleKeyDown(ev) {
    const nev = ev.nativeEvent;
    if (!nev.ctrlKey) {
      return;
    }
    // delete word (clear)
    if (nev.key == "w") {
      this.refs.dropdown.clearSearchQuery();
      return;
    }

    let first = -1;
    let second = -1;
    // check keyCode
    if (nev.key == "n") {
      first = 40;
      second = 38;
    } else if (nev.key == "p") {
      first = 38;
      second = 40;
    }
    // fire
    if (first > 0) {
      document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: first }));
      // to scroll into view
      setTimeout(() =>
        document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: first }))
      );
      setTimeout(() =>
        document.dispatchEvent(
          new KeyboardEvent("keydown", { keyCode: second })
        )
      );
      nev.cancelBubble = true;
      nev.preventDefault();
    }
  }

  render() {
    const { MessageDialog } = inkdrop.components.classes;
    return (
      <MessageDialog
        ref="dialog"
        title="Switch Tag"
        buttons={[]}
        modalSettings={{ autofocus: true }}
      >
        <Dropdown
          ref="dropdown"
          options={this.state.options}
          placeholder="Select Tag"
          onChange={this.handleOnChange}
          searchInput={
            <Dropdown.SearchInput
              className="ui input"
              onKeyDown={this.handleKeyDown.bind(this)}
            />
          }
          selectOnNavigation={false}
          fluid
          selection
          search
        />
      </MessageDialog>
    );
  }
}
