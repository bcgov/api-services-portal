import LoginPage from "../../pageObjects/login"

describe('Verify namespace delete using gwa command', () => {
    const login = new LoginPage()
    let _namespace: string
    let userSession: any

    before(() => {
        // cy.visit('/')
        cy.deleteAllCookies()
        cy.reload(true)
    })

    beforeEach(() => {
        cy.preserveCookies()
        cy.fixture('apiowner').as('apiowner')
        cy.fixture('common-testdata').as('common-testdata')
        cy.visit(login.path)
    })

    it('Authenticates Janis (api owner) to get the user session token', () => {
        cy.get('@common-testdata').then(({ apiTest }: any) => {
            cy.getUserSessionTokenValue(apiTest.namespace, false).then((value) => {
                userSession = value
            })
        })
    })

    it('Set token using gwa config command', () => {
        cy.executeCliCommand('gwa config set --token ' + userSession).then((response) => {
            expect(response.stdout).to.contain("Config settings saved")
        });
    })

    it('Create namespace using gwa cli command', () => {
        var cleanedUrl = Cypress.env('BASE_URL').replace(/^http?:\/\//i, "");
        cy.exec('gwa gateway create --generate --host ' + cleanedUrl + ' --scheme http', { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
            assert.isNotNaN(response.stdout)
            // Use regex to extract the gateway ID
            const match = response.stdout.match(/Gateway ID: ([\w-]+)/);
            if (match && match[1]) {
                _namespace = match[1];
                assert.isNotNull(_namespace);
            } else {
                throw new Error('Failed to extract Gateway ID from response: ' + response.stdout);
            }
        });
    });

    it('Check gwa gateway destroy command for soft deleting namespace', () => {
        cy.executeCliCommand('gwa gateway destroy ' + _namespace).then((response) => {
            expect(response.stdout).to.contain('Gateway destroyed: ' + _namespace);
        });
    })

    it('Check that deleted namespace does not display in gwa gateway list command', () => {
        cy.executeCliCommand('gwa gateway list').then((response) => {
            expect(response.stdout).not.to.contain(_namespace);
        });
    })

    it('Check gwa gateway destroy command for the namespace associated with services', () => {
        cy.get('@common-testdata').then(({ namespace }: any) => {
            _namespace = namespace
            cy.executeCliCommand('gwa config set --gateway ' + namespace).then((response) => {
                expect(response.stdout).to.contain("Config settings saved")
                cy.executeCliCommand('gwa gateway destroy').then((response) => {
                    expect(response.stderr).to.contain('Error: Validation Failed');
                });
            })
        })
    })

    it('Check validation if any consumer is associated with namespace for hard deleting the namespace', () => {
        cy.executeCliCommand('gwa gateway destroy --force').then((response) => {
            expect(response.stderr).to.contain('Error: Validation Failed');
        });
    })

    after(() => {
        cy.logout()
        cy.clearLocalStorage({ log: true })
        cy.deleteAllCookies()
    })
})