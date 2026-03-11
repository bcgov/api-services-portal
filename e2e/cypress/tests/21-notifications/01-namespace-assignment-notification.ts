import LoginPage from '../../pageObjects/login'

const { v4: uuidv4 } = require('uuid')

describe('Notification Service - Namespace Assignment Emails', () => {
  const login = new LoginPage()
  let namespace: string
  let displayName: string
  let orgName: string
  let orgUnitName: string
  const orgAdminEmail = 'benny@test.com'

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload(true)
    cy.resetState()
    // Clear all emails from Mailpit before tests
    cy.mailpitDeleteAllMessages()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.visit(login.path)
  })

  after(() => {
    cy.logout()
  })

  describe('When a namespace is assigned to an organization', () => {
    it('authenticates Janis (api owner)', () => {
      cy.get('@apiowner').then(({ user }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
      })
    })

    it('creates an organization with org admin', () => {
      const datasetId = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 4)
      orgName = `ministry-of-notifications-${datasetId}`
      orgUnitName = `division-of-testing-${datasetId}`

      const org = {
        name: orgName,
        title: 'Ministry of Notifications',
        description: 'Organization for testing notification emails',
        tags: [],
        orgUnits: [
          {
            name: orgUnitName,
            title: 'Division of Testing',
            description: 'Division for testing notification emails',
            tags: [],
            extForeignKey: `division-of-testing-${datasetId}`,
            extSource: 'internal',
            extRecordHash: '',
          },
        ],
        extSource: 'internal',
        extRecordHash: '',
      }

      cy.setHeaders({ 'Content-Type': 'application/json' })
      cy.setRequestBody(org)
      cy.callAPI('ds/api/v3/organizations/ca.bc.gov', 'PUT').then(
        ({ apiRes: { status } }: any) => {
          expect(status).to.be.equal(200)
        }
      )

      // Set permissions for the new Org with org admin
      const orgAccess = {
        name: orgName,
        parent: `/ca.bc.gov`,
        members: [
          {
            member: {
              email: orgAdminEmail,
            },
            roles: ['organization-admin'],
          },
        ],
      }
      cy.setRequestBody(orgAccess)
      cy.callAPI('ds/api/v3/organizations/ca.bc.gov/access', 'PUT').then(
        ({ apiRes: { status } }: any) => {
          expect(status).to.be.equal(204)
        }
      )

      // Set permissions for the new Org Unit with org admin
      const orgUnitAccess = {
        name: orgUnitName,
        parent: `/ca.bc.gov/${orgName}`,
        members: [
          {
            member: {
              email: orgAdminEmail,
            },
            roles: ['organization-admin'],
          },
        ],
      }
      cy.setRequestBody(orgUnitAccess)
      cy.callAPI('ds/api/v3/organizations/ca.bc.gov/access', 'PUT').then(
        ({ apiRes: { status } }: any) => {
          expect(status).to.be.equal(204)
        }
      )
    })

    it('creates a new namespace', () => {
      cy.createGateway().then((response: any) => {
        namespace = response.gatewayId
        displayName = response.displayName
        cy.log('New namespace created: ' + namespace)
      })
    })

    it('activates the namespace', () => {
      cy.activateGateway(namespace)
    })

    it('assigns the namespace to the organization via UI', () => {
      // Navigate directly to the gateway detail page to access namespace organization assignment
      cy.visit(`/manager/gateways/detail`)
      cy.wait(2000)

      // Click "Add Organization" button to open the modal
      cy.contains('button', 'Add Organization').click()
      cy.wait(1000)

      // Select the organization from the dropdown
      cy.get('[data-testid="orgDropDown"]').select(orgName)
      cy.wait(1000)

      // Select the organization unit from the dropdown
      cy.get('[data-testid="orgUnitDropDown"]').select(orgUnitName)

      // Click the Add button to submit
      cy.get('[data-testid="addOrganizationBtn"]').click()

      // Wait for the success toast/notification
      cy.contains('Gateway updated', { timeout: 10000 }).should('be.visible')
    })

    it('sends a notification email to the organization admin', () => {
      // Wait for the email to arrive (namespace assignment triggers async email)
      cy.mailpitWaitForEmail(
        `to:${orgAdminEmail} subject:"New Namespace Approval"`,
        15000
      ).then((message) => {
        // Verify email properties
        expect(message.Subject).to.include('New Namespace Approval')
        expect(message.Subject).to.include(namespace)
        expect(message.To[0].Address).to.eq(orgAdminEmail)
        expect(message.From.Address).to.eq('noreply@api.gov.bc.ca')
      })
    })

    it('verifies the notification email content', () => {
      cy.mailpitSearchMessages(
        `to:${orgAdminEmail} subject:"New Namespace Approval"`
      ).then((result) => {
        expect(result.messages.length).to.be.greaterThan(0)

        const messageId = result.messages[0].ID
        cy.mailpitGetMessage(messageId).then((details) => {
          // Verify HTML content contains expected text
          expect(details.HTML).to.include('Dear')
          expect(details.HTML).to.include(
            'You are identified as an organization administrator'
          )
          expect(details.HTML).to.include('APS Team')
        })
      })
    })
  })

  describe('Email can be searched and filtered', () => {
    it('finds email by recipient', () => {
      cy.mailpitAssertEmail({
        to: orgAdminEmail,
        subject: 'New Namespace Approval',
      })
    })

    it('finds email by subject content', () => {
      cy.mailpitSearchMessages(`subject:"${namespace}"`).then((result) => {
        expect(result.messages.length).to.be.greaterThan(0)
        expect(result.messages[0].Subject).to.include(namespace)
      })
    })

    it('finds email by sender', () => {
      cy.mailpitSearchMessages('from:noreply@api.gov.bc.ca').then((result) => {
        expect(result.messages.length).to.be.greaterThan(0)
        expect(result.messages[0].From.Address).to.eq('noreply@api.gov.bc.ca')
      })
    })
  })

  describe('Cleanup', () => {
    it('deletes all test emails from Mailpit', () => {
      cy.mailpitDeleteAllMessages()
      cy.mailpitGetMessages().then((result) => {
        expect(result.messages.length).to.eq(0)
      })
    })
  })
})
