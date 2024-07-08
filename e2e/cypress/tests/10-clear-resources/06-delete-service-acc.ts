import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import NameSpacePage from '../../pageObjects/namespace'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'


describe('Create API Spec', () => {
    const login = new LoginPage()
    const home = new HomePage()
    const sa = new ServiceAccountsPage()
    const pd = new Products()
    const ns = new NameSpacePage()
    var nameSpace: string
    let userSession: string

    before(() => {
        cy.visit('/')
        cy.reload()
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('api').as('api')
        cy.fixture('common-testdata').as('common-testdata')
        // cy.visit(login.path)
    })

    it('authenticates Janis (api owner)', () => {
        cy.get('@apiowner').then(({ user }: any) => {
            cy.get('@common-testdata').then(({ namespace }: any) => {
                cy.login(user.credentials.username, user.credentials.password)
                cy.log('Logged in!')
                cy.activateGateway(namespace)
            })
        })
    })

    it('Delete existing service account', () => {
        cy.fixture('state/store').then((creds: any) => {
            let cc = JSON.parse(creds.credentials)
            const id = cc.clientId
            cy.visit(sa.path)
            sa.deleteServiceAccount(id)
        })
    })

    it('Verify that the service account is disabled', () => {
        cy.fixture('state/store').then((creds: any) => {
            let cc = JSON.parse(creds.credentials)
            cy.getAccessToken(cc.clientId, cc.clientSecret).then(() => {
                cy.get('@accessTokenResponse').then((token_res: any) => {
                    expect(token_res.status).to.be.equal(400)
                    expect(token_res.body.error).to.contains("invalid_client")
                })
            })
        })
    })
})