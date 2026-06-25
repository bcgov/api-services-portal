import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readRelativeFile = (relativePath: string) => {
  return readFileSync(join(__dirname, relativePath), 'utf8');
};

const schema = readRelativeFile('./schema.cedarschema');

const rawPolicies = ['connection.cedar'].map((file) => {
  const content = readRelativeFile(`./${file}`);
  // split on permit | forbid
  const parts = content.match(/(permit|forbid)\s*\([^)]*\)\s*[\s\S]*?;/g) ?? [];
  return { name: file, parts };
});

// flatten using pre es2019
const policies: Record<string, string> = {};
rawPolicies.forEach((p) => {
  p.parts.forEach((part, index) => {
    // get the label from the first line as a comment after the permit|forbid keyword
    const labelMatch = part.split('\n')[0].split('//')[1];
    const label = labelMatch ? labelMatch.trim() : `${index}`;
    policies[`${p.name}:${label}`] = part;
  });
});

export const SDXPolicy = {
  id: 'SDX.R0.00',
  schema,
  policies,
};
