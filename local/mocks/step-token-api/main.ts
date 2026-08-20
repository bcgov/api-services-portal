import { DB } from 'https://deno.land/x/sqlite@v3.9.1/mod.ts';
import { SignJWT } from 'npm:jose@5.9.6';

// Initialize database
await Deno.mkdir('./data', { recursive: true });
const db = new DB('./data/sqlite.db');

db.execute(`
  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    san TEXT NOT NULL,
    token TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const secret = new TextEncoder().encode('secret-that-no-one-knows');

// Listen port, passed as the first CLI arg so a second instance of this same
// script (a second CA mock, for SP136's per-environment routing) can run on
// its own internal port rather than sharing 2020 and being distinguished
// only by the host port mapping.
const port = Number(Deno.args[0]) || 2020;

async function generateToken(payload: any): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(secret);

  return jwt;
}

Deno.serve({ port }, async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === '/tokens' && req.method === 'POST') {
    let body: { subject?: string; san?: string[] };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.subject || !Array.isArray(body.san)) {
      return new Response(
        JSON.stringify({ error: 'subject and san are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = await generateToken({ sub: body.subject, sans: body.san });

    const sanJson = JSON.stringify(body.san);

    db.query('INSERT INTO tokens (subject, san, token) VALUES (?, ?, ?)', [
      body.subject,
      sanJson,
      token,
    ]);

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (url.pathname === '/tokens' && req.method === 'GET') {
    const [count] = db.query('SELECT COUNT(*) FROM tokens')[0] as [number];

    return new Response(JSON.stringify({ count }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
});
