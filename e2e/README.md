# End-to-End Test Automation

This repository contains a testing solution, with the tests written in Cypress.

Additionally this app is configured to run tests locally and Docker.

The tests are written to be directly compared to the official API Services Portal tests.

Each test covers the same functionality found in the official API Services Portal tests but utilizes the Cypress API.

## Help + Testing

The steps below will take you all the way through Cypress. It is assumed you have nothing installed except for node + git.

Using Cypress with Windows requires having WSL2 installed. Instructions on using Cypress with Windows can be found below.

**If you get stuck, here is more help:**

- [Gitter Channel](https://gitter.im/cypress-io/cypress)
- [Cypress Docs](https://on.cypress.io)
- [Cypress CLI Tool Docs](https://github.com/cypress-io/cypress-cli)

### 1. Install Cypress

[Follow these instructions to install Cypress.](https://docs.cypress.io/guides/getting-started/installing-cypress)

### 1.1 Build Gateway API Image

Clone and build the Dockerfile within the [bcgov / gwa-api](https://github.com/bcgov/gwa-api) repo. Dockerfile is located in `./microservices/gatewayApi`. Build with the following command: `docker build -t gateway-api:e2e-testing .`. Wait for the image to build before proceeding.

### 2. Run Tests

- Clone this repository
- Run `./e2e $ npm install` to install all the dependencies

#### 2.1 Locally

- Create a new file `cypress.json` from `cypress.local.json` and update any params if necessary

##### 2.1.1 Cypress Test Runner

- Run `./e2e $ npm run cy:open` to open the test runner and execute tests selectively

##### 2.2.2 Cypress Headless

- Run `npm run cy:run` to run the tests and print the results to the console
- Run `npm run cy:run:dev:html` to run the tests and generate `mochawesome` report under `results/report`

#### 2.2 Docker Compose

- Run `docker-compose up` under parent folder `api-services-portal` to spin up a local environment, which includes cypress as one of the service and it executes the tests
- Run `docker-compose down` to tear down the containers

#### 2.4 GitHub Actions

- Any new commit pushed to `feature/automation-*` branch triggers a job (`.github/workflows/aps-cypress-e2e.yaml`) and deploys a container to execute the test suite

## Cypress on Windows

You will need a copy of the project on both your local machine and within your WSL2/Linux distro. Instructions pertaining to either WSL2 or Local Machine will be prefaced with `WSL` and `LM` respectively.

### 1. `WSL` AND `LM`: Clone Repos

- Clone a copy of [bcgov / api-services-portal](https://github.com/bcgov/api-services-portal).
- In both the local machine and WSL application directories, switch to a branch for testing. Eg: `util/expand-automation`.

### 2. `WSL`: Build Gateway API Image

- Clone and build the Dockerfile within the [bcgov / gwa-api](https://github.com/bcgov/gwa-api) repo. Dockerfile is located in `./microservices/gatewayApi`.
- Build with the following command: `docker build -t gateway-api:e2e-testing .`.
- Wait for the image to build before proceeding.

### 3. `WSL`: Build and Run Dev Environment

- Inside `api-services-portal` directory, build/run the application by running `docker-compose up` at project root.

### 4. `LM`: Install E2E Testing Dependencies

- Inside `api-services-portal` directory, install npm dependencies: `./e2e $ npm i`.

### 5. `LM`: Run Cypress

- Run Cypress using one of the run commands such as `./e2e $ npm run cy:open`.

## Running Tests with cy:open

After running `npm run cy:open`, the Cypress console will open. Before continuing, be sure the `Electron` browser is selected from the drop down in the top-right corner of console.

Each test file defined in the `./e2e/cypress/tests` directory will be visible. Click on a test in order to run all test cases in that file. A browser window will pop up and you will see your tests executed sequentially. 

## Creating Tests

### Test File Naming Convention and Location

- Test files follow this naming convention: `<num>-<test-name>.spec.ts`.
  - Eg: `01-create-api.spec.ts`
- Place test files in the `./e2e/cypress/tests` directory.

### Test File Structure

Test files will generally have the following structure.

Note the `before()`, `beforeEach()`, and `after()` hooks which are generally added to each test file. You may add in additional functionality to each hook. [Additional hooks](https://docs.cypress.io/guides/references/bundled-tools#Mocha) are also available, including `afterEach()` and `skip()`.

```js
import MyPageObject from '../pageObjects/myPageObject'

describe('Some set of tests', () => {
  
  const pageObject = new MyPageObject();
  
  // Runs prior to all tests in this file. 
  before(() => {
    cy.visit('/');
    cy.clearCookies();
    cy.reload();
  })
  
  // Runs before each test. Must at least preserve cookies.
  beforeEach(() => {
    cy.preserveCookies();
    // If needed: load fixture
    cy.fixture('apiowner').as('apiowner');
    // If needed: visit path to page
    cy.visit(pageObject.path);
  })
  
  it('tests something', () => {
    // Test case logic goes here
  });
  
  // More test cases
  
  // Runs after all tests.
  after(() => {
    cy.logout();
  })
})
```

### Directory Structure

Be sure to place files necessary to run tests in the appropriate directory.

Inside `./e2e/cypress`:

- `/downloads`: Any files that get downloaded while running the tests.
- `/fixtures`: Files with fixed data to ensure repeatable test results. Includes things like like login credentials for API owners, developers, client IDs/secrets, etc.
- `/pageObjects`: Test objects relevant to testing application.
- `/plugins`: Files that enable you to tap into, modify, or extend the internal behavior of Cypress.
- `/support`: Path to file to load before test files load.
- `/tests`: Contains the actual test files.

## Cypress IntelliSense

If you use modern IDE that supports TypeScript (like VSCode), you can benefit
from Cypress type declarations included with the `cypress` NPM module. Just
add `@ts-check` to the spec file and configure "dummy"
[tsconfig.json](tsconfig.json) file and see IntelliSense over `cy.<something>`
commands.

### Custom commands

- This project also adds several custom commands in [cypress/support/index.js](cypress/support/index.ts).
- To let TypeScript compiler know that we have added a custom command and have IntelliSense working, I have described the type signature of the custom command in file [cypress/support/global.d.ts](cypress/support/global.d.ts).
- To include the new ".d.ts" file into IntelliSense, I could update `tsconfig.json` or I could add another special comment to the JavaScript spec files - `/// <reference types="...>`.

```js
// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// type definitions for custom commands will resolve to "cypress/support/global.d.ts"
/// <reference types="../support" />
```

**Related:** [IntelliSense for custom Chai assertions added to Cypress](https://github.com/cypress-io/cypress-example-recipes/tree/master/examples/extending-cypress__chai-assertions#code-completion)
