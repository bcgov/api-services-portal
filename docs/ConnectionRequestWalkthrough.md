# Recreate an SDX Connection Request Locally

This runbook recreates a complete local SDX connection request scenario in `api-services-portal`.

It follows the same setup pattern used by the Cypress helper `buildOrgGatewayDatasetAndProduct()` and then manually calls the SDX connection request API.

The end result is an approved connection request for:

- Organization: `ministry-of-kittens-P001`
- Org unit: `division-of-toys-P001`
- Dataset: `org-dataset-P001`
- Gateway: created dynamically
- Subsystem: `SUBSYS-P001`
- Client ID: `LAB.MIN.P001.SUBSYS-P001`
- Service ID: `LAB.MIN.P001.TOYS.v1`

---

## Prerequisites

Before starting, make sure the following are true:

- You have `api-services-portal` checked out locally at `~/dev/api-services-portal`.
- You have `gwa-api` checked out locally at `~/dev/gwa-api`.
- Your `api-services-portal` checkout is already on the branch you want to test.
- Your branch includes the APS-4506 connection request changes.
- You have Docker available locally.
- You have `gwa` installed locally.
- You can sign in as the local test user `janis`.

---

## Start the local stack

### 1. Build the local `gwa-api:e2e` image

`api-services-portal` expects a local Docker image named `gwa-api:e2e`.

```bash
cd ~/dev/gwa-api/microservices/gatewayApi
docker build -t gwa-api:e2e .
```

Expected output:

```text
naming to docker.io/library/gwa-api:e2e
```

---

### 2. Start the Docker Compose stack

This starts the local portal, Keycloak, OAuth2 Proxy, Redis, Kong, Postgres, feeder, and `gwa-api`.

```bash
cd ~/dev/api-services-portal
docker compose up -d
```

Expected output should show containers starting successfully, similar to:

```text
Container kong-db        Healthy
Container keycloak       Started
Container apsportal      Started
Container oauth2-proxy   Started
Container gwa-api        Started
```

---

### 3. Check that the main containers are running

This confirms the local services started correctly.

```bash
docker compose ps
```

The important services should be `Up`:

```text
apsportal       Up
keycloak        Up ... (healthy)
oauth2-proxy    Up
redis-master    Up
kong-db         Up ... (healthy)
gwa-api         Up
```

---

### 4. Check OAuth2 Proxy logs if it is restarting

Only run this step if `oauth2-proxy` is restarting.

```bash
docker compose logs --tail=100 oauth2-proxy
```

If the logs show Keycloak connection errors, wait until Keycloak is healthy before continuing.

---

### 5. Recheck Keycloak, OAuth2 Proxy, and Redis

Run this after waiting for Keycloak if OAuth2 Proxy was restarting.

```bash
docker compose ps keycloak oauth2-proxy redis
```

Expected output should show each service as `Up`:

```text
keycloak       Up ... (healthy)
oauth2-proxy   Up
redis-master   Up
```

---

### 6. Rebuild the portal container after pulling source changes

Changing source code does not update code already baked into the `apsportal:latest` Docker image.

```bash
cd ~/dev/api-services-portal
docker compose up -d --build apsportal
```

Expected output should show that `apsportal` was rebuilt and restarted:

```text
Image apsportal:latest Built
Container apsportal Started
```

---

### 7. Confirm the rebuilt portal container is running

This confirms the rebuilt portal container started successfully.

```bash
docker compose ps apsportal
```

Expected output should show:

```text
apsportal   apsportal:latest   "npm run start"   Up
```

---

### 8. Configure the `gwa` host

This points `gwa` at the local API Services Portal stack.

```bash
gwa config set host oauth2proxy.localtest.me:4180
```

Expected output:

```text
√ Config settings saved
```

---

### 9. Configure the `gwa` scheme

This tells `gwa` to use HTTP for the local stack.

```bash
gwa config set scheme http
```

Expected output:

```text
√ Config settings saved
```

---

### 10. Confirm the `gwa` host

This confirms `gwa` is pointing at the local stack.

```bash
gwa config get host
```

Expected output:

```text
oauth2proxy.localtest.me:4180
```

Some `gwa` versions may not support `gwa config get scheme`, even though `gwa config set scheme http` works.

---

### 11. Confirm the portal is reachable in the browser

This verifies that OAuth2 Proxy, Keycloak, and the portal are working together.

Open:

```text
http://oauth2proxy.localtest.me:4180
```

Sign in as the local test user, for example `janis`.

Expected result: you should be able to sign in and see the portal navigation, including:

