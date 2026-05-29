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
npm install
npm run dev
```

## Endpoints

Routes are served under the OpenAPI server prefix `/ds/api/sdxpro/v1`:

- `GET  /ds/api/sdxpro/v1/subsystems`
- `GET  /ds/api/sdxpro/v1/subsystems/{id}/allowed-services`
- `POST /ds/api/sdxpro/v1/subsystems/{id}/access-requests`
  - declares the `provisionAllowedServices` callback (`PUT` to the partner)

Docs and spec:

- `http://localhost:3000/docs` — Scalar API Reference
- `http://localhost:3000/docs/openapi.json` — raw OpenAPI 3.1 JSON
- `http://localhost:3000/docs/openapi.yaml` — raw OpenAPI 3.1 YAML

## Upstream clients

Four authenticated HTTP clients are available on `app.clients`:

|Client|Auth|Env-var prefix|
|---|---|---|
|`aps`|OIDC client-credentials with `private_key_jwt`|`APS_`|
|`sdx`|OIDC client-credentials with `private_key_jwt`|`SDX_`|
|`gwa`|OIDC client-credentials with `private_key_jwt`|`GWA_`|
|`css`|OIDC client-credentials with `client_secret_basic`|`CSS_`|

Built on [`oauth4webapi`](https://github.com/panva/oauth4webapi) + [`jose`](https://github.com/panva/jose) (web-standard fetch, no legacy deps). Tokens are cached in-memory until 30 seconds before `expires_in`, with single-flight refresh.

See `.env.example` for the full env-var contract. Each prefix needs `*_BASE_URL`, `*_TOKEN_URL`, `*_CLIENT_ID`, plus `*_PRIVATE_KEY_PATH` (signed JWT) or `*_CLIENT_SECRET` (CSS). Optional: `*_SCOPE`, `*_AUDIENCE`, and for signed JWT `*_KEY_ALG` (default `RS256`) and `*_KID`. The private key file must be PEM-encoded PKCS#8.

Usage in a route:

```ts
const res = await app.clients.aps.fetch('/products')
const products = await res.json()
```

If env vars are missing for a given client, the app still starts; calls to that client throw a clear `not configured: missing X, Y` error.

## Generate and lint the spec

```bash
npm run spec:yaml   # writes openapi.yaml
npm run spec:json   # writes openapi.json
npm run lint:spec   # regenerates openapi.yaml and runs Spectral (fails on warn)
```
