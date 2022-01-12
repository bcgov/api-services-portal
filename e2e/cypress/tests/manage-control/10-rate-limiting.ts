import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import ConsumersPage from '../../pageObjects/consumers'

describe('Manage Control-Rate Limiting Spec for Service as Scope and Local Policy', () => {
    const login = new LoginPage()
    const home = new HomePage()
    const consumers = new ConsumersPage()

    before(() => {
        cy.visit('/')
        cy.deleteAllCookies()
        cy.reload()
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('access-manager').as('access-manager')
        cy.fixture('apiowner').as('apiowner')
        cy.visit(login.path)
    })

    it('set api rate limit to 1 request per min, Local Policy and Scope as Service', () => {
        cy.get('@access-manager').then(({ user, namespace }: any) => {
            cy.login(user.credentials.username, user.credentials.password).then(() => {
                home.useNamespace(namespace);
                cy.visit(consumers.path);
                consumers.clickOnTheFirstConsumerID()
                consumers.setRateLimiting('1')
            })
        })
    })

    it('verify rate limit error when the API calls beyond the limit', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
            })
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(429)
                expect(response.body.message).to.be.contain('API rate limit exceeded')
            })
        })
    })
})

describe('Manage Control-Rate Limiting Spec for Route as Scope and Local Policy', () => {
    const login = new LoginPage()
    const home = new HomePage()
    const consumers = new ConsumersPage()

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('access-manager').as('access-manager')
        cy.fixture('apiowner').as('apiowner')
        cy.visit(login.path)
    })
    it('set api rate limit to 1 request per min, Local Policy and Scope as Route', () => {
        cy.get('@access-manager').then(({ user, namespace }: any) => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            consumers.setRateLimiting('1', "Route")
        })
    })

    it('verify rate limit error when the API calls beyond the limit', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
            })
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(429)
                expect(response.body.message).to.be.contain('API rate limit exceeded')
            })
        })
    })
})

describe('Manage Control-Rate Limiting Spec for Route as Scope and Redis Policy', () => {
    const login = new LoginPage()
    const home = new HomePage()
    const consumers = new ConsumersPage()

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('access-manager').as('access-manager')
        cy.fixture('apiowner').as('apiowner')
        cy.visit(login.path)
    })
    it('set api rate limit to 1 request per hour, Redis Policy and Scope as Route', () => {
        cy.get('@access-manager').then(({ user, namespace }: any) => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            consumers.setRateLimiting('1', "Route", "Redis")
        })
    })

    it('verify rate limit error when the API calls beyond the limit', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
            })
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(429)
                expect(response.body.message).to.be.contain('API rate limit exceeded')
            })
        })
    })
})

describe('Manage Control-Rate Limiting Spec for Service as Scope and Redis Policy', () => {
    const login = new LoginPage()
    const home = new HomePage()
    const consumers = new ConsumersPage()

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('access-manager').as('access-manager')
        cy.fixture('apiowner').as('apiowner')
        cy.visit(login.path)
    })
    it('set api rate limit to 1 request per hour, Redis Policy and Scope as Service', () => {
        cy.get('@access-manager').then(({ user, namespace }: any) => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            consumers.setRateLimiting('1', "Service", "Redis")
        })
    })

    it('verify rate limit error when the API calls beyond the limit', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
            })
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(429)
                expect(response.body.message).to.be.contain('API rate limit exceeded')
            })
        })
    })
})

describe('Manage Control-Apply Rate limiting to Global and Consumer at Service level ', () => {
    const login = new LoginPage()
    const home = new HomePage()
    const consumers = new ConsumersPage()

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('access-manager').as('access-manager')
        cy.fixture('apiowner').as('apiowner')
        cy.visit(login.path)
    })

    it('set api rate limit to global service level', () => {
        cy.visit(consumers.path);
        consumers.clickOnTheFirstConsumerID()
        consumers.deleteControl()
        cy.updateKongPlugin('services','rate-limiting').then((response) => {
            expect(response.status).to.be.equal(201)
        })
    })

    it('Verify that Rate limiting is set at global service level', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
                expect(parseInt(response.headers["x-ratelimit-remaining-hour"])).to.be.equal(18)
            })
        })
    })

    it('set api rate limit to 1 request per min, Redis Policy and Scope as Service', () => {
        cy.get('@access-manager').then(({ user, namespace }: any) => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            consumers.setRateLimiting('2', "Service", "Redis")
        })
    })

    it('verify rate limit error when the API calls beyond the limit', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
            })
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(429)
                expect(response.body.message).to.be.contain('API rate limit exceeded')
            })
        })
    })
})

describe('Manage Control-Apply Rate limiting to Global and Consumer at Route level ', () => {
    const login = new LoginPage()
    const home = new HomePage()
    const consumers = new ConsumersPage()

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('access-manager').as('access-manager')
        cy.fixture('apiowner').as('apiowner')
        cy.visit(login.path)
    })

    it('set api rate limit to global service level', () => {
        cy.visit(consumers.path);
        consumers.clickOnTheFirstConsumerID()
        consumers.deleteControl()
        cy.updateKongPlugin('routes','rate-limiting').then((response) => {
            expect(response.status).to.be.equal(201)
        })
    })

    it('Verify that Rate limiting is set at global service level', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
                expect(parseInt(response.headers["x-ratelimit-remaining-hour"])).to.be.equal(18)
            })
        })
    })

    it('set api rate limit to 1 request per min, Redis Policy and Scope as Service', () => {
        cy.get('@access-manager').then(({ user, namespace }: any) => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            consumers.setRateLimiting('2', "Route", "Redis")
        })
    })

    it('verify rate limit error when the API calls beyond the limit', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
            })
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(429)
                expect(response.body.message).to.be.contain('API rate limit exceeded')
            })
        })
    })

    after(() => {
        cy.logout()
        cy.clearLocalStorage({ log: true })
        cy.deleteAllCookies()
    })
})