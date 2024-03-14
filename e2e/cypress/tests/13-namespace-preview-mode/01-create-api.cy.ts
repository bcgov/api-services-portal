import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'

describe('Create API Spec', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
  const pd = new Products()
  let userSession: any
  let namespace: string

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload(true)
    cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('api').as('api')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@common-testdata').then(({ apiTest }: any) => {
      cy.getUserSessionTokenValue(apiTest.namespace, false).then((value) => {
        userSession = value
      })
    })
  })

  it('Set token with gwa config command', () => {
    cy.exec('gwa config set --token ' + userSession, { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      expect(response.stdout).to.contain("Config settings saved")
    });
  })

  it('create namespace using gwa cli command', () => {
    var cleanedUrl = Cypress.env('BASE_URL').replace(/^http?:\/\//i, "");
    cy.exec('gwa namespace create --generate --host ' + cleanedUrl + ' --scheme http', { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      assert.isNotNaN(response.stdout)
      namespace = response.stdout
      cy.updateJsonValue('common-testdata.json', 'namespacePreview.namespace', namespace)
      // cy.updateJsonValue('apiowner.json', 'clientCredentials.clientIdSecret.product.environment.name.config.serviceName', 'cc-service-for-' + namespace)
      cy.executeCliCommand("gwa config set --namespace " + namespace)
    });
  })

  it('activates new namespace', () => {
    home.useNamespace(namespace)
  })

  it('creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ namespacePreview }: any) => {
      sa.createServiceAccount(namespacePreview.serviceAccount.scopes)
    })
    sa.saveServiceAcctCreds()
  })

  it('creates as new product in the directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ namespacePreview }: any) => {
      pd.createNewProduct(namespacePreview.product.name, namespacePreview.product.environment.name)
    })
  })

  it('update the Dataset in BC Data Catelogue to appear the API in the Directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ namespacePreview }: any) => {
      pd.updateDatasetNameToCatelogue(namespacePreview.product.name, namespacePreview.product.environment.name)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
