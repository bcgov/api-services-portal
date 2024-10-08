import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
import Products from "../../pageObjects/products"
let userSession: any
let productID: string
let envID: string
let updatedProductEndPoint: string
let namespace: string

describe('Get the user session token to check ', () => {

    const login = new LoginPage()
    const home = new HomePage()

    before(() => {
        cy.visit('/')
        cy.deleteAllCookies()
        cy.reload(true)
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('common-testdata').as('common-testdata')
        cy.visit(login.path)
    })

    it('authenticates Janis (api owner) to get the user session token', () => {
        cy.interceptUserSession().then(() => {
            cy.get('@apiowner').then(({ user }: any) => {
                cy.get('@common-testdata').then(({ apiTest }: any) => {
                    cy.login(user.credentials.username, user.credentials.password)
                    cy.activateGateway(apiTest.namespace)
                    namespace = apiTest.namespace
                    cy.get('@login').then(function (xhr: any) {
                        userSession = xhr.response.headers['x-auth-request-access-token']
                    })
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
        cy.fixture('api-v2').as('api')
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
            cy.replaceWord(products.endPoint, 'apiplatform', namespace).then((updatedEndPoint: string) => {
                updatedProductEndPoint = updatedEndPoint
                cy.makeAPIRequest(updatedProductEndPoint, 'PUT').then((response:any) => {
                    expect(response.apiRes.status).to.be.equal(200)
                    cy.addToAstraScanIdList(response.astraRes.body.status)
                })
            })
        })
    })

    it('Get the resource and verify the success code and product name in the response', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.makeAPIRequest(updatedProductEndPoint, 'GET').then((res:any) => {
                expect(res.apiRes.status).to.be.equal(200)
                let index = res.apiRes.body.findIndex((x: { name: string }) => x.name === products.body.name)
                response = res.apiRes.body[index]
                productID = res.apiRes.body[index].appId
                envID = res.apiRes.body[index].environments[0].appId
            })
        })
    })
    it('Compare the values in response against the values passed in the request', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.compareJSONObjects(response, products.body)
        })
    })
})

describe('Verify that created Product is displayed in UI', () => {

    const login = new LoginPage()
    const home = new HomePage()
    const pd = new Products()

    before(() => {
        cy.visit('/')
        cy.reload(true)
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('api-v2').as('api')
        cy.fixture('common-testdata').as('common-testdata')
        cy.visit(login.path)
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
        cy.fixture('api-v2').as('api')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.setHeaders(products.headers)
            cy.setAuthorizationToken(userSession)
        })
    })

    it('Delete the product environment and verify the success code in the response', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.replaceWord(products.deleteEnvironmentEndPoint, 'apiplatform', namespace).then((updatedEndPoint: string) => {
                cy.makeAPIRequest(updatedEndPoint + '/' + envID, 'Delete').then((response:any) => {
                    expect(response.apiRes.status).to.be.equal(200)
                    cy.addToAstraScanIdList(response.astraRes.body.status)
                })
            })
        })
    })

    it('Get the resource and verify that product environment is deleted', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.makeAPIRequest(updatedProductEndPoint, 'GET').then((res:any) => {
                expect(res.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(res.astraRes.body.status)
                let index = res.apiRes.body.findIndex((x: { name: string }) => x.name === products.body.name)
                expect(res.apiRes.body[index].environments).to.be.empty
            })
        })
    })

    it('Delete the product and verify the success code in the response', () => {
        cy.makeAPIRequest(updatedProductEndPoint + '/' + productID, 'Delete').then((response:any) => {
            expect(response.apiRes.status).to.be.equal(200)
            cy.addToAstraScanIdList(response.astraRes.body.status)
        })
    })

    it('Get the resource and verify that product is deleted', () => {
        cy.get('@api').then(({ products }: any) => {
            cy.makeAPIRequest(updatedProductEndPoint, 'GET').then((res:any) => {
                expect(res.apiRes.status).to.be.equal(200)
                response = res.apiRes.body
                cy.addToAstraScanIdList(res.astraRes.body.status)
                assert.equal(response.findIndex((x: { name: string }) => x.name === products.body.name), -1)
            })
        })
    })

    after(() => {
        cy.logout()
        cy.clearLocalStorage({ log: true })
        cy.deleteAllCookies()
    })
})