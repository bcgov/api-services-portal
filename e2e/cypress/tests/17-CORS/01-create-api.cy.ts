import WebAppPage from '../../pageObjects/webApp'

describe('Create API Spec', () => {
  const webApp = new WebAppPage()
  let updatedBody: any
  let pluginID: string
  let serviceID: string
  before(() => {
    cy.visit(Cypress.env('WEBAPP_URL'))
    // cy.visit(Cypress.env('WEBAPP_URL'))
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('cors/kong-cors-plugin-config.json').as('kong-cors-plugin-config')
    cy.preserveCookies()
  })
  serviceID = 'ce5d3e76-1d35-47f0-8ddf-fad087b1f969'
  pluginID = '73a51e86-23ec-43c2-97fc-b96ed9f5bd90'

  // it('Create a route for the service in Kong', () => {
  //   cy.readFile('cypress/fixtures/state/store.json').then((store_cred) => {
  //     serviceID = store_cred.servicesid
  //     cy.get('@kong-cors-plugin-config').then(({ createRoute }: any) => {
  //       cy.updateJsonValue(JSON.stringify(createRoute), '$.service.id', serviceID).then((updatedValue) => {
  //         cy.updateKongPluginForJSONRequest(updatedValue, 'routes').then((response) => {
  //           expect(response.status).to.be.equal(201)
  //           expect(response.statusText).to.be.equal('Created')
  //         })
  //       })
  //     })
  //   })
  // })

  // it('Publish CORS plugin to kong with a valid origins value', () => {
  //   cy.get('@kong-cors-plugin-config').then(({ uploadCORSPlugin }: any) => {
  //     debugger
  //     cy.updateKongPluginForJSONRequest(uploadCORSPlugin, 'services/'+serviceID+'/plugins').then((response) => {
  //       debugger
  //       expect(response.status).to.be.equal(201)
  //       expect(response.statusText).to.be.equal('Created')
  //       pluginID=response.body.id
  //     })
  //   })
  // })

  // it('Verify for successful CORS call for valid origin value', () => {
  //   webApp.getStatusAfterClickOnCORS().then((statusText)=>{
  //     expect(statusText).to.be.equal('Response Code: 200')
  //   })
  // })

  it('Set incorrrect origin name in CORS plugin', () => {
    cy.get('@kong-cors-plugin-config').then(({ uploadCORSPlugin }: any) => {
      debugger
      cy.updateJsonValue(JSON.stringify(uploadCORSPlugin), '$.config.origins[0]', 'https://google.com').then((updatedValue) => {
        updatedBody = updatedValue
        cy.updateKongPluginForJSONRequest(updatedBody, 'services/' + serviceID + '/plugins/' + pluginID, 'PUT').then((response) => {
          debugger
          expect(response.status).to.be.equal(200)
        })
      })
    })
  })

  it('Verify for successful CORS call for valid origin value', () => {
    // cy.origin(Cypress.env('WEBAPP_URL'), () => {
    //   cy.wait(5000)
    //   cy.get('[id="corsButton"]').click({ force: true })
    //   cy.wait(8000)
    // cy.visit('/')

    webApp.getStatusAfterClickOnCORS().then((statusText) => {
      expect(statusText).to.be.equal('Error: Failed to fetch')
    })
  })


  // it('Allow all origin name in CORS plugin', () => {
  //   cy.get('@kong-cors-plugin-config').then(({ uploadCORSPlugin }: any) => {
  //     debugger
  //     cy.updateJsonValue(JSON.stringify(uploadCORSPlugin), '$.config.origins[0]', '*').then((updatedValue) => {
  //       updatedBody = updatedValue
  //       cy.updateKongPluginForJSONRequest(updatedBody, 'services/'+serviceID+'/plugins/'+pluginID, 'PUT').then((response) => {
  //         debugger
  //         expect(response.status).to.be.equal(200)
  //       })
  //     })
  //   })
  // })

  // it('Verify for successful CORS call for valid origin value', () => {
  //   webApp.getStatusAfterClickOnCORS().then((statusText)=>{
  //     expect(statusText).to.be.equal('Response Code: 200')
  //   })
  // })

  // it('Verify for successful CORS call for invalid header', () => {
  //   webApp.getStatusAfterClickOnCORSForHeaders().then((statusText)=>{
  //     expect(statusText).to.be.equal('Error: Failed to fetch')
  //   })
  // })

  // it('Set the header name as Access-Control-Allow-Headers in CORS plugin', () => {
  //   cy.get('@kong-cors-plugin-config').then(({ uploadCORSPlugin }: any) => {
  //     debugger
  //     cy.updateJsonValue(JSON.stringify(uploadCORSPlugin), '$.config.headers[4]', 'X-PINGOTHER').then((updatedValue) => {
  //       updatedBody = updatedValue
  //       cy.updateKongPluginForJSONRequest(updatedBody, 'services/'+serviceID+'/plugins/'+pluginID, 'PUT').then((response) => {
  //         debugger
  //         expect(response.status).to.be.equal(200)
  //       })
  //     })
  //   })
  // })

  // it('Verify for successful CORS call after setting the header in Access-Control-Allow-Headers list', () => {
  //   webApp.getStatusAfterClickOnCORSForHeaders().then((statusText)=>{
  //     expect(statusText).to.be.equal('Response Code: 200')
  //   })
  // })

})

