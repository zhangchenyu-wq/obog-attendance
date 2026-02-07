# OBOG会出席確認システム - プロジェクト計画書

## プロジェクト概要

OBOG会の出席確認を効率的に管理するウェブシステムです。バウハウス様式のモダンなデザインを採用し、参加者が期と名前を選択して出席登録を行い、座席番号を確認できます。出席状況はGoogleスプレッドシートに自動同期されます。

## データ構造設計

### テーブル1: members（名簿）
- `id`: 主キー
- `name`: 名前
- `generation`: 期（27-36）
- `createdAt`: 作成日時

### テーブル2: seats（座席表）
- `id`: 主キー
- `name`: 名前
- `generation`: 期
- `tableNumber`: 卓番号（1-12、または "自由"）
- `seatPosition`: 座席位置（卓内での行番号）
- `createdAt`: 作成日時

### テーブル3: attendance（出席記録）
- `id`: 主キー
- `name`: 名前
- `generation`: 期
- `tableNumber`: 卓番号
- `seatPosition`: 座席位置
- `attendedAt`: 出席登録日時
- `syncedToSheet`: Googleシート同期済みフラグ
- `createdAt`: 作成日時

## API設計

### tRPCプロシージャ

#### 公開API
- `members.getByGeneration(generation)` - 期から名前リスト取得
- `seats.getByName(name, generation)` - 名前から座席情報取得
- `attendance.register(name, generation)` - 出席登録
- `attendance.getLatest(limit)` - 最新の出席記録取得

#### 管理API
- `attendance.getAll()` - 全出席記録取得
- `attendance.syncToSheet()` - Googleシートに同期

## Googleスプレッドシート連携

Data APIを使用してGoogleスプレッドシートに出席状況をリアルタイム同期します。

### 同期内容
- 出席者名
- 期
- 座席番号（卓番号-座席位置）
- 登録日時

### 同期タイミング
- 出席登録時に自動同期
- 管理者が手動同期可能

## デザイン方針（バウハウス様式）

### 色彩体系
- 原色：赤（#FF0000）、青（#0000FF）、黄（#FFFF00）
- 背景：オフホワイト（#F5F5F0）
- テキスト：濃紺（#1A1A1A）

### 幾何学的形態
- 円：ボタン、アイコン、装飾要素
- 三角：矢印、ナビゲーション要素
- 正方形：カード、コンテナ、グリッド

### タイポグラフィ
- サンセリフ書体（Montserrat, Roboto）
- 大きく力強いフォントウェイト（600-700）
- 高コントラスト

### レイアウト
- 非対称バランス
- 十分なネガティブスペース
- レイヤー構造による視覚的階層
- 機能的で明確な情報構造

## 実装フロー

1. **データベーススキーマ実装** - Drizzleで3つのテーブルを定義
2. **データインポート** - 名簿と座席表データをDBに投入
3. **バックエンド実装** - tRPCプロシージャ実装
4. **Googleシート連携** - Data API統合
5. **フロントエンド実装** - バウハウス様式UIコンポーネント
6. **統合テスト** - 全機能動作確認

## 技術スタック

- **フロントエンド**: React 19 + Tailwind CSS 4 + shadcn/ui
- **バックエンド**: Express 4 + tRPC 11
- **データベース**: MySQL（Drizzle ORM）
- **外部連携**: Google Sheets API（Data API経由）
- **テスト**: Vitest
