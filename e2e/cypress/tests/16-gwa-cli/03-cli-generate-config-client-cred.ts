import LoginPage from '../../pageObjects/login'
import ApplicationPage from '../../pageObjects/applications'
import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import MyAccessPage from '../../pageObjects/myAccess'
import HomePage from '../../pageObjects/home';
import Products from '../../pageObjects/products';
const YAML = require('yamljs');
let cli = require("../../fixtures/test_data/gwa-cli.json")
const { v4: uuidv4 } = require('uuid')
const jose = require('node-jose')

let userSession: any
let namespace: string
const customId = uuidv4().replace(/-/g, '').toLowerCase().substring(0, 3)
const serviceName = 'my-service-' + customId

describe('Verify CLI commands for generate/apply config', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const ma = new MyAccessPage()
  const pd = new Products()
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
    const serviceName = 'my-service-' + customId
    const command = [
      'gwa generate-config --template client-credentials-shared-idp',
      `--service ${serviceName}`,
      '--upstream https://httpbin.org',
      '--org ministry-of-health',
      '--org-unit planning-and-innovation-division',
      '--out gw-config-cc.yaml'
    ].join(' ');
    cy.executeCliCommand(command).then((response) => {
      expect(response.stdout).to.contain("File gw-config-cc.yaml created")
    });
  })

  it('Check gwa command to apply generated config', () => {
    cy.executeCliCommand('gwa apply -i gw-config-cc.yaml').then((response) => {
      expect(response.stdout).to.contain("4/4 Published, 0 Skipped")
      let wordOccurrences = (response.stdout.match(/\bcreated\b/g) || []).length;
      expect(wordOccurrences).to.equal(3)
    });
  })

  it('activates namespace in Portal', () => {
    cy.executeCliCommand('gwa gateway current').then((response) => {
      namespace = response.stdout.match(/\bgw-\w+/g)[0]
      cy.activateGateway(namespace)
    })
  })

  it('Verify that the product created through gwa command is displayed in the portal', () => {
    cy.visit(pd.path)
    pd.editProductEnvironment(serviceName + ' API', 'dev')
  })

  it('Verify the Authorization scope and issuer details for the product', () => {
    pd.verifyAuthScope('Oauth2 Client Credentials Flow')
  })

  it('Verify the issuer details for the product', () => {
    pd.verifyIssuer(namespace + ' default (test)')
  })

  it('Verify that the dataset created through GWA comand is assocuated with the product', () => {
    cy.visit(pd.path)
    pd.verifyDataset(serviceName, serviceName + ' API')
  })

  after(() => {
    cy.logout()
})

})