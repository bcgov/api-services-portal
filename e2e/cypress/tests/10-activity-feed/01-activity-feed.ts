import ActivityPage from "../../pageObjects/activity"
import HomePage from "../../pageObjects/home"
import login from "../../pageObjects/login"
import LoginPage from "../../pageObjects/login"
let userSession: any
let nameSpace: string
let response : any

describe('Get the user session token to pass it as authorization token to make the API call ', () => {

    const login = new LoginPage()
    const home = new HomePage()

    before(() => {
        cy.visit('/')
        // cy.deleteAllCookies()
        cy.reload()
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('apiowner').as('apiowner')
        cy.visit(login.path)
    })

    it('authenticates Janis (api owner) to get the user session token', () => {
        cy.get('@apiowner').then(({ namespace }: any) => {
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
        debugger
        cy.get('@api').then(({ namespaces }: any) => {
            cy.makeAPIRequest(namespaces.endPoint + "/" + nameSpace + "/activity", 'GET').then((res) => {
                debugger
                expect(res.status).to.be.equal(200)
                response = res.body
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
        // cy.deleteAllCookies()
        cy.reload()
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('api').as('api')
        // cy.visit(login.path)
    })

    it('Navigate to activity page', () => {
        cy.visit(activity.path)
    })

    it('Verify Activity filter for "Janis Smith" user', () => {
        activity.checkActivityFilterForUser("Janis Smith",response)
    })

    it('Verify Activity filter for "Harley Jones" user', () => {

        activity.checkActivityFilterForUser("Harley Jones",response)
    })

})