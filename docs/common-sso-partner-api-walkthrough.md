# Common SSO → SDX partner API → provider approval → service access

This walkthrough prepares `common-sso-client` to request access through the SDX
Partner API, receive the provisioner's callback at Common SSO, and test the
approved service through SDX. Run it in a nonproduction environment with a service
you control. These are setup instructions, not a record of completed deployment.

The five stages are prerequisites, provider setup, consumer steps, approval in the
SDX brochure UI, and testing. Expected evidence is included at each stage.

## 1. Prerequisites: prepare common-sso-client and the platform

### Keep the identities separate

| Identity | Purpose |
| --- | --- |
| `common-sso-client` | This walkthrough's service client in **APS Authz Keycloak**, used to call the Partner API |
| Common SSO integration ID | The Common SSO request/integration mapped to the consumer subsystem; used in Partner API paths and callback paths |
| Consumer OAuth client ID | The Common SSO-issued client requesting data-plane access; sent as `clientId` in the access request |
| Provisioner's `CSS_CLIENT_ID` | A separate service account used to authenticate callbacks **to Common SSO** |
| SDX subsystem `clientId` | Canonical SDX identifier returned by the catalog; used in connection and routing configuration |

The earlier [Infra authorization playbook](https://github.com/bcgov-c/api-serv-infra/blob/docs/ops/docs/playbooks/SDX-PARTNER-API.md)
names the incoming APS Authz registration `css-partner`. Here the test registration
is named `common-sso-client`, as requested. Register/use the name selected for the
walkthrough consistently; changing a shell variable does not rename an existing
Keycloak client. Both use audience `sdx-partner-api`. The incoming client is not
the provisioner's outgoing Common SSO account or the consumer's data-plane client.

### Register the incoming APS Authz client

An APS Authz administrator prepares a confidential, service-account-enabled client
named `common-sso-client` in the same APS Authz realm used for Portal API
authorization. Enable the client credentials grant and configure the agreed
client authentication method. The token example below uses a client secret;
use a client assertion instead if the registration requires `private_key_jwt`.

Configure an audience mapper so its **access tokens** contain
`aud: "sdx-partner-api"` (or an audience array containing that value). The partner
validator requires RS256 signatures, the correct issuer/audience, and `sub`, `iat`
and `exp`. **No Partner API scope is required.** A token-request `audience`
parameter alone is not a substitute for the Keycloak audience mapper.

Dev trust configuration for the provisioner:

```bash
export PARTNER_JWT_ISSUER="https://authz-apps-gov-bc-ca.dev.api.gov.bc.ca/auth/realms/aps"
export PARTNER_JWT_AUDIENCE="sdx-partner-api"
export PARTNER_JWT_JWKS_URL="${PARTNER_JWT_ISSUER}/protocol/openid-connect/certs"
export PARTNER_JWT_REQUIRED_SCOPE=""
```

The Partner API and internal provisioner have separate OpenAPI documents and
listeners (default ports 3001 and 3000). Obtain the **public partner base URL**
from the operator; do not send partner requests to the internal listener. Feature
Helm settings are in [the preset](../.github/helm/provisioner-feature.values.yaml);
Compose settings are in [the local environment](../local/provisioner/.env.local).

### Configure the callback receiver and its authorization

Common SSO must have a matching integration/request record and accept:

```http
PUT {CSS_BASE_URL}/requests/{integrationId}/sdx-allowed-access
Authorization: Bearer <provisioner-to-common-sso-token>
Content-Type: application/json
```

Before submitting requests:

1. Confirm the callback API base URL, the integration ID and how Common SSO stores
   replacement grants for each SDX environment, including empty grants.
2. Register/authorize the provisioner's callback service account with the identity
   provider accepted by Common SSO. The current provisioner uses client credentials
   with **`private_key_jwt`** authentication. Register its public key/JWKS and mount
   its private JWK through the established Secret/Vault mechanism.
3. Set `CSS_BASE_URL`, `CSS_TOKEN_URL`, `CSS_CLIENT_ID`, and `CSS_JWK_PATH` on the
   provisioner. Set `CSS_KEY_ALG`, `CSS_KID`, `CSS_SCOPE`, and `CSS_AUDIENCE` only as
   required by that provider. Authorize that client to update the relevant Common
   SSO integrations and confirm the token's actual audience/permissions there.
4. Give Common SSO the APS Authz client details, partner base URL/OpenAPI,
   integration/environment mapping and callback contract through the agreed
   handoff. Exchange credentials through the established secret channel.

A 2xx response acknowledges delivery. A callback failure is a failed CSS provider
result; there is no automatic callback retry. An unconfigured CSS client currently
causes dispatch to be skipped, so a successful approval alone is insufficient.
The repository's [CSS mock](../local/mocks/common-sso-api/README.md) can record
payloads locally, but it does **not** validate bearer tokens and cannot prove the
real callback authorization setup.

### Platform and operator readiness

Have the APS operator confirm the following before proceeding:

- Both provisioner listeners are healthy; SDX/APS/Feed/CSS upstream clients and
  signing keys are configured. In Compose, Cypress waits for provisioner health.
- Provider and consumer organizations are onboarded, or an SDX Operator can create
  them. Organization System Admins can manage subsystems; the provider reviewer
  has the subsystem's `access-manager` role (`Connection.Manage`).
- Appropriate runtime groups already host both organizations in the chosen SDX
  environment, with working consumer/provider edge endpoints, TLS/mTLS, and
  organization/subsystem/runtime signing keys. See [the keys runbook](sdx-keys-rotation.md).
- The provider's upstream service is reachable from its runtime group, and its
  OpenAPI description passes the platform's validator.
- For `SDX.R1.00`, confirm the actual deployed policy/upgrades and existing Common
  SSO token capabilities support the intended audience, client identity, scope
  and token-exchange behavior. See [R1 configuration and activation constraints](../provisioner-api/README.md#partner-listener-aps-4927)
  and the security configuration section preceding it. The current defaults do
  not automatically activate every strict token upgrade. Stop short of declaring
  a security acceptance test passed if those deployment gates remain unresolved.

### Set the walkthrough variables

Use `curl`, `jq`, and Bash. Obtain administrative bearer tokens through the
organization's normal login/authorization process; the Partner API credential
must not be substituted for those administrative tokens.

```bash
export SDX_ENV="dev"
export APS_API_BASE="${APS_API_BASE:?Set the Portal base including /ds/api/v3}"
export SDX_API_BASE="${SDX_API_BASE:?Set the SDX management base including /ds/api/sdx/v1}"
export PARTNER_API_BASE="${PARTNER_API_BASE:?Set the public partner base including /v1}"
export BROCHURE_BASE="${BROCHURE_BASE:?Set the SDX brochure UI base}"
export OPERATOR_TOKEN="${OPERATOR_TOKEN:?Obtain an SDX operator token}"
export PROVIDER_TOKEN="${PROVIDER_TOKEN:?Obtain a provider organization administrator token}"
export CONSUMER_ADMIN_TOKEN="${CONSUMER_ADMIN_TOKEN:?Obtain a consumer administrator token}"
export PROVIDER_ORG="demo-provider"
export PROVIDER_SUBSYSTEM="DEMO-API"
export CONSUMER_ORG="${CONSUMER_ORG:?Use the onboarded consumer organization}"
export CONSUMER_SUBSYSTEM="DEMO-CONSUMER"
export PROVIDER_RG="${PROVIDER_RG:?Choose the provider runtime group}"
export CONSUMER_RG="${CONSUMER_RG:?Choose the consumer runtime group}"
export INTEGRATION_ID="${INTEGRATION_ID:?Use the existing Common SSO integration/request ID}"
export CONSUMER_OAUTH_CLIENT_ID="${CONSUMER_OAUTH_CLIENT_ID:?Use the integration Common SSO OAuth client}"
export CONSUMER_PRIVACY_ZONE="${CONSUMER_PRIVACY_ZONE:?Use the registered consumer privacy zone}"
WORK_DIR=$(mktemp -d)
```

Use the same environment label throughout; APS deployment names and SDX runtime
environment labels are not interchangeable. Remove trailing slashes from base URLs.

## 2. Provider setup: organization, subsystem and service

### 2.1 Onboard the provider organization

Skip creation if the organization is already onboarded. The SDX Operator registers
it under the organizational root and assigns the administrators who will carry
out the remaining setup. Choose an approved, unused member ID for this example.

```bash
jq -n --arg name "$PROVIDER_ORG" '{
  name: $name, title: "Demo Provider", description: "Common SSO walkthrough provider",
  extSource: "custom", extRecordHash: "demo-1",
  tags: ["member_class:MIN", "member_id:DEMOPROV"], orgUnits: []
}' | curl --fail-with-body --silent --show-error \
  -X PUT "$APS_API_BASE/organizations/ca.bc.gov" \
  -H "Authorization: Bearer $OPERATOR_TOKEN" \
  -H 'Content-Type: application/json' --data-binary @-
```

Expected: a successful batch result. Ensure a System Admin can manage this
organization and the future provider reviewer will have subsystem access.

### 2.2 Create the provider subsystem and assign its gateway

```bash
jq -n --arg name "$PROVIDER_SUBSYSTEM" '{name: $name, description: "Demo provider API"}' \
  | curl --fail-with-body --silent --show-error \
    -X PUT "$SDX_API_BASE/organizations/$PROVIDER_ORG/subsystems" \
    -H "Authorization: Bearer $PROVIDER_TOKEN" \
    -H 'Content-Type: application/json' --data-binary @-

jq -n --arg rg "$PROVIDER_RG" '{runtimeGroupName: $rg}' \
  | curl --fail-with-body --silent --show-error \
    -X PUT "$SDX_API_BASE/organizations/$PROVIDER_ORG/subsystems/$PROVIDER_SUBSYSTEM/gateway" \
    -H "Authorization: Bearer $PROVIDER_TOKEN" \
    -H 'Content-Type: application/json' --data-binary @-
```

Expected: subsystem creation succeeds and gateway registration returns a
`gatewayId`. Confirm the subsystem is actually hosted on the selected runtime
group in `$SDX_ENV`; a successful registration response alone does not prove that.
Assign the provider reviewer the subsystem's Access Manager role.

### 2.3 Publish a service with known version, scopes and upstream

Prepare an approved `openapi.yaml` for a read-only test operation, for example
`GET /ping`, with an explicit `info.version` and operation security scopes such
as `demo.read`. Use a real OAuth2 security scheme referencing the Common SSO
resource-token issuer. Declared scopes alone do not configure runtime enforcement;
that must be confirmed in the deployed connection policy/upgrades.

```bash
export PROVIDER_SPEC="${PROVIDER_SPEC:?Path to the validated OpenAPI YAML file}"
export PROVIDER_UPSTREAM="${PROVIDER_UPSTREAM:?Upstream base URL reachable from the provider runtime}"

curl --fail-with-body --silent --show-error -X PUT \
  "$SDX_API_BASE/organizations/$PROVIDER_ORG/oas-services?subsystem=$PROVIDER_SUBSYSTEM&environment=$SDX_ENV&upstreamUrl=$(jq -rn --arg u "$PROVIDER_UPSTREAM" '$u|@uri')" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H 'Content-Type: application/yaml' --data-binary "@$PROVIDER_SPEC"
```

Record the **canonical** provider subsystem `clientId`, service `name`, version
and scopes returned by the catalog. Do not construct SDX IDs from display names.
If the environment's APS Product/Application retrofit is required, apply the
`sdx-subsystem.r1` pattern for both subsystem gateways using the operator procedure
before proceeding; the full SDX E2E fixture does this explicitly for ServiceAccess.

## 3. Consumer steps: use the Partner API as common-sso-client

### 3.1 Create/map the consumer subsystem

The consumer organization must already be onboarded with the required runtime
hosting and keys. Its System Admin creates the subsystem and links the existing
Common SSO integration. One subsystem maps to at most one integration; do not
reuse a different integration/OAuth client for existing connections in the same
environment.

```bash
jq -n --arg name "$CONSUMER_SUBSYSTEM" --arg integration "$INTEGRATION_ID" \
  --arg zone "$CONSUMER_PRIVACY_ZONE" '{
    name: $name, privacyZone: $zone,
    integrations: [{integrationClientId: $integration}]
  }' | curl --fail-with-body --silent --show-error \
    -X PUT "$SDX_API_BASE/organizations/$CONSUMER_ORG/subsystems" \
    -H "Authorization: Bearer $CONSUMER_ADMIN_TOKEN" \
    -H 'Content-Type: application/json' --data-binary @-

jq -n --arg rg "$CONSUMER_RG" '{runtimeGroupName: $rg}' \
  | curl --fail-with-body --silent --show-error \
    -X PUT "$SDX_API_BASE/organizations/$CONSUMER_ORG/subsystems/$CONSUMER_SUBSYSTEM/gateway" \
    -H "Authorization: Bearer $CONSUMER_ADMIN_TOKEN" \
    -H 'Content-Type: application/json' --data-binary @-
```

### 3.2 Obtain the Partner API access token

For the client-secret authentication variant:

```bash
export PARTNER_CALLER_CLIENT_ID="common-sso-client"
read -r -s -p 'APS Authz client secret: ' COMMON_SSO_CLIENT_SECRET
printf '\n'
PARTNER_TOKEN=$(curl --fail-with-body --silent --show-error \
  "$PARTNER_JWT_ISSUER/protocol/openid-connect/token" \
  --user "$PARTNER_CALLER_CLIENT_ID:$COMMON_SSO_CLIENT_SECRET" \
  --data-urlencode 'grant_type=client_credentials' | jq -er '.access_token')
unset COMMON_SSO_CLIENT_SECRET
```

Use this token for the following four Partner API operations. Refresh it when it
expires. It is a management token, not the token used for the final service call.

### 3.3 Check integration registration and discover resource servers

```bash
curl --fail-with-body --silent --show-error \
  "$PARTNER_API_BASE/integrations/$INTEGRATION_ID" \
  -H "Authorization: Bearer $PARTNER_TOKEN" > "$WORK_DIR/integration.json"
jq . "$WORK_DIR/integration.json"
CONSUMER_CLIENT_ID=$(jq -er 'select(.status == "registered") | .id' "$WORK_DIR/integration.json")

curl --fail-with-body --silent --show-error \
  "$PARTNER_API_BASE/resource-servers?environment=$SDX_ENV" \
  -H "Authorization: Bearer $PARTNER_TOKEN" > "$WORK_DIR/resource-servers.json"
jq . "$WORK_DIR/resource-servers.json"
```

Expected: `status: "registered"`, and the provider service appears under its
resource server with the selected environment, exact service name/version and
scope labels. `unregistered` means the integration/subsystem link must be fixed
before submitting. Save the identifiers from the matching catalog entry:

```bash
export RESOURCE_SERVER_ID="${RESOURCE_SERVER_ID:?Set the provider resource server id from discovery}"
export SERVICE_ID="${SERVICE_ID:?Set its canonical service name}"
export SERVICE_VERSION="${SERVICE_VERSION:?Set its discovered version}"
export SERVICE_SCOPE="${SERVICE_SCOPE:?Set one scope label declared by the test operation}"
```

### 3.4 Submit the access request and inspect pending access

```bash
jq -n --arg client "$CONSUMER_OAUTH_CLIENT_ID" --arg zone "$CONSUMER_PRIVACY_ZONE" \
  --arg server "$RESOURCE_SERVER_ID" --arg environment "$SDX_ENV" \
  --arg name "$SERVICE_ID" --arg version "$SERVICE_VERSION" --arg scope "$SERVICE_SCOPE" '{
    requester: {displayName: "Common SSO walkthrough", email: "replace-with-requester@example.gov.bc.ca"},
    clientId: $client, privacyZone: $zone, policyVersion: "SDX.R1.00",
    resourceServers: [{id: $server, environment: $environment,
      services: [{name: $name, version: $version, scopes: [$scope]}]}]
  }' > "$WORK_DIR/access-request.json"

curl --fail-with-body --silent --show-error -X POST \
  "$PARTNER_API_BASE/integrations/$INTEGRATION_ID/access-requests" \
  -H "Authorization: Bearer $PARTNER_TOKEN" -H 'Content-Type: application/json' \
  --data-binary "@$WORK_DIR/access-request.json" > "$WORK_DIR/submission.json"
jq . "$WORK_DIR/submission.json"
SUBMISSION_ID=$(jq -er '.submissionId' "$WORK_DIR/submission.json")

curl --fail-with-body --silent --show-error \
  "$PARTNER_API_BASE/integrations/$INTEGRATION_ID/allowed-services?environment=$SDX_ENV&status=pending" \
  -H "Authorization: Bearer $PARTNER_TOKEN" | jq .
```

Expected: HTTP 200 with `submissionId` and per-service outcomes, normally
`submitted approval request` for a new connection. Pending access should identify
the requested client, version and scopes. Submission success is not approval.
Before approval, the approved view should not grant the new service; depending
on stored connection state it can be an empty grant or 404 when no connections
exist. Stale catalog versions, unknown scopes and identity conflicts must be
resolved before retrying. Do not change the service/version/scopes during review.

## 4. Approval step: provider reviews in the SDX brochure UI

1. Sign into `$BROCHURE_BASE` as the provider reviewer with the subsystem's
   **Access Manager** role.
2. Open **Connection Requests** (`/connections?org=<provider-org>`), selecting the
   provider organization. A notification email links to this same page.
3. Find the request using the consumer subsystem, service and environment. Open
   **Approve / Reject** to view **Review connection request**.
4. Verify the requester, consumer identity, service/version, scopes, environment
   and policy/resource settings. Confirm these match the saved submission and
   that the request is still valid against the current provider service.
5. Select **Approve**. Confirm the connection is **active** as well as approved;
   an approved but inactive connection is not a usable grant. If it remains
   inactive, the consumer/authorized operator activates it through the documented
   connection controls before continuing.
6. Wait for provisioning to finish. Approval persistence, successful provider
   provisioning, callback delivery and usable data-plane access are separate
   checkpoints. Review the connection's provisioning status and any failed provider
   details instead of assuming an approval response means deployment is complete.

If the provider rejects the request, do not proceed to a successful access test.
A scope/version change requires resubmission and reapproval. Where automatic
provisioning is not enabled, use the operator's normal apply procedure; do not
bypass the UI decision by directly changing approval through the Partner API.

## 5. Testing step: prove the grant, callback and actual call

### 5.1 Confirm the approved grant through the Partner API

```bash
curl --fail-with-body --silent --show-error \
  "$PARTNER_API_BASE/integrations/$INTEGRATION_ID/allowed-services?environment=$SDX_ENV&status=approved" \
  -H "Authorization: Bearer $PARTNER_TOKEN" > "$WORK_DIR/approved.json"
jq . "$WORK_DIR/approved.json"

jq -e --arg integration "$INTEGRATION_ID" --arg client "$CONSUMER_OAUTH_CLIENT_ID" \
  --arg server "$RESOURCE_SERVER_ID" --arg environment "$SDX_ENV" \
  --arg service "$SERVICE_ID" --arg version "$SERVICE_VERSION" --arg scope "$SERVICE_SCOPE" '
  .integrationId == $integration and .clientId == $client and
  any(.resourceServers[]; .id == $server and .environment == $environment and
    any(.services[]; .name == $service and .version == $version and (.scopes | index($scope)) != null))
' "$WORK_DIR/approved.json"
```

Expected: the identity, environment, approved version and requested scope match.
Versions stay pinned to the reviewed version; a newer catalog publication is not
silently substituted. Record the submission/connection correlation from the UI
and callback as well; a grant can aggregate multiple service requests.

### 5.2 Confirm Common SSO received and accepted the callback

Inspect the real Common SSO receiver's request/audit record for
`PUT /requests/$INTEGRATION_ID/sdx-allowed-access`. Confirm:

- its bearer token was issued to the provisioner's authorized callback client;
- the payload has the right `integrationId`, consumer OAuth `clientId`, submission
  correlation, resource-server ID, environment, service/version and scopes;
- Common SSO returned 2xx and actually saved the grant for the correct environment;
- the provisioner reports a successful CSS dispatch, not an unconfigured-client
  skip or a failed provider result.

For a local payload-only check, `docker compose logs mocks-common-sso-api` shows
what the mock received. This is not proof of authentication at real Common SSO.

### 5.3 Make the data-plane call as the approved consumer

Have the `common-sso-client` test application obtain a **resource access token**
from Common SSO using the integration's `CONSUMER_OAUTH_CLIENT_ID` and its existing
registered grant/authentication method. The token must satisfy the deployed edge
policy. For an enabled strict R1 token-exchange setup, confirm the incoming
exchange-client audience, trusted Common SSO issuer, approved scopes and consumer
identity (`azp`) match the operator's environment configuration. Do not reuse the
APS Authz Partner API token for this request.

Use the consumer runtime group's endpoint and the published operation/path:

```bash
export CONSUMER_EDGE_BASE="${CONSUMER_EDGE_BASE:?Use the consumer runtime endpoint}"
export DATA_PLANE_TOKEN="${DATA_PLANE_TOKEN:?Obtain the Common SSO consumer resource token}"
export SERVICE_OPERATION_PATH="/ping"  # Replace with the registered test operation.

curl --fail-with-body --silent --show-error \
  "$CONSUMER_EDGE_BASE/sdx/0/$SERVICE_ID$SERVICE_OPERATION_PATH" \
  -H "X-Client-Id: $CONSUMER_CLIENT_ID" \
  -H "Authorization: Bearer $DATA_PLANE_TOKEN"
```

Expected: the upstream's documented successful status/body (for `/ping`, normally
HTTP 200). Confirm the request traversed the consumer and provider SDX routes and
reached the intended upstream; calling the upstream URL directly proves nothing
about SDX access. Adapt the request to the deployed route's path/strip behavior,
method, body, and any required caller-side signing or mTLS configuration. Do not
use certificate-verification bypasses to make the test pass.

Run a negative control with an unapproved consumer or token missing the required
**data-plane** grant and verify rejection under the deployed policy. Distinguish
that from a missing/invalid **Partner API** token, which must return 401. A happy
HTTP 200 alone does not prove per-operation scope enforcement; verify the actual
runtime controls and negative result before claiming that security property.

### Completion record

Record the environment, provider/consumer subsystem IDs, service/version/scope,
submission/connection IDs, provider review, provisioning result, accepted callback
and successful/negative data-plane results. Exclude secrets and token values.
A mock callback or isolated contract-suite pass does not replace this deployed
end-to-end verification.

## Troubleshooting checkpoints

| Symptom | Check |
| --- | --- |
| Partner 401 | APS Authz issuer, audience mapper, token expiry and JWKS; use the correct incoming client |
| Partner 403 | An environment may still have a nonempty required scope; the agreed setup uses an empty scope |
| Integration is unregistered | Integration ID exists in Common SSO and is linked to the consumer subsystem |
| No matching resource server | SDX environment, provider publication and canonical IDs |
| Submission 400 / 409 | Exact catalog version/scopes, provider identity and one-to-one integration/client mapping |
| Missing/deleted catalog service gives 502 | SDX upstream client maps non-2xx responses to 502; inspect the underlying catalog error |
| Approve/Reject control absent | Provider organization selection and reviewer subsystem Access Manager membership |
| Approved but no callback | Active flag, provisioning status, CSS_* credentials/key/permissions and receiver path |
| Callback accepted but service call fails | Consumer OAuth token, edge policy/keys, routing, activation and provider upstream reachability |
| Local SDX tests fail broadly with 500 | Provisioner health; mandatory partner startup configuration must exist in Compose as well as Helm |

## Implementation references

- [Partner operations](../provisioner-api/src/routes/integrationAccess.ts)
- [Resource-server discovery](../provisioner-api/src/routes/resource-servers.ts)
- [Access request and grant validation](../provisioner-api/src/services/integration-access-service.ts)
- [Callback client](../provisioner-api/src/services/common-sso-service.ts)
- [Consumer routing](../provisioner-api/src/services/gateway-patterns/sdx-p2p-consumer.ts)
- [Provisioner configuration and limitations](../provisioner-api/README.md)
