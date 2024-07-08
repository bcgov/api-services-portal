import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'


describe('Grant appropriate permissions to team members for client credential flow', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
  let userSession: any
  let namespace: string

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@apiowner').then(({ apiTest }: any) => {
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
    cy.exec('gwa gateway create --generate --host ' + cleanedUrl + ' --scheme http', { timeout: 5000, failOnNonZeroExit: false }).then((response) => {
      debugger
      assert.isNotNaN(response.stdout)
      namespace = response.stdout
      cy.replaceWordInJsonObject('ccplatform', namespace, 'cc-service-gwa.yml')
      cy.updateJsonValue('common-testdata.json', 'clientCredentials.namespace', namespace)
      // cy.updateJsonValue('apiowner.json', 'clientCredentials.clientIdSecret.product.environment.name.config.serviceName', 'cc-service-for-' + namespace)
      cy.executeCliCommand("gwa config set --gateway " + namespace)
    });
  })

  it('activates new namespace', () => {
    home.useNamespace(namespace)
  })


  it('Grant namespace access to access manager(Mark)', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(clientCredentials.Mark)
    })
  })

  it('Grant CredentialIssuer.Admin permission to credential issuer(Wendy)', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(clientCredentials.Wendy)
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
