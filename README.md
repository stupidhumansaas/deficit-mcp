# DEFICIT MCP

Every request requires its own DEFICIT bearer session. A server-wide fallback
account is intentionally unsupported. The API validates the caller before a
transport is created. Credentials are never returned as tool output.

`get_today_summary` reads the existing native API with an explicit IANA timezone.
A missing target stays missing. Food allowance is separate from active burn.

This server is **not a completed consumer OAuth connector**. OAuth discovery,
PKCE, delegated scopes, connection revocation and shared-record migration remain
release prerequisites. Do not instruct consumers to paste session tokens into
prompts or label a provider connected because they copied setup text.

Run `npm ci`, `npm run build`, then `npm start`.
