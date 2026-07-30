# SDX TechDocs test runner

A small Node.js CLI that walks through Secure Data Exchange (SDX) scenarios
against a live restish-configured environment, using freshly generated
random test data, and records what happened into a `results.md` file.

The checkpoint/resume/logging engine (`lib/engine.js`) is scenario-agnostic;
each scenario lives under `tests/` and is composed from the reusable step
builders in `lib/steps/*.js`. Run one with `--test <name>` (default:
`happy-path`):

```sh
node run.js                    # == --test happy-path
node run.js --test plat-001
```

`happy-path` follows, in order, the how-to guides linked from
`aps-infra-platform/documentation/concepts/secure-data-exchange.md`:

1. [`sdx-org-onboarding.md`](../../aps-infra-platform/documentation/how-to/sdx-org-onboarding.md) - register an organization, assign RBAC, assign a gateway
2. [`sdx-edge-servers.md`](../../aps-infra-platform/documentation/how-to/sdx-edge-servers.md) - register a runtime group, its gateway, routes, and public key
3. [`sdx-subsystems.md`](../../aps-infra-platform/documentation/how-to/sdx-subsystems.md) - register a subsystem and assign it to the runtime group
4. [`sdx-services.md`](../../aps-infra-platform/documentation/how-to/sdx-services.md) - register a service from a generated fake OpenAPI spec
5. [`sdx-connections.md`](../../aps-infra-platform/documentation/how-to/sdx-connections.md) - request, approve, and open a connection between the subsystem and the service

...then best-effort cleans everything up in reverse order.

## Prerequisites

