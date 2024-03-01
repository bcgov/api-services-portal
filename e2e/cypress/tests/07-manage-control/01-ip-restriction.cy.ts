import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import ConsumersPage from '../../pageObjects/consumers'

describe('Manage Control-IP Restriction Spec', () => {
    const login = new LoginPage()
    const home = new HomePage()
    const consumers = new ConsumersPage()

    before(() => {
        cy.visit('/')
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('access-manager').as('access-manager')
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('manage-control-config-setting').as('manage-control-config-setting')
        cy.fixture('common-testdata').as('common-testdata')
    })

    it('authenticates Mark (Access Manager)', () => {
        cy.get('@access-manager').then(({ user }: any) => {
            cy.get('@common-testdata').then(({ namespace }: any) => {
                cy.login(user.credentials.username, user.credentials.password).then(() => {
                    home.useNamespace(namespace);
                })
            })
        })
    })

    it('Navigate to Consumer page and filter the product', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.visit(consumers.path);
            consumers.filterConsumerByTypeAndValue('Products', product.name)
        })
    })

    it('Select the consumer from the list', () => {
        consumers.clickOnTheFirstConsumerID()
    })

    it('set IP address that is not accessible in the network as allowed IP and set Route as scope', () => {
        cy.get('@manage-control-config-setting').then(({ ipRestriction }: any) => {
            consumers.setAllowedIPAddress(ipRestriction.ipRange_inValid, 'Route')
        })
    })

    it('verify IP Restriction error when the API calls other than the allowed IP', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(403)
                expect(response.body.message).to.be.contain('Your IP address is not allowed')
            })
        })
    })

    it('set IP address that is not accessible in the network as allowed IP and set service as scope', () => {
        cy.get('@access-manager').then(() => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            cy.get('@manage-control-config-setting').then(({ ipRestriction }: any) => {
                consumers.setAllowedIPAddress(ipRestriction.ipRange_inValid)
            })
        })
    })

    it('verify IP Restriction error when the API calls other than the allowed IP', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(403)
                expect(response.body.message).to.be.contain('Your IP address is not allowed')
            })
        })
    })

    it('set IP address that is accessible in the network as allowed IP and set route as scope', () => {
        cy.get('@access-manager').then(() => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            cy.get('@manage-control-config-setting').then(({ ipRestriction }: any) => {
                consumers.setAllowedIPAddress(ipRestriction.ipRange_valid, "Route")
            })
        })
    })

    it('verify the success stats when the API calls within the allowed IP range', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
            })
        })
    })

    it('set IP address that is accessible in the network as allowed IP and set service as scope', () => {
        cy.get('@access-manager').then(() => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            cy.get('@manage-control-config-setting').then(({ ipRestriction }: any) => {
                consumers.setAllowedIPAddress(ipRestriction.ipRange_valid)
            })
        })
    })

    it('verify the success stats when the API calls within the allowed IP range', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
            })
        })
    })
})

describe('Manage Control -Apply IP Restriction to Global and Consumer at Service level', () => {
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

    it('Navigate to Consumer page and filter the product', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.visit(consumers.path);
            consumers.filterConsumerByTypeAndValue('Products', product.name)
        })
    })

    it('set api ip-restriction to global service level', () => {
        cy.visit(consumers.path);
        consumers.clickOnTheFirstConsumerID()
        consumers.clearIPRestrictionControl()
        cy.updateKongPlugin('services', 'ipRestriction').then((response) => {
            expect(response.status).to.be.equal(201)
        })
    })

    it('Verify that IP Restriction is set at global service level', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
            })
        })
    })

    it('set IP address that is not accessible in the network as allowed IP and set service as scope', () => {
        cy.visit(consumers.path);
        consumers.clickOnTheFirstConsumerID()
        cy.get('@manage-control-config-setting').then(({ ipRestriction }: any) => {
            consumers.setAllowedIPAddress(ipRestriction.ipRange_inValid)
        })
    })

    it('verify IP Restriction error when the API calls other than the allowed IP', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(403)
                expect(response.body.message).to.be.contain('Your IP address is not allowed')
            })
        })
    })
})

describe('Manage Control -Apply IP Restriction to Global and Consumer at Route level', () => {
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

    it('Navigate to Consumer page and filter the product', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.visit(consumers.path);
            consumers.filterConsumerByTypeAndValue('Products', product.name)
        })
    })

    it('set api ip-restriction to global service level', () => {
        cy.visit(consumers.path);
        consumers.clickOnTheFirstConsumerID()
        consumers.clearIPRestrictionControl()
        cy.updateKongPlugin('routes', 'ipRestriction').then((response) => {
            expect(response.status).to.be.equal(201)
        })
    })

    it('Verify that IP Restriction is set at global service level', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(200)
            })
        })
    })

    it('set IP address that is not accessible in the network as allowed IP and set service as scope', () => {
        cy.get('@access-manager').then(({ user, namespace }: any) => {
            cy.visit(consumers.path);
            consumers.clickOnTheFirstConsumerID()
            cy.get('@manage-control-config-setting').then(({ ipRestriction }: any) => {
                consumers.setAllowedIPAddress(ipRestriction.ipRange_inValid)
            })
        })
    })

    it('verify IP Restriction error when the API calls other than the allowed IP', () => {
        cy.get('@apiowner').then(({ product }: any) => {
            cy.makeKongRequest(product.environment.config.serviceName, 'GET').then((response) => {
                expect(response.status).to.be.equal(403)
                expect(response.body.message).to.be.contain('Your IP address is not allowed')
            })
        })
    })

    after(() => {
        cy.logout()
    })
})