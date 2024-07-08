import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
const { _, $ } = Cypress

describe('Assign Access to existing user Spec', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()

  before(() => {
    cy.visit('/')
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    // cy.visit(login.path)
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ namespace }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.log('Logged in!')
        cy.activateGateway(namespace)
      })
    })
  })

  it('Navigate to Namespace Access Page', () => {
    cy.visit(na.path)
    cy.wait(2000)
  })

  it('Grant namespace access to Old User', () => {
    cy.get('@apiowner').then(({ grantPermission }: any) => {
      na.clickGrantUserAccessButton()
      na.grantPermission(grantPermission.OldUser)
    })
  })

  after(() => {
    cy.logout()
  })
})

describe('Authernticate with old user to initiate migration', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()

  before(() => {
    cy.visit('/')
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('usermigration').as('usermigration')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    // cy.visit(login.path)
  })

  it('authenticates with old user', () => {
    cy.get('@usermigration').then(({ oldUser }: any) => {
      cy.get('@common-testdata').then(({ namespace }: any) => {
        cy.login(oldUser.credentials.username, oldUser.credentials.password)
        cy.log('Logged in!')
        cy.activateGateway(namespace)
      })
    })
  })

  after(() => {
    cy.logout()
  })
})

describe('Verify that permission of old user is migrated to new user', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
  let userScopes: any

  before(() => {
    cy.visit('/')
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('usermigration').as('usermigration')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('authenticates with new user', () => {
    cy.get('@usermigration').then(({ newUser }: any) => {
      cy.login(newUser.credentials.username, newUser.credentials.password)
      cy.log('Logged in!')
    })
  })

  // it('activates new namespace', () => {
  //   cy.get('@apiowner').then(({ namespace }: any) => {
  //     cy.activateGateway(namespace)
  //   })
  // })

  it('Get the permission of the user', () => {
    cy.getUserSession().then(() => {
      cy.get('@common-testdata').then(({ namespace }: any) => {
        cy.activateGateway(namespace)
        cy.get('@login').then(function (xhr: any) {
          userScopes = xhr.response.body.user.scopes
        })
      })
    })
  })

  it('Verify that user scopes are same as permissions given to old users', () => {
    cy.get('@apiowner').then(({ grantPermission }: any) => {
      Cypress._.isEqual(grantPermission.OldUser, userScopes)
    })
  })

  after(() => {
    cy.logout()
  })
})

describe('Verify that old user is no longer able to sign in', () => {
  const login = new LoginPage()
  const home = new HomePage()
  const na = new NamespaceAccessPage()
  let userScopes: any

  before(() => {
    cy.visit('/')
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('usermigration').as('usermigration')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    // cy.visit(login.path)
  })

  it('authenticates with old user', () => {
    cy.get('@usermigration').then(({ oldUser }: any) => {
      cy.login(oldUser.credentials.username, oldUser.credentials.password, true)
    })
  })

  it('Verify that user account is disabled', () => {
    login.checkUnsuccessfulSignIn()
  })

  after(() => {
  })
})
