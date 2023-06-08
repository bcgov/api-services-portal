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
        cy.fixture('manage-control-config-setting').as('manage-control-config-setting')
        // cy.visit(login.path)
    })

    it('authenticates Mark (Access Manager)', () => {
        cy.get('@access-manager').then(({ user, namespace }: any) => {
            cy.login(user.credentials.username, user.credentials.password).then(() => {
                home.useNamespace(namespace);
            })
        })
    })

    it('Navigate to Consumer page and filter the product', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.visit(consumers.path);
            consumers.filterConsumerByTypeAndValue('Products', product.name)
        })
    })

    it('Select the consumer from the list ', () => {
        consumers.saveConsumerNumber()
        consumers.clickOnTheFirstConsumerID()
    })

    it('set api rate limit as per the test config, Local Policy and Scope as Service', () => {
        cy.get('@manage-control-config-setting').then(({ rateLimiting }: any) => {
            consumers.clearIPRestrictionControl()
            consumers.setRateLimiting(rateLimiting.requestPerHour_Consumer)
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
        cy.fixture('manage-control-config-setting').as('manage-control-config-setting')
        cy.visit(login.path)
    })
    it('set api rate limit as per the test config, Local Policy and Scope as Route', () => {
        cy.get('@manage-control-config-setting').then(({ rateLimiting }: any) => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            consumers.setRateLimiting(rateLimiting.requestPerHour_Consumer, "Route")
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
        cy.fixture('manage-control-config-setting').as('manage-control-config-setting')
        cy.visit(login.path)
    })
    it('set api rate limit as per the test config, Redis Policy and Scope as Service', () => {
        cy.get('@manage-control-config-setting').then(({ rateLimiting }: any) => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            consumers.setRateLimiting(rateLimiting.requestPerHour_Consumer, "Service", "Redis")
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
        cy.fixture('manage-control-config-setting').as('manage-control-config-setting')
        cy.visit(login.path)
    })
    it('set api rate limit as per the test config, Redis Policy and Scope as Route', () => {
        cy.get('@manage-control-config-setting').then(({ rateLimiting }: any) => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            consumers.setRateLimiting(rateLimiting.requestPerHour_Consumer, "Route", "Redis")
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
        cy.fixture('manage-control-config-setting').as('manage-control-config-setting')
        cy.visit(login.path)
    })

    it('set api rate limit to global service level', () => {
        cy.visit(consumers.path);
        consumers.clickOnTheFirstConsumerID()
        consumers.clearRateLimitControl()
        cy.updateKongPlugin('services', 'rateLimiting').then((response) => {
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

    it('set api rate limit as per the test config, Redis Policy and Scope as Service', () => {
        cy.get('@manage-control-config-setting').then(({ rateLimiting }: any) => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            consumers.setRateLimiting(rateLimiting.requestPerHour_Global, "Service", "Redis")
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
        cy.fixture('manage-control-config-setting').as('manage-control-config-setting')
        cy.visit(login.path)
    })

    it('set api rate limit to global service level', () => {
        cy.visit(consumers.path);
        consumers.clickOnTheFirstConsumerID()
        consumers.clearRateLimitControl()
        cy.updateKongPlugin('routes', 'rateLimiting').then((response) => {
            expect(response.status).to.be.equal(201)
        })
    })

    it('Verify that Rate limiting is set at global service level', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.wait(5000)
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
                expect(parseInt(response.headers["x-ratelimit-remaining-hour"])).to.be.equal(18)
            })
        })
    })

    it('set api rate limit as per the test config, Redis Policy and Scope as Service', () => {
        cy.get('@manage-control-config-setting').then(({ rateLimiting }: any) => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            consumers.setRateLimiting(rateLimiting.requestPerHour_Global, "Route", "Redis")
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