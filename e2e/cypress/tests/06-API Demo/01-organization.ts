describe('Organization API Demo', () => {

    before(() => {
        cy.visit('/')
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('api').as('api')
        cy.request("ds/api/v2/organizations")
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then((organization: any) => {
            cy.setHeaders(organization.headers)
        })
    })

    it('Send the request and verify the responser', () => {
        cy.makeAPIRequest('ds/api/v2/organizations','GET').then((response) => {
            debugger
            expect(response.status).to.be.equal(200)
            expect(response.body[0].name).to.eq("ministry-of-health")
            expect(response.body[0].title).to.eq("Ministry of Health")
            expect(response.body[0]).has.property('title','Ministry of Health')
        })
    })

})