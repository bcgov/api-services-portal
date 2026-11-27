// Plugin config from Kong can hold secrets, which must be masked before the
// config is sent to the Portal (where it is stored and shown in reports).
//
// The config is walked at any depth and masked by:
// - field name: fields whose name marks them as a secret (passwords, secrets,
//   keys, tokens, credentials). This covers every field that Kong 3.9 flags as
//   `encrypted` or `referenceable` in its bundled plugin schemas, the Redis
//   connection details (password, username and host), and the secret fields of
//   the BC Gov plugins (e.g. oidc client_secret, pep auth_header_value).
//   Booleans and numbers are never masked, and unset (null) values stay null.
// - header and parameter values: `Name:value` entries in transformer lists
//   (request-transformer, response-signer, ...) and `{ Name: value }` header
//   maps (http-log, opentelemetry) whose name marks them as a credential.
// - value content, in any string (including pre-function and post-function
//   code): private key blocks, JWTs, AWS access key IDs, credentials in URLs,
//   secret-named assignments (`api_key = "..."`, `"client_secret":"..."`,
//   `ngx.header["X-Api-Key"] = "..."`, `Password=...;`), header values set
//   in code (`set_header("X-Api-Key", "...")`) and Authorization values
//   (Bearer, Basic, Token, Splunk). A secret held under a name that does not
//   look secret (e.g. `local partner = "..."`) is not found.
//
// Kong vault references (`{vault://...}`) are not secrets and stay visible.

const MASK = '****';

// Kong `encrypted` fields that the name patterns below do not cover
const secretFields = [
  'account_email',
  'aws_assume_role_arn',
  'clientid',
  'eab_kid',
  'gcp_service_account_json',
  'key_alt',
  'redis_host',
];

const secretFieldPatterns = [
  /passw(or)?d/, // password, redis_password, sentinel_password, passwd
  /passphrase|pwd|(^|_)pass$/,
  /secret/, // client_secret, session_secret, aws_secret, secret_v1
  /credential/,
  /api_?key/, // apikey, api_key
  /(^|_)token$/, // token (vault, consul), auth_token, access_token
  /(^|_)username$/, // username, redis_username, sentinel_username
  /(^|_)priv(ate)?_key$/, // private_key, ssl_client_priv_key
  /(^|_)(aws_access_key_id|access_key|aws_key)$/,
  /(^|_)(hmac|provision|signing)_key$/, // eab_hmac_key, provision_key
  /^key$/, // loggly key
  /(^|_)(header|param|authorization)_value$/, // auth.header_value, pep
];

function isSecretField(key, parentKey) {
  const name = key.toLowerCase();
  return (
    // the host of a redis connection, e.g. config.redis.host; other `host`
    // fields (loggly, syslog, acme vault storage) are not secret
    (parentKey === 'redis' && name === 'host') ||
    secretFields.includes(name) ||
    secretFieldPatterns.some((pattern) => pattern.test(name))
  );
}

// header, query string, body parameter and assignment names that carry
// credentials
function isSecretName(name) {
  const compact = name.toLowerCase().replace(/[-_.\s]/g, '');
  return (
    [
      'authorization',
      'proxyauthorization',
      'cookie',
      'setcookie',
      'pass',
      'sig',
    ].includes(compact) ||
    /apikey|token|secret|passw(or)?d|passphrase|pwd|credential|signature/.test(
      compact
    ) ||
    compact.startsWith('xauth') ||
    compact.endsWith('auth') ||
    compact.endsWith('key')
  );
}

function isVaultReference(value) {
  return (
    typeof value === 'string' && /^\{vault:\/\/[^{}]+\}$/.test(value.trim())
  );
}

// transformer lists of `Name:value` entries, e.g. config.add.headers
const nameValueListFields = ['headers', 'querystring', 'body', 'json'];

const privateKeyBlock =
  /-----BEGIN [A-Z0-9 ]*PRIVATE KEY( BLOCK)?-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY( BLOCK)?-----/g;
