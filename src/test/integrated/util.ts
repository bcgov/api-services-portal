import YAML from 'js-yaml';

export function o(s: any) {
  console.log(YAML.dump(s, { indent: 2 }));
}
