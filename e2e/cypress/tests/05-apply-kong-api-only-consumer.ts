describe('Apply Kong API key only plugin', () => {
  var consumerID: string
  var consumerKey: string
  var pluginID: string

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()

  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/store').as('store')
  })

  it('Apply Key-auth only authorization plugin to Kong Gateway', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      cy.publishApi('service-plugin-key-auth-only.yml', namespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          cy.log(JSON.stringify(res.body))
        })
      })
    })
  })

  it('Get the plugin ID of Key-auth plugin', () => {
    cy.makeKongGatewayRequest('plugins', '', 'GET').then((response) => {
      expect(response.status).to.be.equal(200)
      pluginID = response.body.data[0].id
    })
  })

  it('Create a new consumer and save the consumer Id', () => {
    cy.makeKongGatewayRequest('consumers', 'createConsumer', 'POST').then((response) => {
      expect(response.status).to.be.equal(201)
      consumerID = response.body.id
      cy.saveState("consumersid", consumerID)
    })
  })

  it('Create a key for the newly created consumer', () => {
    const endpoint = 'consumers/' + consumerID + '/key-auth'
    cy.makeKongGatewayRequest(endpoint, '', 'POST').then((response) => {
      expect(response.status).to.be.equal(201)
      consumerKey = response.body.key
      cy.saveState("consumerkey", consumerKey)
    })
  })

  it('Update the Kong key-auth plugin the new consumer', () => {
    cy.saveState("config.anonymous", consumerID)
    cy.updateKongPlugin('', 'keyAuth', 'plugins/' + pluginID, 'PATCH').then((response) => {
      expect(response.status).to.be.equal(200)
    })
  })
})


