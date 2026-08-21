import keycloakGroupPage from '../../pageObjects/keycloakGroup'
import keycloakUsersPage from '../../pageObjects/keycloakUsers'

describe('Give a user org admin access at organization unit level', () => {
  const user = new keycloakUsersPage()
  const groups = new keycloakGroupPage()

  before(() => {
    cy.visit(Cypress.env('KEYCLOAK_URL'))
    cy.deleteAllCookies()
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/regen').as('regen')
    cy.fixture('admin').as('admin')
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('Authenticates Admin owner', () => {
    cy.get('@admin').then(({ user }: any) => {
      cy.keycloakLogin(user.credentials.username, user.credentials.password)
    })
  })

  it('Navigate to User Groups', () => {
    groups.visitGroups()
  })

  it('Add another org unit', () => {
    const parentPath = 'organization-admin/ca.bc.gov/ministry-of-health'
    const newGroupName = 'health-protection'

    let authToken = ''
    let baseUrl = ''

    // Capture admin bearer token from any admin API call
    cy.intercept('GET', '**/admin/realms/**', (req) => {
      const authHeader = req.headers['authorization']
      if (
        typeof authHeader === 'string' &&
        authHeader.startsWith('Bearer ')
      ) {
        authToken = authHeader.replace('Bearer ', '')
      }
      const baseUrlMatch = req.url.match(/^(https?:\/\/[^/]+)/)
      if (baseUrlMatch) {
        baseUrl = baseUrlMatch[1]
      }
      req.continue()
    }).as('adminApi')

    // Trigger an authenticated admin call from the Groups UI
    cy.get(groups.groupSearchInput, { timeout: 20000 })
      .first()
      .should('be.visible')
      .clear()
      .type('ministry-of-health')
      .type('{enter}')
    cy.wait('@adminApi', { timeout: 15000 })

    cy.then(() => {
      expect(authToken, 'Keycloak admin bearer token').to.be.a('string').and
        .not.be.empty
      expect(baseUrl, 'Keycloak base URL').to.be.a('string').and.not.be.empty

      // Resolve parent by path so we never create health-protection under the wrong group
      cy.request({
        method: 'GET',
        url: `${baseUrl}/auth/admin/realms/master/group-by-path/${parentPath}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      }).then((parentRes) => {
        expect(parentRes.status).to.eq(200)
        const parentGroupId = parentRes.body.id
        expect(parentGroupId, 'ministry-of-health group id').to.be.a('string')

        cy.request({
          method: 'POST',
          url: `${baseUrl}/auth/admin/realms/master/groups/${parentGroupId}/children`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: {
            name: newGroupName,
            description: '',
          },
          failOnStatusCode: false,
        }).then((createResponse) => {
          // 409 when the org unit already exists from a previous run
          expect(createResponse.status).to.be.oneOf([200, 201, 409])
          cy.log(
            `Create group ${newGroupName} under ${parentPath} -> ${createResponse.status}`
          )
        })
      })
    })
  })

  it('Navigate to Users Page', () => {
    user.visitUsers()
  })

  it('Search Wendy (Credential Issuer) from the user list', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      user.editUser(clientCredentials.Wendy.keycloakUsername)
    })
  })

  it('Navigate to Groups tab', () => {
    groups.openGroupsTab()
  })

  it('Leave existing org unit', () => {
    // From 02 Wendy is in ministry-of-health; on re-runs she may already be in health-protection
    groups.leaveGroupIfPresent('ministry-of-health')
    groups.leaveGroupIfPresent('health-protection')
  })

  it('Set the user(Wendy) to the Organization Unit', () => {
    groups.setUserToOrganization('health-protection')
  })

  after(() => {
    cy.keycloakLogout()
  })
})
