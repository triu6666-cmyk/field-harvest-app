# 収穫量管理アプリ

畑の区画、苗、収穫量、費用を記録するためのブラウザアプリです。

## 主な機能

- 左右ページ式の畑マップ
- 区画ごとの野菜・品種登録
- 栽培終了した苗の履歴保存・復元
- 区画からの収穫数カウント
- 野菜別・品種別の収穫集計
- 費用記録
- レシート画像のOCR読み取り
- 月別・分類別の費用集計
- PWA対応
- Supabaseによるクラウド同期の入口

## 公開方式

このアプリは静的ファイルだけで動くため、GitHub Pagesで公開できます。

公開に必要な主なファイル:

- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/storage.js`
- `manifest.webmanifest`
- `service-worker.js`
- `assets/app-icon.svg`

## フォルダ構成

```text
assets/  画像・アプリアイコン
css/     画面デザイン
js/      アプリの処理・データ定義
docs/    公開・接続手順、調査用資料、SQL
tools/   ローカル確認用サーバー
```

## データ保存

初期状態では、データはブラウザの`localStorage`に保存されます。

保存キー:

```text
field-harvest-manager-v1
```

PCとスマホで同じデータを使うには、アプリ右上のクラウド同期設定からSupabaseを設定します。

## Supabase同期

Supabase側には以下のSQLを実行してください。

```text
docs/supabase-schema.sql
```

詳しい手順:

```text
docs/Supabase 接続手順.md
```

その後、アプリの`☁`ボタンから以下を設定します。

- Supabase URL
- publishable key、またはanon public key
- 共有データID

## ローカルでスマホ確認

同じWi-Fi内でスマホから確認する場合は、PCで以下を起動します。

```text
tools/start-mobile-server.cmd
```

詳しい手順は以下を参照してください。

```text
docs/スマホで開く手順.md
```
