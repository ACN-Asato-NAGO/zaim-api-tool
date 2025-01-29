import * as fs from "node:fs";
import * as readline from "node:readline";
import { generateOAuthHeader } from "./zaim-auth.script";
import path from "node:path";

const API_BASE = "https://api.zaim.net/v2";

// **リクエストトークンの取得**
const getRequestToken = async (): Promise<Record<string, string>> => {
  const url = `${API_BASE}/auth/request`;

  const headers = {
    Authorization: generateOAuthHeader("POST", url, "", "", {
      oauth_callback: "oob", // ✅ 追加する
    }),
  };

  console.log("🔍 Request Token URL:", url);
  console.log("🔍 Request Token Headers:", headers);

  const response = await fetch(url, { method: "POST", headers });
  const text = await response.text();

  console.log("🔍 Request Token Response:", text);

  const result = Object.fromEntries(new URLSearchParams(text));
  if (!result.oauth_token || !result.oauth_token_secret) {
    throw new Error("Failed to get request token");
  }

  return result;
};

// **ユーザー認証**
const authorizeUser = async (oauthToken: string): Promise<string> => {
  console.log("Please visit the following URL to authorize:");
  console.log(`https://auth.zaim.net/users/auth?oauth_token=${oauthToken}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) =>
    rl.question("Enter the PIN provided by Zaim: ", (answer) => {
      rl.close();
      resolve(answer.trim());
    }),
  );
};

// **アクセストークン取得**
const getAccessToken = async (requestToken: string, requestTokenSecret: string, verifier: string) => {
  const url = `${API_BASE}/auth/access`;

  const headers = {
    Authorization: generateOAuthHeader("POST", url, requestToken, requestTokenSecret, { oauth_verifier: verifier }),
  };

  const response = await fetch(url, { method: "POST", headers });
  const text = await response.text();
  const result = Object.fromEntries(new URLSearchParams(text));

  if (!result.oauth_token || !result.oauth_token_secret) {
    throw new Error("Failed to get access token");
  }

  return result;
};

const envFilePath = path.resolve(process.cwd(), ".env");

const saveAccessToken = (token: string, secret: string) => {
  // 既存の .env を読み込む
  let envContent = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, "utf8") : "";

  // 既存の `ZAIM_ACCESS_TOKEN` / `ZAIM_ACCESS_SECRET` を削除
  envContent = envContent
    .split("\n")
    .filter((line) => !line.startsWith("ZAIM_ACCESS_TOKEN=") && !line.startsWith("ZAIM_ACCESS_SECRET="))
    .join("\n");

  // 新しいアクセストークンを追記
  envContent += `\nZAIM_ACCESS_TOKEN='${token}'\nZAIM_ACCESS_SECRET='${secret}'\n`;

  // `.env` を更新
  fs.writeFileSync(envFilePath, envContent, { encoding: "utf8" });

  console.log(`✅ Access token saved to ${envFilePath}`);
};

// **メイン処理**
(async () => {
  try {
    console.log("Step 1: Getting request token...");
    const { oauth_token, oauth_token_secret } = await getRequestToken();

    console.log("Step 2: Authorizing user...");
    const verifier = await authorizeUser(oauth_token);

    console.log("Step 3: Getting access token...");
    const accessToken = await getAccessToken(oauth_token, oauth_token_secret, verifier);

    console.log("✅ Access token obtained successfully:");
    console.log(accessToken);

    saveAccessToken(accessToken.oauth_token, accessToken.oauth_token_secret);
  } catch (error) {
    console.error("❌ Error occurred:", error);
  }
})();