```text
API Directory
My Access
Applications
Gateways
```

---

## Recreate the SDX connection request

### 1. Log in with `gwa`

All API calls in this runbook use a bearer token from the local `gwa` login flow.

```bash
gwa login
```

Expected output should include a device login URL and code:

```text
To complete the login process, please follow these steps:
1. Open this URL in your web browser: http://keycloak.localtest.me:9081/auth/realms/master/device
2. Enter this code when prompted: XXXX-XXXX
3. Complete the IDIR authentication process in your browser
4. Return to this terminal window after successful authentication

Waiting for you to complete the login process...
√ Successfully logged in
```

---

### 2. Capture the local bearer token

This reads the token written by `gwa login` and stores it in `API_KEY` for later `curl` commands.

```bash
API_KEY="$(python3 - <<'PY'
import yaml
from pathlib import Path

data = yaml.safe_load((Path.home() / ".gwa-config.yaml").read_text()) or {}
print(data["api_key"])
PY
)"
```

No output is expected.

---

### 3. Set the dataset ID used by the rest of the commands

The SDX identifiers are derived from this value. Using `P001` produces the expected client ID `LAB.MIN.P001.SUBSYS-P001` and service ID `LAB.MIN.P001.TOYS.v1`.

```bash
DATASET_ID="P001"
```

No output is expected.

---

### 4. Create an SDX-ready organization and org unit

The SDX OAS service upload validates organization metadata. The organization must have both of these tags:

- `member_class:MIN`
- `member_id:P001`

Without these tags, uploading the OAS service fails with `Incomplete organization details` and `member information not found`.

```bash
curl -i \
  -X PUT \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\":\"ministry-of-kittens-${DATASET_ID}\",
    \"title\":\"Some good title about kittens\",
    \"description\":\"Some good description about kittens\",
    \"tags\":[\"member_class:MIN\",\"member_id:${DATASET_ID}\"],
    \"orgUnits\":[
      {
        \"name\":\"division-of-toys-${DATASET_ID}\",
        \"title\":\"Division of fun toys to play\",
        \"description\":\"Some good description about how we manage our toys\",
        \"tags\":[],
        \"extForeignKey\":\"division-of-toys-${DATASET_ID}\",
        \"extSource\":\"internal\",
        \"extRecordHash\":\"\"
      }
    ],
    \"extSource\":\"internal\",
    \"extRecordHash\":\"\"
  }" \
  http://oauth2proxy.localtest.me:4180/ds/api/v3/organizations/ca.bc.gov
```

Expected output for a successful create:

```json
{"status":200,"result":"created","id":"2","childResults":[]}
```

If you rerun the command, the result may be `updated` instead of `created`.

---

### 5. Give Janis admin/system-owner access to the organization

The connection request endpoints require `System.Manage` on the target organization. The `system-owner` role grants that permission.

```bash
curl -i \
  -X PUT \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\":\"ministry-of-kittens-${DATASET_ID}\",
    \"parent\":\"/ca.bc.gov\",
    \"members\":[
      {
        \"member\":{\"email\":\"janis@testmail.com\"},
        \"roles\":[\"organization-admin\",\"system-owner\"]
      }
    ]
  }" \
  http://oauth2proxy.localtest.me:4180/ds/api/v3/organizations/ca.bc.gov/access
```

Expected output:

```text
HTTP/1.1 204 No Content
```

No JSON response body is expected.

---

### 6. Give Janis admin access to the org unit

This mirrors the Cypress setup and ensures Janis has permission to operate within the org unit.

```bash
curl -i \
  -X PUT \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\":\"division-of-toys-${DATASET_ID}\",
    \"parent\":\"/ca.bc.gov/ministry-of-kittens-${DATASET_ID}\",
    \"members\":[
      {
        \"member\":{\"email\":\"janis@testmail.com\"},
        \"roles\":[\"organization-admin\"]
      }
    ]
  }" \
  http://oauth2proxy.localtest.me:4180/ds/api/v3/organizations/ca.bc.gov/access
```

Expected output:

```text
HTTP/1.1 204 No Content
```

No JSON response body is expected.

---

### 7. Create the dataset

The product created later needs a dataset to reference.

