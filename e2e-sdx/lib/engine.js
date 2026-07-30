'use strict';

const fs = require('fs');
const path = require('path');

const { runRestish, describeFailure } = require('./restish');
const { generateTestData, generateFakeOpenApiSpec } = require('./testdata');
const {
  loadState,
  saveState,
  logStepOutput,
  writeResultsMarkdown,
} = require('./state');

/**
 * The run/resume engine used by every e2e-sdx test scenario.
 *
 * A "test" is any module exporting `buildSteps(ctx)` that returns an
 * ordered array of `{ id, title, group, fatal, run }` steps (see
 * lib/steps/*.js for the reusable step builders scenarios are composed
 * from). This module owns checkpointing, logging, and the run/resume loop;
 * it has no knowledge of what a particular scenario does.
 */

function printHelp(testNames) {
  console.log(`SDX TechDocs test runner

Walks through an SDX scenario (by default, the full TechDocs onboarding
flow: org -> runtime group -> subsystem -> service -> connection) against a
live restish-configured SDX API, using freshly generated random test data,
and records progress/results into a "test-run-<id>" directory.

Usage:
  node run.js [options]

Options:
  --test <name>          Which test scenario to run (default: happy-path).
                          One of: ${testNames.join(', ')}
  --continue <dir>       Resume a previous test-run-<id> directory, skipping
                          steps already marked successful (reuses the same
                          scenario the run was started with).
  --org-alias <alias>    restish API alias for organization endpoints (default: dsloc)
  --sdx-alias <alias>    restish API alias for SDX endpoints (default: loc)
  --environment <env>    Target environment, e.g. dev|lab|tst (default: dev)
  --member-email <email> Email assigned system-admin access on the test org
                          (default: a generated sdx-test-<id>@example.gov.bc.ca)
  --upstream-url <url>   Fake upstream URL used for the provider connection
                          pattern (default: https://httpbin.org)
  --profile <profile>    restish --rsh-profile override
  --keep                 Skip the cleanup steps; leave everything registered.
  -h, --help              Show this help
`);
}

function parseArgs(argv) {
  const opts = {
    test: 'happy-path',
    orgAlias: 'dsloc',
    sdxAlias: 'loc',
    environment: 'dev',
    upstreamUrl: 'https://httpbin.org',
    keep: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--test':
        opts.test = argv[++i];
        break;
      case '--continue':
        opts.continueDir = argv[++i];
        break;
      case '--org-alias':
        opts.orgAlias = argv[++i];
        break;
      case '--sdx-alias':
        opts.sdxAlias = argv[++i];
        break;
      case '--environment':
        opts.environment = argv[++i];
        break;
      case '--member-email':
        opts.memberEmail = argv[++i];
        break;
      case '--upstream-url':
        opts.upstreamUrl = argv[++i];
        break;
      case '--profile':
        opts.profile = argv[++i];
        break;
      case '--keep':
        opts.keep = true;
        break;
      case '-h':
      case '--help':
        opts.help = true;
        break;
      default:
        console.error(`Unknown argument: ${a}`);
        opts.help = true;
    }
  }
  return opts;
}

function initNewRun(opts, testName) {
  const testData = generateTestData();
  const runDir = path.join(process.cwd(), `test-run-${testData.suffix}`);
  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(path.join(runDir, 'logs'), { recursive: true });

  const state = {
    createdAt: new Date().toISOString(),
    test: testName,
    orgAlias: opts.orgAlias,
    sdxAlias: opts.sdxAlias,
    environment: opts.environment,
    memberEmail:
      opts.memberEmail || `sdx-test-${testData.suffix}@example.gov.bc.ca`,
    upstreamUrl: opts.upstreamUrl,
    profile: opts.profile,
    testData,
    captured: {},
    steps: {},
  };

  fs.writeFileSync(
    path.join(runDir, 'api-spec.yaml'),
    generateFakeOpenApiSpec(testData)
  );
  saveState(runDir, state);
  return { runDir, state };
}

/** Runs one restish call for a step: writes an optional JSON body file,
 *  invokes restish, persists the transcript, and throws on failure. */
