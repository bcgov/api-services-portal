# General Upstream API

## Building

### AI Prompt

- only look for files in current directory
- all code must be in a single `main.ts` typescript file
- use Deno
- no database
- use `jsr:@std/yaml` for yaml handling
- do not use any environment variables
- serve on port 2025

### Requirements

- create a `/ping` api endpoint that returns the current date in ISO-8601 format in a structure like:
  `{ "currentTime": "2026-06-22T10:37:00.000Z"}`

## Running

```sh
docker run -ti --rm -p 2025:2025 --name upstream-mock-api \
  -v `pwd`/main.ts:/app/main.ts \
  denoland/deno:2.7.12 \
  --allow-net=:2025,deno.land --allow-read --allow-write /app/main.ts

```

## Calling API

```sh
curl -v http://localhost:2020/ping
```