```bash
curl -i \
  -X PUT \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\":\"org-dataset-${DATASET_ID}\",
    \"license_title\":\"Open Government Licence - British Columbia\",
    \"security_class\":\"PUBLIC\",
    \"view_audience\":\"Public\",
    \"download_audience\":\"Public\",
    \"record_publish_date\":\"2017-09-05\",
    \"notes\":\"Some notes\",
    \"title\":\"A title about my dataset\",
    \"tags\":[\"tag1\",\"tag2\"],
    \"organization\":\"ministry-of-kittens-${DATASET_ID}\",
    \"organizationUnit\":\"division-of-toys-${DATASET_ID}\"
  }" \
  "http://oauth2proxy.localtest.me:4180/ds/api/v3/organizations/ministry-of-kittens-${DATASET_ID}/datasets"
```

Expected output:

```json
{"status":200,"result":"created","id":"7","childResults":[]}
```

---

### 8. Create a gateway

This creates a new gateway and returns a generated `gatewayId`, such as `gw-bde71`.

```bash
curl -i \
  -X POST \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"displayName\":\"Gateway org-dataset-${DATASET_ID}\"}" \
  http://oauth2proxy.localtest.me:4180/ds/api/v3/gateways
```

Expected output:

```json
{"gatewayId":"gw-bde71","displayName":"Gateway org-dataset-P001"}
```

Save the returned `gatewayId`.

---

### 9. Store the gateway ID

Replace `gw-bde71` with the `gatewayId` returned in the previous step.

```bash
GATEWAY_ID="gw-bde71"
```

No output is expected.

---

### 10. Assign the gateway to the organization and org unit

This assigns the gateway to the org/org-unit pair and enables publishing for that gateway assignment.

```bash
curl -i \
  -X PUT \
  -H "Authorization: Bearer ${API_KEY}" \
  "http://oauth2proxy.localtest.me:4180/ds/api/v3/organizations/ministry-of-kittens-${DATASET_ID}/division-of-toys-${DATASET_ID}/gateways/${GATEWAY_ID}?enable=true"
```

Expected output:

```json
{"result":"namespace-assigned"}
```

---

### 11. Create the product

This creates the product under the new gateway and references the dataset created earlier.

```bash
curl -i \
  -X PUT \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\":\"my-product-on-${GATEWAY_ID}\",
    \"dataset\":\"org-dataset-${DATASET_ID}\",
    \"environments\":[
      {
        \"name\":\"dev\",
        \"active\":true,
        \"approval\":false,
        \"flow\":\"public\"
      }
    ]
  }" \
  "http://oauth2proxy.localtest.me:4180/ds/api/v3/gateways/${GATEWAY_ID}/products"
```

Expected output:

```json
{"status":200,"result":"created","id":"2","childResults":[]}
```

---

### 12. Create the subsystem

The subsystem represents the SDX client side of the connection request and later provides the `clientId`.

```bash
curl -i \
  -X PUT \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"SUBSYS-${DATASET_ID}\"}" \
  "http://oauth2proxy.localtest.me:4180/ds/api/sdx/v1/organizations/ministry-of-kittens-${DATASET_ID}/subsystems"
```

Expected output:

```json
{"status":200,"result":"created","id":"2","childResults":[]}
```

---

### 13. Upload the OAS service

This uploads the `toys.v1.yaml` OpenAPI document and creates an SDX OAS service. The service becomes the `serviceId` used in the connection request.

```bash
curl -i \
  -X PUT \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @e2e/cypress/fixtures/toys.v1.yaml \
  "http://oauth2proxy.localtest.me:4180/ds/api/sdx/v1/organizations/ministry-of-kittens-${DATASET_ID}/oas-services?subsystem=SUBSYS-${DATASET_ID}"
```

Expected output:

```json
{"status":200,"result":"created","id":"1","childResults":[],"refKey":"LAB.MIN.P001.TOYS.v1"}
```

The `refKey` is the service ID.

---

### 14. List the OAS services and confirm the client ID/service ID

The OAS services endpoint returns the created service and its associated subsystem. The subsystem contains the `clientId`; the service `name` is the `serviceId`.

```bash
curl -s \
  -H "Authorization: Bearer ${API_KEY}" \
  "http://oauth2proxy.localtest.me:4180/ds/api/sdx/v1/organizations/ministry-of-kittens-${DATASET_ID}/oas-services" \
  | jq .
```

Expected output should include these values:

```json
[
  {
    "name": "LAB.MIN.P001.TOYS.v1",
    "title": "Toys",
    "version": "1.0",
    "subsystem": {
      "name": "SUBSYS-P001",
      "clientId": "LAB.MIN.P001.SUBSYS-P001",
      "organization": {
        "name": "ministry-of-kittens-P001"
      },
      "member": {
        "memberClass": "MIN",
        "memberId": "P001"
      }
    }
  }
]
```

The important values are:

