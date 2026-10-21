# NEXUS ASI Elite Edition — RC3 (22 October 2026)

## New
- Configurable trusted proxy hop count (default zero), rate-limiting per resolved client IP.
- Per-account daily quotas for image and project generation, on top of existing global cap.
- More restrictive COOP and CORP security response headers.
- Improved responsive glassmorphism CSS (mobile layout, focus, reduced motion).
- Added 3 new backend regression tests and extended configuration test assertions.
- Offline dependency-free validation script and GitHub CI validation step.

## Integrity/verification
- Original RC2 archive used as starting point.
- RC2 contained prior browser/backend test reports; they are archival results, not RC3 results.
- 21 RC3 dependency-free checks passed locally using Node 22.16.0.
- CI requires Node 24 and installation of pinned npm dependencies.
- Actual RC3 backend tests, live Redis integration, full browser E2E, Firebase, provider and Docker deployment **not run** here (npm registry unreachable, no live secrets).
- Source package, config template, CI pipeline and documentation included; this is **not production-certified**.
