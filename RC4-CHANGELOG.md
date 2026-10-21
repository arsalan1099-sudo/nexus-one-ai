# RC4 — deployment preparation, 22 October 2026

- Firebase Admin supports either an external workload identity, a mounted service-account file, or a base64-encoded JSON service-account secret in a host environment variable. Conflicting or mismatched service accounts are rejected. Startup fails closed unless credential source exists, or workload identity is explicitly enabled.
- An exact HTTPS origin is automatically derived from Render-provided `RENDER_EXTERNAL_HOSTNAME` if `APP_ORIGIN` is not specified. Explicit `APP_ORIGIN` takes precedence for custom domains.
- Added Render Blueprint containing Node 24 Docker web service and **paid persistent** Key Value quota store. Applying it can create charges. It deliberately does not auto-create services.
- Preflight recognizes Admin JSON injected by the host, and does not echo credential values.
- Added 6 focused credential regression tests runnable without npm dependencies.
- Pinned example Pollinations text and image model IDs to examples in official docs; model support/billing must still be checked with an actual account.

## Release qualification
These improvements prepare the release, not a live deployment. A GitHub repository, Firebase project configuration, provider credentials/credit, workspace authorization, and live E2E verification are account-specific steps that cannot be truthfully simulated.
