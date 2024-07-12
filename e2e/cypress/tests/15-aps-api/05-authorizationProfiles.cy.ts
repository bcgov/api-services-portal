import AuthorizationProfile from "../../pageObjects/authProfile"
import HomePage from "../../pageObjects/home"
import login from "../../pageObjects/login"
import LoginPage from "../../pageObjects/login"
let userSession: any
let testData = require("../../fixtures/test_data/authorizationProfile.json")
let namespace: string
let updatedAuthProfileEndPoint: string

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
        cy.fixture('common-testdata').as('common-testdata')
        cy.visit(login.path)
    })

    it('authenticates Janis (api owner) to get the user session token', () => {
        cy.get('@common-testdata').then(({ apiTest }: any) => {
            cy.getUserSessionTokenValue(apiTest.namespace).then((value) => {
                userSession = value
                namespace = apiTest.namespace
            })
        })
    })

    it('Set token with gwa config command', () => {
        cy.exec('gwa config set --token ' + userSession, { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
            expect(response.stdout).to.contain("Config settings saved")
        });
    })
})

testData.forEach((testCase: any) => {
    describe('API Tests for Authorization Profiles', () => {

        var response: any
        var actualResponse: any = {}
        var expectedResponse: any = {}

        beforeEach(() => {
            cy.fixture('api-v2').as('api')
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
                cy.replaceWord(authorizationProfiles.endPoint, 'apiplatform', namespace).then((updatedEndPoint: string) => {
                    updatedAuthProfileEndPoint = updatedEndPoint
                    cy.makeAPIRequest(updatedAuthProfileEndPoint, 'PUT').then((response:any) => {
                        expect(response.apiRes.status).to.be.equal(200)
                        cy.addToAstraScanIdList(response.astraRes.body.status)
                    })
                })
            })
        })

        it('Get the resource and verify the success code in the response', () => {
            cy.makeAPIRequest(updatedAuthProfileEndPoint, 'GET').then((res:any) => {
                expect(res.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(res.astraRes.body.status)
                response = res.apiRes.body
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
            cy.makeAPIRequest(updatedAuthProfileEndPoint + '/' + testCase.body.name, 'DELETE').then((response:any) => {
                expect(response.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(response.astraRes.body.status)
            })
        })


        it('Verify that the authorization profile is deleted', () => {
            cy.makeAPIRequest(updatedAuthProfileEndPoint, 'GET').then((response:any) => {
                expect(response.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(response.astraRes.body.status)
                expect(response.apiRes.body.length).to.be.equal(0)
            })
        })
    })
})

describe('API Tests for Authorization Profiles created with inheritFrom attribute set to a valid shared Issuer', () => {

    let response: any
    let actualResponse: any
    let expectedResponse: any

    beforeEach(() => {
        cy.fixture('api-v2').as('api')
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('common-testdata').as('common-testdata')
    })

    it('Prepare the Request Specification to create a shared IDP profile', () => {
        cy.get('@api').then(({ authorizationProfiles }: any) => {
            cy.setHeaders(authorizationProfiles.headers)
            cy.setAuthorizationToken(userSession)
            cy.setRequestBody(authorizationProfiles.shared_IDP_body)
        })
    })

    it('Put the resource to create shared IDP profile and verify the success code in the response', () => {
        cy.get('@common-testdata').then(({ apiTest }: any) => {
            cy.makeAPIRequest('ds/api/v2/namespaces/' + apiTest.namespace + '/issuers', 'PUT').then((response:any) => {
                expect(response.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(response.astraRes.body.status)
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
        cy.get('@common-testdata').then(({ apiTest }: any) => {
            cy.makeAPIRequest('ds/api/v2/namespaces/' + apiTest.namespace + '/issuers', 'PUT').then((response:any) => {
                expect(response.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(response.astraRes.body.status)
                expect(response.apiRes.body.result).to.be.equal("created")
            })
        })
    })

    it('Get list of authorization profile and verify the success code in the response', () => {
        cy.get('@common-testdata').then(({ apiTest }: any) => {
            cy.makeAPIRequest('ds/api/v2/namespaces/' + apiTest.namespace + '/issuers', 'GET').then((res:any) => {
                expect(res.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(res.astraRes.body.status)
                response = res.apiRes.body
            })
        })
    })

    it('Compare the values in response against the values passed in the request', () => {
        cy.get('@api').then(({ authorizationProfiles }: any) => {
            actualResponse = response
            expectedResponse = authorizationProfiles.shared_IDP_inheritFrom_expectedResponse
            cy.compareJSONObjects(actualResponse, expectedResponse, true)
        })
    })

})

describe('Published a shared authorization profile', () => {

    let response: any
    let actualResponse: any
    let expectedResponse: any

    beforeEach(() => {
        cy.fixture('api-v2').as('api')
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('common-testdata').as('common-testdata')
    })

    it('Prepare the Request Specification to create a shared IDP profile', () => {
        cy.get('@api').then(({ authorizationProfiles }: any) => {
            cy.setHeaders(authorizationProfiles.headers)
            cy.setAuthorizationToken(userSession)
            cy.setRequestBody(authorizationProfiles.shared_gwa)
        })
    })

    it('Create a shared credential issuer', () => {
        cy.get('@common-testdata').then(({ apiTest }: any) => {
            cy.makeAPIRequest('ds/api/v2/namespaces/' + apiTest.namespace + '/issuers', 'PUT').then((response:any) => {
                expect(response.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(response.astraRes.body.status)
                expect(response.apiRes.body.result).to.be.equal("created")
            })
        })
    })

    it('Get list of authorization profile and verify the success code in the response', () => {
        cy.get('@common-testdata').then(({ apiTest }: any) => {
            cy.makeAPIRequest('ds/api/v2/namespaces/' + apiTest.namespace + '/issuers', 'GET').then((res:any) => {
                expect(res.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(res.astraRes.body.status)
                response = res.apiRes.body
            })
        })
    })

    after(() => {
        cy.logout()
    })

})

describe('Deleted shared auth profile', () => {

    const login = new LoginPage()
    const home = new HomePage()
    const authProfile = new AuthorizationProfile()

    before(() => {
        cy.visit('/')
        cy.reload()
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('api-v2').as('api')
        cy.fixture('common-testdata').as('common-testdata')
    })

    it('Authenticates Janis (api owner) to get the user session token', () => {
        cy.get('@common-testdata').then(({ apiTest }: any) => {
            cy.getUserSessionTokenValue(apiTest.namespace).then((value) => {
                userSession = value
                namespace = apiTest.namespace
                home.useNamespace(namespace);
            })
        })
    })

    it('Navigate to authorization profile page', () => {
        cy.visit(authProfile.path)
    })

    it('Delete the authorizarion profile inherited from shared IDP', () => {
        cy.get('@api').then(({ authorizationProfiles }: any) => {
            authProfile.deleteAuthProfile(authorizationProfiles.shared_IDP_inheritFrom_expectedResponse.name)
        })
    })

    it('Verify the confirmation message to delete the consumer', () => {
        cy.wait(2000)
        cy.contains('This action cannot be undone').should('exist')
        cy.contains('Yes, Delete').click()
    })

    after(() => {
        cy.logout()
    })
})

describe('Verify that client ID of deleted shared auth profile in IDP', () => {

    var nameSpace: string
    const home = new HomePage()
    const authProfile = new AuthorizationProfile()

    before(() => {
        cy.visit(Cypress.env('KEYCLOAK_URL'))
        cy.reload()
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('developer').as('developer')
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('state/regen').as('regen')
        cy.fixture('admin').as('admin')
        cy.fixture('api-v2').as('api')
    })

    it('Authenticates Admin owner', () => {
        cy.get('@admin').then(({ user }: any) => {
            cy.contains('Administration Console').click({ force: true })
            cy.keycloakLogin(user.credentials.username, user.credentials.password)
        })
    })

    it('Navigate to Clients', () => {
        cy.contains('Clients').click()
    })

    it('Verify that the client id of deleted shared auth profile does not display', () => {
        cy.get('@api').then(({ authorizationProfiles }: any) => {
            cy.contains(authorizationProfiles.shared_IDP_inheritFrom_expectedResponse.name).should('not.exist')
        })
    })

})