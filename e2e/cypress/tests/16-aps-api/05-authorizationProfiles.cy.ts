import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
let userSession: any
let testData = require("../../fixtures/test_data/authorizationProfile.json")

describe('Get the user session token', () => {

    const login = new LoginPage()
    const home = new HomePage()

    before(() => {
        cy.visit('/')
        cy.deleteAllCookies()
        cy.reload()
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

testData.forEach((testCase: any) => {
    describe('API Tests for Authorization Profiles', () => {

        var response: any
        var actualResponse: any = {}
        var expectedResponse: any = {}

        beforeEach(() => {
            cy.fixture('api').as('api')
        })

        it('Prepare the Request Specification for the API', () => {
            cy.get('@api').then(({ authorizationProfiles }: any) => {
                cy.setHeaders(authorizationProfiles.headers)
                cy.setAuthorizationToken(userSession)
                cy.setRequestBody(testCase.body)
            })
        })

        it('Put the resource and verify the success code in the response', () => {
            cy.get('@api').then(({ authorizationProfiles }: any) => {
                cy.makeAPIRequest(authorizationProfiles.endPoint, 'PUT').then((response) => {
                    expect(response.status).to.be.equal(200)
                })
            })
        })

        it('Get the resource and verify the success code in the response', () => {
            cy.get('@api').then(({ authorizationProfiles }: any) => {
                cy.makeAPIRequest(authorizationProfiles.endPoint, 'GET').then((res) => {
                    expect(res.status).to.be.equal(200)
                    response = res.body
                })
            })
        })

        it('Compare the values in response against the values passed in the request', () => {
            cy.get('@api').then(({ authorizationProfiles }: any) => {
                actualResponse = response
                expectedResponse = testCase.body
                cy.compareJSONObjects(actualResponse, expectedResponse, true)
            })
        })

        it('Delete the authorization profile', () => {
            cy.get('@api').then(({ authorizationProfiles }: any) => {
                cy.makeAPIRequest(authorizationProfiles.endPoint + '/' + testCase.body.name, 'DELETE').then((response) => {
                    expect(response.status).to.be.equal(200)
                })
            })
        })

        it('Verify that the authorization profile is deleted', () => {
            cy.get('@api').then(({ authorizationProfiles }: any) => {
                cy.makeAPIRequest(authorizationProfiles.endPoint, 'GET').then((response) => {
                    expect(response.status).to.be.equal(200)
                    expect(response.body.length).to.be.equal(0)
                })
            })
        })
    })

    after(() => {
        cy.clearLocalStorage({ log: true })
        cy.deleteAllCookies()
    })
})

describe('API Tests for Authorization Profiles created with inheritFrom attribute set to a valid shared Issuer', () => {

    let response: any
    let actualResponse: any 
    let expectedResponse: any

    beforeEach(() => {
        cy.fixture('api').as('api')
        cy.fixture('apiowner').as('apiowner')
    })

    it('Prepare the Request Specification to create a shared IDP profile', () => {
        cy.get('@api').then(({ authorizationProfiles }: any) => {
            cy.setHeaders(authorizationProfiles.headers)
            cy.setAuthorizationToken(userSession)
            cy.setRequestBody(authorizationProfiles.shared_IDP_body)
        })
    })

    it('Put the resource to create shared IDP profile and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.makeAPIRequest('ds/api/v2/namespaces/' + apiTest.namespace + '/issuers', 'PUT').then((response) => {
                debugger
                expect(response.status).to.be.equal(200)
                expect(response.body.result).to.be.equal("created")
            })
        })
    })

    it('Prepare the Request Specification to create a shared IDP profile using inheritFrom attribute', () => {
        cy.get('@api').then(({ authorizationProfiles }: any) => {
            cy.setHeaders(authorizationProfiles.headers)
            cy.setAuthorizationToken(userSession)
            cy.setRequestBody(authorizationProfiles.shared_IDP_inheritFrom)
        })
    })

    it('Create an authorization profile using inheritFrom attribute and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.makeAPIRequest('ds/api/v2/namespaces/' + apiTest.namespace + '/issuers', 'PUT').then((response) => {
                expect(response.status).to.be.equal(200)
                expect(response.body.result).to.be.equal("created")
            })
        })
    })

    it('Get list of authorization profile and verify the success code in the response', () => {
        debugger
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.makeAPIRequest('ds/api/v2/namespaces/' + apiTest.namespace + '/issuers', 'GET').then((res) => {
                debugger
                expect(res.status).to.be.equal(200)
                response = res.body
            })
        })
    })

    it('Compare the values in response against the values passed in the request', () => {
        cy.get('@api').then(({ authorizationProfiles }: any) => {
            debugger
            actualResponse = response
            expectedResponse = authorizationProfiles.shared_IDP_inheritFrom_expectedResponse
            cy.compareJSONObjects(actualResponse, expectedResponse, true)
        })
    })

})