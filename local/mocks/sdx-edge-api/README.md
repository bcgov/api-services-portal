# SDX Edge API Mock

## Building

### AI Prompt

- only look for files in current directory
- all code must be in a single `main.ts` typescript file
- use Deno
- use `jsr:@std/yaml` for yaml handling
- do not use any environment variables
- serve on port 8000
- only look at `main.ts`

### Requirements

- create an API endpoint `/edge/{name}/csr` that takes the following payload and returns a `/text/plain` with a generated CSR:

```json
{
  "country": "CA",
  "org_name": "Ministry of Citizens Services",
  "serial_number": "LAB/MIN/PZGW",
  "common_name": "CITZ",
  "SAN": ["lab-min-citz.pz", "gw.servers.sdx"],
  "requester_name": "unknown",
  "requester_email": "unknown"
}
```

The output CSR would have the values:

- Common Name: CITZ
- Subject Alternative Names: lab-min-citz.pz, gw.servers.sdx
- Organization: Ministry of Citizens Services/serialNumber=LAB/MIN/PZGW
- Country: CA

## Running

```sh
docker run -ti --rm -p 2021:8000 --name sdx-edge-mock \
  -v `pwd`/main.ts:/app/main.ts \
  denoland/deno:2.7.12 \
  --allow-net=:8000,deno.land --allow-read --allow-write --allow-env=DENO_TRACE_PERMISSIONS /app/main.ts

```

## Calling API

```sh
curl -v http://localhost:2021/edge/edge123/csr \
  -d '{"subject": "123"}'
```
