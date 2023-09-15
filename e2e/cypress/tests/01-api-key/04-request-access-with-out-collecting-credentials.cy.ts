import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'

describe('Request Access without colleting credential Spec', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const myAccessPage = new MyAccessPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
  })

  it('authenticates Harley (developer)', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Collect the credentials', () => {
    cy.visit(apiDir.path)
    cy.get('@developer').then(({ product, application,accessRequest }: any) => {
      apiDir.createAccessRequest(product, application, accessRequest)
    })
  })

  it('Close the popup without collecting credentials', () => {
    myAccessPage.closeRequestAccessPopUp()
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
