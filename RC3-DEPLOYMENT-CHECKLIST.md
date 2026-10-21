# Release gate for NEXUS ASI RC3

Use private deployment secrets only on the host. Never send them in a chat, commit them to Git, or embed them into the HTML.

1. Create a PRIVATE GitHub repository. Add files from this package without `.env`, credentials, `node_modules` or the ignored `secrets/` directory.
2. Provision Firebase Authentication, enable Email/Password, specify authorized deployment domain; approve exact UID(s) in ALLOWED_UIDS.
3. Create a dedicated server-side Pollinations secret (`sk_...`), choose valid text and image model IDs from `https://gen.pollinations.ai/models`, and impose provider-side spending cap if available.
4. Provision Redis with persistence; Redis must not be exposed publicly. For remote Redis use private networking or TLS.
5. Configure APP_ORIGIN exactly as the final HTTPS origin; use a trusted edge reverse proxy that enforces HTTPS and overwrites forwarded headers. Set TRUST_PROXY_HOPS to 1 only for such single-proxy infrastructure.
6. Supply Firebase Admin SDK credentials as a deployment secret file or tested workload identity.
7. Install pinned deps with Node 24: `npm ci`. Run `npm run verify:offline`, `npm run check`, `npm run test:browser`, `npm audit --omit=dev --audit-level=high`, and `npm run preflight`.
8. Validate real email verification, account approval, revoked/disabled accounts, sign-in/logout, password reset, unauthorized API denial and all 3 live generation modes.
9. Validate MIME/signature of image downloads, ZIP contents, project-path safety and provider failure/timeout behavior in staging.
10. Test IPv4/IPv6 proxy quotas from two distinct real clients and confirm X-Forwarded-For spoofing cannot bypass protection. Verify rate limits & counts persist across container restart.
11. Configure backups, uptime monitoring, abuse response, audit retention policy, privacy notice, and operator contact.
12. Only then consider production rollout, with limited access and budget caps.

**Current state:** source candidate only, NOT deployed or signed off.
