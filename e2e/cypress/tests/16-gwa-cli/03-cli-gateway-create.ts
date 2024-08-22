import NameSpacePage from '../../pageObjects/namespace'

const { v4: uuidv4 } = require('uuid')
let cli = require("../../fixtures/test_data/gwa-cli.json")

let userSession: any
let gatewayId: string
let displayName: string
let customId: string

var cleanedUrl = Cypress.env('BASE_URL').replace(/^http?:\/\//i, "");

describe('Verify "gateway create" and "gateway list" commands', () => {   
  const ns = new NameSpacePage()
  customId = uuidv4().replace(/-/g, '').toLowerCase().substring(0, 3)

  before(() => {
    cy.deleteAllCookies()
    cy.reload(true)
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

  it('create gateway - id and display name provided', () => {
    cy.get('@common-testdata').then(({ myGateways }: any) => {
      gatewayId = myGateways["namespace1"].gatewayId + '-' + customId
      displayName = myGateways["namespace1"].displayName
      cy.executeCliCommand('gwa gateway create --gateway-id ' + gatewayId + ' --display-name ' + displayName + ' --host ' + cleanedUrl + ' --scheme http').then((response) => {
        assert.isNotNaN(response.stdout)
        const gatewayIdMatch = response.stdout.match(/Gateway ID: ([\w-]+)/);
        if (gatewayIdMatch && gatewayIdMatch[1]) {
            const gatewayIdResult = gatewayIdMatch[1];
            assert.equal(gatewayIdResult, gatewayId);
        } else {
            throw new Error('Failed to extract Gateway ID from response: ' + response.stdout);
        }
        const displayNameMatch = response.stdout.match(/display name: ([\w-]+)/); 
        if (displayNameMatch && displayNameMatch[1]) {
            const displayNameResult = displayNameMatch[1];
            assert.equal(displayNameResult, displayName);
        } else {
            throw new Error('Failed to extract Display Name from response: ' + response.stdout);
        }
      });
      // Verify the created gateway in Portal
      cy.visit(ns.listPath)
      cy.get(`[data-testid="ns-list-item-${gatewayId}"]`)
        .should('contain.text', gatewayId)
        .should('contain.text', displayName)
    });
  });

  it('verify gateway list command', () => {
    cy.executeCliCommand('gwa gateway list').then((response) => {
      assert.isNotNaN(response.stdout)
      assert.isTrue(response.stdout.includes(gatewayId), `The output should include the gateway ID: ${gatewayId}`)
      assert.isTrue(response.stdout.includes(displayName), `The output should include the display name: ${displayName}`)
    });
    cy.deleteGatewayCli(gatewayId, false)
  });

  it('create gateway - id provided', () => {
    cy.get('@common-testdata').then(({ myGateways }: any) => {
      gatewayId = myGateways["namespace2"].gatewayId + '-' + customId
      displayName = "janis's Gateway"
      cy.executeCliCommand('gwa gateway create --gateway-id ' + gatewayId + ' --host ' + cleanedUrl + ' --scheme http').then((response) => {
        assert.isNotNaN(response.stdout)
        const gatewayIdMatch = response.stdout.match(/Gateway ID: ([\w-]+)/);
        if (gatewayIdMatch && gatewayIdMatch[1]) {
            const gatewayIdResult = gatewayIdMatch[1];
            assert.equal(gatewayIdResult, gatewayId);
        } else {
            throw new Error('Failed to extract Gateway ID from response: ' + response.stdout);
        }
      });
      // Verify the created gateway
      cy.visit(ns.listPath)
      cy.get(`[data-testid="ns-list-item-${gatewayId}"]`)
        .should('contain.text', gatewayId)
        .should('contain.text', displayName)
      cy.deleteGatewayCli(gatewayId, false)
    });
  });

  it('create gateway - display name provided', () => {
    cy.get('@common-testdata').then(({ myGateways }: any) => {
      let generatedGatewayId: string
      displayName = myGateways["namespace3"].displayName
      cy.executeCliCommand('gwa gateway create --display-name ' + displayName + ' --host ' + cleanedUrl + ' --scheme http').then((response) => {
        assert.isNotNaN(response.stdout)
        const gatewayIdMatch = response.stdout.match(/Gateway ID: ([\w-]+)/);
        generatedGatewayId = gatewayIdMatch[1];
        const displayNameMatch = response.stdout.match(/display name: ([\w-]+)/); 
        if (displayNameMatch && displayNameMatch[1]) {
            const displayNameResult = displayNameMatch[1];
            assert.equal(displayNameResult, displayName);
        } else {
            throw new Error('Failed to extract Display Name from response: ' + response.stdout);
        }
        // Verify the created gateway
        cy.visit(ns.listPath)
        cy.get(`[data-testid="ns-list-item-${generatedGatewayId}"]`)
          .should('contain.text', generatedGatewayId)
          .should('contain.text', displayName)
        cy.deleteGatewayCli(generatedGatewayId, false)
      });
    });
  });

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
