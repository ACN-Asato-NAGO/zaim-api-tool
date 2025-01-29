import { generateOAuthHeader } from "./zaim-auth.script";

const ACCESS_TOKEN = process.env.ZAIM_ACCESS_TOKEN || "";
const ACCESS_SECRET = process.env.ZAIM_ACCESS_SECRET || "";


const verifyAccessToken = async () => {
  const url = "https://api.zaim.net/v2/home/user/verify";

  const headers = {
    Authorization: generateOAuthHeader("GET", url, ACCESS_TOKEN, ACCESS_SECRET),
  };

  console.log("📡 Verifying access token...");

  const response = await fetch(url, { headers });
  const text = await response.text();

  console.log("🔍 Access Token Verification Response:", text);
};

verifyAccessToken();
