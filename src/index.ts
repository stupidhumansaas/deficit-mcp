#!/usr/bin/env node
import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcp/server.js';
import { config } from './config.js';
import { apiFetch } from './deficit-client/client.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', name: 'deficit-mcp', version: '0.1.0' });
});

const resource = 'https://deficit-mcp-production.up.railway.app/mcp';
const metadata = {resource,authorization_servers:[config.deficitApiBase],scopes_supported:['records:read','records:write','photos:read'],bearer_methods_supported:['header']};
app.get(['/.well-known/oauth-protected-resource','/.well-known/oauth-protected-resource/mcp'],(_req,res)=>res.json(metadata));
// MCP endpoint — stateless transport; every request revalidates revocation.
app.all('/mcp', async (req, res) => {
  const header = req.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  res.set('WWW-Authenticate', 'Bearer resource_metadata="https://deficit-mcp-production.up.railway.app/.well-known/oauth-protected-resource/mcp"');
  if (!token) { res.status(401).json({ error: 'Per-user authentication required' }); return; }
  try { await apiFetch('/oauth/connection', token); } catch { res.status(401).json({ error: 'Invalid or expired account session' }); return; }

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = createMcpServer(() => token);

  res.on('close', () => { transport.close(); server.close(); });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(config.port, () => {
  console.log(`deficit-mcp running on http://localhost:${config.port}/mcp`);
});
