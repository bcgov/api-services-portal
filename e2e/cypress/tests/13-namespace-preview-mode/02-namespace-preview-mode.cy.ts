import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import AuthorizationProfile from '../../pageObjects/authProfile'
import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import { consumers } from 'stream'
import Products from '../../pageObjects/products'

describe('Verify Products when namespace in Preview Mode', () => {
  const pd = new Products()
  const home = new HomePage()
  const apiDir = new ApiDirectoryPage()
  const authProfile = new AuthorizationProfile()
  let userSession: string
  var nameSpace: string

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('credential-issuer').as('credential-issuer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('developer').as('developer')
    cy.fixture('api').as('api')
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('authenticates Janis (api owner)', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ namespacePreview }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.log('Logged in!')
        cy.activateGateway(namespacePreview.namespace)
      })
    })
  })


  it('Navigate to API Directory Page ', () => {
    cy.visit(apiDir.path)
  })


  it('Verify that created Product is not displayed under API Directory', () => {
    cy.get('@apiowner').then(({ namespacePreview }: any) => {
      let product = namespacePreview.product.name
      apiDir.isProductDisplay(product, true)
    })
  })

  it('Navigate to Your Product tab in API Directory page', () => {
    apiDir.navigateToYourProduct()
  })

  it('Verify that the banner for Preview mode is displayed', () => {
    cy.get('@apiowner').then(({ namespacePreview }: any) => {
      let product = namespacePreview.product.name
      apiDir.selectProduct(product)
    })
  })


  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})