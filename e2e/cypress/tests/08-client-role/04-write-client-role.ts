import LoginPage from '../../pageObjects/login'
import ApplicationPage from '../../pageObjects/applications'
import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import MyAccessPage from '../../pageObjects/myAccess'
import HomePage from '../../pageObjects/home'
import ConsumersPage from '../../pageObjects/consumers'

describe('Developer creates an access request for Client ID/Secret authenticator to verify write role', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const ma = new MyAccessPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    // cy.visit(login.path)
  })

  it('Developer logs in', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Creates an application', () => {
    cy.visit(app.path)
    cy.get('@developer').then(({ clientCredentials }: any) => {
      app.createApplication(clientCredentials.clientIdSecret_writeRole.application)
    })
  })

  it('Creates an access request', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ clientCredentials, accessRequest }: any) => {
      let product = clientCredentials.clientIdSecret_writeRole.product
      let app = clientCredentials.clientIdSecret_writeRole.application

      apiDir.createAccessRequest(product, app, accessRequest)
      ma.clickOnGenerateSecretButton()

      cy.contains('Client ID').should('be.visible')
      cy.contains('Client Secret').should('be.visible')
      cy.contains('Token Endpoint').should('be.visible')

      ma.saveClientCredentials()
    })
  })

  after(() => {
    cy.logout()
  })
})

describe('Access manager apply "Write" role and approves developer access request', () => {
  const home = new HomePage()
  const login = new LoginPage()
  const consumers = new ConsumersPage()

  before(() => {
    cy.visit('/')
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    // cy.visit(login.path)
  })

  it('Access Manager logs in', () => {
    cy.get('@access-manager').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ clientCredentials }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        home.useNamespace(clientCredentials.namespace)
      })
    })
  })

  it('Access Manager approves developer access request', () => {
    cy.get('@access-manager').then(() => {
      cy.visit(consumers.path)
      consumers.reviewThePendingRequest()
    })
  })

  it('Select "Write" roles in Authorization Tab', () => {
    cy.get('@access-manager').then(({ clientIdSecret_writeRole }: any) => {
      consumers.selectClientRole(clientIdSecret_writeRole.authProfile.roles)
    })
  })

  it('approves an access request', () => {
    consumers.approvePendingRequest()
  })

  after(() => {
    cy.logout()
  })
})

describe('Update Kong plugin and verify that only only PUT and POST methods are allowed for Read role', () => {
  beforeEach(() => {
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('Set allowed methods "PUT" and "POST" in kong plugin ', () => {
    const roles = [
      "PUT", "POST"
    ]
    cy.updatePropertiesOfPluginFile('cc-service-plugin.yml', 'methods', roles)
  })
  it('Set authorization roles in plugin file', () => {
    const authProfile = [
      'cypress-auth-profile:write'
    ]
    cy.updatePropertiesOfPluginFile('cc-service-plugin.yml', 'client_roles', authProfile)
  })
  it('Set allowed audience in plugin file', () => {
    cy.updatePropertiesOfPluginFile('cc-service-plugin.yml', 'allowed_aud', 'cypress-auth-profile')
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.get('@common-testdata').then(({ clientCredentials }: any) => {
      cy.publishApi('cc-service-plugin.yml', clientCredentials.namespace, true).then(() => {
        // cy.get('@publishAPIResponse').then((res: any) => {
        //   cy.log(JSON.stringify(res.body))
        //   expect(res.body.message).to.contains("Sync successful")
        // })
      })
    })
  })

  it('Make "GET" call and verify that Kong does not allow user to access the resources', () => {
    cy.makeKongGatewayRequestUsingClientIDSecret('cc-service-for-platform.api.gov.bc.ca').then((response) => {
      cy.log(response)
      expect(response.status).to.be.equal(404)
      expect(response.body.message).to.be.contains("no Route matched with those values")
    })
  })

  it('Make "POST" call and verify that Kong allows user to access the resources', () => {
    cy.makeKongGatewayRequestUsingClientIDSecret('cc-service-for-platform.api.gov.bc.ca', 'POST').then((response) => {
      cy.log(response)
      expect(response.status).to.be.equal(405)
    })
  })

  it('Make "PUT" call and verify that Kong allows user to access the resources', () => {
    cy.makeKongGatewayRequestUsingClientIDSecret('cc-service-for-platform.api.gov.bc.ca', 'PUT').then((response) => {
      cy.log(response)
      expect(response.status).to.be.equal(405)
    })
  })

})