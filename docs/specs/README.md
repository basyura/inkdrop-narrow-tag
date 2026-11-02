# narrow-tag の仕様

## 概要

narrow-tag は、タグ名を検索して 1 個のタグを選び、ノート一覧をそのタグで絞り込む Inkdrop プラグイン。

公開コマンドは `narrow-tag:open`。タグ選択ダイアログを開く。プラグイン独自の設定項目と既定のキーバインドは定義していない。

## 仕様書一覧

| 仕様書 | 内容 |
| --- | --- |
| [タグ選択](tag-selector.md) | タグの取得、検索、候補移動、確定とキャンセル |
| [ノートの絞り込み](note-filtering.md) | 確定後のコマンド実行順序とフォーカス制御 |
| [表示](appearance.md) | 配置、サイズ、配色、スクロール |

## 対応環境と導入

- `package.json` の `engines.inkdrop` は `^6.x`。
- インストールコマンドは `ipm install narrow-tag`。
- React、`useModal`、グローバルの `inkdrop` など、Inkdrop の実行環境を利用する。パッケージ独自の実行時依存は宣言していない。
- スタイルは CSS で提供する。
- ダイアログを開くには、画面に `.editor` 要素が存在することを前提とする。

[v6 対応時の記録](../plans/001-inkdrop-v6-migration.md)では macOS の Inkdrop 6.3.0 で実機確認済み。6.0〜6.2 系と実際の日本語 IME 操作は未確認。これらは対応バージョンの宣言とは別の検証範囲を示す。

## プラグインの有効化・無効化

| タイミング | 処理 |
| --- | --- |
| 有効化 | `NarrowTagDialog` をコンポーネントとして登録し、`modal` レイアウトに追加する |
| ダイアログのマウント | `document.body` に `narrow-tag:open` のハンドラーを登録する |
| ダイアログのアンマウント | コマンド登録時の購読を `dispose()` する |
| 無効化 | `modal` レイアウトから `NarrowTagDialog` を除去し、コンポーネント登録を削除する |

ダイアログは Inkdrop の `Dialog` と `useModal` を利用する。公開コマンドのハンドラーは、再描画ごとに更新される参照を介して最新の表示処理を呼び出す。

## 実装との対応

| ファイル | 役割 |
| --- | --- |
| [lib/plugin.js](../../lib/plugin.js) | プラグインの有効化・無効化 |
| [lib/narrow-tag-dialog.js](../../lib/narrow-tag-dialog.js) | ダイアログ、タグ検索、入力操作、絞り込みコマンド |
| [styles/narrow-tag.css](../../styles/narrow-tag.css) | ダイアログと候補一覧の表示 |
| [package.json](../../package.json) | パッケージのエントリーポイントと対応環境 |

本仕様書は現在の実装を記述する。移行の履歴と検証結果は計画ファイルを参照する。
