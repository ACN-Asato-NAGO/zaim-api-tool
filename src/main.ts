import * as fs from "node:fs";
import * as csvWriter from "csv-writer";
import { fetchSpendingData } from "./zaim-outcome.script";

/**
 * Zaim API 支出データエクスポートツール
 *
 * Usage:
 *   1. .env ファイルに以下の環境変数を設定:
 *      - ZAIM_CONSUMER_KEY: Zaim API の Consumer Key
 *      - ZAIM_CONSUMER_SECRET: Zaim API の Consumer Secret
 *      - ZAIM_ACCESS_TOKEN: Zaim API の Access Token
 *      - ZAIM_ACCESS_SECRET: Zaim API の Access Secret
 *
 *   2. 実行:
 *      npm start
 *
 *   3. 期間の変更:
 *      startDate と endDate を編集して取得期間を変更できます
 *      日付形式: "YYYY-MM-DD"
 *
 *   4. 出力:
 *      - CSVファイル: spending_data-YYYYMMDD-HHMMSS.csv (実行時のタイムスタンプ付き)
 */

// CSV出力関数（UTF-8 BOM付き）
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const exportToCsv = async (data: any[], filePath: string) => {
  const writer = csvWriter.createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "id", title: "ID" },
      { id: "date", title: "Date" },
      { id: "amount", title: "Amount" },
      { id: "category_id", title: "Category ID" },
      { id: "genre_id", title: "Genre ID" },
      { id: "from_account_id", title: "From Account ID" },
      { id: "to_account_id", title: "To Account ID" },
      { id: "currency_code", title: "Currency" },
      { id: "place", title: "Place" },
      { id: "comment", title: "Comment" },
      { id: "receipt_id", title: "Receipt ID" },
    ],
  });

  // データの整形
  const records = data.map((item) => ({
    id: item.id,
    date: item.date,
    amount: item.amount,
    category_id: item.category_id,
    genre_id: item.genre_id,
    from_account_id: item.from_account_id,
    to_account_id: item.to_account_id,
    currency_code: item.currency_code,
    place: item.place || "",
    comment: item.comment || "",
    receipt_id: item.receipt_id,
  }));

  await writer.writeRecords(records);

  // UTF-8 BOMを先頭に追加（Excelで正しく開くため）
  const fileContent = fs.readFileSync(filePath, "utf8");
  const bom = "\uFEFF"; // UTF-8 BOM
  fs.writeFileSync(filePath, bom + fileContent, "utf8");

  console.log("✅ CSV export completed:", filePath);
};

(async () => {
  // ============================================
  // 設定: ここで取得期間を変更できます
  // ============================================
  const startDate = "2025-01-01";  // 開始日 (YYYY-MM-DD形式)
  const endDate = "2025-12-31";    // 終了日 (YYYY-MM-DD形式)

  // 実行時のタイムスタンプを生成（YYYYMMDD-HHMMSS形式）
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, "").slice(0, 15).replace("T", "-"); // YYYYMMDD-HHMMSS
  const csvFilePath = `./spending_data-${timestamp}.csv`;  // 出力CSVファイル名（日時付き）

  try {
    console.log("🚀 Starting data extraction...");
    const data = await fetchSpendingData(startDate, endDate);
    console.log(`📊 Fetched ${data.length} records`);

    console.log("🚀 Starting CSV export...");
    await exportToCsv(data, csvFilePath);
    console.log("🎉 CSV export completed:", csvFilePath);
  } catch (error) {
    console.error("❌ Error occurred:", error);
  }
})();
