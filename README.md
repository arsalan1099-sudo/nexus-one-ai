# NEXUS ONE — Citizen AI Assistant (RC7)

**Status: prototype / release candidate; not verified for production.**

General-purpose citizen assistant with a tested offline HTML demo, plus Node/Firebase/Redis-backed integration code for chat, photo Q&A, image generation and downloadable projects. No independent foundation model is included.

## Start here

- Offline demo: open `dist/assistant.html` locally. Offline chat cannot run real AI inference.
- Citizen tools: open `dist/citizen-demo.html`.
- Configured service: install Node 24.12+, run `npm ci`, `npm run check`, `npm run verify:astra`, set required environment/secrets from `.env.example`, then `npm run preflight` and `npm start`.
- Production setup: see `RC7-README.md` and `render.yaml`. **Do not deploy secrets into GitHub** or incur paid Render Redis costs without reviewing pricing.
- The current repo's license is **UNLICENSED**. Do not assume reuse or redistribution rights.

## Security status

Firebase-backed user authorization and quota controls are included in the source, but live Firebase, Redis, provider inference and complete integration tests have not been independently verified. Use a private repo until you complete an audit and configure credentials.

## Previous engineering notes

# NEXUS ASI — Elite Edition

Production-oriented release candidate, 1.0.0-rc.4. Not yet a verified live deployment.

This package replaces the simulated single HTML prototype with a real authenticated backend and a self-contained built HTML frontend. It is an AI application, not artificial superintelligence. Saving memory changes request context, not model weights.

## Included

- Email/password Firebase auth, reset email, verification email, session persistence.
- Server verifies Firebase ID tokens with revocation checking, verified email and explicit approved UID allowlist.
- Real Pollinations text/image API adapters; API key stays server-side.
- Language/persona/context sent to the text model.
- AI-generated project JSON validated before ZIP creation; code is never executed.
- Plain-text rendering, no inline event handlers, no runtime CDN scripts.
- CSP hashes generated from the served HTML, anti-framing and other security headers.
- Redis-backed shared request quotas, fail-closed behavior, bounded bodies/responses, timeouts, client disconnect cancellation.
- Per-account browser memory with deletion; chat history is in memory only.
- Docker, Compose, CI, lockfile and automated security tests.

## Local build and tests (Node 24)

```sh
npm ci
npm run check
npm run preflight  # after supplying environment and mounted credentials
npm audit --omit=dev
npm run browser:install
npm run test:browser
```

`dist/index.html` contains the bundled frontend. Serve it through this server; opening it via file:// cannot supply auth configuration or API endpoints. No secret belongs in this HTML.

## Configure and launch

1. Create/use your Firebase project. Enable Email/Password login, email enumeration protection and a strong password policy. Add the exact deployment hostname under authorized domains. Configure verification/reset email templates.
2. Copy `.env.example` to `.env`. Populate the public Firebase configuration from the web app settings for that same project.
3. Supply Admin SDK credentials through workload identity/application default credentials, or mount a service-account JSON secret file. Do not commit or send the private key in chat. Restrict IAM permissions to the required Firebase Auth operations; do not grant broad Owner/Editor roles.
4. Add a Pollinations secret key and currently supported `TEXT_MODEL` / `IMAGE_MODEL` IDs. Confirm provider credit availability, model support, data policy and billing limits in the provider console. This integration is not a promise of free generation.
5. Set an exact HTTPS `APP_ORIGIN` and an internal Redis address (remote/public Redis must use TLS and authentication). Redis is dedicated to this app; enable persistence and no-eviction. Deleted/reset quota storage resets the quotas. Request caps are not monetary budgets; set provider-side spending controls too.
6. Create your initial account in Firebase Console and put its UID in `ALLOWED_UIDS`. New accounts can register and verify email, but cannot generate until explicitly approved. Verification email can be requested from the app. Refresh the session after verification. Change the allowlist through deployment configuration and restart when approving/revoking access.
7. Run `npm run build` then `npm start`, or use the Compose flow below. For local development only, set `NODE_ENV=development` and `APP_ORIGIN=http://localhost:3000`; real Firebase/provider credentials are still required. Production entry point refuses auth-emulator mode.
8. Terminate HTTPS at your reverse proxy/load balancer. Keep the backend private. Preserve the Origin header. Set upstream timeouts to at least 65 seconds, cap request sizes, and add edge bot/DDoS controls. The server deliberately ignores forwarded IP headers; pre-auth limits may be shared by users behind the same proxy. Per-user quotas still distinguish authenticated UIDs.

