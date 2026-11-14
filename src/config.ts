export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  deficitApiBase: process.env.DEFICIT_API_BASE_URL ?? 'https://deficit-production.up.railway.app',
};
