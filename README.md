# zaim-api-tool

Zaim API を使用して一年分の支出明細を CSV ファイルにエクスポートするツールです。

## 機能

- Zaim API から指定期間の支出データを取得
- 取得したデータを CSV ファイルにエクスポート

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルを作成し、以下の環境変数を設定してください：

```env
ZAIM_CONSUMER_KEY=your_consumer_key
ZAIM_CONSUMER_SECRET=your_consumer_secret
ZAIM_ACCESS_TOKEN=your_access_token
ZAIM_ACCESS_SECRET=your_access_secret
```

これらの値は [Zaim Developer](https://dev.zaim.net/) でアプリケーションを登録して取得できます。

## 使い方

### 基本的な使い方

```bash
npm start
```

デフォルトでは、2025年1月1日から2025年12月31日までのデータを取得し、`spending_data-2025.csv` に出力します。

### 期間の変更

`src/main.ts` の以下の部分を編集して、取得期間を変更できます：

```typescript
const startDate = "2025-01-01";  // 開始日（YYYY-MM-DD形式）
const endDate = "2025-12-31";    // 終了日（YYYY-MM-DD形式）
const csvFilePath = "./spending_data-2025.csv";  // 出力CSVファイル名
```

### 出力ファイル

- **CSVファイル**: `./spending_data-YYYYMMDD-HHMMSS.csv` 形式で出力されます（実行時のタイムスタンプ付き）
  - 例: `./spending_data-20250115-143022.csv`

**注意**: ファイル名には実行時のタイムスタンプが自動的に付与されるため、同じ期間で実行しても上書きされません。

## CSV の出力形式

- **文字コード**: UTF-8 BOM付き（Excelで正しく開ける形式）
- **カラム**: 以下のカラムが含まれます：

- ID: 取引ID
- Date: 日付
- Amount: 金額
- Category ID: カテゴリID
- Genre ID: ジャンルID
- From Account ID: 支払元アカウントID
- To Account ID: 支払先アカウントID
- Currency: 通貨コード
- Place: 場所
- Comment: コメント
- Receipt ID: レシートID

## トラブルシューティング

### 認証エラーが発生する場合

- `.env` ファイルに正しい認証情報が設定されているか確認してください
- Zaim Developer でアプリケーションが正しく登録されているか確認してください

### API エラーが発生する場合

- 指定した期間が正しい形式（YYYY-MM-DD）になっているか確認してください
- Zaim API のレート制限に達していないか確認してください
