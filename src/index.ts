#!/usr/bin/env node
import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcp/server.js';
import { config } from './config.js';

const app = express();
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', name: 'deficit-mcp', version: '0.1.0' });
});

// MCP endpoint — one transport per session
app.all('/mcp', async (req, res) => {
  // Phase 1: token from env. Phase 3: extracted from OAuth bearer on req.
  const token = config.deficitBearerToken || undefined;

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
