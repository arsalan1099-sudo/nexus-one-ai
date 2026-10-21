# NEXUS ASI RC4 verification — 22 October 2026

Executed in this session with Node v22.16.0 (full integration expects Node 24 and installed dependencies).

## Dependency-free live test run
TAP version 13
# Subtest: admin credentials decode from a private host env var
ok 1 - admin credentials decode from a private host env var
  ---
  duration_ms: 1.110062
  type: 'test'
  ...
# Subtest: credentials from another Firebase project are rejected
ok 2 - credentials from another Firebase project are rejected
  ---
  duration_ms: 1.898079
  type: 'test'
  ...
# Subtest: malformed base64 credentials are rejected
ok 3 - malformed base64 credentials are rejected
  ---
  duration_ms: 0.277107
  type: 'test'
  ...
# Subtest: conflicting Admin credential methods are rejected
ok 4 - conflicting Admin credential methods are rejected
  ---
  duration_ms: 0.199861
  type: 'test'
  ...
# Subtest: workload identity can be separately verified
ok 5 - workload identity can be separately verified
  ---
  duration_ms: 0.168033
  type: 'test'
  ...
# Subtest: service account must contain private key and email
ok 6 - service account must contain private key and email
  ---
  duration_ms: 0.222415
  type: 'test'
  ...
# Subtest: Render hostname resolves to an HTTPS origin
ok 7 - Render hostname resolves to an HTTPS origin
  ---
  duration_ms: 0.996561
  type: 'test'
  ...
# Subtest: explicit custom domain overrides Render hostname
ok 8 - explicit custom domain overrides Render hostname
  ---
  duration_ms: 0.147452
  type: 'test'
  ...
# Subtest: empty origin without hostname remains invalid to config schema
ok 9 - empty origin without hostname remains invalid to config schema
  ---
  duration_ms: 0.144547
  type: 'test'
  ...
# Subtest: hostnames containing port/protocol are rejected
ok 10 - hostnames containing port/protocol are rejected
  ---
  duration_ms: 1.4933
  type: 'test'
  ...
1..10
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 72.515987

## Offline source/build verification
PASS RC4 manifest / lockfile version match
PASS Credential parser and Render origin resolver shipped
PASS Render Blueprint wires private persistent quota store
PASS Static HTML build contains local bundled JavaScript
PASS Static HTML does not load external scripts
PASS Built HTML uses RC3 theme
PASS Template uses the same RC3 styling
PASS Mobile media query exists
PASS Reduced-motion support exists
PASS App uses explicit trusted proxy hop settings
PASS Pre-auth quota keys off the resolved client IP
PASS Pre-auth quota does not blindly accept X-Forwarded-For
PASS Config defaults to zero trusted proxies
PASS Additional cost-sensitive usage limits configured
PASS Server enforces image and project quotas
PASS Server checks revoked Firebase tokens
PASS Server requires verified approved account
PASS Application enforces API origin
PASS Server security headers include CORP and COOP
PASS Provider credentials remain server-side
PASS Container drops privileges and remains read-only
PASS CI contains real test and browser steps
PASS Syntax parse all source/test/script JavaScript files
TOTAL 23 dependency-free checks passed

## Remaining account-only production acceptance gates
- Creating/connecting a dedicated GitHub repository (not supported by this GitHub connector).
- Render workspace selection and any paid-service approval.
- Firebase web configuration, Admin credential, account UID approval, auth emails.
- Pollinations private key, real billing/model generation smoke tests.
- Live HTTPS deployment, Redis smoke tests, CI/browser tests on deployed site.
- Operator privacy/contact/legal review.

Historical evidence in TEST-REPORT.md records 17 backend and 12 browser checks from RC2, not a new RC4 rerun. npm ci and full integration in this session were blocked by unavailable npm packages/Node 24. No production-verified status is claimed.
