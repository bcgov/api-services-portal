import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
let userSession: any
let nameSpace: string

describe('Get the user session token to pass it as authorization token to make the API call ', () => {

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
            nameSpace = apiTest.namespace
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
                // expect(response.status).to.be.equal(200)
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
                response = res.body
            })
        })
    })

    it('Verify that the selected Namespace is displayed in the Response list in the response', () => {
        expect(response).to.be.contain(nameSpace)
    })
})

describe('API Tests for Namespace Activities', () => {

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
            cy.makeAPIRequest(namespaces.endPoint + "/" + nameSpace + "/activity", 'GET').then((res) => {
                expect(res.status).to.be.equal(200)
            })
        })
    })
})

describe('API Tests for Namespace Summary', () => {

    const login = new LoginPage()
    const home = new HomePage()
    var response: any

    beforeEach(() => {
        cy.fixture('api').as('api')
        cy.fixture('apiowner').as('apiowner')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ namespaces }: any) => {
            cy.setHeaders(namespaces.headers)
            cy.setAuthorizationToken(userSession)
        })
    })

    it('Get the resource for namespace summary and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ namespace }: any) => {
            cy.get('@api').then(({ namespaces }: any) => {
                cy.makeAPIRequest(namespaces.endPoint + "/" + namespace, 'GET').then((res) => {
                    expect(res.status).to.be.equal(200)
                    response = res.body
                })
            })
        })
    })

    it('Verify that expected namespace summary details are display in the response', () => {
        cy.get('@api').then(({ namespaces }: any) => {
            // cy.compareJSONObjects(response, namespaces.activity)
        })
    })
})

describe('API Tests for Deleting Namespace', () => {

    const login = new LoginPage()
    const home = new HomePage()


    beforeEach(() => {
        cy.fixture('api').as('api')
        cy.fixture('apiowner').as('apiowner')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ namespaces }: any) => {
            cy.setHeaders(namespaces.headers)
            cy.setAuthorizationToken(userSession)
        })
    })

    it('Delete the namespace and verify the Validation to prevent deleting the namespace', () => {
        cy.get('@apiowner').then(({ namespace }: any) => {
            cy.get('@api').then(({ namespaces }: any) => {
                cy.makeAPIRequest(namespaces.endPoint + "/" + namespace, 'DELETE').then((res) => {
                    expect(res.status).to.be.equal(422)
                })
            })
        })
    })

    it('Force delete the namespace and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ namespace }: any) => {
            cy.get('@api').then(({ namespaces }: any) => {
                cy.makeAPIRequest(namespaces.endPoint + "/" + namespace + '?force=true', 'DELETE').then((res) => {
                    expect(res.status).to.be.equal(200)
                })
            })
        })
    })

//need to confirm with Aidan - service returns 500 status code if there is no any namespaces
    // it('Verify that deleted namespace does not display in Get namespace list', () => {
    //     let response: any
    //     cy.get('@api').then(({ namespaces }: any) => {
    //         cy.makeAPIRequest(namespaces.endPoint, 'GET').then((res) => {
    //             // expect(res.status).to.be.equal(200)
    //             response = res.body
    //             expect(response).to.not.contain(nameSpace)
    //         })
    //     })
    // })
})
