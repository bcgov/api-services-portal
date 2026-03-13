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
    cy.wait(2000)
    cy.get('[id=nav-toggle').click()
    cy.contains('Groups').click()
    cy.get('[id=nav-toggle').click()
  })

  it('Add another org unit', () => {
    const parentGroupName = 'ministry-of-health'
    const newGroupName = 'health-protection'
    
    let authToken: string = ''
    let parentGroupId: string = ''
    let baseUrl: string = ''
    
    // Intercept API calls to capture Bearer token from request headers
    cy.intercept('GET', '**/groups/**', (req) => {
      if (req.headers['authorization']) {
        const authHeader = req.headers['authorization'] as string
        if (authHeader.startsWith('Bearer ')) {
          authToken = authHeader.replace('Bearer ', '')
        }
      }
      req.continue()
    }).as('groupsApi')
    
    // Navigate to groups and click on parent group to trigger API call
    cy.get('[data-testid="table-search-input"]').type(parentGroupName).type('{enter}')
    cy.get('button').contains(parentGroupName).click({ force: true })
    
    // Wait for API call and extract group ID and base URL from intercepted request
    cy.wait('@groupsApi', { timeout: 10000 }).then((interception: any) => {
      const url = interception.request.url
      // Extract group ID from URL: /groups/{id}/children
      const groupIdMatch = url.match(/\/groups\/([a-f0-9-]+)/)
      if (groupIdMatch && groupIdMatch[1]) {
        parentGroupId = groupIdMatch[1]
      }
      
      // Extract base URL from intercepted request (e.g., http://keycloak.localtest.me:9081)
      const baseUrlMatch = url.match(/^(https?:\/\/[^\/]+)/)
      if (baseUrlMatch && baseUrlMatch[1]) {
        baseUrl = baseUrlMatch[1]
      }
    })
    
    // Create the child group via API
    cy.then(() => {
      if (!authToken) {
        throw new Error('Could not retrieve Bearer token')
      }
      
      if (!parentGroupId) {
        throw new Error(`Could not find parent group ID for ${parentGroupName}`)
      }
      
      if (!baseUrl) {
        throw new Error('Could not extract base URL from intercepted request')
      }
      
      // Construct API URL using base URL from intercepted request
      const apiUrl = `${baseUrl}/auth/admin/realms/master/groups/${parentGroupId}/children`
      
      cy.request({
        method: 'POST',
        url: apiUrl,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          name: newGroupName,
          description: ''
        }
      }).then((createResponse) => {
        expect(createResponse.status).to.be.oneOf([200, 201])
        cy.log(`Successfully created group ${newGroupName} via API`)
      })
    })
  })

  it('Navigate to Users Page', () => {
    cy.wait(2000)
    cy.get('[id=nav-toggle').click()
    cy.contains('Users').click()
    cy.get('[id=nav-toggle').click()
  })

  it('Search Wendy (Credential Issuer) from the user list', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      user.editUser(clientCredentials.Wendy.keycloakUsername)
    })
  })

  it('Navigate to Groups tab', () => {
    cy.get(user.groupsTab).click({ force: true })
  })

  it('Leave existing org unit', () => {
    user.leaveGroup('ministry-of-health')
  })

  it('Set the user(Wendy) to the Organization Unit', () => {
    user.setUserToOrganization('health-protection')
  })

  after(() => {
    cy.keycloakLogout()
  })

})