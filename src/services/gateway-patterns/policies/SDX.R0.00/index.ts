import { readFileSync } from 'fs';
import { join } from 'path';

const readRelativeFile = (relativePath: string) => {
  return readFileSync(join(__dirname, relativePath), 'utf8');
};

const schema = readRelativeFile('./schema.cedarschema');

const rawPolicies = [
  'connection.cedar',
  'consumer.cedar',
  'provider.cedar',
  'environment.cedar',
].map((file) => {
  const content = readRelativeFile(`./${file}`);
  // split on permit | forbid
  const parts = content.match(/(permit|forbid)\s*\([^)]*\)\s*[\s\S]*?;/g) ?? [];
  return { name: file, parts };
});

// flatten using pre es2019
const policies: Record<string, string> = {};
rawPolicies.forEach((p) => {
  p.parts.forEach((part, index) => {
    policies[`${p.name}:${index}`] = part;
  });
});

export const SDXPolicy = {
  id: 'SDX.R0.00',
  schema,
  policies,
};
