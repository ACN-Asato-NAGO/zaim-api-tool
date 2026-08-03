import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateOAuthHeader } from "./zaim-auth.script";

describe("generateOAuthHeader", () => {
  const TEST_URL = "https://api.zaim.net/v2/home/money";
  const TEST_METHOD = "GET";

  beforeEach(() => {
    vi.stubEnv("ZAIM_CONSUMER_KEY", "test_consumer_key");
    vi.stubEnv("ZAIM_CONSUMER_SECRET", "test_consumer_secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should include all required OAuth fields in the Authorization header", () => {
    const header = generateOAuthHeader(TEST_METHOD, TEST_URL);

    expect(header).toMatch(/^OAuth /);
    expect(header).toContain("oauth_consumer_key=");
    expect(header).toContain("oauth_nonce=");
    expect(header).toContain("oauth_signature_method=");
    expect(header).toContain("oauth_timestamp=");
    expect(header).toContain("oauth_version=");
    expect(header).toContain("oauth_signature=");
  });

  it("should generate a different oauth_nonce on each call", () => {
    const header1 = generateOAuthHeader(TEST_METHOD, TEST_URL);
    const header2 = generateOAuthHeader(TEST_METHOD, TEST_URL);

    const extractNonce = (h: string) => h.match(/oauth_nonce="([^"]+)"/)?.[1];
    const nonce1 = extractNonce(header1);
    const nonce2 = extractNonce(header2);

    expect(nonce1).toBeDefined();
    expect(nonce2).toBeDefined();
    expect(nonce1).not.toBe(nonce2);
  });

  it("should produce different Authorization headers on each call due to random nonce", () => {
    // The nonce is crypto.randomBytes(16) so headers must always differ
    const header1 = generateOAuthHeader(TEST_METHOD, TEST_URL);
    const header2 = generateOAuthHeader(TEST_METHOD, TEST_URL);

    expect(header1).not.toBe(header2);
  });

  it("should include oauth_token when a token is provided", () => {
    const token = "test_access_token";
    const header = generateOAuthHeader(TEST_METHOD, TEST_URL, token);

    expect(header).toContain("oauth_token=");
  });

  it("should not include oauth_token when no token is provided", () => {
    const header = generateOAuthHeader(TEST_METHOD, TEST_URL);

    expect(header).not.toContain("oauth_token=");
  });
});
