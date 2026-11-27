# Secret masking rules

Rules for masking secrets in Kong configuration, kept as data so that more than
one engine can apply them and stay in step.

| File | What it holds |
| --- | --- |
| `rules.json` | What counts as a secret: field names, header and parameter names, and text patterns. |
| `cases.json` | The expected behaviour: inputs and their masked output. Every engine must pass every case. |
| `../mask.js` | The JavaScript engine used by the Kong feeder (plugin config sent to the Portal). |

To change what is masked, edit `rules.json`, add or update cases in `cases.json`,
and run `npm test` in `feeds/`. Then copy both files to the other engines and run
their tests against the same cases.

## How an engine applies the rules

An engine has two operations.

**Mask a plugin config** (`kind: "plugin"` cases). Walk the config at any depth.
For each key in an object, with `parentKey` being the key that holds the object:

1. If the key is a secret field and its value can be masked, replace the value
   with `mask`. A key is a secret field when its lowercase name is in
   `secretFields.names`, matches one of `secretFields.patterns`, or is listed
   under `secretFields.byParent[parentKey]` (e.g. `host` directly inside a
   `redis` object). Booleans, numbers, null and Kong vault references
   (`vaultReference`, matched against the trimmed value) cannot be masked.
2. Otherwise, if the key is in `headerMaps` and the value is an object, mask the
   value of each entry whose name is a secret name (see below), then continue
   the walk inside it.
3. Otherwise, if the value is a string, scrub it as text.
4. Otherwise, continue the walk inside the value.

For an array, each string element is scrubbed as text. When the array's key is
in `nameValueLists.fields` and no key on the path to it is in
`nameValueLists.except` (`rename` lists hold `old:new` names), each `Name:value`
element is first masked to `Name:****` when `Name` (trimmed) is a secret name
and the value (trimmed) is neither empty nor a vault reference.

A name is a **secret name** when, lowercased and with `-`, `_`, `.` and
whitespace removed, it is in `secretNames.names`, contains one of
`secretNames.contains`, starts with one of `secretNames.prefixes` or ends with
one of `secretNames.suffixes`.

**Scrub text** (`kind: "text"` cases, and every string in a config). Apply each
of `textRules` in order, replacing every match:

- `mask: "match"`: replace the whole match with `mask`.
- `mask: "group"`: replace capturing group `group` with `mask`.
- `mask: "group-if-secret-name"`: replace group `group` with `mask` when group
  `nameGroup` is a secret name and group `group` is neither empty nor a vault
  reference.

For the two group modes, the capturing groups of the pattern are side by side
and together make up the whole match, so an engine can rebuild the match by
joining the groups (an unmatched group counts as an empty string) with one of
them replaced. Groups are numbered from 1.

## Writing patterns that work in every engine

Patterns are written in the subset shared by JavaScript `RegExp` and Python
`re`:

- Use `(?:...)` for groups that are not one of the side-by-side capturing
  groups. Don't use named groups, lookbehind or Unicode property escapes.
- Backreferences (`\1`) and lookahead (`(?=...)`, `(?!...)`) are fine.
- In Python, compile with `re.ASCII` so that `\b`, `\w` and `\s` behave as in
  JavaScript, add `re.IGNORECASE` when a rule has `"ignoreCase": true`, and use
  `search`, not `match`, for `secretFields.patterns` and `vaultReference`.
- `^` and `$` mean the start and end of the whole string (no multiline flag).

## Known gaps

- A secret under a name that does not look secret (e.g. `local partner = "..."`
  in Lua, or an `X-Partner-Id` header holding a credential) is not found.
- Some values that are not secrets are masked, e.g. header names ending in
  `key` such as `X-Idempotency-Key`, and words after `Bearer` or `Basic` in
  plain text. This only affects what is displayed.
