import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGetTodaySummary } from './tools/get-today-summary.js';

export function createMcpServer(getToken: () => string | undefined): McpServer {
  const server = new McpServer({
    name: 'deficit',
    version: '0.1.0',
  });

  registerGetTodaySummary(server, getToken);

  return server;
}
