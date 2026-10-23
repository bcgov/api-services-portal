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

For a deployed dev environment, use this provisioner trust configuration. For
local Compose, use the local setup subsection below instead:

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

### Local Docker Compose setup (use this for the local walkthrough)

Run all commands from the `repos/api-services-portal` checkout, with Docker Compose,
Python 3, Bash, `curl` and `jq` installed. The stack must already be running. This
local path replaces the dev APS Authz registration/trust settings above; keep dev
and local credentials separate.

| Purpose | Local address / value |
| --- | --- |
| Keycloak realm / expected JWT issuer | `http://keycloak.localtest.me:9081/auth/realms/master` |
| Keycloak administration | `http://keycloak.localtest.me:9081/auth/admin/` |
| Incoming Partner API client | `common-sso-client` |
| Required audience | `sdx-partner-api` |
| Required Partner scope | None |
| Partner API base | `http://localhost:3031/v1` |
| Internal provisioner (not the Partner API) | `http://localhost:3030` |
| Brochure UI (canonical login host) | `http://sdx-ui.localtest.me:5500` |

#### A. Create the local service account and audience mapper

The following command reads the local bootstrap admin credentials from resolved
Compose configuration, authenticates to the running master realm, and creates the
client if absent. It does not print credentials. An existing client must already
have the required settings; the command stops rather than silently repurposing it.
The generated client secret is saved outside Git in a file readable only by its
owner. Re-run after recreating the Keycloak database.

```bash
export COMMON_SSO_CLIENT_FILE="${TMPDIR:-/tmp}/sdx-common-sso-client.json"
python3 - <<'PY'
import json, os, subprocess, urllib.parse, urllib.request

config = json.loads(subprocess.check_output(
    ['docker', 'compose', 'config', '--format', 'json'], text=True))
admin = config['services']['keycloak']['environment']
base = 'http://127.0.0.1:9081/auth'
form = urllib.parse.urlencode({
    'client_id': 'admin-cli', 'grant_type': 'password',
    'username': admin['KC_BOOTSTRAP_ADMIN_USERNAME'],
    'password': admin['KC_BOOTSTRAP_ADMIN_PASSWORD'],
}).encode()
with urllib.request.urlopen(urllib.request.Request(
        base + '/realms/master/protocol/openid-connect/token', data=form)) as r:
    admin_token = json.load(r)['access_token']

def request(path, body=None):
    req = urllib.request.Request(
        base + '/admin/realms/master/' + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers={'Authorization': 'Bearer ' + admin_token,
                 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        data = r.read()
        return json.loads(data) if data else None

clients = request('clients?clientId=common-sso-client')
if not clients:
    request('clients', {
        'clientId': 'common-sso-client', 'enabled': True,
        'protocol': 'openid-connect', 'publicClient': False,
        'clientAuthenticatorType': 'client-secret',
        'serviceAccountsEnabled': True, 'standardFlowEnabled': False,
        'directAccessGrantsEnabled': False,
        'protocolMappers': [{
            'name': 'sdx-partner-api-audience', 'protocol': 'openid-connect',
            'protocolMapper': 'oidc-audience-mapper', 'consentRequired': False,
            'config': {'included.custom.audience': 'sdx-partner-api',
                       'access.token.claim': 'true', 'id.token.claim': 'false'},
        }],
    })
    clients = request('clients?clientId=common-sso-client')
client = clients[0]
assert client.get('enabled') and client.get('serviceAccountsEnabled'), \
    'Existing client must be enabled with service accounts enabled'
assert not client.get('publicClient') and \
    client.get('clientAuthenticatorType') == 'client-secret', \
    'Existing client must be confidential with client-secret authentication'
assert any(m.get('protocolMapper') == 'oidc-audience-mapper' and
           m.get('config', {}).get('included.custom.audience') == 'sdx-partner-api' and
           m.get('config', {}).get('access.token.claim') == 'true'
           for m in client.get('protocolMappers', [])), \
    'Existing client needs an access-token audience mapper for sdx-partner-api'
secret = request('clients/' + client['id'] + '/client-secret')['value']
fd = os.open(os.environ['COMMON_SSO_CLIENT_FILE'],
             os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
os.fchmod(fd, 0o600)
with os.fdopen(fd, 'w') as f:
    json.dump({'client_id': 'common-sso-client', 'client_secret': secret}, f)
print('PASS: common-sso-client and audience mapper ready; secret saved locally')
PY
```

#### B. Configure and rebuild the local provisioner

Set these entries in `local/provisioner/.env.local` (replace existing entries;
do not append duplicate keys):

```dotenv
PARTNER_JWT_ISSUER=http://keycloak.localtest.me:9081/auth/realms/master
PARTNER_JWT_AUDIENCE=sdx-partner-api
PARTNER_JWT_JWKS_URL=http://keycloak.localtest.me:9081/auth/realms/master/protocol/openid-connect/certs
PARTNER_JWT_REQUIRED_SCOPE=
PARTNER_JWT_ALLOW_LOCAL_HTTP=true
```

The local HTTP option requires the accompanying implementation in
[`partner-auth.ts`](../provisioner-api/src/plugins/partner-auth.ts): it accepts only
this exact issuer/certificates URL when **both** `NODE_ENV=test` and the explicit
opt-in are set. Compose sets `NODE_ENV=test`. HTTPS remains mandatory for other
JWKS endpoints and production mode. Setting the flag against older code that
always requires HTTPS will not work; rebuild from this checkout.

```bash
docker compose build provisioner
docker compose up -d --no-deps --wait provisioner
```

Expected: the provisioner becomes **Healthy**. If not, inspect
`docker compose logs --tail=80 provisioner` before continuing. Exporting variables
in your shell alone does not replace the Compose service's `env_file` values.

#### C. Verify a real token and rejected requests

Keep the secret-file variable from step A in the same shell. This obtains a token
without printing it and saves it for the later Partner API commands:

```bash
export PARTNER_JWT_ISSUER="http://keycloak.localtest.me:9081/auth/realms/master"
export PARTNER_API_BASE="http://localhost:3031/v1"
export BROCHURE_BASE="http://sdx-ui.localtest.me:5500"
PARTNER_TOKEN=$(python3 - <<'PY'
import json, os, urllib.parse, urllib.request
with open(os.environ['COMMON_SSO_CLIENT_FILE']) as f:
    data = json.load(f)
data['grant_type'] = 'client_credentials'
req = urllib.request.Request(
    'http://127.0.0.1:9081/auth/realms/master/protocol/openid-connect/token',
    data=urllib.parse.urlencode(data).encode())
with urllib.request.urlopen(req) as r:
    print(json.load(r)['access_token'])
PY
)

curl --silent --show-error --fail-with-body \
  -w '\nHTTP %{http_code}\n' \
  "$PARTNER_API_BASE/integrations/walkthrough-check" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
curl --silent --show-error -w '\nHTTP %{http_code}\n' \
  "$PARTNER_API_BASE/integrations/walkthrough-check"
curl --silent --show-error -w '\nHTTP %{http_code}\n' \
  "$PARTNER_API_BASE/integrations/walkthrough-check" \
  -H 'Authorization: Bearer invalid.token.value'
```

Expected, in order:

1. **200**, `{"status":"unregistered"}` on a fresh stack: the token is accepted,
   but the probe integration has no subsystem mapping yet.
2. **401**, `A bearer token is required`.
3. **401**, `Invalid bearer token`.

A valid token has issuer equal to the local realm URL, audience containing
`sdx-partner-api`, and `azp: common-sso-client`. The token endpoint uses loopback
for host-side connectivity, but Keycloak issues its configured canonical issuer
`keycloak.localtest.me`; do not change the expected issuer to `127.0.0.1`.
If the authenticated request is 401, check the client mapper, runtime environment
and JWKS reachability from the provisioner container. Token expiry requires
repeating the acquisition command. Do not print or commit the token/secret file.

**Checkpoint:** all three results above were verified on the local stack. Provider
setup, consumer mapping, approval, callback delivery and data-plane testing remain
separate checkpoints. In an interactive walkthrough, pause here before creating
the provider organization.

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

For the local Compose walkthrough, the existing callback configuration is:

