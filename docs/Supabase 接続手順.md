# Supabase 接続手順

## 目的

PCとスマホで同じ収穫データを使うために、Supabaseにデータ保存先を作ります。

GitHub Pagesはアプリ本体を公開する場所です。  
Supabaseは収穫・費用データを保存する場所です。

## あなたがやること

Supabaseの画面操作はあなたのアカウントで行う必要があります。

1. Supabaseアカウントを作る、またはログインする
2. 新しいProjectを作る
3. SQL Editorで`docs/supabase-schema.sql`を実行する
4. Project URLをコピーする
5. publishable key、またはanon public keyをコピーする
6. アプリの`☁`設定に入力する
7. 接続テストする
8. クラウドへ保存する
9. スマホで設定リンクを開いてクラウドから取得する

## 手順1: Supabaseプロジェクト作成

1. Supabaseを開く
2. `New project`を押す
3. Organizationを選ぶ
4. Project nameを入力する

例:

```text
field-harvest-app
```

5. Database Passwordを設定する
6. Regionは近い地域を選ぶ
7. `Create new project`を押す

## 手順2: テーブル作成

SupabaseのProject画面で:

1. 左メニューの`SQL Editor`を開く
2. `New query`を押す
3. `docs/supabase-schema.sql`の中身を貼り付ける
4. `Run`を押す

作成されるテーブル:

```text
field_app_states
```

## 手順3: URLとKeyを取得

SupabaseのProject画面で、API設定画面を開きます。

取得するもの:

- Project URL
- publishable key、またはanon public key

アプリに入れてはいけないもの:

- secret key
- service_role key
- database password

## 手順4: アプリに設定

公開したGitHub Pagesのアプリを開きます。

1. 右上の`☁`を押す
2. `Supabase URL`にProject URLを入れる
3. `publishable key / anon public key`に公開用キーを入れる
4. `共有データID`の`生成`を押す
5. `設定を保存`を押す
6. `接続テスト`を押す

接続できたら:

1. `クラウドへ保存`を押す
2. `設定リンクをコピー`を押す
3. スマホへリンクを送る

## 手順5: スマホ側

1. スマホで設定リンクを開く
2. 同期設定が自動で取り込まれる
3. `クラウドから取得`を押す
4. PCと同じデータが表示されるか確認する

## 注意

このSQLは最初の動作確認を優先したシンプルな設定です。

共有データIDを知っている人は、その畑データを読み書きできます。  
設定リンクは自分の端末や信頼できる相手だけに送ってください。

本格運用では、ログイン機能やユーザーごとの権限管理を追加するのが望ましいです。
