# DEFICIT MCP

Remote endpoint: https://deficit-mcp-production.up.railway.app/mcp

Add it as an OAuth MCP server in a supported client. Discovery advertises the
DEFICIT authorization server. Register a public client, use an exact registered
redirect, S256 PKCE and the canonical resource parameter. Account consent grants
records:read, records:write and/or photos:read. Tokens are opaque, stored only as
hashes, time-limited and revocable in DEFICIT → Profile → AI connections.

Each tool request revalidates the grant. `get_connection_status` performs a real,
non-mutating journal read and records verification only after success. Write
permission is reported separately. No user/session tokens belong in prompts.

The API exchanges the validated grant for an internal short-lived account request
to the existing canonical journal. A model-supplied owner is never trusted.
Legacy Cut tool names are retained. Imports, linking and deletion are not delegated
by records:write. Existing hosted Cut connections remain separate and operational.

Run `npm ci`, `npm run build`, `node --test tests/client.mjs`, then `npm start`.
Provider setup and actual user consent must still be exercised separately from
protocol tests. A successful deployment does not prove a particular AI connected.