```dotenv
CSS_BASE_URL=http://common-sso-api.localtest.me:2026
CSS_TOKEN_URL=http://keycloak.localtest.me:9081/auth/realms/master/protocol/openid-connect/token
CSS_CLIENT_ID=sdx-provisioner
CSS_JWK_PATH=/secrets/key.json
```

The running local Keycloak was checked: `sdx-provisioner` exists, is enabled and
uses service-account `private_key_jwt` authentication. Compose mounts
`local/provisioner/key.json` at `/secrets/key.json`. This confirms the registration
and configuration, not successful callback delivery; verify receipt in step 4
and repeat the grant/callback comparison after activation in step 5.2.
Keep the incoming `common-sso-client` secret separate from this signing key.

### Platform and operator readiness

#### Local Kong and brochure image prerequisite

Apply the local build changes from [Portal PR #1591](https://github.com/bcgov/api-services-portal/pull/1591):
both `local/kong/Dockerfile` and `local/kong/sdx.Dockerfile` clone the default
`kong-oss-plugins` branch rather than the retired `feature/mtls` branch; Compose
uses `SDX_UI_TAG` default `v1.0.1`. With those changes in the checkout, run:

```bash
docker compose build kong-migrations kong-sdx-control kong-sdx-edge0
docker compose pull sdx-ui
docker compose up -d --no-deps --force-recreate \
  kong kong-sdx-control kong-sdx-edge0 sdx-ui
```

The regular `kong` service has no build context: **`kong-migrations` builds its
`kong:kong-local` image**. Building that service does not run database migrations.
Do not tear down volumes or reset the database to update these images.
If `SDX_UI_TAG` is explicitly set elsewhere, ensure it selects the intended
`v1.0.1` release; changing a default does not override an existing value.

A stale `trust-sign` plugin rejects the generated `keyset_name` field and requires
the old `keyid` field, causing GWA provisioning to fail with 400. The control and
data planes must both use the compatible plugin image before applying the
runtime signing configuration. Image rebuild/redeployment is the fix; do not
remove signing or weaken the connection policy to get past this error.


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

For **local Compose**, initialize variables progressively in the local steps below;
do not run the deployed-environment block until its required values are available.
Provider setup does not require consumer tokens, integration IDs or privacy-zone
choices yet. The local commands below set the management URLs and operator token;
the consumer stage sets its own remaining inputs.

Use `curl`, `jq`, Bash, Python 3 and Node.js 22 or newer. Obtain administrative bearer tokens through the
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

### Local Compose: obtain the provider setup operator token

For the local stack, use the existing Cypress user `janis@idir`. This account's
fixture has the APS administrator role; it is separate from `common-sso-client`.
The local `aps-portal` client supports the password grant used below. This is a
local fixture login, not a recommendation for deployed user authentication.
Read its password from `e2e/cypress.config.ts` and the client secret from the
Keycloak fixture without printing either:

```bash
export APS_API_BASE="http://localhost:4180/ds/api/v3"
export SDX_API_BASE="http://localhost:4180/ds/api/sdx/v1"
export PROVIDER_ORG="demo-provider"
export PROVIDER_SUBSYSTEM="DEMO-API"
OPERATOR_TOKEN=$(python3 - <<'PY'
import json, pathlib, re, urllib.parse, urllib.request
realm = json.loads(pathlib.Path('local/keycloak/master-realm.json').read_text())
client = next(c for c in realm['clients'] if c['clientId'] == 'aps-portal')
config = pathlib.Path('e2e/cypress.config.ts').read_text()
username = re.search(r"DEV_USERNAME:\s*'([^']+)'", config).group(1)
password = re.search(r"DEV_PASSWORD:\s*'([^']+)'", config).group(1)
form = urllib.parse.urlencode({
    'grant_type': 'password', 'client_id': client['clientId'],
    'client_secret': client['secret'], 'username': username, 'password': password,
}).encode()
req = urllib.request.Request(
    'http://127.0.0.1:9081/auth/realms/master/protocol/openid-connect/token',
    data=form)
with urllib.request.urlopen(req) as response:
    print(json.load(response)['access_token'])
PY
)
export OPERATOR_TOKEN

curl --fail-with-body --silent --show-error \
  "$APS_API_BASE/organizations" \
  -H "Authorization: Bearer $OPERATOR_TOKEN" | jq .
```

Expected: HTTP 200 and an organization array. A fresh local stack can already
contain `ministry-of-health`; it need not be completely empty. Do not overwrite
an existing organization used by another scenario. If `demo-provider` already
exists, read/verify it and skip creation; the PUT is an upsert. Repeat token
acquisition if a later request reports expiry. Fixture credentials must match
the running database; this command does not reset users or client secrets.

The provider organization administrator's `PROVIDER_TOKEN` is needed for the
subsystem stage. Organization creation alone does not establish its SDX System
Administrator membership. Complete and verify that membership at the next
checkpoint before creating a subsystem.

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

Expected: HTTP 200 and a successful batch result, for example:

```json
{"status":200,"result":"created","id":"2","childResults":[]}
```

The database ID is illustrative; use the returned value. Verify persistence with
an independent read:

```bash
curl --fail-with-body --silent --show-error \
  "$APS_API_BASE/organizations" \
  -H "Authorization: Bearer $OPERATOR_TOKEN" \
  | jq -e --arg name "$PROVIDER_ORG" '.[] | select(.name == $name)'
```

Expected: `demo-provider`, title `Demo Provider` and description
`Common SSO walkthrough provider`. Creation and read-back were verified locally.
In the interactive walkthrough, pause here before administrator membership and
subsystem setup. Ensure a System Admin can manage this organization and the future
provider reviewer will have subsystem access.

### 2.2 Assign and verify the provider administrator

For local Compose, Janis is both the operator performing onboarding and the
provider administrator. Assign **`organization-admin`** (organization membership
management) and **`system-admin`** (`System.Manage`, required for subsystem
creation). The role name is `system-admin`, not the older `system-owner` name.
The Partner API service account is not used for these administrative operations.

```bash
jq -n --arg org "$PROVIDER_ORG" '{
  name: $org, parent: "/ca.bc.gov",
  members: [{member: {email: "janis@testmail.com"},
             roles: ["organization-admin", "system-admin"]}]
}' | curl --fail-with-body --silent --show-error \
  -w '\nHTTP %{http_code}\n' -X PUT \
  "$APS_API_BASE/organizations/ca.bc.gov/access" \
  -H "Authorization: Bearer $OPERATOR_TOKEN" \
  -H 'Content-Type: application/json' --data-binary @-

curl --fail-with-body --silent --show-error \
  "$APS_API_BASE/organizations/$PROVIDER_ORG/access" \
  -H "Authorization: Bearer $OPERATOR_TOKEN" \
  | jq -e '.members[] | select(.member.email == "janis@testmail.com")
      | select((.roles | index("organization-admin")) != null
           and (.roles | index("system-admin")) != null)'

# Local walkthrough only: Janis now acts as the provider administrator.
export PROVIDER_TOKEN="$OPERATOR_TOKEN"
```

Expected: the PUT returns **204** with no body; GET returns **200** with Janis and
both roles. Before assignment, GET on this newly created organization's access
can return **403** (`org/demo-provider:GroupAccess.Manage` missing); that was
observed locally and resolved by the root-scoped membership update above.
For a shared/existing organization, inspect its membership first and preserve
unrelated members/roles. For deployed environments, assign the actual provider
administrator and obtain that user's token instead of using the local fixture.

### 2.3 Create and verify the provider subsystem

```bash
jq -n --arg name "$PROVIDER_SUBSYSTEM" '{name: $name, description: "Demo provider API"}' \
  | curl --fail-with-body --silent --show-error \
    -X PUT "$SDX_API_BASE/organizations/$PROVIDER_ORG/subsystems" \
    -H "Authorization: Bearer $PROVIDER_TOKEN" \
    -H 'Content-Type: application/json' --data-binary @-

```

Expected: HTTP 200 with `result: "created"` on first execution. Check for an
existing subsystem before rerunning the upsert; do not overwrite another test's
configuration. Independently verify the result:

```bash
curl --fail-with-body --silent --show-error \
  "$SDX_API_BASE/organizations/$PROVIDER_ORG/subsystems" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  | jq -e --arg name "$PROVIDER_SUBSYSTEM" '.[] | select(.name == $name)'
```

Verified local response (the generated gateway ID varies):

```json
{
  "name": "DEMO-API",
  "description": "Demo provider API",
  "organization": "demo-provider",
  "integrations": [],
  "gatewayId": "sdx-gw-d78aa"
}
```

A generated `gatewayId` does not establish that runtime-group hosting, keys,
service publication or provisioning is ready. In the interactive walkthrough,
pause here before gateway assignment.

### 2.4 Assign the provider gateway to a runtime group

Choose a runtime group that hosts the provider organization in the intended
SDX environment. Set `PROVIDER_RG` to that group's actual name; this is still a
required platform prerequisite, not implied by subsystem creation.

For a fresh local Compose stack, create **`rg0` in `dev`**, owned by
`demo-provider` and hosting `demo-provider`. These endpoints match the existing
SDX E2E fixture and the Compose Kong data plane. Runtime-group names must have
3–8 lowercase alphanumeric characters.

First inspect both lists:

```bash
export SDX_ENV="dev"
export PROVIDER_RG="rg0"
for filter in owned available; do
  curl --fail-with-body --silent --show-error \
    "$SDX_API_BASE/organizations/$PROVIDER_ORG/runtime-groups?filter=$filter" \
    -H "Authorization: Bearer $PROVIDER_TOKEN" | jq .
done
```

Both lists were empty in this walkthrough. If `rg0` already exists, verify its
owner/environment/endpoints before using it; do not replace a shared group's
`hostedOrganizations`. Preserve existing hosting entries when adding an
organization. The following payload is for the fresh local setup:

```bash
jq -n --arg org "$PROVIDER_ORG" --arg rg "$PROVIDER_RG" \
  --arg environment "$SDX_ENV" '{
    name: $rg, environment: $environment, hostedOrganizations: [$org],
    consumerEndpoint: "http://kong-sdx-edge0.localtest.me:9080",
    sdxEndpoint: "https://kong-sdx-edge0.localtest.me:9443"
  }' | curl --fail-with-body --silent --show-error -X PUT \
    "$SDX_API_BASE/organizations/$PROVIDER_ORG/runtime-groups" \
    -H "Authorization: Bearer $PROVIDER_TOKEN" \
    -H 'Content-Type: application/json' --data-binary @- | jq .

curl --fail-with-body --silent --show-error -X PUT \
  "$SDX_API_BASE/organizations/$PROVIDER_ORG/runtime-groups/$PROVIDER_RG/gateway" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H 'Content-Type: application/json' --data-binary '{}' | jq .

jq -n --arg org "$PROVIDER_ORG" --arg rg "$PROVIDER_RG" \
  --arg environment "$SDX_ENV" '{parameters: {
    organization: $org, runtimeGroupName: $rg, environment: $environment
  }}' | curl --fail-with-body --silent --show-error -X PUT \
    "$SDX_API_BASE/organizations/$PROVIDER_ORG/patterns/sdx-runtime-group.r1?action=apply" \
    -H "Authorization: Bearer $PROVIDER_TOKEN" \
    -H 'Content-Type: application/json' --data-binary @- | jq .
```

Expected, in order: HTTP **200**, runtime group `created`; HTTP **200**,
`gatewayId: "sdx-rg-rg0"`; HTTP **200**, `applied: 1`, `failed: 0` and a GWA
provider result `status: "applied"`. Check the result body as well as HTTP status.
Default routes include HELLO, DENY, JWKS and KMS. This does not yet establish
signing keys or provision an approved service connection.

Now assign the provider subsystem gateway:

```bash
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

For this local walkthrough, assignment returned HTTP **200** with
`gatewayId: "sdx-gw-d78aa"`. Verify the runtime group's persisted configuration,
provider hosting and canonical subsystem identity:

```bash
curl --fail-with-body --silent --show-error \
  "$SDX_API_BASE/organizations/$PROVIDER_ORG/runtime-groups?filter=owned" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  | jq -e --arg rg "$PROVIDER_RG" --arg environment "$SDX_ENV" \
      --arg org "$PROVIDER_ORG" '.[]
      | select(.name == $rg and .environment == $environment)
      | select((.hostedOrganizations | index($org)) != null)'

curl --fail-with-body --silent --show-error \
  "$SDX_API_BASE/catalog/subsystems" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  | jq -e --arg org "$PROVIDER_ORG" --arg name "$PROVIDER_SUBSYSTEM" \
      '.[] | select(.organization.name == $org and .name == $name)'

# Host header selects the actual local runtime route; localhost alone does not.
curl --fail-with-body --silent --show-error -w '\nHTTP %{http_code}\n' \
  'http://127.0.0.1:9080/hello' -H 'Host: kong-sdx-edge0.localtest.me'
```

The owned runtime record must have `name: rg0`, `environment: dev`,
`host: rg0.dev.servers.sdx`, `gatewayId: sdx-rg-rg0`, the configured endpoints and
`demo-provider` in `hostedOrganizations`. Catalog discovery returned canonical
`clientId: MIN.DEMOPROV.DEMO-API` for this provider. Save the discovered value;
do not infer it from the generated gateway ID.

Expected data-plane response, verified locally:

```json
{
  "message": "hello from the internal endpoint of a CSBC Edge Server",
  "runtimeGroup": "rg0"
}
```

HTTP **200** confirms the runtime's default route reached the local data plane.
If a newly applied route has not propagated yet, retry the same read-only check;
persistent failure requires inspecting the GWA apply result and Kong control/data
plane logs. This check does not prove TLS trust, signing keys or application
service access. Pause here in the interactive walkthrough; keys and service
publication are subsequent checkpoints.

### 2.5 Publish and verify the local runtime signing key

Compose installs the committed local-only signing certificate/private key from
`local/kong/sdx-edge-signing-cert` into the data plane. Publish its matching public
key fixture into `sdx.edge.rg0.dev`. These committed keys are for local tests only.
This step verifies the **runtime edge signing key**, not organization/subsystem
key issuance or a production certificate enrollment/rotation.

```bash
jq -n --arg org "$PROVIDER_ORG" --arg rg "$PROVIDER_RG" \
  --arg environment "$SDX_ENV" \
  --rawfile publicKey e2e/cypress/fixtures/sdx-edge-signing-public.pem '{
    parameters: {organization: $org, runtimeGroupName: $rg,
      environment: $environment, publicKeyPem: $publicKey, operation: "add"}
  }' | curl --fail-with-body --silent --show-error -X PUT \
    "$SDX_API_BASE/organizations/$PROVIDER_ORG/patterns/sdx-keys.r1?action=apply" \
    -H "Authorization: Bearer $PROVIDER_TOKEN" \
    -H 'Content-Type: application/json' --data-binary @- | jq .