async function call(ctx, stepId, alias, args, { input, body } = {}) {
  const fullArgs = [...args];
  if (body !== undefined) {
    const bodyFile = `${stepId}-body.json`;
    fs.writeFileSync(
      path.join(ctx.runDir, bodyFile),
      JSON.stringify(body, null, 2)
    );
    fullArgs.push(`@${bodyFile}`);
  }
  const result = await runRestish(alias, fullArgs, {
    cwd: ctx.runDir,
    input,
    profile: ctx.state.profile,
  });
  logStepOutput(ctx.runDir, stepId, result);
  if (result.code !== 0) {
    throw new Error(describeFailure(result));
  }
  return result;
}

/**
 * Runs (or resumes) a named test scenario.
 *
 * @param {object} params
 * @param {Record<string, () => {buildSteps: (ctx) => any[]}>} params.tests
 *   map of test name -> lazy loader for a tests/*.js module.
 * @param {string[]} params.argv - process.argv.slice(2)
 */
async function main({ tests, argv }) {
  const opts = parseArgs(argv);
  if (opts.help) {
    printHelp(Object.keys(tests));
    process.exit(0);
  }

  let runDir, state, testName;
  if (opts.continueDir) {
    runDir = path.resolve(opts.continueDir);
    state = loadState(runDir);
    if (!state) {
      console.error(
        `No state.json found in ${runDir} - is this a valid test-run directory?`
      );
      process.exit(1);
    }
    testName = state.test || 'happy-path';
    if (!tests[testName]) {
      console.error(
        `state.json names test "${testName}", which isn't a known scenario. Available: ${Object.keys(tests).join(', ')}`
      );
      process.exit(1);
    }
    console.log(`Resuming test run in ${runDir} (test: ${testName})`);
  } else {
    testName = opts.test || 'happy-path';
    if (!tests[testName]) {
      console.error(
        `Unknown test "${testName}". Available: ${Object.keys(tests).join(', ')}`
      );
      process.exit(1);
    }
    ({ runDir, state } = initNewRun(opts, testName));
    console.log(`Starting new test run in ${runDir} (test: ${testName})`);
  }

  const testModule = tests[testName]();

  const ctx = { runDir, state, opts };
  ctx.call = (stepId, alias, args, callOpts) =>
    call(ctx, stepId, alias, args, callOpts);

  const steps = testModule.buildSteps(ctx);
  writeResultsMarkdown(runDir, state, steps);

  for (const step of steps) {
    if (opts.keep && step.group === 'cleanup') {
      continue;
    }

    const prev = state.steps[step.id];
    if (prev && (prev.status === 'success' || prev.status === 'skipped')) {
      console.log(`SKIP (already ${prev.status}) [${step.id}] ${step.title}`);
      continue;
    }

    console.log(`\n=== [${step.id}] ${step.title} ===`);
    state.steps[step.id] = {
      status: 'running',
      startedAt: new Date().toISOString(),
    };
    saveState(runDir, state);

    const fatal = step.fatal !== false;
    try {
      await step.run();
      state.steps[step.id].status = 'success';
      console.log(`OK   [${step.id}]`);
    } catch (err) {
      state.steps[step.id].error = err.message;
      if (fatal) {
        state.steps[step.id].status = 'failed';
        state.steps[step.id].finishedAt = new Date().toISOString();
        saveState(runDir, state);
        writeResultsMarkdown(runDir, state, steps);
        console.error(`\nFAIL [${step.id}] ${step.title}\n  ${err.message}`);
        console.error(
          `\nSee ${path.join(runDir, 'logs', `${step.id}.log`)} for the full transcript.`
        );
        console.error(
          `\nFix the issue, then resume with:\n  node run.js --continue ${runDir}\n`
        );
        process.exit(1);
      } else {
        state.steps[step.id].status = 'skipped';
        console.warn(
          `WARN [${step.id}] (non-fatal, continuing) ${err.message}`
        );
      }
    }

    state.steps[step.id].finishedAt = new Date().toISOString();
    saveState(runDir, state);
    writeResultsMarkdown(runDir, state, steps);
  }

  console.log(`\nDone. See ${path.join(runDir, 'results.md')}`);
}

module.exports = { main, parseArgs };
