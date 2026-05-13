# Step Token API Mock

## Building

### AI Prompt

- only look for files in current directory
- all code must be in a single `main.ts` typescript file
- use Deno
- use sqlite database
- use `jsr:@std/yaml` for yaml handling
- create database if it does not exist
- do not use any environment variables
- serve on port 8000
- put database at `./data/sqlite.db`
- use the `draft-openapi.yaml` OpenAPI spec for details about the operations and the entity
- build the API rest endpoints, and the corresponding interaction with the database
- only look at the files: openapi.yaml and main.ts (if it exists)

## Running

```sh
docker run -ti --rm -p 2020:2020 --name step-token-api-mock \
  -v `pwd`/main.ts:/app/main.ts \
  denoland/deno:2.7.12 \
  --allow-net=:2020,deno.land --allow-read --allow-write /app/main.ts

```

## Calling API

```sh
curl -v http://localhost:2020/token \
  -d '{"subject": "abc.servers.sdx", "san": ["abc.servers.sdx", "10.10.10.10"]}'
```
