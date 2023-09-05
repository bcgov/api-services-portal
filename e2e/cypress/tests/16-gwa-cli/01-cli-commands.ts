import LoginPage from '../../pageObjects/login'
import ApplicationPage from '../../pageObjects/applications'
import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import MyAccessPage from '../../pageObjects/myAccess'
const YAML = require('yamljs');
let userSession: any
let cli = require("../../fixtures/test_data/gwa-cli.json")
var cleanedUrl = Cypress.env('BASE_URL').replace(/^http?:\/\//i, "");
const jose = require('node-jose')

describe('Verify CLI commands', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const ma = new MyAccessPage()
  let namespace: string

  before(() => {
    // cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    // cy.visit(login.path)
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@apiowner').then(({ apiTest }: any) => {
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
      assert.equal(response.stderr, "Error: unauthorized_client\nINVALID_CREDENTIALS: Invalid client credentials")
    });
  })

  it('Check gwa command for login with invalid client secret', () => {
    let clientID = cli.credentials.clientID
    let clientSecret = "dummy-client-secret"
    cy.executeCliCommand('gwa login --client-id ' + clientID + ' --client-secret ' + clientSecret + ' --host ' + cleanedUrl + ' --scheme http').then((response) => {
      assert.equal(response.stderr, "Error: unauthorized_client\nINVALID_CREDENTIALS: Invalid client credentials")
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
    cy.executeCliCommand('gwa namespace create --host ' + cleanedUrl + ' --scheme http').then((response) => {
      assert.isNotNaN(response.stdout)
      namespace = response.stdout
    });
  })


  it('Check gwa namespace list command and verify the created namespace in the list', () => {
    cy.executeCliCommand('gwa namespace list --host ' + cleanedUrl + ' --scheme http').then((response) => {
      expect(response.stdout).to.contain(namespace);
    });
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})