import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";

const app = express();
const server = new McpServer({ name: "personio-mcp", version: "1.0.0" });

const PERSONIO_CLIENT_ID = process.env.PERSONIO_CLIENT_ID!;
const PERSONIO_CLIENT_SECRET = process.env.PERSONIO_CLIENT_SECRET!;

async function getToken() {
  const res = await fetch("https://api.personio.de/v1/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: PERSONIO_CLIENT_ID, client_secret: PERSONIO_CLIENT_SECRET })
  });
  const data = await res.json();
  return data.data.token;
}

server.tool("get_employees", {}, async () => {
  const token = await getToken();
  const res = await fetch("https://api.personio.de/v1/company/employees", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return { content: [{ type: "text", text: JSON.stringify(await res.json()) }] };
});

server.tool("get_onboarding_flows", {}, async () => {
  const token = await getToken();
  const res = await fetch("https://api.personio.de/v1/company/onboarding-templates", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return { content: [{ type: "text", text: JSON.stringify(await res.json()) }] };
});

server.tool("get_jobs", {}, async () => {
  const token = await getToken();
  const res = await fetch("https://api.personio.de/v1/recruiting/jobs", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return { content: [{ type: "text", text: JSON.stringify(await res.json()) }] };
});

let transport: SSEServerTransport | null = null;

app.get("/mcp", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  await transport?.handlePostMessage(req, res);
});

app.listen(3000, () => console.log("Personio MCP server running on port 3000"));