import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
import Products from "../../pageObjects/products"
let userSession: any
let productID: string
let envID: string

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
                cy.get('@login').then(function (xhr: any) {
                    userSession = xhr.response.headers['x-auth-request-access-token']
                })
            })
        })
    })

})

describe('API Tests for Updating Products', () => {

    const login = new LoginPage()
    const home = new HomePage()
    var response: any

    beforeEach(() => {
        cy.fixture('api').as('api')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.setHeaders(products.headers)
            cy.setAuthorizationToken(userSession)
            cy.setRequestBody(products.body)
        })
    })

    it('Put the resource and verify the success code in the response', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.makeAPIRequest(products.endPoint, 'PUT').then((response) => {
                expect(response.status).to.be.equal(200)
            })
        })
    })

    it('Get the resource and verify the success code and product name in the response', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.makeAPIRequest(products.endPoint, 'GET').then((res) => {
                expect(res.status).to.be.equal(200)
                expect(res.body.length).to.be.equal(1)
                response = res.body
                productID = res.body[0].appId
                envID = res.body[0].environments[0].appId
            })
        })
    })
    it('Compare the values in response against the values passed in the request', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.compareJSONObjects(response, products.body, true)
        })
    })
})

describe('Verify that created Product is displayed in UI', () => {

    const login = new LoginPage()
    const home = new HomePage()
    const pd = new Products()

    before(() => {
        cy.visit('/')
        cy.deleteAllCookies()
        cy.reload()
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('api').as('api')
        cy.visit(login.path)
    })

    it('authenticates Janis (api owner) to get the user session token', () => {
        cy.getUserSessionTokenValue().then((value) => {
            userSession = value
         })
    })

    it('Verify that the product is visible in Manage Product Page', () => {
        cy.visit(pd.path)
        cy.get('@api').then(({ products }: any) => {
            pd.verifyProductIsVisible(products.body.name)
        })
    })
})

describe('API Tests for Delete Products', () => {

    const login = new LoginPage()
    const home = new HomePage()
    var response: any

    beforeEach(() => {
        cy.fixture('api').as('api')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.setHeaders(products.headers)
            cy.setAuthorizationToken(userSession)
        })
    })

    it('Delete the product environment and verify the success code in the response', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.makeAPIRequest(products.deleteEnvironmentEndPoint+'/'+envID, 'Delete').then((response) => {
                expect(response.status).to.be.equal(200)
            })
        })
    })

    it('Get the resource and verify that product environment is deleted', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.makeAPIRequest(products.endPoint, 'GET').then((res) => {
                expect(res.status).to.be.equal(200)
                expect(res.body.length).to.be.equal(1)
                expect(res.body[0].environments).to.be.empty
            })
        })
    })

    it('Delete the product and verify the success code in the response', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.makeAPIRequest(products.endPoint+'/'+productID, 'Delete').then((response) => {
                expect(response.status).to.be.equal(200)
            })
        })
    })

    it('Get the resource and verify that product is deleted', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.makeAPIRequest(products.endPoint, 'GET').then((res) => {
                expect(res.status).to.be.equal(200)
                expect(res.body.length).to.be.equal(0)
            })
        })
    })
})

