// Masks secrets in Kong plugin config before the feeder sends it to the
// Portal, where it is stored and shown in reports.
//
// What counts as a secret is defined as data in masking/rules.json, and the
// expected behaviour in masking/cases.json, so another engine (e.g. gwa-api,
// in Python) can apply the same rules and run the same cases. See
// masking/README.md.
//
// The config is walked at any depth:
// - a field whose name marks it as a secret is masked (`secretFields`);
//   booleans, numbers, unset (null) values and Kong vault references are not;
// - `Name:value` entries in transformer lists (`nameValueLists`) and
//   `{ Name: value }` header maps (`headerMaps`) are masked when the name marks
//   them as a credential (`secretNames`);
// - every other string, including pre-function and post-function code, is
//   scrubbed by the text rules (`textRules`).

const rules = require('./masking/rules.json');

const MASK = rules.mask;

const vaultReference = new RegExp(rules.vaultReference);
const secretFieldPatterns = rules.secretFields.patterns.map(
  (pattern) => new RegExp(pattern)
);
const textRules = rules.textRules.map((rule) => ({
  ...rule,
  regex: new RegExp(rule.pattern, rule.ignoreCase ? 'gi' : 'g'),
  // matching the pattern or an empty string against '' gives an array of the
  // whole match plus one entry per capturing group
  groupCount: new RegExp(`${rule.pattern}|`).exec('').length - 1,
}));

function isSecretField(key, parentKey) {
  const name = key.toLowerCase();
  return (
    (rules.secretFields.byParent[parentKey] || []).includes(name) ||
    rules.secretFields.names.includes(name) ||
    secretFieldPatterns.some((pattern) => pattern.test(name))
  );
}

// header, query string, body parameter and assignment names that carry
// credentials
function isSecretName(name) {
  const compact = name.toLowerCase().replace(/[-_.\s]/g, '');
  const { names, contains, prefixes, suffixes } = rules.secretNames;
  return (
    names.includes(compact) ||
    contains.some((part) => compact.includes(part)) ||
    prefixes.some((prefix) => compact.startsWith(prefix)) ||
    suffixes.some((suffix) => compact.endsWith(suffix))
  );
}

function isVaultReference(value) {
  return typeof value === 'string' && vaultReference.test(value.trim());
}

function maskIfSecret(name, value) {
  return isSecretName(name) && value !== '' && !isVaultReference(value)
    ? MASK
    : value;
}

// `match` rules replace the whole match. For the other rules the capturing
// groups together make up the whole match, so the match is rebuilt from its
// groups with one group masked.
function applyTextRule(text, rule) {
  return text.replace(rule.regex, (match, ...args) => {
    if (rule.mask === 'match') {
      return MASK;
    }
    const parts = args.slice(0, rule.groupCount).map((part) => part ?? '');
    parts[rule.group - 1] =
      rule.mask === 'group'
        ? MASK
        : maskIfSecret(parts[rule.nameGroup - 1], parts[rule.group - 1]);
    return parts.join('');
  });
}

function scrubText(text) {
  return textRules.reduce(applyTextRule, text);
}

function maskNameValueEntry(entry) {
  const separator = entry.indexOf(':');
  if (separator <= 0) {
    return entry;
  }
  const name = entry.substring(0, separator);
  const value = entry.substring(separator + 1);
  return maskIfSecret(name.trim(), value.trim()) === MASK
    ? `${name}:${MASK}`
    : entry;
}

function isMaskable(value) {
  return (
    value !== null &&
    value !== undefined &&
    typeof value !== 'boolean' &&
    typeof value !== 'number' &&
    !isVaultReference(value)
  );
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Masks a plugin config in place and returns it. path is the list of keys
// from the config down to node, e.g. ['config', 'add'].
function maskConfig(node, path = ['config']) {
  const parentKey = path[path.length - 1];
  if (Array.isArray(node)) {
    const isNameValueList =
      rules.nameValueLists.fields.includes(parentKey) &&
      !rules.nameValueLists.except.some((key) => path.includes(key));
    node.forEach((element, index) => {
      if (typeof element === 'string') {
        const entry = isNameValueList ? maskNameValueEntry(element) : element;
        node[index] = scrubText(entry);
      } else {
        maskConfig(element, path);
      }
    });
  } else if (isPlainObject(node)) {
    Object.keys(node).forEach((key) => {
      const value = node[key];
      if (isSecretField(key, parentKey) && isMaskable(value)) {
        node[key] = MASK;
      } else if (rules.headerMaps.includes(key) && isPlainObject(value)) {
        Object.keys(value)
          .filter((name) => isSecretName(name) && isMaskable(value[name]))
          .forEach((name) => {
            value[name] = MASK;
          });
        maskConfig(value, [...path, key]);
      } else if (typeof value === 'string') {
        node[key] = scrubText(value);
      } else {
        maskConfig(value, [...path, key]);
      }
    });
  }
  return node;
}

// Masks the plugin's config in place and returns the plugin.
const mask = function (plugin) {
  if (isPlainObject(plugin['config'])) {
    maskConfig(plugin['config']);
  }
  return plugin;
};

module.exports = mask;
module.exports.maskConfig = maskConfig;
module.exports.scrubText = scrubText;
module.exports.isSecretField = isSecretField;
module.exports.isSecretName = isSecretName;
