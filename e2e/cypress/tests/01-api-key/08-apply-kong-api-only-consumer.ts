describe('Apply Kong API key only plugin', () => {
  var consumerID: string
  var consumerKey: string
  var pluginID: string

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('developer').as('developer')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('state/store').as('store')
  })

  it('Apply Key-auth only authorization plugin to Kong Gateway', () => {
    cy.get('@apiowner').then(({ namespace, product }: any) => {
      cy.updatePluginFile('service-plugin.yml',product.environment.config.serviceName,'service-plugin-key-auth-only.yml')
      cy.publishApi('service-plugin.yml', namespace).then(() => {
        cy.get('@publishAPIResponse').then((res: any) => {
          cy.log(JSON.stringify(res.body))
        })
      })
    })
  })

  it('Get the plugin ID of Key-auth plugin', () => {
    cy.makeKongGatewayRequest('plugins', '', 'GET').then((response) => {
      expect(response.status).to.be.equal(200)
      pluginID = _.get((_.filter(response.body.data,["name","key-auth"]))[0],'id')
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
      cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
        expect(response.status).to.be.equal(200)
      })
    })
  })
})


