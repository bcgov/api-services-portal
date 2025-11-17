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
const customId = uuidv4().replace(/-/g, '').toLowerCase().substring(0, 3)
const serviceName = 'my-service-' + customId

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

  it('Check gwa command to generate config for quick start template', () => {
    const command = [
      'gwa generate-config --template quick-start',
      `--service ${serviceName}`,
      '--upstream https://httpbun.com',
      '--org ministry-of-health',
      '--org-unit planning-and-innovation-division',
      '--out gw-config-qs.yaml'
    ].join(' ');
    cy.executeCliCommand(command).then((response) => {
      expect(response.stdout).to.contain("File gw-config-qs.yaml created")
    });
  })

  it('Check gwa command to apply generated config', () => {
    cy.executeCliCommand('gwa apply -i gw-config-qs.yaml').then((response) => {
      // fix for bug observed in e2e tests
      if (
        response.stdout.includes("2/3 Published, 0 Skipped") && (response.stdout.match(/\bcreated\b/g) || []).length === 1
      ) {
        // Product not created because GatewayService is not synced yet: retry
        cy.log('Retry apply config')
        cy.executeCliCommand('gwa apply -i gw-config-qs.yaml').then((retryResponse) => {
          expect(retryResponse.stdout).to.contain("3/3 Published, 0 Skipped");
          let wordOccurrences = (retryResponse.stdout.match(/\bcreated\b/g) || []).length;
          expect(wordOccurrences).to.equal(1);
        });
      } else {
        expect(response.stdout).to.contain("3/3 Published, 0 Skipped");
        let wordOccurrences = (response.stdout.match(/\bcreated\b/g) || []).length;
        expect(wordOccurrences).to.equal(2);
      }
    });
  })

  // TODO: Remove this once we have a way to test the status command with the kube API in e2e tests
  const runIfKubeAPI = Cypress.env('HAS_KUBE_API') ? it : it.skip;

  runIfKubeAPI('Check gwa status --hosts include routes', () => {
    cy.executeCliCommand('gwa status --hosts').then((response) => {
      expect(response.stdout).to.contain('https://' + serviceName + '.dev.api.gov.bc.ca')
    });
  })

  it('activates namespace in Portal', () => {
    cy.executeCliCommand('gwa gateway current').then((response) => {
      const namespace = response.stdout.match(/\bgw-\w+/g)[0]
      cy.activateGateway(namespace)
    })
  })

  it('Verify that the product created through gwa command is displayed in the portal', () => {
    cy.visit(pd.path)
    pd.editProductEnvironment(serviceName + ' API', 'dev')
  })

  it('Verify that the dataset created through GWA comand is assocuated with the product', () => {
    cy.visit(pd.path)
    pd.verifyDataset(serviceName, serviceName + ' API')
  })

  it('Verify service name validation error in new namespace', () => {
    const command = [
      'gwa generate-config --template quick-start',
      `--service ${serviceName}`,
      '--upstream https://httpbun.com',
      '--org ministry-of-health',
      '--org-unit planning-and-innovation-division'
    ].join(' ');
    cy.executeCliCommand('gwa gateway create --generate').then((response) => {
      const namespace = response.stdout.match(/\bgw-\w+/g)[0]
      cy.executeCliCommand(command).then((response) => {
        expect(response.stderr).to.contain(`Error: Checking service availability: Service ${serviceName} is already in use. Suggestion: ${namespace}-${serviceName}`)
      });
    });
  })

  after(() => {
    cy.logout()
})

})