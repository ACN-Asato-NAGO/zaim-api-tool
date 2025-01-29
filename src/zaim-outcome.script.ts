import { generateOAuthHeader } from "./zaim-auth.script";

const API_BASE = "https://api.zaim.net/v2";
const ACCESS_TOKEN = process.env.ZAIM_ACCESS_TOKEN || "";
const ACCESS_SECRET = process.env.ZAIM_ACCESS_SECRET || "";

console.log({ ACCESS_TOKEN, ACCESS_SECRET });

// **年間データの取得**
export const fetchSpendingData = async (startDate: string, endDate: string) => {
  const url = new URL(`${API_BASE}/home/money`);
  url.searchParams.append("mode", "payment");
  url.searchParams.append("start_date", startDate);
  url.searchParams.append("end_date", endDate);

  console.log("📡 Fetching spending data...");

  const headers = {
    Authorization: generateOAuthHeader("GET", url.toString(), ACCESS_TOKEN, ACCESS_SECRET),
  };

  console.log("🔍 Generated OAuth Params:", headers.Authorization);

  const response = await fetch(url, { headers });
  const text = await response.text();

  console.log("🔍 API Response:", text);

  if (!response.ok) {
    throw new Error(`Failed to fetch spending data: ${response.statusText} - ${text}`);
  }

  return JSON.parse(text).money;
};

// **メイン処理**
(async () => {
  try {
    console.log("🚀 Starting data extraction...");
    const data = await fetchSpendingData("2024-01-01", "2024-12-31");
    console.log("✅ Data fetched successfully:", data);
  } catch (error) {
    console.error("❌ Error occurred:", error);
  }
})();
