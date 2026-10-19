# Provisioner API

The provisioner API will dispatch resources to the appropriate provider.

Additionally, it will provide APIs for retrieving information from SDX to support provider workflows.

It will use client credentials to get tokens for accessing APS, SDX, GWA and CSS.

Resources supported:

- APS
  - Product
  - Application
  - ConsumerLabels
  - Activity

- SDX
  - Subsystem
  - OpenAPISpec

- GWA
  - GatewayService
  - GatewayKeySet
  - GatewayKey
  - GatewayConsumer

- CSS
  - IntegrationAllowedServices

## Stack

- **Fastify 5** — HTTP server
- **@fastify/swagger** — emits an **OpenAPI 3.1** document
- **@scalar/fastify-api-reference** — serves Scalar API Reference at `/docs` (renders OpenAPI 3.1 callbacks and webhooks with full body/response detail, unlike Swagger UI)
- **TypeBox** + `@fastify/type-provider-typebox` — single source of truth for runtime validation and TS types
- Webhooks and callbacks are wired into the OpenAPI document

## Run with Docker

The repo ships a multi-stage `Dockerfile` (Node 24 LTS Alpine, non-root `node` user, runtime image contains only production dependencies).

```bash
docker build -t provisioner-api:dev .
docker run --rm -p 3000:3000 provisioner-api:dev
```

Configurable at runtime via env vars:

| Var        | Default      | Purpose                          |
| ---------- | ------------ | -------------------------------- |
| `PORT`     | `3000`       | Listen port inside the container |
| `HOST`     | `0.0.0.0`    | Listen address                   |
| `NODE_ENV` | `production` | Set by the image                 |

Override examples:

```bash
docker run --rm -p 8080:8080 -e PORT=8080 provisioner-api:dev
docker run --rm -p 3000:3000 --env-file .env provisioner-api:dev
```

## Run from source (local dev)

```bash
set -a; source .env; set +a;
npm install
npm run dev | npx pino-pretty
```

## Endpoints

Routes are served under the OpenAPI server prefix `/ds/api/sdxpro/v1`:

- `GET  /ds/api/sdxpro/v1/subsystems`
- `GET  /ds/api/sdxpro/v1/subsystems/{id}/allowed-services`
- `POST /ds/api/sdxpro/v1/subsystems/{id}/access-requests`
  - declares the `provisionAllowedServices` callback (`PUT` to the partner)

### R1 access migration prerequisite

Before enabling the R1 integration-access callback, complete the APS-4992 audit and migration of legacy connection records so every `requesterDetails` object has an explicit `scopes` array. Submission and normal apply paths intentionally fail closed when scope data is missing or malformed. Delete/revocation remains available and skips malformed legacy rows with a structured warning so stale access can still be removed.

Docs and spec:

- `http://localhost:3000/docs` — Scalar API Reference
- `http://localhost:3000/docs/openapi.json` — raw OpenAPI 3.1 JSON
- `http://localhost:3000/docs/openapi.yaml` — raw OpenAPI 3.1 YAML

## Upstream clients

Four authenticated HTTP clients are available on `app.clients`:

| Client | Auth                                           | Env-var prefix |
| ------ | ---------------------------------------------- | -------------- |
| `aps`  | OIDC client-credentials with `private_key_jwt` | `APS_`         |
| `sdx`  | OIDC client-credentials with `private_key_jwt` | `SDX_`         |
| `gwa`  | OIDC client-credentials with `private_key_jwt` | `GWA_`         |
| `css`  | OIDC client-credentials with `private_key_jwt` | `CSS_`         |

