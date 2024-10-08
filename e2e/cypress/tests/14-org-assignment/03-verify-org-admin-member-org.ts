import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NamespaceAccessPage from '../../pageObjects/namespaceAccess'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'

describe('Multiple Org Adming for the organization', () => {
  const home = new HomePage()
  const na = new NamespaceAccessPage()
  const pd = new Products()
  const sa = new ServiceAccountsPage()
  const apiDir = new ApiDirectoryPage()
  const login = new LoginPage()
  let userSession: any
  let namespace: any

  before(() => {
    cy.visit('/')
    cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })


  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@common-testdata').then(({ apiTest }: any) => {
      cy.getUserSessionTokenValue(apiTest.namespace, false).then((value) => {
        userSession = value
      })
    })
  })

  it('Set token with gwa config command', () => {
    cy.exec('gwa config set --token ' + userSession, { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      expect(response.stdout).to.contain("Config settings saved")
    });
  })

  it('create namespace', () => {
    cy.createGateway().then((response) => {
      namespace = response.gatewayId
      cy.log('New namespace created: ' + namespace)
      cy.updateJsonValue('common-testdata.json', 'orgAssignment.namespace', namespace)
      // cy.updateJsonValue('apiowner.json', 'clientCredentials.clientIdSecret.product.environment.name.config.serviceName', 'cc-service-for-' + namespace)
      cy.executeCliCommand("gwa config set --gateway " + namespace)
    });
  })

  it('activates new namespace', () => {
    cy.activateGateway(namespace)
  })


  it('creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ serviceAccount }: any) => {
      sa.createServiceAccount(serviceAccount.scopes)
    })
    sa.saveServiceAcctCreds()
  })

  it('creates as new product in the directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ orgAssignmentMultipleAdmin }: any) => {
      pd.createNewProduct(orgAssignmentMultipleAdmin.product.name, orgAssignmentMultipleAdmin.product.environment.name)
    })
  })

  it('Assign organization to the created namespace', () => {
    cy.visit(apiDir.path)
    cy.get('@apiowner').then(({ product }: any) => {
      apiDir.addOrganizationAndOrgUnit(product)
    })
  })

  it('Verify Ord Admins Members details in Organization group access ', () => {
    cy.visit(na.path)
    cy.wait(2000)
    na.clickOnOrganizationGroupAccess()
    cy.get('@apiowner').then(({ orgAssignmentMultipleAdmin }: any) => {
    na.checkMembersForGroupAccess(orgAssignmentMultipleAdmin.GroupAccess.members)
    })
  })

  after(() => {
    cy.logout()
  })
})
