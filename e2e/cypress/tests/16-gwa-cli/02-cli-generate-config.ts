import LoginPage from '../../pageObjects/login'
import ApplicationPage from '../../pageObjects/applications'
import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import MyAccessPage from '../../pageObjects/myAccess'
import HomePage from '../../pageObjects/home';
import Products from '../../pageObjects/products';
const YAML = require('yamljs');
let userSession: any
let cli = require("../../fixtures/test_data/gwa-cli.json")

const jose = require('node-jose')

describe('Verify CLI commands for generate/apply config', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const ma = new MyAccessPage()
  const pd = new Products()
  let namespace: string
  const home = new HomePage()

  before(() => {
    // cy.visit('/')
    cy.reload(true)
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

  it('Check gwa config command to set token', () => {
    cy.executeCliCommand('gwa config set --token ' + userSession).then((response) => {
      expect(response.stdout).to.contain("Config settings saved")
    });
  })

  it('Check gwa command to generate config for client credential template', () => {
    cy.executeCliCommand('gwa generate-config --template client-credentials-shared-idp --service my-service --upstream https://httpbin.org --org ministry-of-health --org-unit planning-and-innovation-division --out gw-config.yaml').then((response) => {
      expect(response.stdout).to.contain("File gw-config.yaml created")
    });
  })

  it('Check gwa command to apply generated config', () => {
    cy.executeCliCommand('gwa apply -i gw-config.yaml').then((response) => {
      let wordOccurrences = (response.stdout.match(/\bcreated\b/g) || []).length;
      expect(wordOccurrences).to.equal(3)
      namespace = response.stdout.match(/\bgw-\w+/g)[0]
    });
  })

  it('activates new namespace', () => {
    cy.activateGateway(namespace)
  })

  it('Verify that the product created through gwa command is displayed in the portal', () => {
    cy.visit(pd.path)
    pd.editProductEnvironment('my-service API', 'dev')
  })

  it('Verify the Authorization scope and issuer details for the product', () => {
    pd.verifyAuthScope('Oauth2 Client Credentials Flow')
  })

  it('Verify the issuer details for the product', () => {
    pd.verifyIssuer(namespace + ' default (test)')
  })

  it('Verify that the dataset created through GWA comand is assocuated with the product', () => {
    cy.visit(pd.path)
    pd.verifyDataset('my-service', 'my-service API')
  })

  it('Navigate to home path', () => {
    cy.visit(login.path)
  })

  after(() => {
    cy.logout()
})

})