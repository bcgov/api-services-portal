import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
let userSession: string
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

describe('API Tests for Updating documentation', () => {

    const login = new LoginPage()
    const home = new HomePage()

    beforeEach(() => {
        cy.fixture('api').as('api')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ documentation }: any) => {
            cy.setHeaders(documentation.headers)
            cy.setAuthorizationToken(userSession)
            cy.setRequestBody(documentation.body)
        })
    })

    it('Put the resource and verify the success code in the response', () => {
        cy.get('@api').then(({ documentation }: any) => {
            cy.makeAPIRequest(documentation.endPoint, 'PUT').then((response) => {
                expect(response.status).to.be.equal(200)
            })
        })
    })
})

describe('API Tests for Fetching documentation', () => {

    const login = new LoginPage()
    const home = new HomePage()
    var response: any

    beforeEach(() => {
        cy.fixture('api').as('api')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ documentation }: any) => {
            cy.setHeaders(documentation.headers)
            cy.setAuthorizationToken(userSession)
            cy.setRequestBody(documentation.body)
        })
    })

    it('Get the resource and verify the success code in the response', () => {
        cy.get('@api').then(({ documentation }: any) => {
            debugger
            cy.makeAPIRequest(documentation.endPoint, 'GET').then((res) => {
                debugger
                expect(res.status).to.be.equal(200)
                slugValue = res.body[0].slug
                response = res.body[0]
            })
        })
    })


    it('Compare the values in response against the values passed in the request', () => {
        cy.get('@api').then(({documentation}:any) => {
            cy.compareJSONObjects(response, documentation.body)
        }) 
    })
})

describe('API Tests for Deleting documentation', () => {

    const login = new LoginPage()
    const home = new HomePage()

    beforeEach(() => {
        cy.fixture('api').as('api')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ documentation }: any) => {
            cy.setHeaders(documentation.headers)
            cy.setAuthorizationToken(userSession)
            cy.setRequestBody(documentation.body)
        })
    })

    it('Delete the documentation', () => {
        cy.get('@api').then(({ documentation }: any) => {
            cy.makeAPIRequest(documentation.endPoint + '/' + slugValue, 'DELETE').then((response) => {
                expect(response.status).to.be.equal(200)
            })
        })
    })
})

describe('API Tests for to verify no value in Get call after deleting document content', () => {

    const login = new LoginPage()
    const home = new HomePage()

    beforeEach(() => {
        cy.fixture('api').as('api')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ documentation }: any) => {
            cy.setHeaders(documentation.headers)
            cy.setAuthorizationToken(userSession)
            cy.setRequestBody(documentation.body)
        })
    })

    it('Delete the documentation', () => {
        cy.get('@api').then(({ documentation }: any) => {
            cy.makeAPIRequest(documentation.endPoint, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
                expect(response.body).to.be.empty
            })
        })
    })
})