Built on [`oauth4webapi`](https://github.com/panva/oauth4webapi) + [`jose`](https://github.com/panva/jose) (web-standard fetch, no legacy deps). Tokens are cached in-memory until 30 seconds before `expires_in`, with single-flight refresh.

See `.env.example` for the full env-var contract. Each prefix needs `*_BASE_URL`, `*_TOKEN_URL`, `*_CLIENT_ID`, `*_JWK_PATH` pointing at a standard JWK JSON file holding the private signing key used for the `private_key_jwt` client assertion. Optional: `*_KEY_ALG` (defaults to the JWK's `alg`, then `RS256`), `*_KID` (defaults to the JWK's `kid`), `*_SCOPE`, `*_AUDIENCE`.

For CSS specifically, `CSS_CLIENT_ID` doubles as the feature switch: if it (or any other `CSS_*` variable) is left unset, the `css` client stays unconfigured and `CommonSsoService` skips CSS dispatch with a warning instead of failing the request.

The JWK file is a standard JSON Web Key containing a private key (it must include the `d` parameter); symmetric keys are rejected. A matching public JWK is registered with the authorization server for `private_key_jwt` verification.

Usage in a route:

```ts
const res = await app.clients.aps.fetch('/products');
const products = await res.json();
```

If env vars are missing for a given client, the app still starts; calls to that client throw a clear `not configured: missing X, Y` error.

## Generate and lint the spec

```bash
npm run spec:yaml   # writes openapi.yaml
npm run spec:json   # writes openapi.json
npm run lint:spec   # regenerates openapi.yaml and runs Spectral (fails on warn)
```

## SDX R1 security configuration

An environment used for R1 must include all three of these fields:

- `sdx_token_exchange_client_id` identifies the OAuth client used by the
  consumer edge for RFC 8693 exchange. It must not reuse `client_id` merely
  because that field already exists; `client_id` belongs to provisioner/GWA
  control-plane authentication.
- `sdx_trusted_issuers` lists the token issuers accepted at the consumer and
  provider edges.
- `sdx_token_exchange_token_url` identifies the exchange endpoint. It is
  required and never falls back to the control-plane `oauth_token_url`.

The available R1 preflight API validates these values and reports missing
environment fields, invalid URLs, environment conflicts, and a requester
provider identity that differs from the service catalog. The provider audience
always comes from the catalog service subsystem's `clientId`. Managed R1 route
configuration leaves the static exchange-scope fallback empty because the
verified original token is the sole source of requested scopes. The consumer
token's incoming audience is deliberately the exchange-client ID: APS-4979
removes that audience during exchange and adds the authoritative provider
audience. R1 activation remains blocked until APSTST confirms that CSS can
issue the exchange-client audience.

These settings are non-secret deployment configuration. APS platform
operations may populate them only with an existing Common SSO realm and
exchange client that already support the required audiences, JWKS, and scopes.
The R1 solution must not require any CSS code, API, UI, deployment, client,
realm, scope, or JWKS change. If the needed capability is unavailable in the
existing CSS configuration, APS must revise the APS/SDX design instead of
creating a CSS prerequisite. The exchange private key remains in the edge
signing certificate mount; it does not belong in the environment JSON.

The new settings remain optional while environments are populated. Existing
R0 behavior is unchanged. This task leaves the preflight out of the active
request evaluator and does not add the R1 token, ACL, or exchange upgrades to
route defaults. The policy-enforcement change will invoke the preflight before
generating gateway resources.

## Partner listener (APS-4927)

Startup now creates two independent Fastify applications. `PORT` (default 3000)
serves Portal resource/connection, pattern, gateway and runtime-group operations.
`PARTNER_PORT` (default 3001) serves only `/v1/integrations/*` and
`/v1/resource-servers`. Both use `HOST` (default `0.0.0.0`). Do not route the
public hostname to `PORT`. Compose exposes the partner listener on loopback port
3031 and leaves the existing Portal port mapping intact.

Set these values through the established environment/secret mechanism before
starting either listener (Compose uses `local/provisioner/.env.local`):

| Variable | Required value |
| --- | --- |
| `PARTNER_JWT_ISSUER` | Exact trusted issuer claim |
| `PARTNER_JWT_AUDIENCE` | Intended SDX partner API audience |
| `PARTNER_JWT_JWKS_URL` | Trusted HTTPS JWKS endpoint |
| `PARTNER_JWT_REQUIRED_SCOPE` | Optional required OAuth scope; empty for the CSS partner integration |

The partner listener validates RS256 signatures, issuer, audience, expiry and
required `exp`, `iat`, `sub` claims using `jose` remote JWKS retrieval/cache.
Scope validation applies only when `PARTNER_JWT_REQUIRED_SCOPE` is nonempty.
Missing/invalid tokens return 401 with a Bearer challenge; missing a configured
scope returns 403. Missing issuer/audience/JWKS settings or a non-HTTPS JWKS URL prevent startup. No
production issuer/scope or role mapping has been assumed: CSS must confirm these
settings and the RS256 contract. The scope grants access across integrations;
per-integration caller restrictions require an agreed claim mapping.

The partner OpenAPI document is produced by `npm run spec`; use
`npm run spec -- --internal` for the Portal contract. Offline spec generation
uses example authentication configuration and never starts a listener.

CSS receives `PUT /requests/{integrationId}/sdx-allowed-access` with the approved
grant payload. Non-2xx and transport failures map to 502; this change adds no
callback retries. Confirm replacement/idempotency and retry semantics with CSS.

Validation:

```sh
# In provisioner-api, using Node 22+ and installed dependencies:
npm run typecheck
node --import tsx --test $(rg --files src -g '*.test.ts')
# In e2e, with both packages' dependencies and Cypress installed:
npx cypress run --config-file cypress.css.config.ts --browser electron --headless
```

The standalone Cypress suite starts the real partner HTTP app against a stateful
mock SDX catalog/connection store, Feed endpoint and CSS callback receiver. It
covers all four APIs, dev/test isolation, submission validation before writes,
repeated submissions, simulated approval/rejection, and callback delivery through
the real consumer-access pattern and CSS dispatcher. The mock changes stored
approval state to simulate SDX approval; it does not execute the Portal approval
UI, upstream OAuth, Cedar approval policy or GWA provisioning.

Cases include missing/invalid/expired tokens, wrong issuer/audience/scope on each
API; missing services, stale request versions and invalid scopes; services,
providers, environments and scope definitions changed after submission; removed
catalog versions; resubmission requiring reapproval; rejected/inactive grants;
CSS 200/202/204 acknowledgements, non-2xx replies and transport failure. Dispatcher
failures are asserted as failed CSS provider results, rather than fabricated HTTP
responses from the asynchronous callback.

Partner OpenAPI errors are operation-specific and use
`application/problem+json`. Discovery/resource-server APIs advertise
400/401/403/500/502; allowed-services and submission additionally advertise
404/409. Blanket 422/503 declarations were removed from the partner spec. An
unknown integration is 200/unregistered for discovery, 400 for allowed-services
(existing behavior), and 404 for submission. Removed catalog services remain
502 under the existing SDX client error mapping. CSS callbacks accept any 2xx.

Approved versions stay pinned to the reviewed version; a newer catalog version
is never silently substituted. Resubmitting an old version fails validation;
requesting the current version triggers reapproval. Grants whose approved scopes
are no longer declared, whose provider has changed, or whose catalog has no
usable version return 409 and cannot be dispatched to CSS. These checks also run
when callbacks are built after approval.

Before APSTST deployment, obtain ADR-017 and agree issuer/audience/scope, hostname,
ports and callback contract. Update the deployment's container ports, Service
ports and public Route target together; preserve Portal targeting of the internal
port. No deployment manifests for these resources are present in this repository.
Verify public operations reject missing/wrong/expired tokens, internal operations
are unreachable publicly, both environments remain isolated and an approved
request reaches CSS. Startup failure closes both listeners; existing readiness
probes must be checked against the selected listener during deployment review.

### Silver feature deployment configuration

`.github/workflows/ci-build-provisioner-api.yaml` defines dev APS Authz settings
directly in its environment block: issuer
`https://authz-apps-gov-bc-ca.dev.api.gov.bc.ca/auth/realms/aps`, audience
`sdx-partner-api`, the issuer's `/protocol/openid-connect/certs` JWKS URL, and
`PARTNER_JWT_REQUIRED_SCOPE: ""`. The CSS partner integration requires no scope;
JWT signature, issuer, audience and expiry validation still apply.
`.github/scripts/provisioner-values.py` rejects missing/invalid settings before
Helm can replace a release. The chart exposes internal port 3000 and the named
`partner` Service/container port 3001. Startup/readiness check the partner
listener, which starts after the internal listener. Helm waits up to five minutes
for readiness instead of reporting an unhealthy release as successfully deployed.

This workflow applies dev trust settings to Silver releases only. Gold's
Terraform-managed provisioner configuration is separate and must be updated
before promotion.

Partner authentication alone does not configure upstream SDX/APS/CSS clients,
private signing keys, Feed, or environment-specific operator/GWA settings. The
existing feature workflow has no bindings for those dependencies; their approved
ConfigMap/Secret/Vault source still needs to be supplied for full integration
verification. A public partner Route must target the named `partner` Service
port; this workflow does not create a public hostname or route the internal
listener publicly.

Check the values renderer locally without cluster credentials:

```sh
python3 -m unittest discover -s .github/scripts -p 'test_provisioner_values.py'
```
