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
    cy.reload()
    cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    cy.fixture('api').as('api')
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
      cy.replaceWordInJsonObject('ns.permission', 'ns.' + namespace, 'service-permission-gwa.yml')
      cy.updateJsonValue('common-testdata.json', 'checkPermission.namespace', namespace)
      // cy.updateJsonValue('apiowner.json', 'clientCredentials.clientIdSecret.product.environment.name.config.serviceName', 'cc-service-for-' + namespace)
      cy.executeCliCommand("gwa config set --namespace " + namespace)
    });
  })

  it('activates new namespace', () => {
    home.useNamespace(namespace)
  })

  it('creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      sa.createServiceAccount(checkPermission.serviceAccount.scopes)
    })
    sa.saveServiceAcctCreds()
  })

  it('publishes a new API to Kong Gateway', () => {
    cy.publishApi('service-permission-gwa.yml', namespace).then((response: any) => {
      expect(response.stdout).to.contain('Sync successful');
    })
  })

  it('creates as new product in the directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      pd.createNewProduct(checkPermission.product.name, checkPermission.product.environment.name)
    })
  })

  it('Associate Namespace to the organization Unit', () => {
    cy.get('@api').then(({ organization }: any) => {
      cy.setHeaders(organization.headers)
      cy.setAuthorizationToken(userSession)
      cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/' + organization.orgExpectedList.name + '/namespaces/' + namespace, 'PUT').then((response) => {
        expect(response.status).to.be.equal(200)
      })
    })
  })

  it('update the Dataset in BC Data Catelogue to appear the API in the Directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      pd.updateDatasetNameToCatelogue(checkPermission.product.name, checkPermission.product.environment.name)
    })
  })

  it('publish product to directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ checkPermission }: any) => {
      pd.editProductEnvironment(checkPermission.product.name, checkPermission.product.environment.name)
      pd.editProductEnvironmentConfig(checkPermission.product.environment.config)
      pd.generateKongPluginConfig(checkPermission.product.name, checkPermission.product.environment.name, 'service-permission.yml')
    })
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.replaceWordInJsonObject('ns.permission', 'ns.' + namespace, 'service-permission-plugin.yml')
    cy.replaceWordInJsonObject('ns.permission', 'ns.' + namespace, 'service-permission.yml')
    cy.publishApi('service-permission-plugin.yml', namespace).then((res: any) => {
      expect(res.stdout).to.contain('Sync successful');
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
