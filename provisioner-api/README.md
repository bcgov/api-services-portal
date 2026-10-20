# Provisioner API

The provisioner API will dispatch resources to the appropriate provider.

Additionally, it will provide APIs for retrieving information from SDX to support provider workflows.

It will use client credentials to get tokens for accessing APS, SDX, GWA and CSS.

Resources supported:

- APS
  - Product
  - Application
  - ServiceAccess
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

After APS-4992 is deployed, backfill the Kong consumer identity before enabling strict token matching:

1. Run `npm run datafix:aps-4994` and review the dry-run output. Each active R1 subsystem/environment must produce exactly one consumer whose `username` and `custom_id` match the OAuth client ID selected from the latest connection record.
2. Resolve every reported mismatch. The command does not publish gateway changes without `--apply`.
3. Run `npm run datafix:aps-4994 -- --apply` to re-provision one representative active connection per subsystem/environment.
4. Re-run the dry run and require `failed: 0` before APS-4995 enables strict `azp`-to-`custom_id` matching.

Deploy APS-4995 only after APS-4992, APS-4994, and the required Kong plugin
changes are live. Then use the enforcement migration as the release gate:

1. Run `npm run datafix:aps-4995` without arguments. It previews every active,
   approved R1 connection and verifies strict consumer `azp`/`custom_id`
   matching, subsystem ACL enforcement, consumer-edge token exchange with
   verified-subject scope transfer, provider JWT verification, and the absence
   of provider-edge token exchange.
2. Resolve every reported configuration or preview failure. The command does
   not publish gateway changes without `--apply`.
3. During the controlled cutover, run
   `npm run datafix:aps-4995 -- --apply` to reprovision each validated active
   R1 connection with the canonical policy-managed settings.
4. Re-run the dry run and require `failed: 0` before enabling the release.

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