const jwt = /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g;
const awsAccessKeyId = /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g;
const urlUserInfo = /\b([a-z][a-z0-9+.-]*:\/\/)[^\s/?#@]+@/gi;
const urlQueryParam = /([?&])([^=&#\s]+)=([^&#\s]*)/g;
// "client_secret": "value", ngx.header["X-Api-Key"] = "value"
const quotedNameAssignment =
  /(["'])([^"'\s]+)\1(\]?\s*[:=]\s*)(["'])((?:\\.|(?!\4)[^\\])*)\4/g;
// set_header("X-Api-Key", "value"): the first two arguments of a call
const nameValueCallArguments =
  /(\(\s*)(["'])([^"'\n]+)\2(\s*,\s*)(["'])((?:\\.|(?!\5)[^\\])*)\5/g;
// api_key = "value", client_secret: 'value'
const quotedValueAssignment =
  /\b([A-Za-z_][\w.-]*)(\s*[:=]\s*)(["'])((?:\\.|(?!\3)[^\\])*)\3/g;
// Password=value; (connection strings)
const unquotedAssignment = /(^|[;,\s])([A-Za-z][\w.-]*)(\s*=\s*)([^;&,\s"']+)/g;
// HTTP auth schemes are case-insensitive; a WWW-Authenticate challenge
// parameter such as realm="api" is not a credential
const authScheme =
  /\b(Bearer|Basic)\s+(?!(realm|scope|error|error_description|charset)=)[A-Za-z0-9][A-Za-z0-9._~+/=-]*/gi;
const otherAuthScheme = /\b(Token|Splunk)\s+[A-Za-z0-9][A-Za-z0-9._~+/=-]*/g;

function maskIfSecret(name, value) {
  return isSecretName(name) && value !== '' && !isVaultReference(value)
    ? MASK
    : value;
}

function scrubString(value) {
  return value
    .replace(privateKeyBlock, MASK)
    .replace(jwt, MASK)
    .replace(awsAccessKeyId, MASK)
    .replace(urlUserInfo, `$1${MASK}@`)
    .replace(
      urlQueryParam,
      (match, sep, name, paramValue) =>
        `${sep}${name}=${maskIfSecret(name, paramValue)}`
    )
    .replace(
      quotedNameAssignment,
      (match, q1, name, op, q2, assigned) =>
        `${q1}${name}${q1}${op}${q2}${maskIfSecret(name, assigned)}${q2}`
    )
    .replace(
      nameValueCallArguments,
      (match, open, q1, name, comma, q2, argument) =>
        `${open}${q1}${name}${q1}${comma}${q2}${maskIfSecret(
          name,
          argument
        )}${q2}`
    )
    .replace(
      quotedValueAssignment,
      (match, name, op, q, assigned) =>
        `${name}${op}${q}${maskIfSecret(name, assigned)}${q}`
    )
    .replace(
      unquotedAssignment,
      (match, sep, name, op, assigned) =>
        `${sep}${name}${op}${maskIfSecret(name, assigned)}`
    )
    .replace(authScheme, `$1 ${MASK}`)
    .replace(otherAuthScheme, `$1 ${MASK}`);
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

// path is the list of keys from config down to node, e.g. ['config', 'add']
function maskNode(node, path) {
  const parentKey = path[path.length - 1];
  if (Array.isArray(node)) {
    // `rename` lists hold `old:new` header or parameter names, not values
    const isNameValueList =
      nameValueListFields.includes(parentKey) && !path.includes('rename');
    node.forEach((element, index) => {
      if (typeof element === 'string') {
        const entry = isNameValueList ? maskNameValueEntry(element) : element;
        node[index] = scrubString(entry);
      } else {
        maskNode(element, path);
      }
    });
  } else if (isPlainObject(node)) {
    Object.keys(node).forEach((key) => {
      const value = node[key];
      if (isSecretField(key, parentKey) && isMaskable(value)) {
        node[key] = MASK;
      } else if (key === 'headers' && isPlainObject(value)) {
        Object.keys(value)
          .filter((name) => isSecretName(name) && isMaskable(value[name]))
          .forEach((name) => {
            value[name] = MASK;
          });
        maskNode(value, [...path, key]);
      } else if (typeof value === 'string') {
        node[key] = scrubString(value);
      } else {
        maskNode(value, [...path, key]);
      }
    });
  }
  return node;
}

const mask = function (plugin) {
  if (isPlainObject(plugin['config'])) {
    maskNode(plugin['config'], ['config']);
  }
  return plugin;
};

module.exports = mask;
