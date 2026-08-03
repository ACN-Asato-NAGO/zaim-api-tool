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

`.env.example` をコピーして `.env` を作成し、各値を設定してください：

```bash
cp .env.example .env
```

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
# 当年（実行時の年）のデータを取得
npm start

# 年を指定して取得
npm start -- 2024

# 環境変数で年を指定
ZAIM_YEAR=2024 npm start
```

### 年の指定方法

優先順位: CLI 引数 > 環境変数 `ZAIM_YEAR` > 実行時の現在年

| 方法 | 例 |
|------|-----|
| CLI 引数 | `npm start -- 2024` |
| 環境変数 | `ZAIM_YEAR=2024 npm start` |
| デフォルト | `npm start`（実行時の年を自動取得）|

### MCP サーバーとして使う

Claude Code から直接 Zaim データを参照できる MCP サーバーとして起動できます。

#### 起動

```bash
npm run mcp
```

#### Claude Code への登録

`.claude/mcp.json` を作成し、`cwd` を自環境のパスに書き換えてください：

```json
{
  "mcpServers": {
    "zaim": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/path/to/zaim-api-tool"
    }
  }
}
```

#### 使えるツール

| ツール名 | 説明 | パラメータ |
|----------|------|-----------|
| `get_spending` | 指定期間の支出データを取得 | `start_date` (YYYY-MM-DD), `end_date` (YYYY-MM-DD) |

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
