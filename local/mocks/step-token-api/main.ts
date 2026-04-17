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

async function generateToken(payload: any): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(secret);

  return jwt;
}

Deno.serve({ port: 2020 }, async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === '/token' && req.method === 'POST') {
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

  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
});
