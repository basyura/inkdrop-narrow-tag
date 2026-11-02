# narrow-tag

Inkdrop's plugin to narrow by tag.

Requires Inkdrop v6.

![Screenshot](https://raw.githubusercontent.com/basyura/inkdrop-narrow-tag/master/images/image.png)

## Install

```
ipm install narrow-tag
```

## Keybindings

| Command         | Explanation       |
| --------------- | ------------------|
| narrow-tag:open | open tag selector |


## Development

```sh
npm ci
npm test
```

Tests use Jest and React Testing Library with mocked Inkdrop APIs in jsdom.
They cover plugin registration, tag search and selection, keyboard controls,
focus handling, and filtering command order. They run using this repository's
development dependencies; a running Inkdrop instance is not required.

jsdom does not verify CSS layout, actual scrolling, or Inkdrop's filtering
results. Check those in Inkdrop when changing the UI.

## LICENSE

MIT
