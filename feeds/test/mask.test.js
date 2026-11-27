const { test } = require('node:test');
const assert = require('node:assert/strict');

const mask = require('../kong/mask');
const rules = require('../kong/masking/rules.json');
const { cases } = require('../kong/masking/cases.json');

// The shared cases are the specification: any engine that applies
// masking/rules.json (e.g. gwa-api) runs the same list.
cases.forEach((testCase) => {
  test(`${testCase.kind}: ${testCase.name}`, () => {
    const actual =
      testCase.kind === 'plugin'
        ? mask(structuredClone(testCase.input))
        : mask.scrubText(testCase.input);
    assert.deepEqual(actual, testCase.expected);
  });
});

function allStrings(value) {
  if (typeof value === 'string') {
    return [value];
  }
  if (value !== null && typeof value === 'object') {
    return Object.values(value).flatMap(allStrings);
  }
  return [];
}

const caseStrings = cases.flatMap((testCase) => allStrings(testCase.input));

rules.textRules.forEach((rule) => {
  test(`text rule ${rule.name} is valid and covered by a case`, () => {
    const regex = new RegExp(rule.pattern, rule.ignoreCase ? 'gi' : 'g');
    const matches = caseStrings.flatMap((text) => [...text.matchAll(regex)]);
    assert.ok(matches.length > 0, 'no case exercises this rule');
    if (rule.mask !== 'match') {
      matches.forEach((match) => {
        // the groups must make up the whole match, so that one group can be
        // replaced and the rest kept
        assert.equal(
          match
            .slice(1)
            .map((part) => part ?? '')
            .join(''),
          match[0]
        );
        assert.ok(rule.group < match.length);
        if (rule.mask === 'group-if-secret-name') {
          assert.ok(rule.nameGroup < match.length);
        }
      });
    }
  });
});

test('every rules.json pattern compiles', () => {
  [
    rules.vaultReference,
    ...rules.secretFields.patterns,
    ...rules.textRules.map((rule) => rule.pattern),
  ].forEach((pattern) => assert.doesNotThrow(() => new RegExp(pattern)));
});