### Docker Compose

Place your Firebase Admin credential at `secrets/firebase-admin.json`; set `.env` including `REDIS_URL=redis://redis:6379`. Then:

```sh
docker compose up --build -d
```

Compose exposes only `127.0.0.1:3000`; Redis is not exposed to the host. Put your HTTPS proxy in front. Never run `docker compose down -v` casually: removing Redis data removes rate-limit state. Container base images are version-tagged, not digest-pinned: pin reviewed digests for your deployment and keep security patches current.

### Managed hosting

Deploy the Dockerfile as a web service, attach dedicated persistent Redis, mount the Firebase secret, and provide the environment variables. Set the health-check path to `/readyz`. No hosting service or paid resource is created by this package. A static HTML host alone is insufficient.

## API contract

All generation routes require JSON, an exact `Origin`, and `Authorization: Bearer <Firebase ID token>`.

- `GET /api/config`: public Firebase client config only.
- `POST /api/chat`: `{messages:[{role:'user'|'assistant',content}],persona,language,memory}` → `{text}`.
- `POST /api/image`: `{prompt}` → binary PNG/JPEG.
- `POST /api/project`: `{prompt}` → `{files:[{path,content}]}`. The client packages these as ZIP.
- `GET /healthz`: process health. `GET /readyz`: Redis reachability, **not** provider/Firebase readiness.

Limits: 256 KiB incoming JSON, 6,000-character prompts, 60,000-character chat context, 8,000-character saved context, 1 MiB upstream text JSON, 10 MiB image, 20 generated files, 180,000 total file characters, 55-second backend timeout. Server fixes provider hosts and model IDs, never accepts arbitrary provider URLs or credentials from the client. Quotas count failed upstream attempts too. Fixed-window counters can permit a burst across a window boundary.

## Privacy and operations

The server logs request ID/method/status, not prompts, tokens, email or provider response bodies. Images are generated with a URL prompt sent server-to-provider, which the provider may log. No server-side conversations are stored. Browser memory is not encrypted; the user can delete it. Firebase still stores accounts, Redis stores hashed quota keys, and provider/hosting retention policies still apply. Publish your own operator contact and privacy terms before opening registration publicly. Account deletion is currently an administrator workflow through Firebase Console, with separate provider data requests as applicable.

Never execute downloaded projects without review. Generated content may be wrong; generated code has not been automatically tested. Medical/legal personas provide information, not professional certification. Prompt injection is not solved by a system prompt: this application grants no tools, shell execution or privileged backend actions to model output.

Monitor 401/403, 429, 502/504 and Redis failures. Use request IDs for support; never log authorization headers. To roll back, redeploy a previously tested image with the same Redis volume and correct secrets. Revoke/rotate provider keys if leaked, and revoke affected Firebase sessions as needed.

## Required live acceptance checks

Before calling the deployment production-ready:

- Verify HTTPS and security headers on the actual domain.
- Register, receive verification email, approve UID, refresh and sign in.
- Confirm unapproved, unverified, expired/revoked and logged-out sessions cannot generate.
- Complete one real chat in Urdu, one real image download and one real project ZIP.
- Verify quota rejection and fail-closed behavior with Redis unavailable.
- Test on Android Chrome and desktop; check keyboard, scrolling, download and logout behavior.
- Confirm actual model availability, generation costs and provider-side spending limits.
- Publish deployment-specific privacy terms/contact and establish account-deletion support.

