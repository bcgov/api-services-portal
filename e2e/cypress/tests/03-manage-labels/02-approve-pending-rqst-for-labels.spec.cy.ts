import ConsumersPage from '../../pageObjects/consumers'
import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import ProductPage from '../../pageObjects/products'

describe('Approve Pending Request Spec', () => {
  const login = new LoginPage()
  const consumers = new ConsumersPage()
  const home = new HomePage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload(true)
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('developer').as('developer')
    cy.fixture('state/store').as('store')
    cy.fixture('common-testdata').as('common-testdata')
    // cy.visit(login.path)
  })

  it('authenticates Mark (Access-Manager)', () => {
    cy.get('@access-manager').then(({ user }: any) => {
      cy.get('@common-testdata').then(({ namespace }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        cy.activateGateway(namespace);
      })
    })
  })

  it('verify the request details', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.get('@developer').then(({ accessRequest, applicationLabels }: any) => {
        cy.visit(consumers.path);
        consumers.reviewThePendingRequest()
        consumers.verifyRequestDetails(product, accessRequest, applicationLabels)
      })
    })
  })

  it('Add group labels in request details window', () => {
    cy.get('@access-manager').then(({ labels_consumer2 }: any) => {
      consumers.addGroupLabels(labels_consumer2)
    })
  })

  it('approves an access request', () => {
    consumers.approvePendingRequest()
  })

  it('Verify that API is accessible with the generated API Key', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
        cy.log(response)
        expect(response.status).to.be.equal(200)
      })
    })
  })

  after(() => {
    cy.logout()
  })

})

// describe('Turn off the Authentication', () => {
//   const products = new ProductPage()
//   const consumers = new ConsumersPage()

//   beforeEach(() => {
//     cy.preserveCookies()
//     cy.fixture('access-manager').as('access-manager')
//     cy.fixture('developer').as('developer')
//     cy.fixture('apiowner').as('apiowner')
//     cy.fixture('state/store').as('store')
//   })

//   it('Turn off the authentication switch', () => {
//     cy.visit(products.path);
//     // consumers.clickOnTheFirstConsumerID()
//     products.turnOnACLSwitch(false)
//   })

//   it('Verify that API is not accessible with the generated API Key', () => {
//     cy.get('@apiowner').then(({ product }: any) => {
//       cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
//         expect(response.status).to.be.equal(403)
//         expect(response.body.message).to.be.contain('You cannot consume this service')
//       })
//     })
//   })

//   after(() => {
//     products.turnOnACLSwitch(true)
//     cy.logout()
//     cy.clearLocalStorage({ log: true })
//     cy.deleteAllCookies()
//   })
// })