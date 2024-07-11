describe('Identifiers', () => {
  it('GET /identifiers/application', () => {
    cy.callAPI('ds/api/v3/identifiers/application', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        cy.log(`ID ${body}`)
        expect(status).to.be.equal(200)
      }
    )
  })

  it('GET /identifiers/product', () => {
    cy.callAPI('ds/api/v3/identifiers/product', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        cy.log(`ID ${body}`)
        expect(status).to.be.equal(200)
      }
    )
  })

  it('GET /identifiers/environment', () => {
    cy.callAPI('ds/api/v3/identifiers/environment', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        cy.log(`ID ${body}`)
        expect(status).to.be.equal(200)
      }
    )
  })

  it('GET /identifiers/gateway', () => {
    cy.callAPI('ds/api/v3/identifiers/gateway', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        cy.log(`ID ${body}`)
        expect(status).to.be.equal(200)
      }
    )
  })
})
