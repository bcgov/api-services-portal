# End-to-End Test Automation

This repository contains a testing solution, with the tests written in Cypress.

Additionally this app is configured to run tests locally and Docker.

The tests are written to be directly compared to the official API Services Portal tests.

Each test covers the same functionality found in the official API Services Portal tests but utilizes the Cypress API.

## Help + Testing

The steps below will take you all the way through Cypress. It is assumed you have nothing installed except for node + git.

**If you get stuck, here is more help:**

- [Gitter Channel](https://gitter.im/cypress-io/cypress)
- [Cypress Docs](https://on.cypress.io)
- [Cypress CLI Tool Docs](https://github.com/cypress-io/cypress-cli)

### 1. Install Cypress

[Follow these instructions to install Cypress.](https://docs.cypress.io/guides/getting-started/installing-cypress)

### 2. Run Tests

* Clone this repository
* Create a new file `cypress.env.json` from `cypress.env.local.json`

#### Locally

* Run `npm install` to install all the dependencies
* Run `npm run cy:run` to run the tests

#### Docker

#### Docker Compose

#### GitHub Actions



## Cypress IntelliSense

If you use modern IDE that supports TypeScript (like VSCode), you can benefit
from Cypress type declarations included with the `cypress` NPM module. Just
add `@ts-check` to the spec file and configure "dummy"
[tsconfig.json](tsconfig.json) file and see IntelliSense over `cy.<something>`
commands.

### Custom commands

* This project also adds several custom commands in [cypress/support/index.js](cypress/support/index.ts). 
* To let TypeScript compiler know that we have added a custom command and have IntelliSense working, I have described the type signature of the custom command in file [cypress/support/global.d.ts](cypress/support/global.d.ts). 
* To include the new ".d.ts" file into IntelliSense, I could update `tsconfig.json` or I could add another special comment to the JavaScript spec files - `/// <reference types="...>`.

```js
// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// type definitions for custom commands will resolve to "cypress/support/global.d.ts"
/// <reference types="../support" />
```

**Related:** [IntelliSense for custom Chai assertions added to Cypress](https://github.com/cypress-io/cypress-example-recipes/tree/master/examples/extending-cypress__chai-assertions#code-completion)

