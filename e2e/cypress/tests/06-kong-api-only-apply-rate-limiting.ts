
describe('Check the API key for free and elevated access', () => {

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/store').as('store')
  })

  it('Verify the service is accessibale with API key for free access', () => {
    cy.get('@apiowner').then(async ({ product }: any) => {
      cy.fixture('state/store').then((creds: any) => {
        const key = creds.consumerKey
        cy.makeKongRequest(product.environment.config.serviceName, 'GET', key).then((response) => {
          expect(response.status).to.be.equal(200)
        })
      })
    })
  })

  it('Verify the service is accessible with API key for elevated access', () => {
    cy.get('@apiowner').then(async ({ product }: any) => {
      cy.fixture('state/store').then((creds: any) => {
        const key = creds.consumerKey
        cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
          expect(response.status).to.be.equal(200)
        })
      })
    })
  })
})

describe('Apply Rate limiting for Free Access', () => {

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/store').as('store')
  })

  it('set api rate limit to free access', () => {
    cy.updateKongPlugin('consumers', 'rateLimitingConsumer').then((response) => {
      expect(response.status).to.be.equal(201)
    })
  })

  it('Verify the rate limiting is applied for free access', () => {
    cy.get('@apiowner').then(async ({ product }: any) => {
      cy.fixture('state/store').then((creds: any) => {
        const key = creds.consumerkey
        cy.makeKongRequest(product.environment.config.serviceName, 'GET', key).then((response) => {
          expect(response.status).to.be.equal(200)
          expect(parseInt(response.headers["x-ratelimit-remaining-hour"])).to.be.equal(99)
        })
      })
    })
  })
})
