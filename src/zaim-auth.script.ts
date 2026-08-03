import crypto from "node:crypto";

// Zaim API 認証情報 (環境変数から取得)
const CONSUMER_KEY = process.env.ZAIM_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.ZAIM_CONSUMER_SECRET || "";

// OAuth 1.0a Signature を生成
const generateSignature = (method: string, url: string, params: Record<string, string>, tokenSecret = ""): string => {
  const urlObject = new URL(url);

  // クエリパラメータと OAuth パラメータをマージしてソート
  const mergedParams = {
    ...Object.fromEntries(urlObject.searchParams),
    ...params,
  };

  const sortedParams = Object.keys(mergedParams)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(mergedParams[key])}`)
    .join("&");

  const baseString = `${method.toUpperCase()}&${encodeURIComponent(urlObject.origin + urlObject.pathname)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(CONSUMER_SECRET)}&${encodeURIComponent(tokenSecret)}`;

  return crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");
};

// OAuth ヘッダーを生成
export const generateOAuthHeader = (
  method: string,
  url: string,
  token = "",
  tokenSecret = "",
  additionalParams: Record<string, string> = {},
) => {
  const params: Record<string, string> = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
    ...additionalParams,
  };

  if (token) {
    params.oauth_token = token;
  }

  params.oauth_signature = generateSignature(method, url, params, tokenSecret);

  return `OAuth ${Object.keys(params)
    .map((key) => `${key}="${encodeURIComponent(params[key])}"`)
    .join(", ")}`;
};
