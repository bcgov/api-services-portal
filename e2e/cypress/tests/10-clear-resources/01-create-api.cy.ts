import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'

describe('Create API Spec for Delete Resources', () => {
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
    // cy.resetState()
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

  it('create namespace', () => {
    cy.createGateway().then((response) => {
      namespace = response.gatewayId
      cy.log('New namespace created: ' + namespace)
      cy.replaceWordInJsonObject('ns.deleteplatform', 'ns.' + namespace, 'service-clear-resources-gwa.yml')
      cy.updateJsonValue('common-testdata.json', 'deleteResources.namespace', namespace)
      // cy.updateJsonValue('apiowner.json', 'clientCredentials.clientIdSecret.product.environment.name.config.serviceName', 'cc-service-for-' + namespace)
      cy.executeCliCommand("gwa config set --gateway " + namespace)
    });
  })

  it('activates new namespace', () => {
    cy.activateGateway(namespace)
  })

  it('creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ serviceAccount }: any) => {
      sa.createServiceAccount(serviceAccount.scopes)
    })
    sa.saveServiceAcctCreds()
  })

  it('publishes a new API to Kong Gateway', () => {
    cy.get('@common-testdata').then(({ deleteResources }: any) => {
      cy.publishApi('service-clear-resources-gwa.yml', namespace).then((response: any) => {
        expect(response.stdout).to.contain('Sync successful');
      })
    })
  })

  it('creates as new product in the directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ deleteResources }: any) => {
      pd.createNewProduct(deleteResources.product.name, deleteResources.product.environment.name)
    })
  })

  it('Associate Namespace to the organization Unit', () => {
    cy.get('@api').then(({ organization }: any) => {
      cy.setHeaders(organization.headers)
      cy.setAuthorizationToken(userSession)
      cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/' + organization.orgExpectedList.name + '/gateways/' + namespace, 'PUT').then((response:any) => {
        expect(response.apiRes.status).to.be.equal(200)
      })
    })
  })

  it('update the Dataset in BC Data Catelogue to appear the API in the Directory', () => {

    cy.visit(pd.path)
    cy.get('@apiowner').then(({ deleteResources }: any) => {
      pd.updateDatasetNameToCatelogue(deleteResources.product.name, deleteResources.product.environment.name)
    })
  })

  it('publish product to directory', () => {
    cy.visit(sa.path)
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ deleteResources }: any) => {
      pd.editProductEnvironment(deleteResources.product.name, deleteResources.product.environment.name)
      pd.editProductEnvironmentConfig(deleteResources.product.environment.config, false, false)
      pd.generateKongPluginConfig(deleteResources.product.name, deleteResources.product.environment.name, 'service-clear-resources.yml')
    })
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.get('@apiowner').then(({ deleteResources }: any) => {
      cy.replaceWordInJsonObject('ns.deleteplatform', 'ns.' + namespace, 'service-clear-resources-plugin.yml')
      cy.publishApi('service-clear-resources-plugin.yml', namespace).then((response: any) => {
        expect(response.stdout).to.contain('Sync successful');
      })
    })
  })

  it('activate the service for Dev environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ deleteResources }: any) => {
      pd.activateService(deleteResources.product.name, deleteResources.product.environment.name, deleteResources.product.environment.config)
      cy.wait(3000)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