```

Expected: HTTP **200**, `failed: 0`, and info/GWA results applied. The `changes`
object reports a random edge `kid` such as
`urn:ca:bc:sdx:edge:rg0:dev:8ca93e31`; use the returned value. Reapplying the same
public key with `operation: add` is idempotent and must not add a duplicate match.

Verify the public JWKS and compare it with the data plane's **mounted public
certificate** (no private key is read). This uses Node.js built-in crypto:

```bash
export WALKTHROUGH_DIR="${WALKTHROUGH_DIR:-$(mktemp -d)}"
docker compose exec -T kong-sdx-edge0 sh -c \
  'openssl x509 -in "$KONG_SIGNING_CERT" -pubkey -noout' \
  > "$WALKTHROUGH_DIR/edge-public.pem"
curl --fail-with-body --silent --show-error \
  "http://127.0.0.1:9080/keysets/sdx.edge.$PROVIDER_RG.$SDX_ENV/.well-known/jwks.json" \
  -H 'Host: kong-sdx-edge0.localtest.me' > "$WALKTHROUGH_DIR/edge-jwks.json"
node - <<'JS'
const fs = require('fs');
const crypto = require('crypto');
const directory = process.env.WALKTHROUGH_DIR;
const mounted = crypto.createPublicKey(fs.readFileSync(`${directory}/edge-public.pem`))
  .export({ format: 'der', type: 'spki' });
