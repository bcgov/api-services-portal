import NameSpacePage from '../../pageObjects/namespace'
import ApiDirectoryPage from '../../pageObjects/apiDirectory'
let gateways: any
let gateway1: any

const { v4: uuidv4 } = require('uuid')
const customId = uuidv4().replace(/-/g, '').toLowerCase().substring(0, 3)

describe('Gateway selector dropdown', () => { 
  const ns = new NameSpacePage()
  const ad = new ApiDirectoryPage()
  let userSession: any

  before(() => {
    cy.deleteAllCookies()
    cy.clearLocalStorage({ log: true })
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
      gateway1 = gateways["namespace1"]
      Cypress._.forEach(gateways, (gateway) => {
        cy.createGateway(gateway.gatewayId + '-' + customId, gateway.displayName);
      });
    });
  });

  it('Verify dropdown shows the total number of gateways', () => {
    cy.visit(ad.yourProductsPath)
    cy.get('[data-testid="ns-dropdown-btn"]').should('contain.text', "No Active Gateway")
    cy.get('[data-testid="ns-dropdown-btn"]').click()
    cy.get('[data-testid="ns-dropdown-total-gateways"]').should('contain.text', `You have 4 gateways in total`)
  })

  it('Check Gateway button activates the Gateway', () => {  
    cy.visit(ad.yourProductsPath)
    cy.get('[data-testid="ns-dropdown-btn"]').click()
    cy.get(`[data-testid="ns-dropdown-item-${gateways["namespace1"].gatewayId + '-' + customId}"]`).click()
    cy.get('h1').should('contain.text', gateways["namespace1"].displayName)   
  
    cy.visit(ns.detailPath)
    cy.url().should('include', '/manager/gateways/detail')
    cy.get('[data-testid="ns-detail-gateway-display-name"]').should('contain.text', gateways["namespace1"].displayName)
  })

  it('Recently used gateways are shown in the dropdown', () => {
    cy.visit(ns.listPath)
    cy.get(`[data-testid="ns-list-activate-link-${gateways["namespace1"].gatewayId + '-' + customId}"]`).click()
    cy.get('[data-testid="ns-dropdown-btn"]').click()
    cy.get(`[data-testid="ns-dropdown-item-${gateways["namespace2"].gatewayId + '-' + customId}"]`).click()
    cy.get('[data-testid="ns-dropdown-btn"]').click()
    cy.get('[data-testid="ns-dropdown-heading"]').should('contain.text', "Recently viewed")
    cy.get(`[data-testid="ns-dropdown-item-${gateways["namespace1"].gatewayId + '-' + customId}"]`).should('exist')
    cy.get(`[data-testid="ns-dropdown-item-${gateways["namespace2"].gatewayId + '-' + customId}"]`).should('not.exist')
    cy.get(`[data-testid="ns-dropdown-item-${gateways["namespace3"].gatewayId + '-' + customId}"]`).should('not.exist')
  })

  it('Test search - find results', () => {
    cy.visit(ns.listPath)
    cy.get(`[data-testid="ns-list-activate-link-${gateways["namespace2"].gatewayId + '-' + customId}"]`).click()
    cy.visit(ns.listPath)
    cy.get(`[data-testid="ns-list-activate-link-${gateways["namespace3"].gatewayId + '-' + customId}"]`).click()

    cy.get('[data-testid="ns-dropdown-btn"]').click()
    cy.get('[data-testid="ns-dropdown-search-input"]').type(gateway1.displayName)
    cy.get(`[data-testid="ns-dropdown-item-${gateways["namespace1"].gatewayId + '-' + customId}"]`).should('exist')
    cy.get(`[data-testid="ns-dropdown-item-${gateways["namespace2"].gatewayId + '-' + customId}"]`).should('not.exist')
    cy.get(`[data-testid="ns-dropdown-item-${gateways["namespace3"].gatewayId + '-' + customId}"]`).should('not.exist')
    cy.get('[data-testid="ns-dropdown-search-input"]').clear()
    cy.get(`[data-testid="ns-dropdown-item-${gateways["namespace2"].gatewayId + '-' + customId}"]`).should('exist')
  })

  it('Test filter - do not find results', () => {
    cy.visit(ns.listPath)
    cy.get(`[data-testid="ns-list-activate-link-${gateways["namespace1"].gatewayId + '-' + customId}"]`).click()

    cy.get('[data-testid="ns-dropdown-btn"]').click()
    cy.get('[data-testid="ns-dropdown-search-input"]').type('gibberish')
    cy.get(`[data-testid="ns-dropdown-item-${gateways["namespace1"].gatewayId + '-' + customId}"]`).should('not.exist')
    cy.get('[data-testid="ns-dropdown-no-results-box"]').should('exist')
  })
    
  it('Cleanup: delete namespaces', () => {
    Cypress._.forEach(gateways, (gateway) => {
      cy.deleteGatewayCli(gateway.gatewayId + '-' + customId, false)
    });
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})