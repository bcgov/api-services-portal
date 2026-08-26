import * as yaml from 'jsr:@std/yaml';

const PORT = 2026;

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const match = url.pathname.match(
    /^\/requests\/([^/]+)\/sdx-allowed-services$/
  );

  if (match && req.method === 'PUT') {
    const integrationId = decodeURIComponent(match[1]);
    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return new Response('Invalid JSON payload', { status: 400 });
    }

    console.log(
      yaml.stringify({
        request: `PUT /requests/${integrationId}/sdx-allowed-services`,
        payload,
      })
    );

    return new Response(
      JSON.stringify({ integrationId, status: 'accepted' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response('Not Found', { status: 404 });
}

Deno.serve({ port: PORT }, handler);
