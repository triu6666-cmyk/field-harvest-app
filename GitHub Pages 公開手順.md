# GitHub Pages 公開手順

## 目的

このアプリをインターネット上に公開し、スマホからURLで開けるようにします。

公開後の形:

```text
https://GitHubユーザー名.github.io/リポジトリ名/
```

## こちらで準備済みのもの

- GitHub Pagesで動く静的ファイル構成
- PWA用の`manifest.webmanifest`
- PWA用の`service-worker.js`
- ホーム画面用アイコン`app-icon.svg`
- GitHub Pages用`.nojekyll`
- Supabase用SQL`supabase-schema.sql`

## あなたがやる必要があること

以下はGitHub上での操作なので、あなた自身のアカウントで作業が必要です。

1. GitHubアカウントを作る、またはログインする
2. 新しいリポジトリを作る
3. このフォルダ内のファイルをアップロードする
4. GitHub Pagesを有効化する
5. 公開URLをスマホで開く

## 手順1: GitHubリポジトリを作る

1. GitHubを開く
2. 右上の`+`から`New repository`を選ぶ
3. Repository nameを入力する

例:

```text
field-harvest-app
```

4. Publicを選ぶ
5. `Create repository`を押す

## 手順2: ファイルをアップロードする

リポジトリ作成後、`uploading an existing file`を選びます。

以下のファイルをアップロードします。

```text
.nojekyll
.gitignore
README.md
index.html
styles.css
app.js
storage.js
manifest.webmanifest
service-worker.js
app-icon.svg
supabase-schema.sql
スマホで開く手順.md
GitHub Pages 公開手順.md
```

ローカル確認用の以下も入れて問題ありません。

```text
local-server.js
start-mobile-server.cmd
```

アップロード後、下の`Commit changes`を押します。

## 手順3: GitHub Pagesを有効化する

1. リポジトリの`Settings`を開く
2. 左メニューの`Pages`を開く
3. `Build and deployment`の`Source`を`Deploy from a branch`にする
4. Branchを`main`にする
5. Folderを`/ (root)`にする
6. `Save`を押す

少し待つと公開URLが表示されます。

## 手順4: スマホで開く

GitHub PagesのURLをスマホで開きます。

例:

```text
https://GitHubユーザー名.github.io/field-harvest-app/
```

表示できたら、ホーム画面に追加します。

### iPhone

1. SafariでURLを開く
2. 共有ボタンを押す
3. `ホーム画面に追加`

### Android

1. ChromeでURLを開く
2. 右上メニューを押す
3. `ホーム画面に追加`または`アプリをインストール`

## 注意: データ同期について

GitHub Pagesで公開されるのはアプリ本体です。

PCとスマホで同じ収穫データを使うには、Supabase同期も必要です。

流れ:

1. Supabaseでプロジェクトを作る
2. `supabase-schema.sql`をSQL Editorで実行
3. アプリ右上の`☁`を開く
4. Supabase URL、anon key、共有データIDを設定
5. PC側で`クラウドへ保存`
6. `設定リンクをコピー`
7. スマホでそのリンクを開く
8. `クラウドから取得`

## 注意: 公開してはいけないもの

以下はアップロードしないでください。

```text
server.log
server-error.log
個人的なメモ
秘密のAPIキー
```

Supabaseの`anon public key`は公開前提のキーですが、このアプリでは同期設定リンク内に含まれます。
設定リンクは、自分のスマホや信頼できる相手だけに送ってください。