- [restish](https://rest.sh/) installed and on `PATH`.
- restish configured with API aliases for the organization API and the SDX
  API (`dsloc`/`loc` against a local docker-compose stack by default - see
  [`documentation/reference/restish-cli.md`](../../aps-infra-platform/documentation/reference/restish-cli.md)
  for the `restish api edit` config block, or point `--org-alias`/`--sdx-alias`
  at your own aliases, e.g. `aps`/`sdx` to target the shared DEV environment).
- Node.js 18+.
- `openssl` on `PATH` (optional - only used to generate a throwaway
  self-signed certificate for the runtime group public-key step; that step
  is skipped, non-fatally, if `openssl` isn't available).
- An account with enough privilege to create organizations
  (`GroupAccess.Manage`) and manage systems (`System.Manage`). Without this,
  the run will stop on the first step it can't perform - see "Resuming" below.

The first restish call against a given profile opens a browser for an
OAuth login; subsequent calls reuse the cached token.

## Usage

```sh
cd api-services-portal/e2e-sdx
node run.js
```

This creates a `test-run-<random-id>/` directory (in the current working
directory) containing:

- `state.json` - machine-readable checkpoint (test data, captured IDs, per-step status)
- `results.md` - human-readable summary and step-by-step log
- `api-spec.yaml` - the generated fake OpenAPI spec registered as the service
- `logs/<step-id>.log` - full request/response transcript for every step
- `*-body.json` - the JSON body sent for each step that has one
- `rg.crt` / `rg.key` - the throwaway self-signed cert used for the runtime group key step

Each step prints as it runs:

```
=== [subsystem.gateway] Assign subsystem to runtime group ===
OK   [subsystem.gateway]
```

### Resuming after a failure

If a required step fails, the runner stops and prints the resume command.
Fix the underlying issue (permissions, restish config, etc.), then:

```sh
node run.js --continue test-run-<id>
```

Already-successful steps are skipped; the run picks up where it left off.
You can also hand-edit `state.json` (e.g. to fill in a `captured` value the
runner couldn't determine automatically) before resuming.

### Options

| Flag | Default | Description |
| --- | --- | --- |
| `--continue <dir>` | - | Resume an existing `test-run-*` directory |
| `--org-alias <alias>` | `dsloc` | restish alias for `put-organization`/`put-organization-access` |
| `--sdx-alias <alias>` | `loc` | restish alias for all other SDX operations |
| `--environment <env>` | `dev` | Target environment (`dev`, `lab`, `tst`, ...) |
| `--member-email <email>` | generated `sdx-test-<id>@example.gov.bc.ca` | Email granted `system-admin` on the test org |
| `--upstream-url <url>` | `https://httpbin.org` | Fake upstream used for the provider connection pattern |
| `--profile <profile>` | restish default | `--rsh-profile` override, passed through to every call |
| `--keep` | off | Skip the cleanup steps; leave everything registered for manual inspection |
| `--test <name>` | `happy-path` | Which scenario under `tests/` to run - see "Error scenarios" below |

## Error scenarios

Besides `happy-path`, `tests/` holds one demonstration scenario per tracked
issue in [`feedback/API-SERVICES-PORTAL-ISSUES.md`](../../feedback/API-SERVICES-PORTAL-ISSUES.md)
(distilled from [`feedback/DOCUMENTATION-ERRATA-OUTSTANDING.md`](../../feedback/DOCUMENTATION-ERRATA-OUTSTANDING.md)).
Each is a thin composition of the same `lib/steps/*.js` builders `happy-path`
uses, plus one deliberately-wrong parameter and one assertion, so the same
file works both as the pre-fix reproduction (run it, see it fail the way the
errata describes) and the post-fix regression check (run it again, see it
pass).

**All of these run against the local docker-compose stack only** (the
`dsloc`/`loc` defaults) - never point `--org-alias`/`--sdx-alias`/`--profile`
at a shared environment for these. `err-031` in particular deliberately
triggers an unhandled-promise crash that restarts the `provisioner`
container; that's acceptable against a disposable local container and never
against anything shared.

| `--test` | Reproduces |
| --- | --- |
| `plat-001` | Organization-access sync silently accepts an unsupported role (`system-owner`) |
| `err-013` | Subsystem gateway registration succeeds for an org the runtime doesn't host |
| `err-014` | Repeating subsystem gateway registration 422s instead of reconciling |
| `err-015` | A validator content-rejection is reported as `validation_service_unavailable` |
| `err-018` | Generated service routes don't match the subsystem's namespace route allow-list |
| `err-019` | The public/org-scoped OAD endpoint returns a validation-enriched, not fully SDX-transformed, spec |
| `err-020` | Omitting `policyVersion` on connection request gives a generic `create-failed`, not a field error |
| `err-023` | The default `requesterDetails` is invalid against the R0 policy schema at activation |
| `err-024` | Activation reports success before/regardless of whether provisioning succeeds |
| `err-025` | The R0 policy schema rejects the implemented `useSni` provider parameter |
| `err-029` | OAS per-operation security scopes aren't converted into runtime enforcement |
| `err-031` | Updating an existing integration connection crashes the provisioner (local docker-compose only) |
| `err-032` | A provider `serviceResources` update reports `no-change` despite persisting |

### `org.access` and the local docker-compose stack

`put-organization-access` resolves `--member-email` against Keycloak users
tagged `identity_provider=idir` in the target realm - it's a real lookup, not
free text. Against the local docker-compose stack this comes from the seeded
`master` realm (`local/keycloak/master-realm.json` in api-services-portal),
which doesn't contain the runner's generated `sdx-test-<id>@example.gov.bc.ca`
address, so this step is expected to log a non-fatal
`No suitable match for ...` warning and skip on a local run. Pass
`--member-email` with one of the seeded local users (e.g. `benny@test.com`)
to exercise this step for real locally; against a real environment, pass a
real IDIR-linked email instead.

## What isn't automated

- **Runtime group infrastructure (Helm deploy).** Creating/registering a
  runtime group via the API doesn't stand up a real edge server; that's a
  separate Helm-based deployment step per `sdx-edge-servers.md`. The runner
  only exercises the API-level operations.
- **Organization/runtime-group deletion.** `sdx-edge-servers.md` marks
  runtime group decommissioning as "to be documented", and there's no
  published organization-delete how-to, so cleanup leaves the test
  organization and runtime group registered. `results.md` calls this out
  explicitly at the end of every run.
- **Organization signing / `sign`/`verify` connection upgrades.** These
  depend on the org-signing flow (a separate how-to), so the connection
  patterns opened here use empty `upgrades`.

## Files

```
run.js                    entrypoint: resolves --test, delegates to lib/engine.js
lib/engine.js              CLI parsing, run/resume loop, checkpointing (scenario-agnostic)
lib/restish.js              spawns restish, streams + captures output
lib/testdata.js              random org/RG/subsystem name + fake OpenAPI spec generation
lib/cert.js                  throwaway self-signed cert generation
lib/state.js                 state.json + results.md persistence
lib/steps/org.js              org.create / org.access / org.gateway step builders
lib/steps/runtime-group.js     rg.create / rg.gateway / rg.token / rg.routes / rg.keys builders
lib/steps/subsystem.js          subsystem.create / list-rgs / gateway / verify builders
lib/steps/service.js             service.create / locate / get-spec / pattern-preview builders
lib/steps/connection.js           connection.request / list / approve / consumer-open /
                                 provider-open / activate builders
lib/steps/cleanup.js              cleanup.* builders
tests/happy-path.js                the full TechDocs flow (see above)
tests/<issue-id>.js                 one error-reproduction scenario each (see "Error scenarios")
```

Every step builder takes `(ctx, overrides = {})` and returns the same
`{ id, title, group, fatal, run }` shape `lib/engine.js` expects. `overrides`
is how a scenario injects one wrong value and/or an `onResult(res, ctx)`
assertion hook without duplicating the step body - see any file under
`tests/` for examples.
