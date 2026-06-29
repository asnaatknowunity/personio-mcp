"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const server = new mcp_js_1.McpServer({ name: "personio-mcp", version: "1.0.0" });
const PERSONIO_CLIENT_ID = process.env.PERSONIO_CLIENT_ID;
const PERSONIO_CLIENT_SECRET = process.env.PERSONIO_CLIENT_SECRET;
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
let transport = null;
app.get("/mcp", async (req, res) => {
    transport = new sse_js_1.SSEServerTransport("/messages", res);
    await server.connect(transport);
});
app.post("/messages", async (req, res) => {
    await transport?.handlePostMessage(req, res);
});
app.listen(3000, () => console.log("Personio MCP server running on port 3000"));
//# sourceMappingURL=server.js.map