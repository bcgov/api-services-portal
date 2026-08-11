# SDX v1 API — Permissions Audit

Audit of every controller under `src/controllers/sdx/v1/`, covering which permission scope
each endpoint requires, what operation it performs, and what resource that scope is actually
checked against (Keycloak/UMA2 resolves the resource dynamically per-request — see
`src/auth/auth-tsoa.ts` and `src/auth/auth-sdx-middle.ts`).

## Permission → Resource classification

| Permission (scope) | Resolved against | Classification |
|---|---|---|
| `System.Manage` | `org/{org}` (always, regardless of what sub-resource the path is nested under) | **Organization** |
| `Connection.Manage` | the target service's gateway namespace, looked up via `body.serviceId` when present (approval); for list, no single resource — the caller must hold `Connection.Manage` on *at least one* gateway (checked via a UMA2 permission-discovery call, same as `Subsystem.Manage`), and the response is filtered to connections for services on those gateways | **Gateway** (service-level); list is discovery-based across all of the caller's granted gateways |
| `Subsystem.Manage` **(new)** | dynamic — for `oas-services`: the named service's gateway (`{name}` path param) for get/spec/delete, the target subsystem's gateway (`subsystem` query param) for create; for `connections`: the target service's gateway via `body.serviceId` for create, or via `{id}` (looked up to that connection's own `serviceId`) for delete; for list (`oas-services` only), no single resource — the caller must hold `Subsystem.Manage` on *at least one* gateway (checked via a UMA2 permission-discovery call), and the response is filtered to just the services on those gateways (see endpoint table) | **Gateway** (varies); list is discovery-based across all of the caller's granted gateways |
| `GatewayPattern.Publish` | dynamic — org, subsystem, runtime-group, or service gateway, depending on `pattern` + `body.parameters` | **Gateway** (varies) |
| `jwt` with `[]` scope | none — any authenticated user, no resource check | **None** (authenticated-only) |
| *(no `@Security`)* | none | **Public** |
| *(subsystem/runtime-group `subsystem-owner`/`tech-lead`/`access-manager`)* | UMA2 group under `/systems` (subsystem) or `/runtimes` (runtime group), keyed by subsystem `clientId` or runtime group name, for the GET/PUT `.../access` endpoints themselves | **Subsystem/Runtime Group** — the role-membership endpoints are still gated solely by org-wide `System.Manage` (see Inconsistency #1), but each role now also grants real, role-differentiated UMA2 permissions (`subsystem-owner`/`tech-lead`: `Namespace.View` + `GatewayPattern.Publish` + `Subsystem.Manage` — `subsystem-owner` also gets `Namespace.Manage`; `access-manager`: `Namespace.View` + `Connection.Manage`) on the actual gateway namespace resource (see roles table and "Gateway registration side effects" below) |

## Endpoint table

| Method & Path | Controller.method | Permission | Scope |
|---|---|---|---|
| GET `/catalog/activity` | Catalog.listOrgActivity | *none* | Public |
| GET `/catalog/organizations` | Catalog.listOrganizations | *none* | Public |
| GET `/catalog/subsystems` | Catalog.listSubsystems | *none* | Public |
| GET `/catalog/subsystems/{name}` | Catalog.getSubsystem | *none* | Public |
| GET `/catalog/services` | Catalog.listCatalog | *none* | Public |
| GET `/catalog/scopes` | Catalog.listCatalogScopes | *none* | Public |
| GET `/catalog/services/{name}` | Catalog.getOASService | *none* | Public |
| GET `/catalog/services/{name}/oas-spec` | Catalog.getOASServiceSpec | *none* | Public |
| GET `/organizations/{org}/activity` | OrgActivity.listOrganizationActivity | `System.Manage` | Organization |
| PUT `/organizations/{org}/connections` | OrgConnection.upsertConnection | `System.Manage` **or** `Subsystem.Manage` | Organization; or **Gateway** (service) via `body.serviceId` |
| GET `/organizations/{org}/connections` | OrgConnection.listConnections | `System.Manage` **or** `Connection.Manage` | Organization for `System.Manage` (returns every connection); for `Connection.Manage`, discovery-based across every gateway the caller holds it on — the response is filtered to connections for services on those gateways (see "Listing connections and oas-services with gateway-scoped permissions" below) |
| DELETE `/organizations/{org}/connections/{id}` | OrgConnection.deleteConnection | `System.Manage` **or** `Subsystem.Manage` | Organization; or **Gateway** (service) via `{id}` looked up to that connection's own `serviceId` |
| PUT `/organizations/{org}/connections/approval` | OrgConnection.updateConnectionApproval | `Connection.Manage` | **Gateway** (service) |
| PUT `/organizations/{org}/patterns/{pattern}` | OrgGateways.provisionConfigFromPattern | `GatewayPattern.Publish` | **Gateway** (dynamic) |
| PUT `/organizations/{org}/gateway` | OrgGateways.registerOrganizationGateway | `System.Manage` | Organization |
| POST `/organizations/{org}/keys` | OrgKeys.createNewKey | `System.Manage` | Organization |
| PUT `/organizations/{org}/runtime-groups` | RuntimeGroup.createRuntimeGroup | `System.Manage` | Organization |
| GET `/organizations/{org}/runtime-groups` | RuntimeGroup.listRuntimeGroups | `System.Manage` | Organization |
| DELETE `/organizations/{org}/runtime-groups/{name}/environments/{environment}` | RuntimeGroup.delete | `System.Manage` | Organization |
| PUT `/organizations/{org}/runtime-groups/{name}/gateway` | RuntimeGroup.registerRuntimeGroupGateway | `System.Manage` | Organization *(side effect: same gateway-registration role/permission grants as `registerSubsystemGateway` — see "Gateway registration side effects" below)* |
| POST `/organizations/{org}/runtime-groups/{name}/environments/{environment}/tokens` | RuntimeGroup.generateOneTimeUseToken | `System.Manage` | Organization |
| PUT `/organizations/{org}/oas-services` | GatewayService.createOASService | `System.Manage` **or** `Subsystem.Manage` | Organization; or **Gateway** (subsystem) via the `subsystem` query param |
| GET `/organizations/{org}/oas-services` | GatewayService.listOrganizationServices | `System.Manage` **or** `Subsystem.Manage` | Organization for `System.Manage` (returns every service); for `Subsystem.Manage`, discovery-based across every gateway the caller holds it on — the response is filtered to just those services (see "Listing connections and oas-services with gateway-scoped permissions" below) |
| GET `/organizations/{org}/oas-services/{name}` | GatewayService.getOrganizationOASService | `System.Manage` **or** `Subsystem.Manage` | Organization; or **Gateway** (service) via the `{name}` path param |
| GET `/organizations/{org}/oas-services/{name}/oas-spec` | GatewayService.getOrganizationServiceSpec | `System.Manage` **or** `Subsystem.Manage` | Organization; or **Gateway** (service) via the `{name}` path param |
| DELETE `/organizations/{org}/oas-services/{name}` | GatewayService.delete | `System.Manage` **or** `Subsystem.Manage` | Organization; or **Gateway** (service) via the `{name}` path param |
| GET `/organizations/{org}/clients` | OrgSubsystemClient.listSubsystemClients | `System.Manage` | Organization |
| GET `/organizations/{org}/clients/{name}` | OrgSubsystemClient.getSubsystemClient | `System.Manage` | Organization |
| PUT `/organizations/{org}/subsystems` | OrgSubsystem.upsertSubsystem | `System.Manage` | Organization |
| GET `/organizations/{org}/subsystems` | OrgSubsystem.listSubsystems | `System.Manage` | Organization |
| DELETE `/organizations/{org}/subsystems/{name}` | OrgSubsystem.delete | `System.Manage` | Organization |
| PUT `/organizations/{org}/subsystems/{name}/gateway` | OrgSubsystem.registerSubsystemGateway | `System.Manage` | Organization *(side effect: grants the calling user direct gateway-scoped permissions on the new subsystem namespace — see "Gateway registration side effects" below)* |
| GET `/organizations/{org}/subsystems/{name}/access` **(SP136, new)** | OrgSubsystem.getAccess | `System.Manage` | Organization *(manages Subsystem-scoped data)* |
| PUT `/organizations/{org}/subsystems/{name}/access` **(SP136, new)** | OrgSubsystem.putAccess | `System.Manage` | Organization *(manages Subsystem-scoped data)* |

## Roles summary

| Role (Keycloak client role, from scope) | Source scope | What it gets in sdx/v1 |
|---|---|---|
| `system-admin` | `System.Manage` | Full CRUD across virtually the entire API for the org(s) they hold this on: subsystems, runtime groups, keys, OAS services, connections (except approval), org gateway registration, org activity, and (as of SP136) subsystem RBAC access. This is the de-facto "org admin" role (see `PredefinedRolePermissions['system-admin']` in `src/services/org-groups/roles.ts` and `OrganizationRoles` in `src/services/org-groups/group-access.ts`). |
| `connection-manager` | `Connection.Manage` | Connection **approval**, scoped to the specific service's gateway. Can now also **list** connections (`GET /organizations/{org}/connections`) — a `connection-manager`-only holder gets back connections for services on the gateways they hold the scope on, not the whole org's, via the same discovery-based filtering as `Subsystem.Manage` (see below). Still cannot create or delete connections. |
| `pattern-publisher` | `GatewayPattern.Publish` | Gateway config provisioning via pre-defined patterns, scoped to whatever gateway (org/subsystem/runtime-group/service) the pattern targets. |
| `subsystem-manager` | `Subsystem.Manage` **(new)** | Full CRUD on `oas-services` (create/list/get/spec/delete) **and** create/delete on `connections`, all scoped to the target service's or subsystem's gateway at the sdx/v1 REST layer — an alternative to `system-admin` for delegating subsystem-level management without full org-wide `System.Manage`. Listing (`oas-services` only — `connections` listing uses `Connection.Manage` instead) works too: a `Subsystem.Manage`-only holder gets back just the services on gateways they hold the scope on, not the whole org's (see "Listing connections and oas-services with gateway-scoped permissions" below). `scopesToRoles()` (`src/auth/scope-role-utils.ts`) synthesizes this as the `subsystem-manager` role, and `src/authz/matrix.csv` grants it create/update/delete on `OpenAPISpec` and `ConnectionRequest` **without any namespace filter** — i.e. a JWT/M2M caller with `Subsystem.Manage` hits the Keystone GraphQL API directly (bypassing sdx/v1's per-gateway UMA2 checks entirely) gets **blanket**, org-wide CRUD on every subsystem's services/connections, not just gateways it holds the scope on. This mirrors how `system-admin`'s matrix.csv rows are also unfiltered — the same scope means "this one gateway" via sdx/v1 REST but "everything" via direct GraphQL access; see Inconsistency #6. |
| `organization-admin` | `GroupAccess.Manage` (also gets `Namespace.Assign`, `Dataset.Manage`) | Nothing in sdx/v1 — no v1 endpoint requires `GroupAccess.Manage`. Instead this is the *role-administration* role: it's what lets a user grant/revoke `organization-admin` and `system-admin` themselves, via `GET/PUT /organizations/{org}/roles` and `GET/PUT /organizations/{org}/access` on `src/controllers/v3/OrganizationController.ts`. Distinct from `system-admin`, which does the org's operational CRUD but doesn't inherently manage who else holds these roles. |
| *(any caller, incl. anonymous)* | — | Read all public catalog listings, including individual OAS specs and, as of this change, individual service detail (`GET /catalog/services/{name}` is now public — see Inconsistency #4). |

> `organization-admin` and the v3 `OrganizationController` endpoints above are outside this
> document's stated scope (`src/controllers/sdx/v1/`), but are included here because they're
> the mechanism that grants/revokes the v1 roles above — omitting them would leave a gap in
> understanding who can escalate whom.

Separately — the role-*membership* endpoints (GET/PUT `.../access`) are **not** wired to any
endpoint's `@Security` beyond org-wide `System.Manage`, but the roles themselves now carry
real, enforced, role-differentiated grants:

| Role (UMA group under `/systems` or `/runtimes`) | Managed by | Enforces what? |
|---|---|---|
| `subsystem-owner` (renamed from `system-owner`) | GET/PUT `.../subsystems/{name}/access` (subsystem only — there's no equivalent runtime-group role-membership endpoint) | Grants `Namespace.Manage`, `Namespace.View`, `Subsystem.Manage` **and** `GatewayPattern.Publish` on the real gateway namespace resource (see below). Membership itself still isn't checked by any `@Security` decorator, but the other three scopes *are* checked elsewhere, so this role now has real functional effect. |
| `tech-lead` | same | `Namespace.View`, `Subsystem.Manage` **and** `GatewayPattern.Publish` — same as `subsystem-owner` minus `Namespace.Manage`. |
| `access-manager` | same | Grants `Namespace.View` **and** `Connection.Manage` instead — lets holders approve/list connections (`PUT .../connections/approval`, `GET .../connections`) scoped to this gateway. |

These roles are granted automatically as a side effect of registering a gateway — for a
**subsystem**, all three roles go to the calling user (confirmed in
`e2e/cypress/tests/99-sp136/01-subsystem-access.ts`); for a **runtime group**
(`RuntimeGroup.registerRuntimeGroupGateway` → `CreateNamespaceForRuntimeGroup`), only
`tech-lead` and `subsystem-owner` are assigned — **not** `access-manager` — so a runtime-group
creator does not automatically get `Connection.Manage` the way a subsystem creator does. Runtime
group role membership also lives under a different parent group, `/runtimes` instead of
`/systems` (`prepareRoleAssignments`, `src/services/workflow/create-namespace-sdx.ts`).

`roles.ts` (`src/services/org-groups/roles.ts`) gives each role a
`{ resourceType: 'namespace', scopes: [...] }` permission — mirroring the pre-existing pattern
used by `organization-admin` — with `Namespace.View` common to all three, plus role-specific
scopes: `subsystem-owner` additionally gets `Namespace.Manage`, `Subsystem.Manage`, and
`GatewayPattern.Publish`; `tech-lead` gets `Subsystem.Manage` and `GatewayPattern.Publish` (no
`Namespace.Manage`); `access-manager` gets `Connection.Manage`. This is applied via the
pre-existing (previously dead, since permissions were empty) `GroupAccessService.assignSystemRolesToNamespace`
call in `prepareRoleAssignments`, which now also takes a `type: 'subsystem' | 'runtime'`
parameter (used only to pick `/systems` vs `/runtimes` as the parent group — the permission
grant itself is identical either way) and grants the permission on the actual gateway
`namespace` resource — the same resource `Connection.Manage`/`GatewayPattern.Publish`/
`Subsystem.Manage` are checked against — so, unlike `Namespace.View` alone (which no
`@Security` decorator in sdx/v1 checks), the rest of this grant is real and enforced.

### Gateway registration side effects

`PUT /organizations/{org}/subsystems/{name}/gateway` (`registerSubsystemGateway`) and
`PUT /organizations/{org}/runtime-groups/{name}/gateway` (`registerRuntimeGroupGateway`) do more
than register the gateway — each is the endpoint that actually provisions the corresponding UMA2
`namespace` resource, and in doing so grants **direct, per-user UMA2 permissions** to whichever
user called it (the "creator"), separate from and in addition to the role grants above. Both
funnel through the same shared code: `CreateNamespaceForSubsystem` /
`CreateNamespaceForRuntimeGroup` → `createSDXNamespace` → `CreateNamespace`
(`src/services/workflow/create-namespace-sdx.ts`, `src/services/workflow/create-namespace.ts`):

- A UMA2 resource set of `type: 'namespace'` is created for the gateway (`CreateNamespace`,
  `src/services/workflow/create-namespace.ts:81-92`), with `resource_scopes` including
  `Namespace.Manage`, `Namespace.View`, `GatewayConfig.Publish`, `Access.Manage`,
  `Content.Publish`, `CredentialIssuer.Admin`, `Connection.Manage`, `GatewayPattern.Publish`, and
  (as of this change) `Subsystem.Manage`. Identical for subsystems and runtime groups.
- An individual UMA2 permission ticket is then granted **directly to the calling user**
  (`envCtx.subjectUuid`, i.e. `context.req.user.sub`) for `Namespace.Manage`
  (`createSDXNamespace`, `src/services/workflow/create-namespace-sdx.ts:311`, applied via
  `permissionApi.createPermission` in `CreateNamespace`,
  `src/services/workflow/create-namespace.ts:103-121`). This is a one-off grant (permission
  ticket), not membership in a reusable role, so it won't show up in any roles/groups listing —
  only as a UMA2 permission on the gateway's namespace resource. `Connection.Manage` and
  `GatewayPattern.Publish` are deliberately **not** included here — see below for why.
  `Subsystem.Manage` is registered as a valid scope on the resource but isn't granted to the
  creator by any path yet; it must be granted separately (e.g. by whoever holds
  `System.Manage`/existing `Subsystem.Manage` on that gateway).
- Separately, `GatewayConfig.Publish` and `Namespace.Manage` on that same namespace resource are
  also granted to the `sdx-provisioner` service-account **client** via a UMA policy
  (`createSDXNamespace`, `src/services/workflow/create-namespace-sdx.ts:318-323`) — not the
  user, and out of scope for "what a human gets."

**Why `Connection.Manage`/`GatewayPattern.Publish` aren't in the direct grant, and why
`Namespace.Manage` still is despite now being redundant too:** the same
`CreateNamespaceForSubsystem`/`CreateNamespaceForRuntimeGroup` call also runs
`prepareRoleAssignments`, which — per the roles table above — gives the creator roles that
already carry `GatewayPattern.Publish` (`subsystem-owner`/`tech-lead`, both auto-assigned in
either path) and, for subsystems only, `Connection.Manage` (`access-manager`, auto-assigned only
on subsystem creation, **not** runtime-group creation) on this exact same namespace resource.
Duplicating those as a *second*, direct per-user grant would be redundant, so they're excluded.
`Namespace.Manage`, however, is *also* now granted by the `subsystem-owner` role (added to
`roles.ts` alongside `Subsystem.Manage` — see roles table above), which is auto-assigned in
**both** paths — so the direct grant is, strictly, now redundant there too. It's kept because of
a bootstrapping order dependency called out in the code comment: `createSDXNamespace` runs
*before* `prepareRoleAssignments`, and something inside `CreateNamespace`'s own UMA-policy-creation
step ("due to how the getResources work") requires the calling user to already hold
`Namespace.Manage` on the resource being created — which only the direct grant can provide at
that point, since the role-based grant doesn't exist until the subsequent `prepareRoleAssignments`
call completes. After that, the role-based grant is what actually keeps it in effect long-term.

Net effect: the user who registers a subsystem's gateway walks away with **all three**
subsystem-RBAC roles (role *membership* itself still unenforced by any `@Security` check — see
Inconsistency #1 — though each role now also carries a real, role-differentiated grant covering
`Namespace.Manage`/`Subsystem.Manage`/`GatewayPattern.Publish`/`Connection.Manage`) **plus** one
additional, directly-granted, enforced permission (`Namespace.Manage`, functionally redundant
with the role grant post-creation) on that subsystem's namespace. A runtime-group creator gets
only **two** of the three roles (`tech-lead`, `subsystem-owner` — not `access-manager`), so they
end up with `Namespace.Manage`/`Subsystem.Manage`/`GatewayPattern.Publish` but **not**
`Connection.Manage` on their own runtime group's gateway, unlike a subsystem creator. Either way
this is granted as an undocumented side effect of the gateway-registration endpoint rather than
as an explicit, reviewable role assignment.

### Resolving Subsystem.Manage for per-resource operations

`Subsystem.Manage` is shared across two controllers and five non-list operations, each with a
different way of identifying the target gateway. `AuthMiddle.lookupSubsystemManageGatewayId`
(`src/auth/auth-sdx-middle.ts`), called from the `Subsystem.Manage` branch in
`expressAuthentication` (`src/auth/auth-tsoa.ts`), tries each in order and resolves to whichever
applies to the current request:

| Operation | Identifier | Resolution |
|---|---|---|
| `oas-services` get/spec/delete | `{name}` path param | that service's own gateway |
| `oas-services` create | `subsystem` query param | the target subsystem's gateway |
| `connections` create (`upsertConnection`) | `body.serviceId` | that service's gateway |
| `connections` delete (`deleteConnection`) | `{id}` path param | looked up via `AuthMiddle.lookupConnectionServiceId` to the connection's own `serviceId`, then that service's gateway |
| either `list` operation | *(none)* | falls through to the discovery-based check below |

If none of the above resolves (the list case for either endpoint), the request falls through to
the discovery-based check described next rather than being rejected outright.

### Deterministic scope OR (`System.Manage` **or** `Subsystem.Manage`/`Connection.Manage`)

Every endpoint above that accepts more than one scope declares them as a **single**
`@Security('jwt', [scopeA, scopeB])` decorator with a multi-element scopes array (e.g.
`@Security('jwt', ['System.Manage', 'Subsystem.Manage'])` on `createOASService`/`delete`), not
multiple stacked `@Security(...)` decorators. This matters because of how tsoa's generated
`authenticateMiddleware` (`src/controllers/sdx/v1/routes.ts`) handles the two cases differently:

- **Stacked decorators** (multiple separate `@Security(...)` calls on one method) each become an
  independent call to `expressAuthentication`, and tsoa fires all of them **concurrently**,
  taking whichever fulfills first via the `promise.any` polyfill — correct for the pass/fail
  decision itself (`promise.any` does correctly implement "resolve on first fulfillment, reject
  only if all reject"), but the concurrency means: every stacked check runs to completion
  regardless of whether an earlier one already succeeded (wasted Keycloak/UMA2 round-trips, worse
  for the more expensive `Subsystem.Manage`/`Connection.Manage` discovery-based checks); the
  *value* returned to the controller as `request.user` is whichever check happened to settle
  first in wall-clock time, not a deterministic/prioritized choice; and on total failure, the
  403 message shown is whichever check happened to reject *last* (`failedAttempts.pop()` in the
  generated code), not necessarily the most relevant one. This was the previous shape of every
  OR'd endpoint in this doc and is why the response-filtering code in
  `listOrganizationServices`/`listConnections` had to re-derive the caller's scopes from the raw
  JWT claim instead of trusting the resolved `request.user`/`request.oauth_user.scope` — see
  "Listing connections and oas-services with gateway-scoped permissions" below.
- **A single decorator with a multi-scope array** results in exactly **one** call to
  `expressAuthentication` per request (`Object.keys(secMethod).length === 1` in the generated
  code takes the non-racing branch). `expressAuthentication` (`src/auth/auth-tsoa.ts`) now
  implements the OR itself, sequentially: `authorizeAnyScope` tries each scope in array order via
  `authorizeScope`, returning on the first success and only falling through to the next scope on
  failure; if every scope fails, it throws one `ForbiddenError` listing every scope that was
  tried and why. Declaring `System.Manage` first means the common case (an org-wide admin) never
  pays for `Subsystem.Manage`'s extra gateway-resolution/UMA2-discovery work, and the winning
  scope — and therefore `request.user`/`request.permissions` — is now deterministic rather than a
  function of network timing.

All multi-scope endpoints in this document were migrated to the single-decorator form as part of
this fix; `expressAuthentication`'s scope-resolution logic (`resolveGatewayIdForScope`,
`resolveGenericResource`, `enforcePermission`) was factored out to be reusable per-scope rather
than assuming a single resource shared across an entire call's scopes list. This is shared,
non-generated code used by every `sdx/v1` (and `v1`/`v2`/`v3`) controller, so the fix applies
everywhere `expressAuthentication` is used, not just the endpoints that currently declare
multiple scopes.

### Listing connections and oas-services with gateway-scoped permissions

`GET /organizations/{org}/oas-services` (`listOrganizationServices`) and
`GET /organizations/{org}/connections` (`listConnections`) can't resolve a single gateway
resource to check the way the other, per-service operations do — a list spans every
subsystem's services. Rather than falling back to the org resource (which would make
`Subsystem.Manage`/`Connection.Manage` pointless for listing, since neither is registered there),
both endpoints use the same two-step, discovery-based design across `src/auth/auth-tsoa.ts`,
`src/auth/auth-sdx-middle.ts`, and the respective controller:

1. **Authorization gate** (`auth-tsoa.ts`): when `Subsystem.Manage`/`Connection.Manage` is being
   checked and no resource was otherwise resolved (no `{name}`/`subsystem` param for
   `oas-services`; no `body.serviceId` for `connections`), `AuthMiddle.getPermittedNamespacesForScope`
   performs a UMA2 permission-ticket exchange (`requestTicket` + `getPermittedResourcesUsingTicket`,
   evaluated against the caller's own bearer token) asking Keycloak "which gateway namespaces
   does this caller hold [that scope] on, if any." A non-empty result passes that scope's check
   (tried after `System.Manage`, per "Deterministic scope OR" below — `System.Manage` alone
   already grants access without ever reaching this discovery call); an empty result on the last
   scope tried rejects with 403.
2. **Response filtering** (`OrgServiceController.listOrganizationServices` /
   `OrgConnectionController.listConnections`): each controller independently re-derives the
   same thing — checking the caller's raw JWT `scope` claim (`request.oauth_user.scope`) for
   `System.Manage`. If present, it returns the full unfiltered list (existing behavior,
   unchanged). If absent, it calls the same discovery flow itself (`getPermittedNamespaceNames`,
   exported from `src/services/workflow/get-namespaces.ts`) to get the caller's permitted
   gateway namespaces, then:
   - `listOrganizationServices` adds a `namespace_in: [...]` clause directly to the
     `OpenAPISpec` query (`OpenAPISpec.namespace` is a direct field).
   - `listConnections` first resolves those namespaces to the `OpenAPISpec.name`s (serviceIds)
     of the services that live in them (`ConnectionService.getServiceIdsForNamespaces`, a
     `namespace_in` query against `OpenAPISpec`), then filters `ConnectionRequest` by
     `serviceId_in: [...]` — since `ConnectionRequest.serviceId` is a plain text field storing
     the provider service's name, not a relationship. Connections are inherently
     provider-gateway-scoped this way; there's no client-side equivalent for `Connection.Manage`.

   Reading the raw `request.oauth_user.scope` claim here (rather than the resolved
   `request.user.scope` the auth middleware settled on) is no longer needed to dodge a race —
   see "Deterministic scope OR" below, the auth middleware itself is now race-free — but it's
   kept because it answers a genuinely different question: "does this caller hold `System.Manage`
   *at all*," not "which scope happened to authorize this particular request." A caller holding
   both scopes is now deterministically authorized via `System.Manage` (tried first), so in
   practice `request.user.scope` would give the same answer today, but the explicit claim check
   doesn't depend on that ordering staying stable.

This means two Keycloak round-trips for a scope-only list call (one to authorize, one to
filter) rather than one — not shared across the request, since the authorization check happens
in the auth middleware (`auth-tsoa.ts`, before the controller method even runs) and the
response-filtering check happens independently inside the controller. `getMyNamespaces` in the
same file already did the identical two-step UMA2 flow (ticket → resource ids → resource
details) for the namespaces report; `getPermittedResourceIds` was extracted out of it so both
that and the new `getPermittedNamespaceNames` share the ticket-exchange logic.

## Inconsistencies & recommendations

1. **Subsystem RBAC role *membership* still isn't enforced anywhere — `[substantially
   resolved]`.** The SP136 endpoints let you view/edit who holds `subsystem-owner`/`tech-lead`/
   `access-manager` *for a subsystem*, but access to those endpoints themselves is still gated
   solely by org-wide `System.Manage` — holding one of these roles doesn't affect who can call
   GET/PUT `.../access` (and there's no equivalent role-membership endpoint for runtime groups
   at all — see below). What *has* changed: each role now carries a real, role-differentiated
   `{ resourceType: 'namespace', scopes: [...] }` permission (`roles.ts`) — `Namespace.Manage` +
   `Namespace.View` + `Subsystem.Manage` + `GatewayPattern.Publish` for `subsystem-owner`;
   `Namespace.View` + `Subsystem.Manage` + `GatewayPattern.Publish` for `tech-lead`;
   `Namespace.View` + `Connection.Manage` for `access-manager` — applied to the actual gateway
   resource via `assignSystemRolesToNamespace`. Since `Subsystem.Manage`, `GatewayPattern.Publish`,
   and `Connection.Manage` *are* checked by `@Security` elsewhere (oas-services, connections,
   pattern provisioning), these roles now meaningfully gate real operations on their gateway —
   it's just the SP136 access-management endpoints themselves that remain ungated by role
   membership. This role system was also extended to **runtime groups** in this change
   (`registerRuntimeGroupGateway` → `CreateNamespaceForRuntimeGroup`, granting `tech-lead` +
   `subsystem-owner` — not `access-manager` — under a `/runtimes` parent group), previously
   subsystem-only. Recommend a follow-up ticket to make `PUT .../access` itself callable by a
   subsystem's own `access-manager`, not just an org `system-admin`, and to consider adding an
   equivalent role-membership endpoint for runtime groups.

2. **Naming collision on "system-owner" — `[resolved]`.** The subsystem-scoped role has been
   renamed `system-owner` → `subsystem-owner` (`SystemRoles` in `sys-group-access.ts`,
   `PredefinedRolePermissions` in `roles.ts`), and `scopesToRoles()` in
   `src/auth/scope-role-utils.ts` now emits `system-admin` for the `System.Manage` scope
   (matching `roles.ts`) instead of the stale `system-owner`, with `src/authz/matrix.csv`
   updated to match. The two role systems (group-based org-groups roles, and JWT/M2M-derived
   Keystone roles) no longer share an ambiguous name.

3. **Connections CRUD is inconsistently scoped — `[resolved]`.** `listConnections` now also
   accepts `Connection.Manage` (multi-scope `@Security`), including a real, working list: approval
   still resolves via `body.serviceId`, and a bare list call now goes through the same
   discovery-based gate + response-filtering used by `Subsystem.Manage`/`listOrganizationServices`
   (see "Listing connections and oas-services with gateway-scoped permissions" above) — a
   `connection-manager`-only holder gets back connections for services on gateways they hold
   the scope on, not a 403 and not the whole org's. `upsertConnection` (create) and
   `deleteConnection` now also accept `Subsystem.Manage`, resolved via `body.serviceId` (create)
   or `{id}` looked up to the connection's own `serviceId` (delete) — see "Resolving
   Subsystem.Manage for per-resource operations" above. Every connections operation now has a
   gateway-scoped alternative to `System.Manage`; `connection-manager` (list/approve) and
   `Subsystem.Manage` (create/delete) together cover the full CRUD surface without requiring
   org-wide admin.

4. **Catalog auth gap — `[resolved]`.** `GET /catalog/services/{name}` no longer requires
   authentication — the `@Security('jwt', [])` decorator was removed and the context switched
   to `keystone.sudo()`, matching the already-public `GET /catalog/services/{name}/oas-spec`.
   Both catalog service endpoints are now consistently public.

5. **All-or-nothing admin model within an org — `[partially addressed]`.** `Subsystem.Manage`
   (all of `oas-services`, plus connection create/delete) and `Connection.Manage` (connection
   approval + list) now both give gateway-scoped alternatives to `System.Manage` (additive, via
   multi-scope `@Security` — existing `system-admin` holders are unaffected), including real,
   filtered listing where a list operation exists — a scope-only holder gets back just their own
   gateways' data via the shared UMA2 discovery pattern (see "Listing connections and
   oas-services with gateway-scoped permissions" above), not the whole org's and not a 403. This
   covers the full CRUD surface for both `oas-services` and `connections` — the delegation model
   this recommendation called for. Every other write/read operation — subsystems, runtime
   groups, keys, org gateway — is still gated by the same org-wide `System.Manage` alone.
   There's no way to grant someone rights over a single subsystem or runtime group without
   giving them control of the whole organization. Given SP136 just added subsystem-level role
   data, extending the same scope/discovery-filtered-list pattern to those remaining endpoints
   looks like the natural next step if finer delegation is a goal.

6. **`Subsystem.Manage` means "one gateway" via sdx/v1, but "everything" via direct Keystone
   GraphQL access — `[not addressed, pre-existing pattern]`.** `scopesToRoles()`
   (`src/auth/scope-role-utils.ts`) now synthesizes `Subsystem.Manage` as the `subsystem-manager`
   role, and `src/authz/matrix.csv` grants that role create/update/delete on `OpenAPISpec` and
   `ConnectionRequest` with **no `filters` value** — i.e. no namespace/organization restriction.
   A JWT/M2M caller presenting `Subsystem.Manage` who hits the Keystone GraphQL API directly
   (bypassing sdx/v1's dynamic per-gateway UMA2 checks in `auth-tsoa.ts` entirely) gets blanket
   CRUD on every subsystem's services and connections org-wide, not just gateways they hold the
   scope on via UMA2. This isn't a new gap introduced here — `system-admin`'s equivalent
   `matrix.csv` rows are unfiltered the same way, so `System.Manage` already had this same
   dual nature (org-scoped via sdx/v1 REST, unscoped via direct GraphQL) before this change. It's
   worth flagging now because `Subsystem.Manage` was deliberately designed to be a *narrower*,
   single-gateway alternative to `System.Manage` at the sdx/v1 layer — callers who only look at
   the REST-layer behavior would reasonably assume it stays narrow everywhere, which isn't the
   case for anything that talks to Keystone's GraphQL API directly. Worth documenting explicitly
   as "this scope is only gateway-scoped through sdx/v1; a direct GraphQL/M2M client with it is
   effectively org-wide," or tightening `matrix.csv` with a namespace filter to match.
