import { parse as parseYaml, stringify as stringifyYaml } from 'jsr:@std/yaml';

const PORT = 2025;

function handler(req: Request): Response {
  const url = new URL(req.url);

  if (req.method === 'GET' && url.pathname === '/ping') {
    // return all the headers as well
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return Response.json({ currentTime: new Date().toISOString(), headers });
  }

  return new Response('Not Found', { status: 404 });
}

// Reference jsr:@std/yaml so the dependency is exercised, per the spec.
void parseYaml;
void stringifyYaml;

Deno.serve({ port: PORT }, handler);