const jwks = JSON.parse(fs.readFileSync(`${directory}/edge-jwks.json`));
const matches = jwks.keys.filter(jwk => crypto.createPublicKey({ key: jwk, format: 'jwk' })
  .export({ format: 'der', type: 'spki' }).equals(mounted));
if (matches.length !== 1) throw new Error('Expected exactly one matching edge key');
console.log(`PASS: mounted signing certificate matches JWKS kid ${matches[0].kid}`);
JS
```

Expected: exactly one matching key. Zero matches means the wrong public key was
published or the route has not propagated; multiple matches prevent automatic
signing-key selection and must be investigated. The local fixture and mounted
certificate public-key SHA-256 fingerprint verified in this walkthrough was
`f0f0d809d371950c6b626359e359c20a8e391f327703e2075bbe8128954a3e8f`.
For additional organization/subsystem signing capabilities, follow the
[keys runbook](sdx-keys-rotation.md) with their actual key pairs; do not substitute
the edge fixture for a different identity's public key.

### 2.6 Publish a service with known version, scopes and upstream

The example uses OAuth **`authorizationCode`**, including both authorization and
token URLs. The existing catalog loader reads operation scope declarations from
that flow. No parser change or Portal rebuild is required. If an earlier upload
used another flow and discovery omitted `demo.read`, upload the corrected example
again to refresh its stored operations, then verify discovery below. This is
separate from the `client_credentials` grant used by `common-sso-client` to call
the Partner API management endpoints.

For local Compose, use the supplied
[Demo Ping OpenAPI example](examples/common-sso-provider.openapi.yaml). It declares
`GET /ping`, version `1.0.0`, and OAuth authorization-code scope `demo.read`; its
upstream is the running `mocks-upstream-api` container:

```bash
export PROVIDER_SPEC="docs/examples/common-sso-provider.openapi.yaml"
export PROVIDER_UPSTREAM="http://upstream-mock-api.localtest.me:2025"
# Confirms mock health only, not SDX access. Omit echoed headers from output.
curl --fail-with-body --silent --show-error http://localhost:2025/ping \
  | jq '{currentTime}'
```

For another environment, prepare a validated `openapi.yaml` for a read-only operation, for example
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
  -H 'Content-Type: application/octet-stream' --data-binary "@$PROVIDER_SPEC"
```

Record the **canonical** provider subsystem `clientId`, service `name`, version
and scopes returned by the catalog. Do not construct SDX IDs from display names.
Create the provider's APS Application/Product used by connection ServiceAccess.
Apply the same pattern for the consumer subsystem at its setup stage:

```bash
export PROVIDER_CLIENT_ID="MIN.DEMOPROV.DEMO-API"  # Use the catalog value verified above.
jq -n --arg client "$PROVIDER_CLIENT_ID" '{parameters: {clientId: $client}}' \
  | curl --fail-with-body --silent --show-error -X PUT \
    "$SDX_API_BASE/organizations/$PROVIDER_ORG/patterns/sdx-subsystem.r1?action=apply" \
    -H "Authorization: Bearer $PROVIDER_TOKEN" \
    -H 'Content-Type: application/json' --data-binary @- | jq .
```

Expected: `failed: 0` and an APS provider `status: applied`. This creates resource
records; it does not grant consumer access. Provider approval still comes later.



### 2.7 Verify provider publication through the Partner API

Refresh `PARTNER_TOKEN` using prerequisite C if it has expired. The provider's
service is discoverable before a consumer integration requests access:

```bash
export RESOURCE_SERVER_ID="MIN.DEMOPROV.DEMO-API"
export SERVICE_ID="DEV.MIN.DEMOPROV.DEMO-PING.v1"
export SERVICE_VERSION="1.0.0"
export SERVICE_SCOPE="demo.read"
curl --fail-with-body --silent --show-error \
  "$PARTNER_API_BASE/resource-servers?environment=$SDX_ENV" \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  | jq -e --arg server "$RESOURCE_SERVER_ID" --arg service "$SERVICE_ID" \
      --arg version "$SERVICE_VERSION" --arg scope "$SERVICE_SCOPE" '
      .[] | select(.id == $server)
      | select(any(.services[]; .name == $service and .version == $version
          and any(.scopes[]; .label == $scope)))'
```

Expected: HTTP **200** with resource server `MIN.DEMOPROV.DEMO-API`, environment
`dev`, service `DEV.MIN.DEMOPROV.DEMO-PING.v1`, version `1.0.0` and scope label
`demo.read`. These values were verified against the running Partner API using the
local `common-sso-client`. For other provider names/specs, use the actual discovery
identifiers rather than copying these local example IDs.

The initial corrected upload returned `updated` because the example had already
been published; on a fresh stack it returns `created` with `refKey` equal to the
service ID. An independent provider catalog read confirmed the operation's
`demo.read` scope. The upstream `/ping` was also reached directly **from the Kong
data-plane container**, confirming network reachability; that is not an approved
end-to-end consumer service call.

**Provider checkpoint complete:** runtime gateway, matching edge signing JWKS,
subsystem APS resources and service discovery are verified. Consumer mapping,
resource-token authorization-code login, access submission, provider approval,
callback delivery and the actual approved service call remain to be verified.
Pause here in the interactive walkthrough before creating the consumer.

## 3. Consumer steps: use the Partner API as common-sso-client

### Local Compose consumer identifiers and onboarding

Use these fixed identifiers for this walkthrough. `sdx-demo-integration` is a
**simulated Common SSO integration ID**: the local CSS mock has no request database
and accepts the callback path for any ID. No real Common SSO integration/request
is created by this procedure. For deployed Common SSO, use its actual existing
integration and registered OAuth client.

| Identifier | Local value |
| --- | --- |
| Consumer organization | `demo-consumer` |
| Member class / ID | `MIN` / `DEMOCONS` |
| Consumer subsystem | `DEMO-CONSUMER` |
| Integration ID for Partner API and callback paths | `sdx-demo-integration` |
| Consumer resource OAuth client | `sdx-demo-consumer` |
| Privacy zone | `urn:local:common-sso` (local test label) |
| Runtime group / environment | `rg0` / `dev`, owned by `demo-provider` |
| Incoming Partner API caller (unchanged) | `common-sso-client` |

Refresh `OPERATOR_TOKEN` with the provider setup command if expired. Inspect
`GET $APS_API_BASE/organizations` before creating an organization; skip creation
only if the existing record belongs to this walkthrough and matches its metadata.

```bash
export CONSUMER_ORG="demo-consumer"
export CONSUMER_SUBSYSTEM="DEMO-CONSUMER"
export INTEGRATION_ID="sdx-demo-integration"
export CONSUMER_OAUTH_CLIENT_ID="sdx-demo-consumer"
export CONSUMER_PRIVACY_ZONE="urn:local:common-sso"
export CONSUMER_RG="rg0"
export SDX_ENV="dev"

jq -n --arg org "$CONSUMER_ORG" '{
  name: $org, title: "Demo Consumer",
  description: "Common SSO walkthrough consumer",
  extSource: "custom", extRecordHash: "demo-1",
  tags: ["member_class:MIN", "member_id:DEMOCONS"], orgUnits: []
}' | curl --fail-with-body --silent --show-error -X PUT \
  "$APS_API_BASE/organizations/ca.bc.gov" \
  -H "Authorization: Bearer $OPERATOR_TOKEN" \
  -H 'Content-Type: application/json' --data-binary @- | jq .

jq -n --arg org "$CONSUMER_ORG" '{
  name: $org, parent: "/ca.bc.gov",
  members: [{member: {email: "janis@testmail.com"},
             roles: ["organization-admin", "system-admin"]}]
}' | curl --fail-with-body --silent --show-error -X PUT \
  -w '\nHTTP %{http_code}\n' \
  "$APS_API_BASE/organizations/ca.bc.gov/access" \
  -H "Authorization: Bearer $OPERATOR_TOKEN" \
  -H 'Content-Type: application/json' --data-binary @-
export CONSUMER_ADMIN_TOKEN="$OPERATOR_TOKEN"
```

Expected: organization creation **200**, result `created`; membership **204**.
This local walkthrough uses Janis for both organizations. Deployed provider and
consumer administrators use their own appropriate accounts.

