import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { generateOAuthHeader } from "./zaim-auth.script";

// Redirect console.log to stderr to protect stdio MCP transport
console.log = console.error;

const API_BASE = "https://api.zaim.net/v2";
const ACCESS_TOKEN = process.env.ZAIM_ACCESS_TOKEN ?? "";
const ACCESS_SECRET = process.env.ZAIM_ACCESS_SECRET ?? "";

const fetchSpendingData = async (startDate: string, endDate: string): Promise<unknown> => {
  const url = new URL(`${API_BASE}/home/money`);
  url.searchParams.append("mode", "payment");
  url.searchParams.append("start_date", startDate);
  url.searchParams.append("end_date", endDate);

  const headers = {
    Authorization: generateOAuthHeader("GET", url.toString(), ACCESS_TOKEN, ACCESS_SECRET),
  };

  const response = await fetch(url.toString(), { headers });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to fetch spending data: ${response.statusText} - ${text}`);
  }

  return (JSON.parse(text) as { money: unknown }).money;
};

const server = new Server(
  { name: "zaim", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_spending",
      description: "Zaim から指定期間の支出データを取得する",
      inputSchema: {
        type: "object" as const,
        properties: {
          start_date: { type: "string", description: "開始日 YYYY-MM-DD" },
          end_date: { type: "string", description: "終了日 YYYY-MM-DD" },
        },
        required: ["start_date", "end_date"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== "get_spending") {
    throw new Error(`Unknown tool: ${name}`);
  }

  const startDate = args?.["start_date"];
  const endDate = args?.["end_date"];

  if (typeof startDate !== "string" || typeof endDate !== "string") {
    throw new Error("start_date and end_date are required string parameters");
  }

  try {
    const data = await fetchSpendingData(startDate, endDate);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch((err: unknown) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});
