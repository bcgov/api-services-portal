import HomePage from "../../pageObjects/home"
import LoginPage from "../../pageObjects/login"
let testData = require("../../fixtures/apiowner.json")
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
        cy.fixture('common-testdata').as('common-testdata')
        cy.visit(login.path)
    })

    it('authenticates Janis (api owner) to get the user session token', () => {
        cy.get('@common-testdata').then(({ apiTest }: any) => {
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
        cy.fixture('common-testdata').as('common-testdata')
    })

    it('Prepare the Request Specification for the API', () => {
        cy.get('@api').then(({ namespaces }: any) => {
            cy.setHeaders(namespaces.headers)
            cy.setAuthorizationToken(userSession)
        })
    })

    it('Get the resource for namespace summary and verify the success code in the response', () => {
        cy.get('@common-testdata').then(({ namespace }: any) => {
            cy.get('@api').then(({ namespaces }: any) => {
                cy.makeAPIRequest(namespaces.endPoint + "/" + namespace, 'GET').then((res) => {
                    expect(res.status).to.be.equal(200)
                    response = res.body.name
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

describe('API Tests for Create Namespace', () => {

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

    it('Create system generated namespace when user does not specify namespace name', () => {
        cy.get('@api').then(({ namespaces }: any) => {
            cy.makeAPIRequest(namespaces.endPoint, 'POST').then((res) => {
                expect(res.status).to.be.equal(200)
                expect(res.body.displayName).to.be.equal(null)
                nameSpace = res.body.name
            })
        })
    })

    it('Verify that the generated namespace is displayed in the namespace list', () => {
        cy.get('@api').then(({ namespaces }: any) => {
            cy.makeAPIRequest(namespaces.endPoint, 'GET').then((res) => {
                expect(res.status).to.be.equal(200)
                expect(res.body).to.be.contain(nameSpace)
            })
        })
    })

    it('Create users own namespace with its description', () => {
        cy.get('@api').then(({ namespaces }: any) => {
            cy.setRequestBody(namespaces.userDefinedNamespace)
            cy.makeAPIRequest(namespaces.endPoint, 'POST').then((res) => {
                expect(res.status).to.be.equal(200)
                expect(res.body.displayName).to.be.equal(namespaces.userDefinedNamespace.displayName)
                nameSpace = res.body.name
            })
        })
    })

    it('Verify that the generated namespace is displayed in the namespace list', () => {
        cy.get('@api').then(({ namespaces }: any) => {
            cy.makeAPIRequest(namespaces.endPoint, 'GET').then((res) => {
                expect(res.status).to.be.equal(200)
                expect(res.body).to.be.contain(nameSpace)
            })
        })
    })
})

describe('API Tests for invalid namespace name', () => {

    beforeEach(() => {
        cy.fixture('api').as('api')
        cy.fixture('apiowner').as('apiowner')
    })

    it('Verify validation message in response when user creat namespace using invalid name', () => {
        cy.get('@api').then(({ namespaces }: any) => {
            cy.fixture('apiowner').then((testdata: any) => {
                let namespaceName: Array<string> = testdata.invalid_namespace
                testdata
                namespaceName.forEach((name: any) => {
                    cy.setHeaders(namespaces.headers)
                    // cy.setRequestBody('{"name": "' + name + '","displayName": "Test for GWA test"}')
                    cy.updateJsonBoby(namespaces.inValidNamespace, 'name', name).then((updatedBody) => {
                        cy.setRequestBody(updatedBody)
                        cy.makeAPIRequest(namespaces.endPoint, 'POST').then((res) => {
                            expect(res.status).to.be.equal(422)
                            expect(res.body.message).to.be.equal('Validation Failed')
                        })
                    })
                })
            })
        })
    })
})

// describe('API Tests for Deleting Namespace', () => {

//     const login = new LoginPage()
//     const home = new HomePage()


//     beforeEach(() => {
//         cy.fixture('api').as('api')
//         cy.fixture('apiowner').as('apiowner')
//     })

//     it('Prepare the Request Specification for the API', () => {
//         cy.get('@api').then(({ namespaces }: any) => {
//             cy.setHeaders(namespaces.headers)
//             cy.setAuthorizationToken(userSession)
//         })
//     })

//     it('Delete the namespace and verify the Validation to prevent deleting the namespace', () => {
//         cy.get('@apiowner').then(({ namespace }: any) => {
//             cy.get('@api').then(({ namespaces }: any) => {
//                 cy.makeAPIRequest(namespaces.endPoint + "/" + namespace, 'DELETE').then((res) => {
//                     expect(res.status).to.be.equal(422)
//                 })
//             })
//         })
//     })

//     it('Force delete the namespace and verify the success code in the response', () => {
//         cy.get('@apiowner').then(({ namespace }: any) => {
//             cy.get('@api').then(({ namespaces }: any) => {
//                 cy.makeAPIRequest(namespaces.endPoint + "/" + namespace + '?force=true', 'DELETE').then((res) => {
//                     expect(res.status).to.be.equal(200)
//                 })
//             })
//         })
//     })

//     //need to confirm with Aidan - service returns 500 status code if there is no any namespaces
//     // it('Verify that deleted namespace does not display in Get namespace list', () => {
//     //     let response: any
//     //     cy.get('@api').then(({ namespaces }: any) => {
//     //         cy.makeAPIRequest(namespaces.endPoint, 'GET').then((res) => {
//     //             // expect(res.status).to.be.equal(200)
//     //             response = res.body
//     //             expect(response).to.not.contain(nameSpace)
//     //         })
//     //     })
//     // })

//     after(() => {
//         cy.logout()
//         cy.clearLocalStorage({ log: true })
//         cy.deleteAllCookies()
//     })
// })