Extend the existing runtime group's hosting **without losing the provider or
other hosts**. Read with the owner's provider token and preserve its endpoints.
Initialize `WORK_DIR` first if it is not already set:

```bash
WORK_DIR="${WORK_DIR:-$(mktemp -d)}"
```


```bash
curl --fail-with-body --silent --show-error \
  "$SDX_API_BASE/organizations/$PROVIDER_ORG/runtime-groups?filter=owned" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  | jq -e --arg rg "$CONSUMER_RG" --arg environment "$SDX_ENV" \
      --arg consumer "$CONSUMER_ORG" '
      .[] | select(.name == $rg and .environment == $environment)
      | {name, environment, consumerEndpoint, sdxEndpoint,
         hostedOrganizations: ((.hostedOrganizations + [$consumer]) | unique)}' \
  > "$WORK_DIR/consumer-hosting.json"
curl --fail-with-body --silent --show-error -X PUT \
  "$SDX_API_BASE/organizations/$PROVIDER_ORG/runtime-groups" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H 'Content-Type: application/json' \
  --data-binary "@$WORK_DIR/consumer-hosting.json" | jq .
```

Expected: **200**, result `updated`; owned runtime read-back contains both
`demo-provider` and `demo-consumer` in `hostedOrganizations`. Since both use the
same `rg0/dev` data plane, reuse its verified edge key rather than publishing a
second matching key. Ensure `WORK_DIR` is set (`WORK_DIR=$(mktemp -d)` if starting
a new shell); keep refreshed administrative tokens in their respective variables.

### Local authorization-code resource client

Run the supplied [local client setup helper](examples/setup-common-sso-consumer.py)
from the repository root:

```bash
python3 docs/examples/setup-common-sso-consumer.py
```

It reads the Compose bootstrap admin credentials without printing them and
creates/verifies:

- public OAuth client **`sdx-demo-consumer`**, standard authorization-code flow;
- required **PKCE S256**;
- exact redirect URI **`http://127.0.0.1:8765/callback`**;
- password and service-account grants disabled;
- optional client scope **`demo.read`** included in token scope when requested.

Expected: client settings are printed with the fields above and `demo.read` in
`optionalScopes`. An existing incompatible client stops the helper. It does not
obtain a resource token, assign SDX service access, or configure a token audience.
The later login step must run a callback listener at that exact loopback URL and
exchange the returned code using its PKCE verifier. Do not attempt a password or
client-credentials grant for this resource client. The `common-sso-client`
management account still uses client credentials to call the Partner API.


### 3.1 Create/map the consumer subsystem

The consumer organization must already be onboarded with the required runtime
hosting and keys. Its System Admin creates the subsystem and links the existing
Common SSO integration. One subsystem maps to at most one integration; do not
reuse a different integration/OAuth client for existing connections in the same
environment.

```bash
jq -n --arg name "$CONSUMER_SUBSYSTEM" --arg integration "$INTEGRATION_ID" \
  --arg zone "$CONSUMER_PRIVACY_ZONE" '{
    name: $name, description: "Common SSO walkthrough consumer", privacyZone: $zone,
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

For local Compose, create the consumer's APS Application/Product after gateway
registration, then independently read its subsystem and available runtime group:

```bash
# Use the canonical ID returned by catalog/integration discovery.
export CONSUMER_CLIENT_ID="MIN.DEMOCONS.DEMO-CONSUMER"
jq -n --arg client "$CONSUMER_CLIENT_ID" '{parameters: {clientId: $client}}' \
  | curl --fail-with-body --silent --show-error -X PUT \
    "$SDX_API_BASE/organizations/$CONSUMER_ORG/patterns/sdx-subsystem.r1?action=apply" \
    -H "Authorization: Bearer $CONSUMER_ADMIN_TOKEN" \
    -H 'Content-Type: application/json' --data-binary @- | jq .
curl --fail-with-body --silent --show-error \
  "$SDX_API_BASE/organizations/$CONSUMER_ORG/subsystems" \
  -H "Authorization: Bearer $CONSUMER_ADMIN_TOKEN" | jq .
curl --fail-with-body --silent --show-error \
  "$SDX_API_BASE/organizations/$CONSUMER_ORG/runtime-groups?filter=available" \
  -H "Authorization: Bearer $CONSUMER_ADMIN_TOKEN" | jq .
```

Expected: APS apply `failed: 0`; subsystem read-back includes
`integrationClientId: sdx-demo-integration`, `privacyZone: urn:local:common-sso`
and a generated gateway ID (locally `sdx-gw-a477f`, which varies). Available
runtime groups include `rg0/dev` owned by `demo-provider`.

### 3.2 Obtain the Partner API access token

For local Compose, repeat the token-acquisition command in prerequisite C using
`COMMON_SSO_CLIENT_FILE`. For a deployed client-secret registration, use:

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

Local registration was verified as:

```json
{
  "status": "registered",
  "id": "MIN.DEMOCONS.DEMO-CONSUMER",
  "name": "DEMO-CONSUMER",
  "organization": "demo-consumer",
  "description": "Common SSO walkthrough consumer"
}
```

**R1 behavior in this checkout:** local `environments.json` does not contain
`sdx_token_exchange_client_id`, `sdx_token_exchange_token_url` or
`sdx_trusted_issuers`. The R1 preflight helper requires those values **when called**,
but the active request evaluator in this checkout does not invoke it. Current R1
defaults include signing/verification/countersigning and provider mTLS upgrades;
they do not activate the token, ACL or token-exchange upgrades. Consequently,
these missing settings do **not** block the baseline request below. This was
verified by a successful R1 submission with the environment file unchanged.

Do not invent an exchange-client ID, reuse the provisioner's control-plane client
or create Common SSO exchange prerequisites solely to populate unused settings.
Enabling strict token exchange is separate work with the constraints in the
[provisioner README](../provisioner-api/README.md#sdx-r1-security-configuration).
A baseline service-call success must not be reported as proof of OAuth audience,
per-operation scope or token-exchange enforcement.

**Consumer setup checkpoint:** organization, hosting, subsystem mapping, APS
resources and PKCE client are ready. In the interactive walkthrough, pause here
before submitting the access request. Provider approval is a later checkpoint.

### 3.4 Submit the access request and inspect pending access

```bash
jq -n --arg client "$CONSUMER_OAUTH_CLIENT_ID" --arg zone "$CONSUMER_PRIVACY_ZONE" \
  --arg server "$RESOURCE_SERVER_ID" --arg environment "$SDX_ENV" \
  --arg name "$SERVICE_ID" --arg version "$SERVICE_VERSION" --arg scope "$SERVICE_SCOPE" '{
    requester: {displayName: "Janis — local Common SSO walkthrough", email: "janis@testmail.com"},
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

For local Compose, the verified new submission returned HTTP **200**:

```json
{
  "submissionId": "submission-1792712304705-wr04s9b8wzh",
  "results": {
    "DEV.MIN.DEMOPROV.DEMO-PING.v1": "submitted approval request"
  }
}
```

Submission IDs are generated; always use the current response. The pending view
returned the requested `sdx-demo-consumer` client, resource server
`MIN.DEMOPROV.DEMO-API`, service version `1.0.0` and scope `demo.read`.
The approved view returned **200** with `resourceServers: []`, proving no approved
grant was present. Use the local fixture requester above for this scenario;
replace it with the actual requester in a deployed workflow.

Independently read the stored connection using the consumer administrator token:

```bash
curl --fail-with-body --silent --show-error \
  "$SDX_API_BASE/organizations/$CONSUMER_ORG/connections" \
  -H "Authorization: Bearer $CONSUMER_ADMIN_TOKEN" \
  | jq -e --arg client "$CONSUMER_CLIENT_ID" --arg service "$SERVICE_ID" '
      .[] | select(.clientId == $client and .serviceId == $service)
      | {id, clientId, serviceId, environment, policyVersion, isActive, isApproved,
         requesterDetails, provisionerStatus}'
```

