import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
let userSession: any
var nameSpace: string

describe('API Tests to verify the Organization details in the response', () => {

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
            cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
                assert.isTrue(Cypress._.isEqual(response.body.orgUnits[0], organization.orgExpectedList))
            })
        })
    })

    it('Verify the status code and response message for invalid organization name', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint + '/health', 'GET').then((response) => {
                expect(response.status).to.be.oneOf([404, 422])
                expect(response.body.message).to.be.equal("Validation Failed")
            })
        })
    })
})

describe('Get the user session token', () => {

    const login = new LoginPage()
    const home = new HomePage()

    before(() => {
        cy.visit('/')
        cy.deleteAllCookies()
        cy.reload()
        // cy.getUserSessionTokenValue()
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('apiowner').as('apiowner')
        cy.visit(login.path)
    })

    it('authenticates Janis (api owner) to get the user session token', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.getUserSessionTokenValue(apiTest.namespace).then((value) => {
                userSession = value
            })
        })
    })
})

describe('Get the Organization Role', () => {

    var response: any
    var actualResponse: any = {}
    var expectedResponse: any = {}

    beforeEach(() => {
        cy.fixture('api').as('api')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.setHeaders(organization.headers)
            cy.setAuthorizationToken(userSession)
        })
    })

    it('Get the resource and verify the success code in the response', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/roles', 'GET').then((res) => {
                expect(res.status).to.be.equal(200)
                response = res.body
            })
        })
    })

    it('Compare the scope values in response against the expected values', () => {
        cy.get('@api').then(({ organization }: any) => {
            actualResponse = response.roles[0].permissions[0].scopes
            expectedResponse = organization.expectedScope
            assert.isTrue(Cypress._.isEqual(actualResponse, expectedResponse))
        })
    })

    it('Get the list of roles and verify the success code in the response', () => {
        cy.makeAPIRequest('ds/api/v2/roles', 'GET').then((res) => {
            expect(res.status).to.be.equal(200)
            response = res.body
        })
    })

    it('Compare the roles values in response against the expected values', () => {
        cy.get('@api').then(({ organization }: any) => {
            expectedResponse = organization.expectedRoles
            cy.compareJSONObjects(response, expectedResponse)
        })
    })

})

describe('Get the Namespace associated with the organization', () => {

    var response: any
    var actualResponse: any = {}
    var expectedResponse: any = {}

    beforeEach(() => {
        cy.fixture('api').as('api')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.setHeaders(organization.headers)
            cy.setAuthorizationToken(userSession)
        })
    })

    it('Get the resource and verify the success code in the response', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/namespaces', 'GET').then((res) => {
                expect(res.status).to.be.equal(200)
                response = res.body
                nameSpace = response[0].name
            })
        })
    })

    it('Compare the Namespace values in response against the expected values', () => {
        cy.get('@api').then(({ organization }: any) => {
            expectedResponse = organization.expectedNamespace
            // assert.isTrue(Cypress._.isEqual(response, expectedResponse))
            debugger
            cy.compareJSONObjects(response, expectedResponse, true)
        })
    })

})

describe('Delete the Namespace associated with the organization', () => {

    var response: any
    var actualResponse: any = {}
    var expectedResponse: any = {}

    beforeEach(() => {
        cy.fixture('api').as('api')
        cy.fixture('apiowner').as('apiowner')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.setHeaders(organization.headers)
            cy.setAuthorizationToken(userSession)
        })
    })

    it('Delete the namespace associated with the organization, organization unit and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ namespace }: any) => {
            cy.get('@api').then(({ organization }: any) => {
                cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/' + organization.orgExpectedList.name + '/namespaces/' + nameSpace, 'DELETE').then((res) => {
                    expect(res.status).to.be.equal(200)
                    response = res.body
                })
            })
        })
    })

    it('Verify that the deleted Namespace is not displayed in Get Call', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/namespaces', 'GET').then((res) => {
                expect(res.status).to.be.equal(200)
                response = res.body
                assert.equal(response.findIndex((x: { name: string }) => x.name === nameSpace), -1)
            })
        })
    })
})

describe('Add and Get Organization Access', () => {

    var response: any
    var actualResponse: any = {}
    var expectedResponse: any = {}

    beforeEach(() => {
        cy.fixture('api').as('api')
        cy.fixture('apiowner').as('apiowner')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.setHeaders(organization.headers)
            cy.setAuthorizationToken(userSession)
            cy.setRequestBody(organization.body)
        })
    })

    it('Add the access of the organization to the specific user and verify the success code in the response', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/access', 'PUT').then((res) => {
                expect(res.status).to.be.equal(204)
            })
        })
    })

    it('Get the resource and verify the success code in the response', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/access', 'GET').then((res) => {
                expect(res.status).to.be.equal(200)
                response = res.body
            })
        })
    })

    it('Compare the Namespace values in response against the expected values', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.compareJSONObjects(response, organization.body)
        })
    })

    after(() => {
        cy.logout()
        cy.clearLocalStorage({ log: true })
        cy.deleteAllCookies()
    })
})