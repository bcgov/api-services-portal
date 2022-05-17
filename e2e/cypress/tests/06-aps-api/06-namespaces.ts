import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
let userSession: string
let nameSpace: string

describe('Get the user session token to check ', () => {

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
                nameSpace = apiTest.namespace
                cy.get('@login').then(function (xhr: any) {
                    userSession = xhr.response.headers['x-auth-request-access-token']
                })
            })
        })
    })
})

describe('API Tests for Namespace Report', () => {

    const login = new LoginPage()
    const home = new HomePage()
    var response: any

    beforeEach(() => {
        cy.fixture('api').as('api')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ namespaces }: any) => {
            cy.setHeaders(namespaces.headers)
            cy.setAuthorizationToken(userSession)
        })
    })

    it('Get the resource and verify the success code in the response', () => {
        cy.get('@api').then(({ namespaces }: any) => {
            cy.makeAPIRequest(namespaces.endPoint + "/report", 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
            })
        })
    })
})

describe('API Tests for Namespace List', () => {

    const login = new LoginPage()
    const home = new HomePage()
    var response: any

    beforeEach(() => {
        cy.fixture('api').as('api')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ namespaces }: any) => {
            cy.setHeaders(namespaces.headers)
            cy.setAuthorizationToken(userSession)
        })
    })

    it('Get the resource and verify the success code in the response', () => {
        cy.get('@api').then(({ namespaces }: any) => {
            cy.makeAPIRequest(namespaces.endPoint, 'GET').then((res) => {
                expect(res.status).to.be.equal(200)
                debugger
                response = res.body
            })
        })
    })

    it('Verify that the selected Namespace is displayed in the Response list in the response', () => {
        expect(response).to.be.contain(nameSpace)
    })
})