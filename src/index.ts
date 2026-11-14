#!/usr/bin/env node
import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcp/server.js';
import { config } from './config.js';
import { getUserProfile } from './deficit-client/client.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', name: 'deficit-mcp', version: '0.1.0' });
});

// MCP endpoint — one transport per session
app.all('/mcp', async (req, res) => {
  const header = req.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) { res.status(401).json({ error: 'Per-user authentication required' }); return; }
  try { await getUserProfile(token); } catch { res.status(401).json({ error: 'Invalid or expired account session' }); return; }

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