```text
clientId:  LAB.MIN.P001.SUBSYS-P001
serviceId: LAB.MIN.P001.TOYS.v1
```

---

### 15. Create the connection request

This creates a `ConnectionRequest` record linking the client subsystem to the service.

```bash
curl -i \
  -X PUT \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "LAB.MIN.P001.SUBSYS-P001",
    "serviceId": "LAB.MIN.P001.TOYS.v1"
  }' \
  "http://oauth2proxy.localtest.me:4180/ds/api/sdx/v1/organizations/ministry-of-kittens-${DATASET_ID}/connections"
```

Expected output for a new request:

```json
{"status":200,"result":"created","id":"1","childResults":[]}
```

If the same request already exists, you may see:

```json
{"status":200,"result":"no-change","id":"1","childResults":[]}
```

---

### 16. Verify the pending connection request

This confirms the connection request exists before approval.

```bash
curl -s \
  -H "Authorization: Bearer ${API_KEY}" \
  "http://oauth2proxy.localtest.me:4180/ds/api/sdx/v1/organizations/ministry-of-kittens-${DATASET_ID}/connections" \
  | jq .
```

Expected output before approval:

```json
[
  {
    "id": "1",
    "clientId": "LAB.MIN.P001.SUBSYS-P001",
    "serviceId": "LAB.MIN.P001.TOYS.v1",
    "isApproved": false,
    "isActive": true
  }
]
```

---

### 17. Approve the connection request

The same `PUT` endpoint updates the existing connection request. Setting `isApproved` to `true` approves it.

```bash
curl -i \
  -X PUT \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "LAB.MIN.P001.SUBSYS-P001",
    "serviceId": "LAB.MIN.P001.TOYS.v1",
    "isApproved": true
  }' \
  "http://oauth2proxy.localtest.me:4180/ds/api/sdx/v1/organizations/ministry-of-kittens-${DATASET_ID}/connections"
```

Expected output:

```json
{"status":200,"result":"updated","id":"1","childResults":[]}
```

---

### 18. Verify the approved connection request

This verifies that the `ConnectionRequest` record has `isApproved: true`.

```bash
curl -s \
  -H "Authorization: Bearer ${API_KEY}" \
  "http://oauth2proxy.localtest.me:4180/ds/api/sdx/v1/organizations/ministry-of-kittens-${DATASET_ID}/connections" \
  | jq .
```

Expected output after approval:

```json
[
  {
    "id": "1",
    "clientId": "LAB.MIN.P001.SUBSYS-P001",
    "serviceId": "LAB.MIN.P001.TOYS.v1",
    "isApproved": true,
    "isActive": true
  }
]
```

---

## Handling expired token authorization errors

If a request fails with this response:

```json
{"code":"invalid_token","message":"jwt expired"}
```

the bearer token in `~/.gwa-config.yaml` has expired.

### Refresh the token

Run `gwa login` again.

```bash
gwa login
```

Expected output should include a device login URL and end with:

```text
√ Successfully logged in
```

### Reload the token into your shell

Reload the fresh token into the `API_KEY` variable.

```bash
API_KEY="$(python3 - <<'PY'
import yaml
from pathlib import Path

data = yaml.safe_load((Path.home() / ".gwa-config.yaml").read_text()) or {}
print(data["api_key"])
PY
)"
```

No output is expected.

Then rerun the failed `curl` command.

---

## Handling permission errors

If a request fails with a response like:

```json
{
  "code": "permission_denied",
  "message": "Missing required scope: org/ministry-of-kittens-P001:System.Manage"
}
```

then the current user does not have the required role for that organization.

### Reapply organization access

Confirm that the organization access update succeeded.

```bash
curl -i \
  -X PUT \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\":\"ministry-of-kittens-${DATASET_ID}\",
    \"parent\":\"/ca.bc.gov\",
    \"members\":[
      {
        \"member\":{\"email\":\"janis@testmail.com\"},
        \"roles\":[\"organization-admin\",\"system-owner\"]
      }
    ]
  }" \
  http://oauth2proxy.localtest.me:4180/ds/api/v3/organizations/ca.bc.gov/access
```

Expected output:

```text
HTTP/1.1 204 No Content
```

The connection request endpoint requires `System.Manage` for the organization. The `system-owner` role gives Janis that scope.

---

## Final expected state

At the end, the local connection request should be:

```json
[
  {
    "id": "1",
    "clientId": "LAB.MIN.P001.SUBSYS-P001",
    "serviceId": "LAB.MIN.P001.TOYS.v1",
    "isApproved": true,
    "isActive": true
  }
]
```