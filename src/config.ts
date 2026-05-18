export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  deficitApiBase: process.env.DEFICIT_API_BASE_URL ?? 'https://deficit-production.up.railway.app',
  // Phase 1: single bearer token for testing with Will's account.
  // Phase 3: replaced by per-user OAuth tokens.
  deficitBearerToken: process.env.DEFICIT_BEARER_TOKEN ?? '',
};
