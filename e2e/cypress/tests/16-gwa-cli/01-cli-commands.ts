let cli = require("../../fixtures/test_data/gwa-cli.json")
let userSession: any
var cleanedUrl = Cypress.env('BASE_URL').replace(/^http?:\/\//i, "");

describe('Verify config / login CLI commands', () => {
  let namespace: string

  before(() => {
    cy.deleteAllCookies()
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@common-testdata').then(({ apiTest }: any) => {
      cy.getUserSessionTokenValue(apiTest.namespace, false).then((value) => {
        userSession = value
      })
    })
  })


  it('Check gwa command to login with client ID and secret', () => {
    let clientID = cli.credentials.clientID
    let clientSecret = cli.credentials.clientSecret
    cy.log('gwa login --host ${url} --scheme http')
    cy.executeCliCommand('gwa login --client-id ' + clientID + ' --client-secret ' + clientSecret + ' --host ' + cleanedUrl + ' --scheme http').then((response) => {
      expect(response.stdout).to.contain('Successfully logged in');
    });
  })

  it('Check gwa command for login with invalid client id', () => {
    let clientID = "dummy-client"
    let clientSecret = cli.credentials.clientSecret
    cy.executeCliCommand('gwa login --client-id ' + clientID + ' --client-secret ' + clientSecret + ' --host ' + cleanedUrl + ' --scheme http').then((response) => {
      expect(response.stderr).to.contain("Error: invalid_client")
    });
  })

  it('Check gwa command for login with invalid client secret', () => {
    let clientID = cli.credentials.clientID
    let clientSecret = "dummy-client-secret"
    cy.executeCliCommand('gwa login --client-id ' + clientID + ' --client-secret ' + clientSecret + ' --host ' + cleanedUrl + ' --scheme http').then((response) => {
      expect(response.stderr).to.contain("unauthorized_client")
    });
  })


  it('Check gwa config command to set environment', () => {
    var cleanedUrl = Cypress.env('BASE_URL').replace(/^http?:\/\//i, "");
    cy.executeCliCommand('gwa config set --host ' + cleanedUrl + ' --scheme http').then((response) => {
      expect(response.stdout).to.contain("Config settings saved")
    });
  })

  it('Check gwa config command to set token', () => {
    cy.executeCliCommand('gwa config set --token ' + userSession).then((response) => {
      expect(response.stdout).to.contain("Config settings saved")
    });
  })

  it('Check gwa command to create namespace', () => {
    cy.executeCliCommand('gwa gateway create --generate --host ' + cleanedUrl + ' --scheme http').then((response) => {
      assert.isNotNaN(response.stdout)
      // Use regex to extract the gateway ID
      const match = response.stdout.match(/Gateway ID: ([\w-]+)/);
      if (match && match[1]) {
          namespace = match[1];
          assert.isNotNull(namespace);
      } else {
          throw new Error('Failed to extract Gateway ID from response: ' + response.stdout);
      }
    });
  })

  it('Check gwa gateway list command and verify the created namespace in the list', () => {
    cy.executeCliCommand('gwa gateway list --host ' + cleanedUrl + ' --scheme http').then((response) => {
      expect(response.stdout).to.contain(namespace);
    });
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})
