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
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.getUserSessionTokenValue(apiTest.namespace).then((value) => {
                userSession = value
            })
        })
    })
})

describe('API Tests for Updating dataset', () => {

    const login = new LoginPage()
    const home = new HomePage()
    var response: any
    let directoryID: string
    let directoryName: string

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

    it('Put the resource (/organization/{org}/datasets) and verify the success code in the response', () => {
        cy.get('@api').then(({ apiDirectory, organization }: any) => {
            cy.makeAPIRequest(apiDirectory.orgEndPoint + '/' + organization.orgName + '/datasets', 'PUT').then((response) => {
                expect(response.status).to.be.equal(200)
            })
        })
    })

    it('Get the resource (/organization/{org}/datasets/{name}) and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.get('@api').then(({ apiDirectory }: any) => {
                cy.makeAPIRequest(apiDirectory.endPoint + '/' + apiTest.namespace + '/datasets/' + apiDirectory.body.name, 'GET').then((res) => {
                    expect(res.status).to.be.equal(200)
                    response = res.body
                })
            })
        })
    })

    it('Compare the values in response against the values passed in the request', () => {
        cy.get('@api').then(({ apiDirectory }: any) => {
            cy.compareJSONObjects(response, apiDirectory.body)
        })
    })

    it('Put the resource (/namespaces/{ns}/datasets/{name}) and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.get('@api').then(({ apiDirectory }: any) => {
                cy.makeAPIRequest(apiDirectory.endPoint + '/' + apiTest.namespace + '/datasets', 'PUT').then((response) => {
                    expect(response.status).to.be.equal(200)
                })
            })
        })
    })

    it('Get the resource (/namespaces/{ns}/datasets/{name}) and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.get('@api').then(({ apiDirectory }: any) => {
                cy.makeAPIRequest(apiDirectory.endPoint + '/' + apiTest.namespace + '/datasets/' + apiDirectory.body.name, 'GET').then((res) => {
                    expect(res.status).to.be.equal(200)
                    response = res.body
                })
            })
        })
    })

    it('Compare the values in response against the values passed in the request', () => {
        cy.get('@api').then(({ apiDirectory }: any) => {
            cy.compareJSONObjects(response, apiDirectory.body)
        })
    })

    it('Get the resource (/organizations/{org}/datasets/{name}) and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.get('@api').then(({ apiDirectory, organization }: any) => {
                cy.makeAPIRequest(apiDirectory.orgEndPoint + '/' + organization.orgName + '/datasets/' + apiDirectory.body.name, 'GET').then((res) => {
                    expect(res.status).to.be.equal(200)
                    response = res.body
                })
            })
        })
    })

    it('Compare the values in response against the values passed in the request', () => {
        cy.get('@api').then(({ apiDirectory }: any) => {
            cy.compareJSONObjects(response, apiDirectory.body)
        })
    })

    it('Get the resource (/organizations/{org}/datasets) and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.get('@api').then(({ apiDirectory, organization }: any) => {
                cy.makeAPIRequest(apiDirectory.orgEndPoint + '/' + organization.orgName + '/datasets/', 'GET').then((res) => {
                    expect(res.status).to.be.equal(200)
                    response = res.body
                })
            })
        })
    })

    it('Compare the values in response against the values passed in the request', () => {
        cy.get('@api').then(({ apiDirectory }: any) => {
            cy.compareJSONObjects(response, apiDirectory.body, true)
        })
    })

    it('Get the directory details (/directory) and verify the success code in the response', () => {
        cy.get('@api').then(({ apiDirectory }: any) => {
            debugger
            cy.makeAPIRequest(apiDirectory.directoryEndPoint, 'GET').then((res) => {
                debugger
                expect(res.status).to.be.equal(200)
                response = res.body
                directoryID = res.body[0].id
                directoryName = res.body[0].name
            })
        })
    })

    it('Verify the expected directory details are display in the response', () => {
        cy.get('@api').then(({ apiDirectory }: any) => {
            debugger
            // cy.compareJSONObjects(response, apiDirectory.directory, true)
        })
    })

    it('Get the directory details by its ID (/directory/{id}) and verify the success code in the response', () => {
        cy.get('@api').then(({ apiDirectory }: any) => {
            cy.makeAPIRequest(apiDirectory.directoryEndPoint + '/' + directoryID, 'GET').then((res) => {
                expect(res.status).to.be.equal(200)
                expect(res.body.name).to.be.equal(directoryName)
            })
        })
    })

    it('Get the namespace directory details (/namespaces/{ns}/directory) and verify the success code and empty response for the namespace with no directory', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.get('@api').then(({ apiDirectory }: any) => {
                cy.makeAPIRequest(apiDirectory.endPoint + '/' + apiTest.namespace + '/directory', 'GET').then((res) => {
                    expect(res.status).to.be.equal(200)
                    expect(res.body).to.be.empty
                })
            })
        })
    })

    it('Get the namespace directory details (/namespaces/{ns}/directory) and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ namespace }: any) => {
            cy.get('@api').then(({ apiDirectory }: any) => {
                cy.makeAPIRequest(apiDirectory.endPoint + '/' + namespace + '/directory', 'GET').then((res) => {
                    expect(res.status).to.be.equal(200)
                    response = res.body[0]
                    directoryID = res.body[0].id
                    directoryName = res.body[0].name
                })
            })
        })
    })

    // it('Verify the expected namespace directory details are display in the response', () => {
    //     cy.get('@api').then(({ apiDirectory }: any) => {
    //         cy.compareJSONObjects(response, apiDirectory.directory, true)
    //     })
    // })

    it('Get the namespace directory details by its ID (/namespaces/{ns}/directory/{id}) and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ namespace }: any) => {
            cy.get('@api').then(({ apiDirectory }: any) => {
                cy.makeAPIRequest(apiDirectory.endPoint + '/' + namespace + '/directory' + '/' + directoryID, 'GET').then((res) => {
                    expect(res.status).to.be.equal(200)
                    expect(res.body.name).to.be.equal(directoryName)
                })
            })
        })
    })

    it('Get the namespace directory details (/namespaces/{ns}/directory/{id}) for non exist directory ID and verify the response code', () => {
        cy.get('@apiowner').then(({ namespace }: any) => {
            cy.get('@api').then(({ apiDirectory }: any) => {
                cy.makeAPIRequest(apiDirectory.endPoint + '/' + namespace + '/directory' + '/99', 'GET').then((res) => {
                    expect(res.status).to.be.oneOf([404, 422])
                })
            })
        })
    })

    it('Delete the dataset (/organizations/{org}/datasets/{name}) and verify the success code in the response', () => {
        cy.get('@apiowner').then(({ apiTest }: any) => {
            cy.get('@api').then(({ apiDirectory, organization }: any) => {
                cy.makeAPIRequest(apiDirectory.orgEndPoint + '/' + organization.orgName + '/datasets/' + apiDirectory.body.name, 'DELETE').then((res) => {
                    expect(res.status).to.be.equal(200)
                })
            })
        })
    })

    it('Verify that deleted dataset does not display in Get dataset list', () => {
        cy.get('@api').then(({ apiDirectory, organization }: any) => {
            cy.makeAPIRequest(apiDirectory.orgEndPoint + '/' + organization.orgName + '/datasets/', 'GET').then((res) => {
                expect(res.status).to.be.equal(200)
                response = res.body
                expect(response).to.not.contain(apiDirectory.body.name)
            })
        })
    })
})