import cypress, { defineConfig } from 'cypress'
//import plugins from './cypress/plugins/index.js'

const baseUrl = 'http://oauth2proxy.localtest.me:4180'

export default defineConfig({
  env: {
    codeCoverage: {
      url: `${baseUrl}/__coverage__`,
      exclude: 'e2e/**/*.*',
    },
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      require('dotenv').config()
      require('@cypress/code-coverage/task')(on, config)

      // // It's IMPORTANT to return the config object
      // // with any changed environment variables
      config.specPattern = [
        './cypress/tests/01-*/*.ts',
        './cypress/tests/02-*/*.ts',
        './cypress/tests/06-*/*.ts',
        './cypress/tests/07-*/*.ts',
        './cypress/tests/03-*/*.ts',
        './cypress/tests/04-*/*.ts',
        // './cypress/tests/05-*/*.ts',
        './cypress/tests/08-*/*.ts',
        './cypress/tests/09-*/*.ts',
        './cypress/tests/10-*/*.ts',
        './cypress/tests/11-*/*.ts',
        './cypress/tests/12-*/*.ts',
        './cypress/tests/13-*/*.ts',
        './cypress/tests/14-*/*.ts',
        './cypress/tests/15-*/*.ts',
        './cypress/tests/16-*/*.ts',
        './cypress/tests/17-*/*.ts',
        './cypress/tests/18-*/*.ts',
        './cypress/tests/19-*/*.ts',
        './cypress/tests/20-*/*.ts',
      ]
      return config
    },
    baseUrl,
    specPattern: 'cypress/tests/**/*.cy.ts',
    screenshotOnRunFailure: true,
    screenshotsFolder: 'results/report/assets',
    video: false,
    testIsolation: false,
    watchForFileChanges: false,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'results',
      html: false,
      json: true,
      overwrite: false,
    },
    chromeWebSecurity: false,
    env: {
      ASTRA_SCAN_ENABLED: true,
      CLIENT_ID: 'aps-portal',
      CLIENT_SECRET: '8e1a17ed-cb93-4806-ac32-e303d1c86018',
      OIDC_ISSUER: 'http://keycloak.localtest.me:9081/auth/realms/master',
      TOKEN_URL:
        'http://keycloak.localtest.me:9081/auth/realms/master/protocol/openid-connect/token',
      GWA_API_URL: 'http://gwa-api.localtest.me:2000/v2',
      KONG_URL: 'http://kong.localtest.me:8000',
      JWKS_URL: 'http://cypress-jwks-url.localtest.me:3500',
      KONG_CONFIG_URL: 'http://kong.localtest.me:8001',
      BASE_URL: 'http://oauth2proxy.localtest.me:4180',
      KEYCLOAK_URL: 'http://keycloak.localtest.me:9081',
      WEBAPP_URL: 'http://html-sample-app.localtest.me:4242',
      DEV_USERNAME: 'janis@idir',
      DEV_PASSWORD: 'awsummer',
    },
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },
})
