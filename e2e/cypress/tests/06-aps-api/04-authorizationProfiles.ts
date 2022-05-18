import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
let userSession: string
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
        cy.getUserSession().then(() => {
            cy.get('@apiowner').then(({ user, apiTest }: any) => {
                cy.login(user.credentials.username, user.credentials.password)
                home.useNamespace(apiTest.namespace)
                cy.get('@login').then(function (xhr: any) {
                    userSession = xhr.response.headers['x-auth-request-access-token']
                })
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
})