Expected: the mapped consumer subsystem ID, the requested provider service,
`policyVersion: SDX.R1.00`, `environment: dev`, **`isApproved: false`** and
**`isActive: false`** for this fresh local submission. Provider approval and
consumer activation are separate actions. A usable approved service grant
depends on provider approval alone. Activation controls runtime routing; it does
not filter approved allowed access or its callback payload.
Do not change `isApproved` through a management API to skip provider review.
**Pause here before approving in the provider UI.**

## 4. Approval step: provider reviews in the SDX brochure UI

### Local provider UI preparation

Use the canonical Compose UI hostname, because `OIDC_REDIRECT_URI` is configured
as `http://sdx-ui.localtest.me:5500/auth/callback`. The public home page can load
at `localhost:5500`, but starting login on a different hostname can lose the
host-scoped login/session cookie on callback.

Open this URL in the browser/right panel:

[Local provider connection review](http://sdx-ui.localtest.me:5500/connections?org=demo-provider&refresh=1)

The `refresh=1` parameter reloads the brochure catalog; use it if organizations
or services were created after the UI started. The earlier empty home page was
not evidence that the management API had no organizations. Sign in as
`janis@idir` using the existing `DEV_PASSWORD` fixture in `e2e/cypress.config.ts`.
No password reset or new user is required.

The provider role check was verified with:

```bash
curl --fail-with-body --silent --show-error \
  "$SDX_API_BASE/organizations/$PROVIDER_ORG/subsystems/$PROVIDER_SUBSYSTEM/access" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  | jq -e '.members[] | select(.member.email == "janis@testmail.com")
      | select((.roles | index("access-manager")) != null)'
```

Expected: HTTP **200**, Janis has `access-manager` (also `subsystem-owner` and
`tech-lead`). The provider connection list independently contains connection `1`
with client `MIN.DEMOCONS.DEMO-CONSUMER`, service
`DEV.MIN.DEMOPROV.DEMO-PING.v1`, version `1.0.0`, scope `demo.read` and both
approval/activation flags false. The ID varies on another stack.

At this checkpoint, if automation can open but cannot control the embedded Codex
browser, the user performs the UI login/review/Approve click. Do not substitute a
direct approval API request and claim the UI was tested. Verify the persisted
state separately after the user completes approval.


1. Sign into `$BROCHURE_BASE` as the provider reviewer with the subsystem's
   **Access Manager** role.
2. Open **Connection Requests** (`/connections?org=<provider-org>`), selecting the
   provider organization. A notification email links to this same page.
3. Find the request using the consumer subsystem, service and environment. Open
   **Approve / Reject** to view **Review connection request**.
4. Verify the requester, consumer identity, service/version, scopes, environment
   and policy/resource settings. Confirm these match the saved submission and
   that the request is still valid against the current provider service.
5. Select **Approve** and verify `isApproved: true`. Provider approval alone is
   sufficient for the service to appear in approved allowed access and the
   callback. `isActive` controls runtime routing separately; leave it unchanged
   while checking the approval grant.
6. Wait for provisioning to finish. Approval persistence, successful provider
   provisioning, callback delivery and usable data-plane access are separate
   checkpoints. Review the connection's provisioning status and any failed provider
   details instead of assuming an approval response means deployment is complete.

If the provider rejects the request, do not proceed to a successful access test.
A scope/version change requires resubmission and reapproval. Where automatic
provisioning is not enabled, use the operator's normal apply procedure; do not
bypass the UI decision by directly changing approval through the Partner API.

### Verify the provider UI approval was saved

After the provider clicks Approve, independently read the connection from the
management API. This is verification, not an alternative way to approve:

```bash
curl --fail-with-body --silent --show-error \
  "$SDX_API_BASE/organizations/$PROVIDER_ORG/connections" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  | jq -e --arg client "$CONSUMER_CLIENT_ID" --arg service "$SERVICE_ID" '
      .[] | select(.clientId == $client and .serviceId == $service)
      | select(.isApproved == true)
      | {id, clientId, serviceId, environment, policyVersion,
         isApproved, isActive, provisionerStatus}'
```

The local provider approval was completed manually in the brochure UI and then
verified through the API. Actual flags immediately afterward:

```json
{"id":"1","isApproved":true,"isActive":false,"provisionerStatus":{}}
```

The `status=approved` Partner API view must include the provider's reviewed
service/version/scopes even while `isActive: false`. The `status=pending` view
selects unapproved requests, so this approved request no longer appears there.
Activation is only needed later to enable its runtime routes, not to discover
approved access or deliver the corresponding callback.

### Step 4 checks: Partner API allowed access and Common SSO callback

Before clicking Approve in a repeat run, record a callback log boundary:

```bash
export APPROVAL_CHECK_STARTED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

After approval, refresh `PARTNER_TOKEN` using prerequisite C if necessary. It must
belong to **`common-sso-client`**, not an administrator or callback service account:

```bash
curl --fail-with-body --silent --show-error \
  "$PARTNER_API_BASE/integrations/$INTEGRATION_ID/allowed-services?environment=$SDX_ENV&status=approved" \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  > "$WORK_DIR/after-approval-access.json"
jq -e --arg integration "$INTEGRATION_ID" --arg client "$CONSUMER_OAUTH_CLIENT_ID" \
  --arg server "$RESOURCE_SERVER_ID" --arg service "$SERVICE_ID" \
  --arg version "$SERVICE_VERSION" --arg scope "$SERVICE_SCOPE" '
  .integrationId == $integration and .clientId == $client and
  any(.resourceServers[]; .id == $server and
    any(.services[]; .name == $service and .version == $version
      and (.scopes | index($scope)) != null))' \
  "$WORK_DIR/after-approval-access.json"
jq . "$WORK_DIR/after-approval-access.json"
docker compose logs --timestamps \
  --since "${APPROVAL_CHECK_STARTED:-30m}" mocks-common-sso-api
```

Expected and verified locally: HTTP **200**, with this grant despite
**`isActive: false`**:

```json
{
  "integrationId": "sdx-demo-integration",
  "submissionId": "submission-1792712304705-wr04s9b8wzh",
  "clientId": "sdx-demo-consumer",
  "resourceServers": [
    {
      "environment": "dev",
      "id": "MIN.DEMOPROV.DEMO-API",
      "services": [
        {
          "scopes": [
            "demo.read"
          ],
          "name": "DEV.MIN.DEMOPROV.DEMO-PING.v1",
          "version": "1.0.0"
        }
      ]
    }
  ]
}
```

The callback must contain the same integration, OAuth client, submission ID and
resource servers at `PUT /requests/sdx-demo-integration/sdx-allowed-access`.
Compare version `1.0.0`, environment `dev` and scope `demo.read`; a callback from
another submission or only a pre-approval timestamp is insufficient.

After fixing the approval filter in this local walkthrough, the already approved
inactive connection's existing change event was replayed, without reapproval or
activation. The CSS dispatch reported `applied`, and the mock recorded the matching
nonempty grant at **2026-10-22 16:50:53 PDT**. The API read-back still showed
`isApproved: true`, `isActive: false`. On a fresh run with the corrected code,
the normal provider approval change event supplies this callback.

If replaying an existing local inactive connection after rebuilding the
provisioner, fetch its current full connection record, preserve the requester and
pattern resources, and use the internal change-event endpoint with
`action=delete` (the same inactive-state action used by the Portal hook). Do not
activate the connection or call the approval API just to resend its callback.
The shared consumer-access pattern retains approval-based grants while runtime
connection routes remain removed. This is an operator recovery action, separate
from the Partner API client's allowed-access GET.

For this local recovery only, refresh the provider administrator token and run:

```bash
curl --fail-with-body --silent --show-error \
  "$SDX_API_BASE/organizations/$PROVIDER_ORG/connections" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  | jq -e --arg client "$CONSUMER_CLIENT_ID" --arg service "$SERVICE_ID" '
      .[] | select(.clientId == $client and .serviceId == $service)
      | select(.isApproved == true and .isActive == false)' \
  > "$WORK_DIR/approved-inactive-connection.json"
CONNECTION_ID=$(jq -er '.id' "$WORK_DIR/approved-inactive-connection.json")
jq '{clientId, serviceId, policyVersion, environment, isApproved,
     requesterDetails, clientResources, serviceResources}' \
  "$WORK_DIR/approved-inactive-connection.json" \
  | curl --fail-with-body --silent --show-error -X POST \
    "http://localhost:3030/v1/connections/$CONNECTION_ID?action=delete" \
    -H 'Content-Type: application/json' --data-binary @- | jq .
