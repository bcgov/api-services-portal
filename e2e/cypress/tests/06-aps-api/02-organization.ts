describe('API Tests for Organization Manage Control End points', () => {

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('api').as('api')
        cy.request("ds/api/v2/organizations")
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.setHeaders(organization.headers)
        })
    })

    it('Get the resource and verify the Organization details in the response', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
                expect(response.body[0].name).to.eq("ministry-of-health")
                expect(response.body[0].title).to.eq("Ministry of Health")
                expect(response.body[0]).has.property('title', 'Ministry of Health')
            })
        })
    })
})

describe('Verify /Organization/{Org} end point', () => {

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('api').as('api')
        cy.request("ds/api/v2/organizations")
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.setHeaders(organization.headers)
        })
    })

    it('Get the resource and verify the org Names in the response', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint +'/'+ organization.orgName, 'GET').then((response) => {
                debugger
                expect(response.status).to.be.equal(200)
                var expectedResult = organization.orgExpectedList
                assert.isTrue(_.isEqual(response.body.orgUnits[0], organization.orgExpectedList))
            })
        })
    })
})