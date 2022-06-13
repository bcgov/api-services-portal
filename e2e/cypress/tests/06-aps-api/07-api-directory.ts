import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
let userSession: any
let slugValue: string

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
        cy.getUserSessionTokenValue().then((value) => {
            userSession = value
         })
    })
})

describe('API Tests for Updating dataset', () => {

    const login = new LoginPage()
    const home = new HomePage()
    var response: any

    beforeEach(() => {
        cy.fixture('api').as('api')
        cy.fixture('apiowner').as('apiowner')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ apiDirectory }: any) => {
            cy.setHeaders(apiDirectory.headers)
            cy.setAuthorizationToken(userSession)
            cy.setRequestBody(apiDirectory.body)
        })
    })

    it('Put the resource and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.get('@api').then(({ apiDirectory }: any) => {
                cy.makeAPIRequest(apiDirectory.endPoint +'/'+ apiTest.namespace + '/datasets', 'PUT').then((response) => {
                    expect(response.status).to.be.equal(200)
                })
            })
        })
    })

    it('Get the resource (/namespaces/{ns}/datasets/{name}) and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.get('@api').then(({ apiDirectory }: any) => {
                cy.makeAPIRequest(apiDirectory.endPoint +'/'+ apiTest.namespace + '/datasets/'+apiDirectory.body.name, 'GET').then((res) => {
                    expect(res.status).to.be.equal(200)
                    response = res.body
                })
            })
        })
    })

    it('Compare the values in response against the values passed in the request', () => {
        cy.get('@api').then(({ apiDirectory }: any) => {
            debugger
            cy.compareJSONObjects(response, apiDirectory.body)
        })
    })

    it('Get the resource (/organizations/{org}/datasets/{name}) and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.get('@api').then(({ apiDirectory, organization }: any) => {
                cy.makeAPIRequest(apiDirectory.orgEndPoint+'/'+organization.orgName + '/datasets/'+apiDirectory.body.name, 'GET').then((res) => {
                    expect(res.status).to.be.equal(200)
                    response = res.body
                })
            })
        })
    })

    it('Compare the values in response against the values passed in the request', () => {
        cy.get('@api').then(({ apiDirectory }: any) => {
            debugger
            cy.compareJSONObjects(response, apiDirectory.body)
        })
    })

    it('Get the resource (/organizations/{org}/datasets) and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.get('@api').then(({ apiDirectory, organization }: any) => {
                cy.makeAPIRequest(apiDirectory.orgEndPoint+'/'+organization.orgName + '/datasets/', 'GET').then((res) => {
                    expect(res.status).to.be.equal(200)
                    response = res.body
                })
            })
        })
    })

    it('Compare the values in response against the values passed in the request', () => {
        cy.get('@api').then(({ apiDirectory }: any) => {
            debugger
            cy.compareJSONObjects(response, apiDirectory.body, true)
        })
    })
})