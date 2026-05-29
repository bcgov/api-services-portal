import { writeFileSync } from 'node:fs';
import { argv } from 'node:process';
import yaml from 'js-yaml';

import { buildApp } from './app.js';

const format = argv.includes('--yaml') ? 'yaml' : 'json';
const outIdx = argv.indexOf('--out');
const out = outIdx >= 0 ? argv[outIdx + 1] : undefined;

const app = await buildApp();
await app.ready();
const doc = app.swagger();
const text =
  format === 'yaml'
    ? yaml.dump(doc, { noRefs: true, lineWidth: 120 })
    : JSON.stringify(doc, null, 2) + '\n';

if (out) writeFileSync(out, text);
else process.stdout.write(text);

await app.close();
