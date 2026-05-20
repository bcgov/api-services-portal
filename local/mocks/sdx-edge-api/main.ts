import * as yaml from 'jsr:@std/yaml';
import * as x509 from 'npm:@peculiar/x509@1.12.3';

x509.cryptoProvider.set(globalThis.crypto);

interface CSRRequest {
  country?: string;
  org_name?: string;
  serial_number?: string;
  common_name?: string;
  san?: string;
  requester_name?: string;
  requester_email?: string;
}

function escapeDN(value: string): string {
  return value.replace(/([,+"\\<>;])/g, '\\$1');
}

function buildSubject(p: CSRRequest): string {
  const parts: string[] = [];
  if (p.common_name) parts.push(`CN=${escapeDN(p.common_name)}`);
  if (p.serial_number) parts.push(`2.5.4.5=${escapeDN(p.serial_number)}`);
  if (p.org_name) parts.push(`O=${escapeDN(p.org_name)}`);
  if (p.country) parts.push(`C=${escapeDN(p.country)}`);
  return parts.join(', ');
}

async function generateCSR(payload: CSRRequest): Promise<string> {
  const alg = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-256',
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 2048,
  };

  const keys = await crypto.subtle.generateKey(alg, false, ['sign', 'verify']);
  const extensions: x509.Extension[] = [];
  if (payload.san) {
    extensions.push(
      new x509.SubjectAlternativeNameExtension([
        { type: 'dns', value: payload.san },
      ])
    );
  }
  console.log('sub', buildSubject(payload), {
    type: 'dns',
    value: payload.san,
  });

  const csr = await x509.Pkcs10CertificateRequestGenerator.create({
    name: buildSubject(payload),
    keys,
    signingAlgorithm: alg,
    extensions,
  });

  return csr.toString('pem');
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const match = url.pathname.match(/^\/edge\/([^/]+)\/csr$/);

  if (match && req.method === 'POST') {
    const name = match[1];
    let payload: CSRRequest;
    try {
      payload = await req.json();
    } catch {
      return new Response('Invalid JSON payload', { status: 400 });
    }

    console.log(
      yaml.stringify({
        request: `POST /edge/${name}/csr`,
        payload,
      })
    );

    const csr = await generateCSR(payload);
    return new Response(JSON.stringify({ csr }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Not Found', { status: 404 });
}

Deno.serve({ port: 2021 }, handler);
