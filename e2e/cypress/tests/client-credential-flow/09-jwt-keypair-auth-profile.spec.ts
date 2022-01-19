import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import AuthorizationProfile from '../../pageObjects/authProfile'
import Products from '../../pageObjects/products'

/*
QUESTIONS

- Verify iDP issuer URL: http://keycloak.localtest.me:9080/auth/realms/master/protocol/openid-connect/certs
- Should Client Registration be Managed? If so can same client ID and Secret as ID and Secret flow be used?
  - According to video below a cert is generated so no need for client id and secret
  - What happens to the private key file?
*/

/*
NOTES:

- Overview of signed JWT using keycloak: https://www.youtube.com/watch?v=blv_nuONnTw
  - Creating a client
  - Client scopes
  - Creating key pairs

TEST CASES
- First create a new client in keycloak
  - (??) under credentials:
    - select Signed JWT
    - signature algorithm = RS256
    - JWKS URL = off
    - Generate keys:
      - Format = PKCS12
      - Password(s) = local
      - Download key
        - Nav to file location, run:
          openssl pkcs12 -in <pkcs12-file>.p12 -nocerts > privateKey.pem
        - Aidan created docs:
          - https://github.com/bcgov/gwa-api/blob/dev/docs/guides/intro-signed-jwt.md
        - Store .pem file in fixtures

- API Owner Log In
- Create Auth Profile
  - Flow = CCF
  - (??) Authenticator = Signed JWT with JWKS URL
  - Add Env:
    - Env = Test
    - (??) idp issuer: /auth/realms/master
    - (??) client reg: anonymous
- Create new product, add auth profile to test env, (??) apply template to API
- Developer access request
- Approved access request
- Make request (?? how to?)
*/

/*
Sysdig/meeting notes with Aidan:
(Migrate to VSCode)
- sysdig cloud: organized by team
  b8840c-team is ours
- Tons of different queries that can be run
- Still early days of getting reports, queries, alerts taht we want
Under Dashboard on left > switchover agena dn team CPU, memory utilization
- Check out alerts under alerts
- Notification changels under settings
  - theres one for opsgenie
  - one set up for teams
    - need apikey for opsgenie
  - Sent to APS_ALERTS channel
- teampersisten storage: info on volume claims, but bug where those metrics are not being populated
- Will be added to team
- go to app.sysdigcloud.com
- log in in using openID
- Company name is BCDevOps

- Best practices go to rcoketchat sysdig next tuesday at 1pm
- Create a microservice in dev
*/

describe('Creates an authorization and applies it to a product environment', () => {
  const home = new HomePage()
  const login = new LoginPage()
  const authProfile = new AuthorizationProfile()
  const pd = new Products()

  before(() => {
    cy.visit('/')
    cy.clearCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.visit(login.path)
  })

  it('authenticates api owner', () => {
    cy.get('@apiowner').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Activates cc namespace', () => {
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      home.useNamespace(clientCredentials.namespace)
    })
  })

  it('API Owner creates authorization profile for JWT - Key Pair', () => {
    cy.visit(authProfile.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let ap = clientCredentials.jwtKeyPair.authProfile
      authProfile.createAuthProfile(ap)
      cy.get(authProfile.profileTable).contains(ap.name).should('be.visible')
    })
  })

  it('API Adds Environment for JWT - Key Pair to Client Credentials Test Product', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ clientCredentials }: any) => {
      let prod = clientCredentials.jwtKeyPair.product
      let ap = clientCredentials.jwtKeyPair.authProfile
      pd.addEnvToProduct(prod.name, prod.environment.name)
      pd.editProductEnvironment(prod.name, prod.environment.name)
      prod.environment.config.authIssuer = ap.name
      prod.environment.config.authIssuerEnv = ap.environmentConfig.environment
      pd.editProductEnvironmentConfig(prod.environment.config)
    })
  })

  after(() => {
    cy.logout()
  })
})
