import { report } from 'process'
import NameSpacePage from '../../pageObjects/namespace'
let gateways: any

const { v4: uuidv4 } = require('uuid')
const customId = uuidv4().replace(/-/g, '').toLowerCase().substring(0, 3)

describe('My Gateways list page', () => { 
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
      gateways["namespace1"] = gateways["namespace1"]
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

  it('Check Gateway link goes to details page', () => {  
    cy.visit(ns.listPath)
    cy.get(`[data-testid="ns-list-activate-link-${gateways["namespace1"].gatewayId + '-' + customId}"]`).click()
    cy.url().should('include', '/manager/gateways/detail')
  })

  it('Test search - find results', () => {
    cy.visit(ns.listPath)
    cy.get('[data-testid="ns-search-input"]').type(gateways["namespace1"].displayName)
    cy.get(`[data-testid="ns-list-item-${gateways["namespace1"].gatewayId + '-' + customId}"]`).should('exist')
    cy.get(`[data-testid="ns-list-item-${gateways["namespace2"].gatewayId + '-' + customId}"]`).should('not.exist')
    cy.get('[data-testid="ns-search-input"]').clear()
    cy.get(`[data-testid="ns-list-item-${gateways["namespace2"].gatewayId + '-' + customId}"]`).should('exist')
  })

  it('Test search - do not find results', () => {
    cy.visit(ns.listPath)
    cy.get('[data-testid="ns-search-input"]').type('gibberish')
    cy.get(`[data-testid="ns-list-item-${gateways["namespace1"].gatewayId + '-' + customId}"]`).should('not.exist')
    cy.get('[data-testid="ns-no-results-text"]').should('exist')
  })

  it('Test filter - find results', () => {
    cy.visit(ns.listPath)
    cy.get('[data-testid="ns-filter-select"]').select('disabled')
    cy.get(`[data-testid="ns-list-item-${gateways["namespace1"].gatewayId + '-' + customId}"]`).should('exist')
  })

  it('Test filter - do not find results', () => {
    cy.visit(ns.listPath)
    cy.get('[data-testid="ns-filter-select"]').select('pending')
    cy.get(`[data-testid="ns-list-item-${gateways["namespace1"].gatewayId + '-' + customId}"]`).should('not.exist')
  })

  it('Test filter and search together', () => {
    cy.visit(ns.listPath)
    cy.get('[data-testid="ns-filter-select"]').select('disabled')
    cy.get('[data-testid="ns-search-input"]').type(gateways["namespace1"].displayName)
    cy.get(`[data-testid="ns-list-item-${gateways["namespace1"].gatewayId + '-' + customId}"]`).should('exist')
  })

  it('Export Gateway Report', () => {
    cy.visit(ns.listPath)
    cy.get('[data-testid="ns-report-btn"]').click()
    cy.get('[data-testid="export-report-select-all-check"]').click()
    cy.get('[data-testid="export-report-export-btn"]').click()
    // check that the report is downloaded
    const filePath = 'cypress/downloads/gateway-report.xlsx'
    cy.readFile(filePath, 'binary', { timeout: 10000 }).then((fileContent) => {
      expect(fileContent.length).to.be.greaterThan(0);
    });
  });
    
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