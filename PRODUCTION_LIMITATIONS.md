# NEXUS ONE — Citizen Edition

## Current scope

This repository currently deploys a **static, offline-oriented decision-support demo**. It is not a general-purpose AI model, banking app, emergency dispatch service, security scanner, or certified legal/financial adviser.

Included deterministic modules: budget arithmetic, business unit economics, career planning, study scheduling, household emergency checklist, digital-safety self-assessment, document preparation checklist, project capacity estimates, and household resource estimates.

## Known limitations

- No AI inference, general chat, image generation, uploaded-image analysis, or autonomous agent execution.
- No API backend, authentication, database, account recovery, cloud sync, or server-side user history.
- Live web search, jobs, weather/disaster alerts, bank feeds, official form submission, device scanning, and current tariff lookups are not implemented.
- Data is not intentionally sent to a server by the calculator code, but exported reports may contain sensitive information. Protect exports and do not enter secrets.
- JSON report export is available; persistent in-app history and import/restore are not implemented.
- Static hosting and an online deployment do not prove offline reload support. A service worker/PWA and real-device offline verification are separate work.
- No production security certification, penetration test, load test, formal accessibility audit, backup/restore drill, or availability guarantee is claimed.
- Outputs are estimates from user-entered data. Users must independently verify important decisions.

## Local regression tests

Requires Node.js 20 or later. Run:

```sh
node --test tests/citizen.test.mjs
```

The tests cover all nine workflow reports, representative arithmetic, invalid input rejection, and non-overclaiming safety labels. They are not a substitute for browser/device end-to-end testing.