CI also starts real Redis for an atomic-counter integration test; locally set TEST_REDIS_URL to enable that test. The test suite uses controlled auth/provider fixtures, not real Firebase tokens or paid generation. Test results and known verification gaps are in TEST-REPORT.md.

## Primary documentation

- https://firebase.google.com/docs/auth/admin/verify-id-tokens
- https://firebase.google.com/docs/auth/admin/manage-sessions
- https://gen.pollinations.ai/docs
- https://github.com/pollinations/pollinations/blob/main/gen.pollinations.ai/src/docs/authentication.md

## RC2 changes

Real Redis concurrency and stalled-write tests now pass locally. Redis operations have a 3-second end-to-end deadline and the server limits the command queue to 128. A timed-out write may still consume quota; it is deliberately not retried. `npm run preflight` reports missing configuration without printing secrets. The current preflight supports mounted service-account JSON; workload identity must be validated separately.


## RC3 security changes (22 October 2026)

- Proxy-aware preauthentication throttling: by default `TRUST_PROXY_HOPS=0`
  and the client-supplied `X-Forwarded-For` header is ignored. When served behind
  a **single trusted reverse proxy** which overwrites forwarded headers and
  prevents direct app-port access, set `TRUST_PROXY_HOPS=1`. A multi-hop setup
  requires carefully validated trusted chain count, up to 2. Wrong settings
  allow quota bypass or make many users share one quota. Do **not** set a trust
  count when direct Internet access to the app is possible.
- Added per-user daily limits `IMAGE_DAILY_LIMIT` and `PROJECT_DAILY_LIMIT`
  (default 10 each), separate from the global daily request cap. Quotas
  are request counters, not a guarantee of maximum provider charges.
- Added Cross-Origin-Resource-Policy and Cross-Origin-Opener-Policy headers.
- Added regression tests for forwarded IP handling, cost-intensive request
  limits and proxy configuration validation.
- The configured Pollinations endpoints were checked against published docs on
  22 Oct 2026. Set currently valid model IDs from `/models` before launch.

**Testing limitation for this revised package:** The dependencies could not be
installed in the isolated build environment because access to npm registry was
unavailable. Original RC2's earlier 29 test results are included for reference,
not as proof RC3 passed. Run `npm ci && npm run check && npm run test:browser`
with Node 24 and Redis on CI or a connected developer machine. An independent
source/package smoke check is supplied, with report `RC3-VALIDATION.txt`.

## RC4 managed Render deployment path

The optional `render.yaml` Blueprint provisions a web service and a **billable starter-tier persistent Redis-compatible Key Value** instance. Review charges before applying it. Web service stays on free tier in the template; free instances can sleep. The private Redis instance uses noeviction and journal+snapshot to protect quota accounting. A free Key Value instance does **not** offer persistence and is unsuitable for authoritative usage controls.

On Render, leave `APP_ORIGIN` unset to derive HTTPS from the trusted `RENDER_EXTERNAL_HOSTNAME`; for a custom domain supply an exact HTTPS origin. Configure `FIREBASE_ADMIN_JSON_B64` as a private secret, containing the base64-encoded service-account JSON for the same `FIREBASE_PROJECT_ID`; do not additionally set `GOOGLE_APPLICATION_CREDENTIALS`. This is a convenience path, not an invitation to store the private key in GitHub or share it in chat.

`npm test` now includes dependency-free Admin-credential parser tests. `node --test test/credentials.test.js test/origin.test.js` works without installed npm packages. Node 24, all dependencies, browser checks, real provider credential/credits, and live HTTPS deployment remain mandatory for production.

For workload identity deployments without a service-account secret file, explicitly set `NEXUS_ALLOW_WORKLOAD_IDENTITY=true` only after configuring and testing an actual supported application-default identity on the host. Otherwise startup fails closed when no Admin credentials are set.
