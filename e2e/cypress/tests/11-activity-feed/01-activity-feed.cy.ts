import ActivityPage from "../../pageObjects/activity"
import HomePage from "../../pageObjects/home"
import login from "../../pageObjects/login"
import LoginPage from "../../pageObjects/login"
let userSession: any
let nameSpace: string
let response: any

describe('Get the user session token to pass it as authorization token to make the API call ', () => {

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
        cy.get('@common-testdata').then(({ namespace }: any) => {
            cy.getUserSessionTokenValue(namespace).then((value) => {
                userSession = value
            })
            nameSpace = namespace
        })
    })
})

describe('API Tests for Activity report', () => {

    const login = new LoginPage()
    const home = new HomePage()

    beforeEach(() => {
        cy.preserveCookies()
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
            cy.makeAPIRequest(namespaces.endPoint + "/" + nameSpace + "/activity?first=100", 'GET').then((res:any) => {
                expect(res.data2.status).to.be.equal(200)
                response = res.data2.body
            })
        })
    })
})

describe('Generate activity response from APS V2 API', () => {

    const login = new LoginPage()
    const home = new HomePage()

    beforeEach(() => {
        cy.preserveCookies()
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
            cy.makeAPIRequest(namespaces.endPoint + "/" + nameSpace + "/activity?first=100", 'GET').then((res:any) => {
                expect(res.data2.status).to.be.equal(200)
                response = res.data2.body
            })
        })
    })
})

describe('Verify the Activity filter for users', () => {

    const activity = new ActivityPage()
    const home = new HomePage()
    const login = new LoginPage()

    before(() => {
        cy.visit('/')
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('api').as('api')
        cy.fixture('common-testdata').as('common-testdata')
        // cy.visit(login.path)
    })

    it('activates new namespace', () => {
        cy.get('@common-testdata').then(({ namespace }: any) => {
            home.useNamespace(namespace)
        })
    })


    it('Navigate to activity page', () => {
        cy.visit(activity.path)
    })

    it('Verify Activity filter for "Janis Smith" user', () => {
        activity.checkActivityFilter("User", "Janis Smith", response)
    })

    it('Verify Activity filter for "Harley Jones" user', () => {
        activity.checkActivityFilter("User", "Harley Jones", response)
    })

    it('Verify Activity filter for "Mark F Mark L" user', () => {
        activity.checkActivityFilter("User", "Mark F Mark L", response)
    })

    it('Verify Activities filter for consumer', () => {
        cy.readFile('cypress/fixtures/state/regen.json').then((store) => {
            let consumerID = store.consumernumber
            activity.checkActivityFilter("Consumer", consumerID, response)
        })
    })
})