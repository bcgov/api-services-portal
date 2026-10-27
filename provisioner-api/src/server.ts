import { buildApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
const partnerPort = Number(process.env.PARTNER_PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';

const internal = await buildApp();
const partner = await buildApp({ listener: 'partner' });

try {
  await internal.listen({ port, host });
  await partner.listen({ port: partnerPort, host });
} catch (err) {
  internal.log.error(err);
  await Promise.all([internal.close(), partner.close()]);
  process.exit(1);
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, async () => {
    await Promise.all([internal.close(), partner.close()]);
  });
}
