# Todo アプリケーション要件定義

## 概要

本プロジェクトは、ユーザーがタスクを管理できる Todo アプリケーションを開発することを目的とします。

## 全体要件

- ユーザーはタスクの作成、閲覧、更新、削除ができること。
- タスクにはタイトル、説明、完了状態、作成日、更新日が含まれること。
- ユーザー認証機能は MVP（Minimum Viable Product）の範囲外とする。

## バックエンド要件

- **フレームワーク**: FastAPI
- **ORM**: SQLModel
- **データベース**: PostgreSQL
- **API エンドポイント**:
  - `GET /todos`: 全てのタスクを取得
  - `GET /todos/{id}`: 特定のタスクを取得
  - `POST /todos`: 新しいタスクを作成
  - `PUT /todos/{id}`: 特定のタスクを更新
  - `DELETE /todos/{id}`: 特定のタスクを削除
- **データモデル**:
  - `Todo`モデル: `id` (UUID), `title` (string), `description` (string, optional), `completed` (boolean, default: false), `created_at` (datetime), `updated_at` (datetime)

## フロントエンド要件

- **フレームワーク**: React
- **ルーティング**: React-Router-v7
- **機能**:
  - Todo リストの表示
  - 新規 Todo の追加フォーム
  - 各 Todo の編集・削除機能
  - Todo の完了状態の切り替え
- **UI/UX**:
  - 直感的で使いやすいインターフェース
  - レスポンシブデザイン（デスクトップ、モバイル対応）は MVP の範囲外とする。

## その他

- バックエンドの.env ファイルは alembic.ini のファイルと同じディレクトリに配置すること
- localStorage の仕組みは使わないこと
