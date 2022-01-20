import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'

<<<<<<< HEAD:e2e/cypress/tests/client-credential-flow/01-client-cred-team-access.ts

=======
>>>>>>> 5b71799c (Finishes JWKS URL test suite):e2e/cypress/tests/client-credential-flow/03-client-cred-team-access.spec.ts
describe('Grant appropriate permissions to team members for client credential flow', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.visit(login.path)
  })

  it('Authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Creates and activates new namespace', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      home.createNamespace(clientCredentials.namespace)
    })
  })

  it('Grant namespace access to access manager(Mark)', () => {
    cy.get('@apiowner').then(({ permission }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission(permission.Mark)
    })
  })

  it('Grant CredentialIssuer.Admin permission to API Owner', () => {
    cy.get('@apiowner').then(({ user, namespaceAccessPermissions }: any) => {
      cy.visit(na.path)
      na.clickGrantUserAccessButton()
      na.grantPermission({ userName: user.credentials.username, accessRole: namespaceAccessPermissions })
    })
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
