import LoginPage from '../../pageObjects/login'
import NameSpacePage from '../../pageObjects/namespace'
let gateways: any

const { v4: uuidv4 } = require('uuid')
const customId = uuidv4().replace(/-/g, '').toLowerCase().substring(0, 3)

describe('My Gateways list page', () => { 
  const login = new LoginPage()
  const ns = new NameSpacePage()
  let userSession: any

  before(() => {
    cy.deleteAllCookies()
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

  it('create a set of namespaces', () => {
    cy.get('@common-testdata').then(({ myGateways }: any) => {
      gateways = myGateways
      Cypress._.forEach(gateways, (gateway) => {
        cy.createGateway(gateway.gatewayId + '-' + customId, gateway.displayName);
      });
    });
  });

  it('Verify My Gateways shows the created gateways', () => {
    cy.visit(ns.listPath)
    Cypress._.forEach(gateways, (gateway) => {
      cy.get(`[data-testid="ns-list-item-${gateway.gatewayId + '-' + customId}"]`)
        .should('contain.text', gateway.displayName)
    });
  })

  it('Cleanup: delete namespaces', () => {
    Cypress._.forEach(gateways, (gateway) => {
      cy.deleteGatewayCli(gateway.gatewayId + '-' + customId, false)
    });
  })
    



  // it('Verify My Gateways shows the created gateways', () => {
  //   cy.visit(ns.listPath)
  //   cy.get(`[data-testid="ns-list-item-${namespace}"]`)
  //   .should('contain.text', namespace1)
  // })
  // it('activates new namespace', () => {
  //   cy.activateGateway(namespace)
  // })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})