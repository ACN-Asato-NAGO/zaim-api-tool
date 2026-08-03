import { generateOAuthHeader } from "./zaim-auth.script";

const API_BASE = "https://api.zaim.net/v2";
const ACCESS_TOKEN = process.env.ZAIM_ACCESS_TOKEN || "";
const ACCESS_SECRET = process.env.ZAIM_ACCESS_SECRET || "";

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

  const response = await fetch(url, { headers });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch spending data: ${response.statusText} - ${text}`);
  }

  return JSON.parse(text).money;
};

