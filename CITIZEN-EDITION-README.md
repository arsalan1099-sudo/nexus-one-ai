# NEXUS ASI — Citizen Edition RC6

**Goal:** High-reliability-inspired everyday decision-support tools for the general public, not defence/military operations. No claim of any military certification.

## Two separate products in one source tree

- `/citizen` or `dist/citizen-demo.html`: Works offline, without login, network calls, AI inference, or storing input data. Nine **deterministic** citizen workflows for budget, business, career, study, emergency supplies, digital safety, document preparation, project timeline, and household utility estimates. Inputs are checked and bounded. Output can be copied or exported to JSON. Source file `web/citizen.js` is reusable and testable.
- `/` and `/ai`: Existing NEXUS chat/image/code-generation AI portal, requiring Firebase, approved accounts, provider credentials and Redis. Source and service configuration inherited from RC5. Not configured for live use in this archive.

### Deployment

1. For **offline citizen dashboard**, open `dist/citizen-demo.html` directly in a modern browser (or host as a static HTML file). No keys required.
2. For optional **AI portal**, install Node 24 (per manifest), run `npm ci && npm run check`. Configure secret environment variables from `.env.example` on the server; never put secrets in client HTML or Git. Review `render.yaml` resource costs. Deploy only after authentication, abuse-protection, E2E tests, and private policy review.
3. When running the Node service, `/citizen` serves the offline dashboard and `/ai` serves the authenticated advanced portal. Root `/` continues to serve the advanced portal to preserve existing integrations.

### Limitations

- Dashboard is deterministic JavaScript (not model inference). It does not browse the web or read real bank, medical, government or military records.
- Financial and preparedness values are estimates from the user's chosen inputs; no official advice or eligibility validation.
- Data remain in current page memory. Export saves a local file; the user is responsible for securing that file. No encryption or signed audit trail is claimed.
- Current archive has source-based + browser tests but no end-to-end live provider verification.
- The production portal bundled HTML was preserved from RC5 to avoid using missing build dependencies in this environment; its legacy Defence workspace UI is hidden. A fresh `npm run build` from RC6 source removes that unused feature. The citizen dashboard itself contains no military modules.
