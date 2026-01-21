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
 *      - CSVファイル: spending_data-2025.csv (デフォルト)
 *      - 画像ファイル: ./images/ ディレクトリ
 */

import * as fs from "node:fs";
import * as csvWriter from "csv-writer";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { Readable } from "node:stream";
import { fetchSpendingData } from "./zaim-outcome.script";

const pipelineAsync = promisify(pipeline);

// 画像ダウンロード関数
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const downloadImages = async (data: any[], outputDir: string) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const item of data) {
    if (item.image_url) {
      const imagePath = `${outputDir}/${item.id}.jpg`;

      console.log(`📥 Downloading image: ${item.image_url}`);

      try {
        const response = await fetch(item.image_url);
        if (!response.ok || !response.body) {
          console.warn(`⚠ Failed to download image for ID ${item.id}: ${response.statusText}`);
          continue;
        }

        // Node.js の ReadableStream に変換して保存
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const readable = Readable.fromWeb(response.body as any);
        await pipelineAsync(readable, fs.createWriteStream(imagePath));

        console.log("✅ Image downloaded:", imagePath);
      } catch (error) {
        console.error(`❌ Failed to download image for ID ${item.id}:`, error);
      }
    }
  }
};

// CSV出力関数
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
  console.log("✅ CSV export completed:", filePath);
};

(async () => {
  // ============================================
  // 設定: ここで取得期間と出力ファイル名を変更できます
  // ============================================
  const startDate = "2025-01-01";  // 開始日 (YYYY-MM-DD形式)
  const endDate = "2025-12-31";    // 終了日 (YYYY-MM-DD形式)
  const csvFilePath = "./spending_data-2025.csv";  // 出力CSVファイル名
  const imageOutputDir = "./images";  // 画像出力ディレクトリ

  try {
    console.log("🚀 Starting data extraction...");
    const data = await fetchSpendingData(startDate, endDate);

    console.log("🚀 Starting CSV export...");
    await exportToCsv(data, csvFilePath);
    console.log("🎉 CSV export completed:", csvFilePath);

    console.log("📸 Starting image download...");
    await downloadImages(data, imageOutputDir);
    console.log("🎉 Image download completed.");
  } catch (error) {
    console.error("❌ Error occurred:", error);
  }
})();
