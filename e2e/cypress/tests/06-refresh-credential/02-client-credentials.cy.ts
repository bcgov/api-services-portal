import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import ApplicationPage from '../../pageObjects/applications'
import ConsumersPage from '../../pageObjects/consumers'
import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import MyAccessPage from '../../pageObjects/myAccess'

// describe('Apply Rate Limiting for Client Credential Authorization Profile', () => {
//   const login = new LoginPage()
//   const home = new HomePage()
//   const consumers = new ConsumersPage()

//   before(() => {
//     cy.visit('/')
//     cy.deleteAllCookies()
//     cy.reload()
//   })

//   beforeEach(() => {
//     cy.preserveCookies()
//     cy.fixture('access-manager').as('access-manager')
//     cy.fixture('apiowner').as('apiowner')
//     cy.fixture('developer').as('developer')
//     cy.fixture('manage-control-config-setting').as('manage-control-config-setting')
//     cy.visit(login.path)
//   })

//   it('set api rate limit as per the test config, Local Policy and Scope as Service', () => {
//     cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
//       let cc = JSON.parse(store_res.clientidsecret)
//       cy.get('@access-manager').then(({ user, clientCredentials }: any) => {
//         cy.get('@developer').then(({ clientCredentials }: any) => {
//           cy.login(user.credentials.username, user.credentials.password).then(() => {
//             home.useNamespace(clientCredentials.namespace);
//             cy.visit(consumers.path);
//             consumers.filterConsumerByTypeAndValue('Environment', clientCredentials.clientIdSecret.product.environment)
//             consumers.clickOnTheFirstConsumerID()
//             consumers.setRateLimiting('3')
//           })
//         })
//       })
//     })
//   })


//   it('Verify that rate limiting is applied correctly to the consument', () => {
//     cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
//       let cc = JSON.parse(store_res.clientidsecret)
//       debugger
//       cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
//         cy.get('@accessTokenResponse').then((token_res: any) => {
//           let token = token_res.body.access_token
//           cy.get('@apiowner').then(({ clientCredentials }: any) => {
//             cy.makeKongRequest(clientCredentials.serviceName, 'GET', token).then((response) => {
//               expect(response.status).to.be.equal(200)
//               expect(parseInt(response.headers["x-ratelimit-remaining-hour"])).to.be.equal(2)
//             })
//           })
//         })
//       })
//     })
//   })
// })

describe('Regenerate Credential for Client Credentials- Client ID/Secret', () => {
  const login = new LoginPage()
  const myAccessPage = new MyAccessPage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/regen').as('regen')
    cy.visit(login.path)
  })

  it('authenticates Harley (developer)', () => {
    cy.get('@developer').then(({ user }: any) => {
      cy.login(user.credentials.username, user.credentials.password)
    })
  })

  it('Regenrate credential client ID and Secret', () => {
    cy.visit(myAccessPage.path)
    cy.get('@developer').then(({ clientCredentials }: any) => {
      myAccessPage.regenerateCredential(clientCredentials.clientIdSecret.product.environment, clientCredentials.clientIdSecret.application.name)
      myAccessPage.clickOnGenerateSecretButton()
      cy.contains('Client ID').should('be.visible')
      cy.contains('Client Secret').should('be.visible')
      cy.contains('Token Endpoint').should('be.visible')
      myAccessPage.saveClientCredentials(true)
    })
  })

  it('Make sure that the old client ID and Secret is disabled', () => {
    cy.readFile('cypress/fixtures/state/store.json').then((store_res) => {
      let cc = JSON.parse(store_res.clientidsecret)
      cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
        cy.get('@accessTokenResponse').then((token_res: any) => {
          expect(token_res.status).to.be.equal(401)
        })
      })
    })
  })

  it('Verify that service is accessible with new client ID and Secret', () => {
    cy.readFile('cypress/fixtures/state/regen.json').then((store_res) => {
      let cc = JSON.parse(store_res.clientidsecret)
      cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
        cy.get('@accessTokenResponse').then((token_res: any) => {
          let token = token_res.body.access_token
          cy.get('@apiowner').then(({ clientCredentials }: any) => {
            cy.makeKongRequest(clientCredentials.serviceName, 'GET', token).then((response) => {
              expect(response.status).to.be.equal(200)
              // expect(parseInt(response.headers["x-ratelimit-remaining-hour"])).to.be.equal(1)
            })
          })
        })
      })
    })
  })

  after(() => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.getServiceOrRouteID('services', product.environment.config.serviceName)
      cy.getServiceOrRouteID('routes', product.environment.config.serviceName)
    })
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})