```

Expected: `failed: 0` and the CSS provider `status: applied`. Recheck the stored
flags afterward and confirm the fresh mock callback against the approved GET.
Do not use this inactive-state replay for an active connection; its normal event
action is different. This internal endpoint is not a public Partner API endpoint.

Unapproved requests still produce no approved grant. Empty replacement grants
remain valid when approval is withdrawn or no approved services remain; the
receiver must not retain stale access. Inactivity alone must **not** clear a
provider-approved grant.

The local mock logs receipt and returns 200, but does not validate bearer tokens
or persist a real Common SSO integration. Mock receipt does not establish real
callback authorization/storage. Pause after these two step 4 checks before
activation and the data-plane test.

## 5. Testing step: prove the grant, callback and actual call

### 5.0 Activate the consumer connection and verify provisioning

#### Local RSA fixture and route-prefix settings

Before activation on local Compose, explicitly match the committed RSA edge key
and preserve the provider's SDX path prefix on the consumer hop. The provider
strips that prefix before forwarding to `/ping`; the consumer must preserve it.
The general signing default is ES256, which does not match this local RSA fixture.

```bash
curl --fail-with-body --silent --show-error \
  "$SDX_API_BASE/organizations/$CONSUMER_ORG/connections" \
  -H "Authorization: Bearer $CONSUMER_ADMIN_TOKEN" \
  | jq -e --arg client "$CONSUMER_CLIENT_ID" --arg service "$SERVICE_ID" '
      .[] | select(.clientId == $client and .serviceId == $service)
      | .clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].stripPath = false
      | .clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.sign.alg = "RS256"
      | .serviceResources.gatewayPatterns["sdx-p2p-provider.r1"].upgrades.sign.alg = "RS256"
      | {clientId, serviceId, clientResources, serviceResources}' \
  > "$WORK_DIR/local-runtime-settings.json"
curl --fail-with-body --silent --show-error -X PUT \
  "$SDX_API_BASE/organizations/$CONSUMER_ORG/connections" \
  -H "Authorization: Bearer $CONSUMER_ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  --data-binary "@$WORK_DIR/local-runtime-settings.json" | jq .
```

The local Janis user administers both sides, so this update can preserve and set
both resource blocks. Use the appropriate administrators for separate real
organizations. This does not change approval, remove signing, or disable mTLS.
Expected: **200**, updated; activation/provisioning follows below.

The consumer pattern now also defaults an omitted `stripPath` to **false**.
Without that fix, Kong's strip default removed the SDX prefix and the provider
received `/ping` instead of `/sdx/0/<service>/ping`, selecting its deny route.
Regression tests cover omission and explicit overrides. Rebuild the provisioner
from this checkout if running an older image. Existing stored connection settings
are corrected by the explicit local update above.


Provider approval already made the service visible to the Partner API and callback.
Activate only when ready to enable runtime routing. Refresh the local Janis operator
token as documented above, then set `CONSUMER_ADMIN_TOKEN="$OPERATOR_TOKEN"`.
Use the **consumer organization** for activation and leave approval unchanged:

```bash
jq -n --arg client "$CONSUMER_CLIENT_ID" --arg service "$SERVICE_ID" \
  '{clientId: $client, serviceId: $service, isActive: true}' \
  | curl --fail-with-body --silent --show-error -X PUT \
    "$SDX_API_BASE/organizations/$CONSUMER_ORG/connections" \
    -H "Authorization: Bearer $CONSUMER_ADMIN_TOKEN" \
    -H 'Content-Type: application/json' --data-binary @- | jq .

for attempt in {1..30}; do
  curl --fail-with-body --silent --show-error \
    "$SDX_API_BASE/organizations/$CONSUMER_ORG/connections" \
    -H "Authorization: Bearer $CONSUMER_ADMIN_TOKEN" \
    | jq -e --arg client "$CONSUMER_CLIENT_ID" --arg service "$SERVICE_ID" \
        '.[] | select(.clientId == $client and .serviceId == $service)' \
    > "$WORK_DIR/active-connection.json"
  status=$(jq -r '.provisionerStatus.status // "pending"' "$WORK_DIR/active-connection.json")
  case "$status" in
    provisioned|failed) break ;;
  esac
  sleep 1
done
jq '{id, isApproved, isActive, provisionerStatus}' "$WORK_DIR/active-connection.json"
jq -e '.isApproved == true and .isActive == true
       and .provisionerStatus.status == "provisioned"' "$WORK_DIR/active-connection.json"
```

Expected: activation PUT **200**, result `updated`. Successful local provisioning
was verified with both flags true, status **`provisioned`**, and message
`Provisioned 6 provider batches successfully.` The stored endpoint was
`http://kong-sdx-edge0.localtest.me:9080/sdx/0/DEV.MIN.DEMOPROV.DEMO-PING.v1`.
HTTP 200 from activation or the internal evaluator alone is insufficient; inspect
`provisionerStatus` and per-provider `failed`/`skipped` counts.

#### Failures found and resolved in this walkthrough

- **Cedar rejects requesterDetails.service.version:** both R0/R1 schemas must
  declare the already-supported pinned metadata as optional `version?: String`.
  The local schema fix preserves approval enforcement and accepts older records
  without a version. Regression tests cover both policies and rejection of an
  unapproved R1 request. Do not remove the reviewed version from the request.
- **trust-sign requires keyid / rejects keyset_name:** rebuild and redeploy Kong
  using the PR #1591 steps in platform prerequisites. The live compatible schema
  accepts `keyset_name`.
- **trust-verify-signature requires allowed_jwks_uri_prefix:** the P2P patterns
  now supply the configured environment's public registry URL plus `/keysets/`.
  This restricts signature-key URLs to that registry; do not use an unrestricted
  prefix or disable signature verification.
- **mtls-acl rejects certificate_header_name:** the P2P provider pattern now uses
  `certificate_attribute: common_name`, preserving its allow-list of the consumer
  runtime group's host. The current plugin reads the verified certificate
  attribute directly rather than a caller-provided header.

After local schema/pattern fixes, rebuild and restart only the provisioner:

```bash
docker compose build provisioner
docker compose up -d --no-deps --wait provisioner
```

If activation was already saved before provisioning failed, retry the **current
active approved connection's** event without changing its approval or cycling
activation. Fetch its full current record and use the internal operator endpoint:

```bash
curl --fail-with-body --silent --show-error \
  "$SDX_API_BASE/organizations/$CONSUMER_ORG/connections" \
  -H "Authorization: Bearer $CONSUMER_ADMIN_TOKEN" \
  | jq -e --arg client "$CONSUMER_CLIENT_ID" --arg service "$SERVICE_ID" '
      .[] | select(.clientId == $client and .serviceId == $service)
      | select(.isApproved == true and .isActive == true)' \
  > "$WORK_DIR/active-connection.json"
CONNECTION_ID=$(jq -er '.id' "$WORK_DIR/active-connection.json")
jq '{clientId, serviceId, policyVersion, environment, isApproved,
     requesterDetails, clientResources, serviceResources}' \
  "$WORK_DIR/active-connection.json" \
  | curl --fail-with-body --silent --show-error -X POST \
    "http://localhost:3030/v1/connections/$CONNECTION_ID?action=apply" \
    -H 'Content-Type: application/json' --data-binary @- | jq .
```

The successful retry returned **`applied: 6`, `failed: 0`, `skipped: 0`**.
It applied the consumer/provider GWA routes, APS service access and CSS callback.
The mock logged the matching nonempty grant at **2026-10-22 17:01:30 PDT**;
`common-sso-client` independently fetched the same approved provider, service
version `1.0.0` and scope `demo.read` after activation. Approval-based access did
not change when activation changed.

**Pause here before resource-token login and the actual SDX service call.**
Successful provisioning does not establish runtime signing, mTLS or upstream
behavior for an application request; those are verified in the following steps.

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

#### Local authorization-code + PKCE login

Run the [local login helper](examples/common-sso-consumer-login.py) from the
repository root in a terminal that stays running during login:

