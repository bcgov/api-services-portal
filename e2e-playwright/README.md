## Install Playwright

```sh
cd e2e-playwright
npm install
npx playwright install
```

## Run tests

npx playwright test
  Runs the end-to-end tests.

npx playwright test --ui
  Starts the interactive UI mode.

npx playwright test --project=chromium
  Runs the tests only on Desktop Chrome.

npx playwright test example
  Runs the tests in a specific file (or folder)

npx playwright test --debug
  Runs the tests in debug mode.

npx playwright codegen
  Auto generate tests with Codegen.

## Cypress vs Playwright

Key changes to convert tests from Cypress:

1. Changed `describe`/`it` to `test.describe`/`test.it`
1. Changed `before` to `test.beforeAll`
1. Changed `cy.log` to `console.log`
1. Changed promise chains to async/await
1. Updated to use Playwright's `expect` assertions
1. Slightly modified `callAPI` helper   
1. Imported necessary functions from helpers (not required with Cypress commands)
1. Set `test.describe.configure({ mode: 'serial' });` if tests in a file must be run in serial 
   and `fullyParallel` is set to `true` in `playwright.config.ts`.

## Debugging Playwright failures

When a test fails, Playwright will print minimal details in the console, which
are also included in the HTML report. These would be the line the test failed
on, and for an assertion failure, the expected and actual values.

If you want to see more details, the idea is that locally you can run the tests
in UI Mode to debug. Whereas in CI, you'd use 'traces' to get more details (e.g.
viewing API request and response details). That said, you can also capture
traces locally - just use `--trace on` when running the tests.

For more info, see [Recording a
Trace](https://playwright.dev/docs/trace-viewer-intro#recording-a-trace) in the
Playwright docs.

## Speeding up tests

### Parallel tests

In Playwright, tests are run in [parallel](https://playwright.dev/docs/test-parallel) by default. This is great for speeding
up tests, but it can also cause issues if you have tests that depend on each
other. So best to avoid that, at least within files.

To speed things up even more, one can not only run tests in parallel on a given
machine (using multiple workers), but also on multiple machines at once.
Playwright calls this [sharding](https://playwright.dev/docs/test-sharding).

### Fail fast

Use `--only-changed` to run only tests that have changed since the last run
first, then run all tests afterwards. See [Fail fast](https://playwright.dev/docs/ci#fail-fast)