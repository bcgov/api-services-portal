# Common SSO Service (CSS) Mock

## Building

### AI Prompt

- only look for files in current directory
- all code must be in a single `main.ts` typescript file
- use Deno
- no database
- use `jsr:@std/yaml` for yaml handling
- do not use any environment variables
- serve on port 2026

### Requirements

- create an API endpoint `PUT /requests/{integrationId}/sdx-allowed-services` that:
  - accepts a JSON body (the `IntegrationAccessRequest` sent by the
    provisioner's `CommonSsoService.provisionAllowedServices`)
  - logs the path and payload as YAML to stdout
  - returns `200` with `{ "integrationId": "<integrationId>", "status": "accepted" }`

## Running

```sh
docker run -ti --rm -p 2026:2026 --name common-sso-mock \
  -v `pwd`/main.ts:/app/main.ts \
  denoland/deno:2.7.12 \
  --allow-net=:2026,deno.land --allow-read --allow-write /app/main.ts
```

## Calling API

```sh
curl -v -X PUT http://localhost:2026/requests/int-123/sdx-allowed-services \
  -H 'content-type: application/json' \
  -d '{"integrationId":"int-123","submissionId":"sub-1","clientId":"client-a","resourceServers":[]}'
```
