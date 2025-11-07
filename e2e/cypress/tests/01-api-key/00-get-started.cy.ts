import LoginPage from '../../pageObjects/login'
import NameSpacePage from '../../pageObjects/namespace'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'
const cleanedUrl = Cypress.env('BASE_URL').replace(/^https?:\/\//i, "");

// Elements of this page must be checked when there are no Gateways, so this test comes first of all
describe('Gateway Get Started page', () => {
  const login = new LoginPage()
  const ns = new NameSpacePage()
  const sa = new ServiceAccountsPage()
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
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.getUserSessionTokenValue('', false).then((value) => {
      userSession = value
      cy.log('User session token: ' + userSession)
    })
  })

  it('Set environment with gwa config command', () => {
    cy.executeCliCommand('gwa config set --host ' + cleanedUrl + ' --scheme httpss').then((response) => {
      expect(response.stdout).to.contain("Config settings saved")
    });
  })

  it('Check for redirect to Get Started page', () => {
    cy.visit(ns.path)
    cy.url().should('include', '/manager/gateways/get-started')
  })

  it('Check for box that says "No gateways"', () => {
    cy.get('[data-testid="no-gateways"]').should('exist')
  })

  it('Create a namespace', () => {
    cy.createGateway().then((response) => {
      namespace = response.gatewayId
    })
  })
  
  it('activate gateway', () => {
    cy.activateGateway(namespace)
  })

  it('creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ serviceAccount }: any) => {
      sa.createServiceAccount(serviceAccount.scopes)
      cy.wait(6000)
    })
    sa.saveServiceAcctCreds()
  })

  it('Login to gwa with service account', () => {
    cy.exec('gwa login --client-id ' + sa.clientId + ' --client-secret ' + sa.clientSecret, { timeout: 3000, failOnNonZeroExit: false })
  })

  it('Cleanup: delete namespace', () => {
    cy.visit(ns.path).then(() => {
      cy.deleteGatewayUI(namespace)
    })
  })
  
  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})