```bash
export SDX_CONSUMER_TOKEN_FILE="${TMPDIR:-/tmp}/sdx-consumer-resource-token.json"
python3 docs/examples/common-sso-consumer-login.py
```

Open [the local consumer login](http://127.0.0.1:8765/) in the browser/right panel
and select **Sign in to local Keycloak**. Use the existing local test user
`janis@idir` and the `DEV_PASSWORD` fixture in `e2e/cypress.config.ts` if prompted.
An existing Keycloak session may complete login without another password prompt.
Do not use the `common-sso-client` service-account secret for this user login.

The helper uses client `sdx-demo-consumer`, scope `openid demo.read`, a fresh state
value and PKCE S256. It exchanges the returned code at local Keycloak, writes
only the access token and expiry/scope metadata to the restricted local file,
and shows **Consumer login completed** without exposing the code or token. It
binds only `127.0.0.1:8765` and exits after successful login or 15 minutes. If the
port is occupied, stop the earlier helper; the registered redirect URI must not
be changed just to select another port. If login times out or code exchange fails,
restart the helper and begin a fresh login.

The local token metadata should show `azp: sdx-demo-consumer`, the local master
realm issuer and scope `demo.read`. Decoding metadata alone is not signature or
runtime authorization verification. No new token audience or token-exchange
capability is established by this login.

After successful login, read the resource token into the same shell without
printing it:

```bash
DATA_PLANE_TOKEN=$(python3 - <<'PYTOKEN'
import json, os
with open(os.environ['SDX_CONSUMER_TOKEN_FILE']) as handle:
    print(json.load(handle)['access_token'])
PYTOKEN
)
export DATA_PLANE_TOKEN
```

Use the token promptly; if expired, repeat the authorization-code login. Keep
the token file outside the repository. At the interactive checkpoint, the user
completes login in the right panel and reports success before the actual service
request is made. A started helper is not a completed login or a passing service test.


Have the `common-sso-client` test application obtain a **resource access token**
from Common SSO using the integration's `CONSUMER_OAUTH_CLIENT_ID` and its existing
registered grant/authentication method. The token must satisfy the deployed edge
policy. For an enabled strict R1 token-exchange setup, confirm the incoming
exchange-client audience, trusted Common SSO issuer, approved scopes and consumer
identity (`azp`) match the operator's environment configuration. Do not reuse the
APS Authz Partner API token for this request.

For local Compose set `CONSUMER_EDGE_BASE=http://kong-sdx-edge0.localtest.me:9080`
and `SERVICE_OPERATION_PATH=/ping`. If using loopback IP or localhost instead,
also send `Host: kong-sdx-edge0.localtest.me`; the route matches the runtime host.
The mock echoes request headers, so filter output as below rather than displaying
resource tokens and signatures.

Use the consumer runtime group's endpoint and the published operation/path:

```bash
export CONSUMER_EDGE_BASE="${CONSUMER_EDGE_BASE:?Use the consumer runtime endpoint}"
export DATA_PLANE_TOKEN="${DATA_PLANE_TOKEN:?Obtain the Common SSO consumer resource token}"
export SERVICE_OPERATION_PATH="/ping"  # Replace with the registered test operation.

curl --fail-with-body --silent --show-error \
  "$CONSUMER_EDGE_BASE/sdx/0/$SERVICE_ID$SERVICE_OPERATION_PATH" \
  -H "X-Client-Id: $CONSUMER_CLIENT_ID" \
  -H "Authorization: Bearer $DATA_PLANE_TOKEN" \
  | jq '{currentTime, headers: (.headers | with_entries(select(.key == "host"
       or .key == "x-client-id" or .key == "x-service-id"
       or .key == "x-sdx-client-subsystem-id" or .key == "x-kong-request-id")))}'
```

Expected: the upstream's documented successful status/body (for `/ping`, normally
HTTP 200). Confirm the request traversed the consumer and provider SDX routes and
reached the intended upstream; calling the upstream URL directly proves nothing
about SDX access. Adapt the request to the deployed route's path/strip behavior,
method, body, and any required caller-side signing or mTLS configuration. Do not
use certificate-verification bypasses to make the test pass.

### 5.4 Verified local results and control checks

The local authorization-code login completed for `sdx-demo-consumer`. The actual
SDX request returned **200** at **2026-10-22 17:12:12 PDT**, reaching the upstream
mock through consumer and provider routes. Sanitized response evidence:

```json
{
  "currentTime": "2026-10-23T00:12:12.914Z",
  "headers": {
    "host": "upstream-mock-api.localtest.me:2025",
    "x-client-id": "MIN.DEMOCONS.DEMO-CONSUMER",
    "x-sdx-client-subsystem-id": "MIN.DEMOCONS.DEMO-CONSUMER",
    "x-service-id": "DEV.MIN.DEMOPROV.DEMO-PING.v1",
    "x-kong-request-id": "65ae710e7611733564b60a0bd5375300"
  }
}
```

Kong logged successful JWT signature verification for both the provider request
and consumer response, using the published `rg0/dev` edge key. The response
included edge-signature/countersignature metadata. Keep actual token/signature
values out of walkthrough evidence.

Run an unknown-consumer route control with the same valid token:

```bash
curl --silent --show-error -w '\nHTTP %{http_code}\n' \
  "$CONSUMER_EDGE_BASE/sdx/0/$SERVICE_ID$SERVICE_OPERATION_PATH" \
  -H 'X-Client-Id: MIN.UNKNOWN.NO-ACCESS' \
  -H "Authorization: Bearer $DATA_PLANE_TOKEN"
```

Verified: **401**, `Access Denied. Route not found.` This establishes rejection
of an unknown route selector, not token-claim enforcement.

Explicitly test whether the chosen baseline enforces a resource token; omit it
while keeping the valid subsystem route selector, and suppress echoed headers:

```bash
curl --silent --show-error -o /dev/null -w 'HTTP %{http_code}\n' \
  "$CONSUMER_EDGE_BASE/sdx/0/$SERVICE_ID$SERVICE_OPERATION_PATH" \
  -H "X-Client-Id: $CONSUMER_CLIENT_ID"
```

For this local baseline the actual tokenless request returned **200**. Therefore
the completed test proves approval propagation, callbacks, routing, upstream
reachability and edge signatures, but **does not prove resource OAuth token or
per-operation scope enforcement**. Current R1 defaults do not enable the token,
ACL or token-exchange upgrades. Do not mark a missing-token/scope rejection test
passed or describe this baseline as enforcing Common SSO resource authorization.
Activation of those controls is separate work under the existing R1 design
constraints; do not add an exchange client or weaken another control to mask it.

#### Runtime failure checkpoints

- **Missing Signature / initial 401:** inspect the request path seen at the
  provider. Preserve the SDX prefix on the consumer route; provider-side stripping
  then forwards `/ping` to the mock. Do not remove signature verification.
- **Public key format error / signature must be 64 bytes:** inspect the JWT
  header algorithm without printing the token. An RSA signature labeled ES256
  fails verification; this local fixture requires RS256 on both signing upgrades.
- **One direction still fails just after reapply:** verify both control-plane
  trust-sign configurations and allow hybrid config propagation before retrying.
  The successful run followed confirmation that both configurations were RS256.

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
| Approved but no callback | Timestamp/correlation, change-event/dispatch logs, CSS_* credentials/key/permissions and receiver path; an approved inactive connection must still return/send its approved grant |
| Callback accepted but service call fails | Consumer OAuth token, edge policy/keys, routing, activation and provider upstream reachability |
| Local SDX tests fail broadly with 500 | Provisioner health; mandatory partner startup configuration must exist in Compose as well as Helm |

## Implementation references

- [Partner operations](../provisioner-api/src/routes/integrationAccess.ts)
- [Resource-server discovery](../provisioner-api/src/routes/resource-servers.ts)
- [Access request and grant validation](../provisioner-api/src/services/integration-access-service.ts)
- [Callback client](../provisioner-api/src/services/common-sso-service.ts)
- [Consumer routing](../provisioner-api/src/services/gateway-patterns/sdx-p2p-consumer.ts)
- [Provisioner configuration and limitations](../provisioner-api/README.md)
