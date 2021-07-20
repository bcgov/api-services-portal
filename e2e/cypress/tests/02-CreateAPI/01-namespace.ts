import HomePage from '../../pageObjects/home'

describe('Namespace spec', () => {
  const home = new HomePage()
  beforeEach(() => {
    cy.visit('/')
    cy.preserveCookies()
    cy.fixture('api-owner').as('api-owner')
  })

  it('should allow user to login as API Owner', () => {
    cy.get('@api-owner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })
  it('should display namespaces dropdown', () => {
    cy.xpath(home.namespaceDropdown).should('be.visible')
  })

  it('should allow user to create a new namespace', () => {
    cy.get('@api-owner').then(({ namespace }: any) => {
      home.createNamespace(namespace)
    })
  })

  it('should allow user to switch to new namespace', () => {
    cy.get('@api-owner').then(({ namespace }: any) => {
      home.useNamespace(namespace)
    })
  })

  after(() => {
    cy.logout()
  })
})
