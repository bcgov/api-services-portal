import LoginPage from '../../pageObjects/login'
import NameSpacePage from '../../pageObjects/namespace'
const cleanedUrl = Cypress.env('BASE_URL').replace(/^http?:\/\//i, "");

// Elements of this page must be checked when there are no Gateways, so this test comes first of all
describe('Gateway Get Started page', () => {
  const login = new LoginPage()
  const ns = new NameSpacePage()
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
    })
  })
  
  it('Set token with gwa config command', () => {
    cy.exec('gwa config set --token ' + userSession, { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      expect(response.stdout).to.contain("Config settings saved")
    });
  })

  it('Set environment with gwa config command', () => {
    cy.executeCliCommand('gwa config set --host ' + cleanedUrl + ' --scheme http').then((response) => {
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

  it('Check for banner that says "You have gateways"', () => {
    cy.reload()
    cy.get('[data-testid="no-gateways"]').should('not.exist')
    cy.get('[data-testid="you-have-gateways-banner"]').should('exist')
  })

  it('Cleanup: delete namespace', () => {
    cy.deleteGatewayCli(namespace, true)
  })
  
  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})