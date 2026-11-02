# 表示

## 構成

Inkdrop の `Dialog` の `Dialog.Content` 内に入力欄と候補一覧を配置する。

| 要素 | CSS クラス・属性 |
| --- | --- |
| ダイアログ | `.narrow-tag-dialog` |
| 入力欄と候補一覧のコンテナー | `.narrow-tag-dropdown` |
| 検索入力欄 | `.narrow-tag-input.native-key-bindings`、`type="text"`、スペルチェック無効 |
| 候補一覧 | `.narrow-tag-menu`、`role="listbox"`、`aria-label="Tags"` |
| 候補 | `.narrow-tag-option`、`button` 要素、`type="button"`、`role="option"` |
| 選択中の候補 | `.is-active` を追加し、`aria-selected` を真にする |
| 候補なしのメッセージ | `.narrow-tag-empty` |

## 配置とサイズ

- ダイアログに `margin-top: 80px !important` と `align-self: flex-start` を指定する。背景は `none !important`。
- 入力欄と候補一覧のコンテナーの幅は `300px`。
- 入力欄と各候補の幅は `100%`。
- 入力欄の余白は上下 `0.75rem`、左右 `0.9rem`。枠線は `1px solid`、角丸は `0.5rem`。
- 候補一覧の上余白は `0.5rem`、角丸は `0.5rem`。
- 各候補と候補なしのメッセージの余白は上下 `0.65rem`、左右 `0.9rem`。
- 候補の文字は左寄せで、マウスカーソルは `pointer`。

ダイアログを開くたびに `.editor` の `clientHeight` を取得し、次の値を `document.documentElement` の CSS カスタムプロパティに設定する。

```text
--narrow-tag-menu-height = max(エディターの高さ - 260, 180) px
```

候補一覧はこの値を `max-height` として使う。`180px` は算出する最大高さの下限であり、一覧自体の最小高さではない。候補が少ない場合は内容に応じて一覧が短くなる。

高さを再計算するのは開いたときのみ。ウィンドウのリサイズを監視して更新する処理はない。

## 配色

| 対象 | 指定 |
| --- | --- |
| 入力欄の枠線 | `var(--border-color)` |
| 入力欄の背景 | `var(--input-background)` |
| 候補一覧の背景 | `var(--dropdown-menu-background)` |
| 通常候補の背景 | `transparent` |
| 選択中候補の背景 | `var(--note-list-view-item-active-background)` |
| 候補なしの文字色 | `var(--muted-text-color)` |
| 入力欄と候補の文字色 | `inherit` |

テーマの CSS 変数を参照し、プラグイン側で固定の色や変数未定義時の代替色は指定しない。候補の枠線は `0`。独自のホバー用スタイルは定義しない。

## スクロール

候補一覧には `overflow-y: auto` を指定する。内容が最大高さを超えると縦スクロールできる。

表示状態、選択位置、検索文字列の変更時に、表示中かつ選択中の候補要素が存在すれば `scrollIntoView({ block: "nearest" })` を呼ぶ。これにより、キーボードで移動した候補が見える位置へスクロールする。

## 実装

- [styles/narrow-tag.css](../../styles/narrow-tag.css)：配置、サイズ、配色。
- [lib/narrow-tag-dialog.js](../../lib/narrow-tag-dialog.js)：高さの設定、属性、選択状態、スクロール。
