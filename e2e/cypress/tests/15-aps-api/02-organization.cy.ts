import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
let userSession: any
var nameSpace: string

describe('Get the user session token', () => {

    const login = new LoginPage()
    const home = new HomePage()

    before(() => {
        cy.visit('/')
        cy.deleteAllCookies()
        cy.reload(true)
        // cy.getUserSessionTokenValue()
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('common-testdata').as('common-testdata')
        // cy.visit(login.path)
    })

    it('authenticates Janis (api owner) to get the user session token', () => {
        cy.get('@common-testdata').then(({ apiTest }: any) => {
            cy.getUserSessionTokenValue(apiTest.namespace).then((value) => {
                userSession = value
            })
        })
    })
})

describe('API Tests to verify the Organization details in the response', () => {

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('api-v2').as('api')
        cy.request("ds/api/v2/organizations")
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.setHeaders(organization.headers)
        })
    })

    it('Get the resource and verify the Organization details in the response', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint, 'GET').then((response:any) => {
                expect(response.apiRes.status).to.be.equal(200)
                expect(response.apiRes.body[0].name).to.eq("ministry-of-health")
                expect(response.apiRes.body[0].title).to.eq("Ministry of Health")
                expect(response.apiRes.body[0]).has.property('title', 'Ministry of Health')
                cy.addToAstraScanIdList(response.astraRes.body.status)
            })
        })
    })
})

describe('Verify /Organization/{Org} end point', () => {

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('api-v2').as('api')
        cy.request("ds/api/v2/organizations")
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.setHeaders(organization.headers)
        })
    })

    it('Get the resource and verify the org Names in the response', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName, 'GET').then((response:any) => {
                expect(response.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(response.astraRes.body.status)
                assert.isTrue(Cypress._.isEqual(response.apiRes.body.orgUnits[0], organization.orgExpectedList))
            })
        })
    })

    it('Verify the status code and response message for invalid organization name', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint + '/health', 'GET').then((response:any) => {
                expect(response.apiRes.status).to.be.oneOf([404, 422])
                expect(response.apiRes.body.message).to.be.equal("Validation Failed")
            })
        })
    })
})

describe('Get the Organization Role', () => {

    var response: any
    var actualResponse: any = {}
    var expectedResponse: any = {}

    beforeEach(() => {
        cy.fixture('api-v2').as('api')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.setHeaders(organization.headers)
            cy.setAuthorizationToken(userSession)
        })
    })

    it('Get the resource and verify the success code in the response', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/roles', 'GET').then((res:any) => {
                expect(res.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(res.astraRes.body.status)
                response = res.apiRes.body
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
        cy.makeAPIRequest('ds/api/v2/roles', 'GET').then((res:any) => {
            expect(res.apiRes.status).to.be.equal(200)
            response = res.apiRes.body
            cy.addToAstraScanIdList(res.astraRes.body.status)
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
        cy.fixture('api-v2').as('api')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.setHeaders(organization.headers)
            cy.setAuthorizationToken(userSession)
        })
    })

    it('Get the resource and verify the success code in the response', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/namespaces', 'GET').then((res:any) => {
                expect(res.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(res.astraRes.body.status)
                response = res.apiRes.body
                nameSpace = response[0].name
            })
        })
    })

    it('Compare the Namespace values in response against the expected values', () => {
        cy.get('@api').then(({ organization }: any) => {
            expectedResponse = organization.expectedNamespace
            // assert.isTrue(Cypress._.isEqual(response, expectedResponse))
            cy.compareJSONObjects(response, expectedResponse, true)
        })
    })

})

describe('Delete the Namespace associated with the organization', () => {

    var response: any
    var actualResponse: any = {}
    var expectedResponse: any = {}

    beforeEach(() => {
        cy.fixture('api-v2').as('api')
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('common-testdata').as('common-testdata')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.setHeaders(organization.headers)
            cy.setAuthorizationToken(userSession)
        })
    })

    it('Delete the namespace associated with the organization, organization unit and verify the success code in the response', () => {
        cy.get('@common-testdata').then(({ namespace }: any) => {
            cy.get('@api').then(({ organization }: any) => {
                cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/' + organization.orgExpectedList.name + '/namespaces/' + nameSpace, 'DELETE').then((res:any) => {
                    expect(res.apiRes.status).to.be.equal(200)
                    cy.addToAstraScanIdList(res.astraRes.body.status)
                    response = res.apiRes.body
                })
            })
        })
    })

    it('Verify that the deleted Namespace is not displayed in Get Call', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/namespaces', 'GET').then((res:any) => {
                expect(res.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(res.astraRes.body.status)
                response = res.apiRes.body
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
        cy.fixture('api-v2').as('api')
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
            cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/access', 'PUT').then((res:any) => {
                expect(res.apiRes.status).to.be.equal(204)
                cy.addToAstraScanIdList(res.astraRes.body.status)
            })
        })
    })

    it('Get the resource and verify the success code in the response', () => {
        cy.get('@api').then(({ organization }: any) => {
            cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/access', 'GET').then((res:any) => {
                expect(res.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(res.astraRes.body.status)
                response = res.apiRes.body
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