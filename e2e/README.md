# End-to-End Test Automation

The API Service Portal repository contains a testing solution with the tests written in Cypress.

The API Service Portal is configured to run tests locally and in Docker.

The End-to-End (E2E) automation tests are written to be directly compared to the official API Services Portal tests.

Each E2E test covers the same functionality found in the official API Services Portal tests, but uses the Cypress API.

## Help and Testing

The following steps will guide you through installing and configuring Cypress as well as running tests. Before installing Cypress ensure you have Node, Git, and Docker installed on your local machine.

Note: Using Cypress with Windows requires having Windows Subsystem for Linux 2 (WSL 2) installed. Instructions on using Cypress with Windows can be found in the _Cypress on Windows_ section.

If you get stuck, here is more help:

- [Gitter Channel](https://gitter.im/cypress-io/cypress)
- [Cypress Docs](https://on.cypress.io/)
- [Cypress CLI Tool Docs](https://github.com/cypress-io/cypress-cli)

## 1. Install Cypress

Install Cypress on your local machine by following [these instructions](https://docs.cypress.io/guides/getting-started/installing-cypress) on the Cypress website.

### Build Gateway API Image

- Clone and build the Dockerfile within the [bcgov / gwa-api](https://github.com/bcgov/gwa-api) repository. Dockerfile is located in `./microservices/gatewayApi`
- Use the following command to build the Dockerfile: `docker build -t gwa-api:e2e .`
- **Important**: Wait for the image to build before proceeding

## 2. Overview - Running Tests

- Clone the API Service Portal repository
- Run `./e2e $ npm i` to install all the dependencies

### Test data dependencies

Many tests are cannot be run independently because they depend on state established by other tests. These dependencies are [documented](test-data-dependencies.md) to assist in running tests selectively.

### Running Cypress Locally

- `./e2e/cypress.config.ts` contains the web app config. Update the file to use local or dev version of the portal for executing the tests

- Recommendation is to use local version of portal. Use `docker compose` to create local development environment

#### Cypress Test Runner

- Run `npm run cy:open` to open the test runner and selectively execute the tests

#### Cypress Headless

- Run `npm run cy:run` to execute the tests and print the results to the console
- Run `npm run cy:run:html` to execute the tests and generate the `mochawesome` HTML report under `results/report` folder

### Docker Compose

- Run `docker-compose up` to spin up a local development environment, which includes Cypress as one of the services and it executes all the tests and generates the HTML report
- Run `docker-compose down` to tear down the environment

#### GitHub Actions

- Any new commit pushed to a `cypress*` branch or `test`, triggers the job (`.github/workflows/aps-cypress-e2e.yaml`) and it spawns all the services including Cypress to execute the test suite

- The test results would be uploaded to `https://www.cypress.io/dashboard/`, as well as attached as an artifact on the GitHub Action run.

## 3. Cypress on Windows

> [!NOTE]  
> WSL2 now supports running Linux GUI apps. [Get setup here](https://learn.microsoft.com/en-us/windows/wsl/tutorials/gui-apps) and follow the regular instructions above for setting up Cypress

### Legacy Instructions:

You will need a copy of the API Service Portal on both your local machine and within your WSL 2/Linux distribution. Instructions pertaining to either

WSL 2 or your local machine are prefaced with `WSL` and `LM` respectively in the following sections.

### `WSL` and `LM` : Clone Repositories

- Clone [bcgov / api-services-portal](https://github.com/bcgov/api-services-portal).
- In both your local machine and WSL application directories switch to a branch for testing (e.g., `util/expand-automation`).

### `WSL`: Build Gateway API Image

- Clone and build the Dockerfile within the [bcgov / gwa-api](https://github.com/bcgov/gwa-api) repository. Dockerfile is located in `./microservices/gatewayApi`.
- Build the Dockerfile using the `docker build -t gateway-api:e2e-testing .` command.
- **Important**: Wait for the image to build before proceeding.

### `WSL`: Build and Run Dev Environment

- Inside the `api-services-portal` directory, build and run the application by running `docker-compose up` at the project root.

### `LM`: Install E2E Testing Dependencies

- Inside the `api-services-portal` directory, install npm dependencies using the `./e2e $ npm i` command.

### `LM`: Run Cypress

- Run Cypress using a run command such as `./e2e $ npm run cy:open`.

## 4. Creating Tests

After you run `npm run cy:open`, the Cypress console will open. Before continuing, ensure the `Edge` browser is selected from the drop-down list of available browsers (top-right corner of the Cypress test runner).

Each test file defined in the `./e2e/cypress/tests` directory will be visible. Click on a test in order to run all test cases in that file. A new browser window will open and you will see your tests executed sequentially.

### Test File Naming Convention and Location

- Test files follow this naming convention: `<num>-<test-name>.cy.ts`. (e.g., `01-create-api.cy.ts`)
- Store the test files in the `./e2e/cypress/tests` directory.

### Test File Structure

Test files will generally have the structure as shown in the following example.

Note the `before()`, `beforeEach()`, and `after()` hooks, which are generally added to each test file. You can add additional functionality to each hook. [Additional hooks](https://docs.cypress.io/guides/references/bundled-tools#Mocha) are also available including `afterEach()` and `skip()`.

```js
import MyPageObject from '../pageObjects/myPageObject'

describe('Some set of tests', () => {
  const pageObject = new MyPageObject()

  // Runs prior to all tests in this file.
  before(() => {
    cy.visit('/')
    cy.clearCookies()
    cy.reload()
  })

  // Runs before each test. Must at least preserve cookies.
  beforeEach(() => {
    cy.preserveCookies()
    // If needed: load fixture
    cy.fixture('apiowner').as('apiowner')
    // If needed: visit path to page
    cy.visit(pageObject.path)
  })

  it('tests something', () => {
    // Test case logic goes here
  })

  // More test cases

  // Runs after all tests.
  after(() => {
    cy.logout()
  })
})
```

### Directory Structure

Ensure that you place all the files necessary to run tests in the appropriate directory.

Inside the `./e2e/cypress` directory:

- `/downloads`: Any files downloaded while running the tests
- `/fixtures`: Files with fixed data to ensure repeatable test results including items such a login credentials for API owners, developers, client IDs/secrets
- `/pageObjects`: Test objects relevant to the testing application
- `/plugins`: Files that enable you to tap into, modify, or extend the internal behavior of Cypress
- `/support`: Path to the file to load before the test files load
- `/tests`: Actual test files

### Cypress IntelliSense

If you use a modern Integrated Development Environment (IDE) that supports TypeScript (like VSCode), you can benefit from Cypress type declarations included with the `cypress` NPM module. Add `@ts-check` to the specification file and configure a dummy [tsconfig.json](https://github.com/bcgov/api-services-portal/blob/util/expand-automation/e2e/tsconfig.json) file and you will see the IntelliSense over `cy.<something>` commands.

### Custom Commands

- Custom Cypress commands can be found in the [cypress/support/index.js](https://github.com/bcgov/api-services-portal/blob/util/expand-automation/e2e/cypress/support/index.ts) directory.
- To let the TypeScript compiler know that a custom command has been added and ensure IntelliSense is working, the type signature of the custom command is described in file [cypress/support/global.d.ts](https://github.com/bcgov/api-services-portal/blob/util/expand-automation/e2e/cypress/support/global.d.ts).
- To include the new `.d.ts` file in IntelliSense, you can update `tsconfig.json` or add another special comment to the JavaScript spec files -
  `/// <reference types="...>`.

```html
// type definitions for Cypress object "cy" /// <reference types="cypress" />

// type definitions for custom commands will resolve to "cypress/support/global.d.ts" ///
<reference types="../support" />
```

See the [Cypress-example-recipes](https://github.com/cypress-io/cypress-example-recipes) repository for information on IntelliSense and adding Chai assertions to Cypress.
