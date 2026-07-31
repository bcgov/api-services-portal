#!/usr/bin/env node
'use strict';

const engine = require('./lib/engine');

// Lazily-required so `--help`/an unknown --test doesn't need every
// scenario module (and its dependencies) to load successfully.
const tests = {
  'happy-path': () => require('./tests/happy-path'),
  'plat-001': () => require('./tests/plat-001'),
  'err-013': () => require('./tests/err-013'),
  'err-014': () => require('./tests/err-014'),
  'err-015': () => require('./tests/err-015'),
  'err-018': () => require('./tests/err-018'),
  'err-019': () => require('./tests/err-019'),
  'err-020': () => require('./tests/err-020'),
  'err-023': () => require('./tests/err-023'),
  'err-024': () => require('./tests/err-024'),
  'err-025': () => require('./tests/err-025'),
  'err-029': () => require('./tests/err-029'),
  // 'err-031' - not yet implemented, see README.md's "Error scenarios" section.
  'err-032': () => require('./tests/err-032'),
  'enh-002': () => require('./tests/enh-002'),
};

engine.main({ tests, argv: process.argv.slice(2) }).catch((err) => {
  console.error(err);
  process.exit(1);
});
