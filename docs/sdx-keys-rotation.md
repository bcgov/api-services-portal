# Runtime-group key rotation

This document describes how `sdx-keys.r1` publishes, rotates, and retires
runtime-group (edge) signing keys, and the ordered operational steps required
for a safe overlap rotation.

## Contract

`PUT /ds/api/sdx/v1/organizations/{org}/patterns/sdx-keys.r1?action={preview|diff|apply|delete}`

Query `action` is unchanged:

| Query action | Meaning |
| --- | --- |
| `preview` / `diff` | Evaluate without applying (diff is a GWA dry-run) |
| `apply` | Publish the generated key resources |
| `delete` | Delete the **entire** key qualifier (key set + all keys) |

An optional body parameter `operation` selects a targeted, state-aware update.
When `operation` is omitted, `sdx-keys.r1` keeps its previous behaviour: a
single key named `{name}:0` with kid `{urn}:0`.

| `parameters.operation` | Effect |
| --- | --- |
| `add` | Append a public key. Retries that present the same public key are idempotent. |
| `rotate` | Append a replacement public key and **retain** existing keys for overlap. |
| `replace` | Atomically swap `targetKid` for the incoming public key. |
| `delete` | Remove only `targetKid`. Refuses if it is the last remaining key. |

`targetKid` is required for `replace` and `delete`. `publicKeyPem` or a single
`certificatePem` entry is required for `add`, `rotate`, and `replace`.

Do not combine query `action=delete` with `operation`. Query `delete` wipes the
qualifier; targeted deletion is `action=apply` with `operation=delete`.

New kids for runtime groups use:

```
urn:ca:bc:sdx:edge:{runtimeGroup}:{environment}:{uuid}
```

The provisioner fetches the current keyset from the Kong control plane through
GWA (`GET /v2/namespaces/{namespace}/keys`) and emits the **complete** desired
state. The apply response includes structured, non-secret `changes`:

```json
{
  "operation": "rotate",
  "added": [{ "kid": "urn:ca:bc:sdx:edge:myrg:dev:…", "name": "sdx.keys.myrg.dev.edge:…" }],
  "removed": [],
  "retained": [{ "kid": "urn:ca:bc:sdx:edge:myrg:dev:0", "name": "sdx.keys.myrg.dev.edge:0" }]
}
```

Catalog activity records `added` / `rotated` / `replaced` / `removed` /
`published` with the affected kids. Public and private key material is never
written to activity blobs beyond the existing GWA deck output.

## Active kid at the data plane

`trust-sign` (and `token-exchange`) resolve the JWT `kid` by matching the
mounted private key’s public half against the Kong keyset named in
`config.keyset_name`. Explicit `config.keyid` / `config.key_id` remains
supported as a rollback path.

Resolution fails closed when zero or more than one keyset entries match.
Keyset order is not used.

Related gateway patterns (`sdx-p2p-consumer.r1`, `sdx-p2p-provider.r1`,
`sdx-service.r1`) pass `keyset_name` and no longer hard-code `:0`. Deploy the
updated plugin image **before** applying those pattern changes.

## Rotation procedure (runtime group)

1. Create a one-time CA token:
   `POST /organizations/{org}/runtime-groups/{name}/environments/{env}/tokens`
2. Bootstrap / stage a **new** runtime-group key and CSR without restarting
   Kong yet (`bootstrap.stageSecret=true`, which writes
   `{release}-client-next` and skips `rollout restart`).
3. Sign the CSR with the one-time token.
4. Publish the new public key while retaining the old one:

   ```
   PUT .../patterns/sdx-keys.r1?action=apply
   { "parameters": { "runtimeGroupName", "environment", "operation": "rotate", "certificatePem": ["..."], "caCerts": "..." } }
   ```

5. Verify the JWKS at
   `{operator_edge_url}keysets/sdx.edge.{rg}.{env}/.well-known/jwks.json`
   contains **both** kids.
6. Promote the staged secret to the live client/server secrets and perform a
   rolling restart (`rotation.promote=true` on the sdx-edge chart).
7. Verify a signed `X-Edge-Token` now carries the new random `kid`, matching
   the mounted private key.
8. Wait through the verifier grace period (`iss_key_grace_period`, default
   300s on `trust-verify-signature`).
9. Remove the old kid:

   ```
   PUT .../patterns/sdx-keys.r1?action=apply
   { "parameters": { "runtimeGroupName", "environment", "operation": "delete", "targetKid": "<old kid>" } }
   ```

## Recovery and rollback

- If rotate apply succeeds but restart has not happened, traffic still signs
  with the old private key and old kid. Both public keys are in JWKS, so
  verification continues.
- If restart happens before the new public key is published, signing fails
  closed (no JWKS match). Republish with `operation=rotate` or `add`, then
  retry.
- To abandon a staged key before promote: delete `{release}-client-next` and
  leave the live secret unchanged.
- To roll back after promote: restore the previous TLS secret, restart, then
  `operation=delete` the new kid (or `replace` it) once verifiers no longer
  see it.
- Whole-qualifier emergency removal remains query `action=delete` with no
  `operation`.

## Rollout order

1. GWA key-read endpoint (`GET /v2/namespaces/{ns}/keys`)
2. Kong image with automatic kid resolution (`trust-sign` / `token-exchange`)
3. Portal / provisioner `sdx-keys.r1` operations and pattern `keyset_name`
4. Enable random-kid rotations (`operation=add|rotate|…`)
5. Runtime chart flags for staged secrets and separate restart

Keep explicit `keyid` and legacy no-`operation` publishes available until every
runtime group runs the compatible plugin.

## Plugin audit

| Plugin | Edge signing key | Kid handling |
| --- | --- | --- |
| `trust-sign` | Yes (`KONG_SIGNING_CERT_KEY` / `private_key_location`) | Resolves via `keyset_name`, or explicit `keyid` |
| `token-exchange` | Yes (same private key) | Resolves via `keyset_name`, or explicit `key_id` |
| `trust-kms` | No (org KMS key) | Remains `urn:ca:bc:sdx:org:…:0` until KMS rotation exists |

Do not enable random-kid edge rotation on a data plane whose image still
requires `trust-sign` `config.keyid`.
