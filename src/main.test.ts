import { describe, it, expect, vi, afterEach } from "vitest";
import * as fs from "node:fs";

// Hoist this mock before main.ts is imported so that its top-level IIFE
// receives the mocked fetchSpendingData and does not hit the real API.
vi.mock("./zaim-outcome.script", () => ({
  fetchSpendingData: vi.fn().mockRejectedValue(new Error("skipped in test")),
}));

import { exportToCsv } from "./main";

describe("exportToCsv", () => {
  let tempFilePath: string;

  afterEach(() => {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  });

  it("should write a CSV file with the expected headers and data values", async () => {
    tempFilePath = `/tmp/test-spending-${Date.now()}.csv`;

    const sampleData = [
      {
        id: 123,
        date: "2024-01-15",
        amount: 1000,
        category_id: 10,
        genre_id: 101,
        from_account_id: 1,
        to_account_id: 2,
        currency_code: "JPY",
        place: "Test Store",
        comment: "Test comment",
        receipt_id: 456,
      },
    ];

    await exportToCsv(sampleData, tempFilePath);

    const content = fs.readFileSync(tempFilePath, "utf8");

    // CSV column headers
    expect(content).toContain("ID");
    expect(content).toContain("Date");
    expect(content).toContain("Amount");
    expect(content).toContain("Category ID");
    expect(content).toContain("Genre ID");
    expect(content).toContain("Place");
    expect(content).toContain("Comment");

    // Row data
    expect(content).toContain("2024-01-15");
    expect(content).toContain("1000");
    expect(content).toContain("Test Store");
    expect(content).toContain("Test comment");
  });

  it("should start with a UTF-8 BOM (\\uFEFF)", async () => {
    tempFilePath = `/tmp/test-spending-${Date.now()}.csv`;

    const sampleData = [
      {
        id: 1,
        date: "2024-01-01",
        amount: 500,
        category_id: 1,
        genre_id: 1,
        from_account_id: 1,
        to_account_id: 1,
        currency_code: "JPY",
        place: "",
        comment: "",
        receipt_id: 1,
      },
    ];

    await exportToCsv(sampleData, tempFilePath);

    // Verify BOM bytes (0xEF 0xBB 0xBF)
    const buffer = fs.readFileSync(tempFilePath);
    expect(buffer[0]).toBe(0xef);
    expect(buffer[1]).toBe(0xbb);
    expect(buffer[2]).toBe(0xbf);

    // Also verify via string representation
    const content = fs.readFileSync(tempFilePath, "utf8");
    expect(content.startsWith("﻿")).toBe(true);
  });
});
