import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
let userSession: any
let slugValue: string
let namespace: string
let updatedDocumentEndPoint: string
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
            cy.replaceWord(documentation.endPoint, 'apiplatform', namespace).then((updatedEndPoint: string) => {
                updatedDocumentEndPoint = updatedEndPoint
                cy.makeAPIRequest(updatedDocumentEndPoint, 'PUT').then((response:any) => {
                    expect(response.apiRes.status).to.be.equal(200)
                    cy.addToAstraScanIdList(response.astraRes.body.status)
                })
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
        cy.makeAPIRequest(updatedDocumentEndPoint, 'GET').then((res:any) => {
            expect(res.apiRes.status).to.be.equal(200)
            cy.addToAstraScanIdList(res.astraRes.body.status)
            slugValue = res.apiRes.body[0].slug
            response = res.apiRes.body[0]
        })
    })


    it('Compare the values in response against the values passed in the request', () => {
        cy.get('@api').then(({ documentation }: any) => {
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

    it('Verify the status code and response message for invalid slugvalue', () => {
        cy.makeAPIRequest(updatedDocumentEndPoint + '/platform_test', 'DELETE').then((response:any) => {
            expect(response.apiRes.status).to.be.oneOf([404, 422])
            expect(response.apiRes.body.message).to.be.equal("Content not found")
            cy.addToAstraScanIdList(response.astraRes.body.status)
        })
    })


    it('Delete the documentation', () => {
        cy.makeAPIRequest(updatedDocumentEndPoint + '/' + slugValue, 'DELETE').then((response:any) => {
            expect(response.apiRes.status).to.be.equal(200)
            cy.addToAstraScanIdList(response.astraRes.body.status)
        })
    })
})

describe('API Tests to verify no value in Get call after deleting document content', () => {

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
        cy.makeAPIRequest(updatedDocumentEndPoint, 'GET').then((response:any) => {
            expect(response.apiRes.status).to.be.equal(200)
            cy.addToAstraScanIdList(response.astraRes.body.status)
            expect(response.apiRes.body).to.be.empty
        })
    })
})

describe('API Tests to verify Get documentation content', () => {

    const login = new LoginPage()
    const home = new HomePage()
    let slugID: string

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

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ documentation }: any) => {
            cy.setHeaders(documentation.headers)
            cy.setAuthorizationToken(userSession)
            cy.setRequestBody(documentation.body)
        })
    })

    it('Put the resource and verify the success code in the response', () => {
        cy.makeAPIRequest(updatedDocumentEndPoint, 'PUT').then((response:any) => {
            expect(response.apiRes.status).to.be.equal(200)
            cy.addToAstraScanIdList(response.astraRes.body.status)
        })
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ documentation }: any) => {
            cy.setHeaders(documentation.headers)
            cy.setRequestBody(documentation.body)
        })
    })

    it('Verify that document contant is displayed for GET /documentation', () => {
        cy.get('@api').then(({ documentation }: any) => {
            cy.makeAPIRequest(documentation.getDocumentation_endPoint, 'GET').then((response:any) => {
                expect(response.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(response.astraRes.body.status)
                expect(response.apiRes.body[0].title).to.be.equal(documentation.body.title)
                expect(response.apiRes.body[0].description).to.be.equal(documentation.body.description)
                slugID = response.apiRes.body[0].slug
            })
        })
    })

    it('Verify the status code and response message for invalid slug id', () => {
        cy.get('@api').then(({ documentation }: any) => {
            cy.makeAPIRequest(documentation.getDocumentation_endPoint + '/998898', 'GET').then((response:any) => {
                expect(response.apiRes.status).to.be.oneOf([404, 422])
                cy.addToAstraScanIdList(response.astraRes.body.status)
                expect(response.apiRes.body.message).to.be.contains("Not Found")
            })
        })
    })

    it('Verify that document contant is fetch by slug ID', () => {
        cy.get('@api').then(({ documentation }: any) => {
            cy.makeAPIRequest(documentation.getDocumentation_endPoint + '/' + slugID, 'GET').then((response:any) => {
                expect(response.apiRes.status).to.be.equal(200)
                cy.addToAstraScanIdList(response.astraRes.body.status)
                expect(response.apiRes.body.slug).to.be.equal(slugID)
                expect(response.apiRes.body.title).to.be.equal(documentation.body.title)
            })
        })
    })

    after(() => {
        cy.logout()
        cy.clearLocalStorage({ log: true })
        cy.deleteAllCookies()
    })
})
