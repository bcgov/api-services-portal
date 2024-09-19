import HomePage from '../../pageObjects/home'
import LoginPage from '../../pageObjects/login'
import Products from '../../pageObjects/products'
import ServiceAccountsPage from '../../pageObjects/serviceAccounts'


describe('Create API Spec', () => { 
  const login = new LoginPage()
  const home = new HomePage()
  const sa = new ServiceAccountsPage()
  const pd = new Products()
  var nameSpace: string
  let userSession: any

  before(() => {
    cy.visit('/')
    cy.reload(true)
    cy.resetState()
    cy.deleteAllCookies()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('api').as('api')
    cy.fixture('common-testdata').as('common-testdata')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@common-testdata').then(({ namespace }: any) => {
      cy.getUserSessionTokenValue(namespace, false).then((value) => {
        userSession = value
      })
    })
  })

  it('Check gwa config command to set environment', () => {
    var cleanedUrl = Cypress.env('BASE_URL').replace(/^http?:\/\//i, "");
    cy.executeCliCommand('gwa config set --host ' + cleanedUrl + ' --scheme http').then((response) => {
      expect(response.stdout).to.contain("Config settings saved")
    });
  })

  it('Check gwa config command to set token', () => {
    cy.executeCliCommand('gwa config set --token ' + userSession).then((response) => {
      expect(response.stdout).to.contain("Config settings saved")
    });
  })

  it('creates and activates new namespace', () => {
    cy.getUserSession().then(() => {
      cy.get('@common-testdata').then(({ namespace }: any) => {
        nameSpace = namespace
        cy.createGateway(namespace)
        cy.activateGateway(namespace)
        cy.visit('/manager/gateways/detail')
        cy.get('[data-testid="ns-detail-gatewayid"]').then(($el) => {
          expect($el).contain(namespace)
        })
        cy.get('@login').then(function (xhr: any) {
          userSession = xhr.headers['x-auth-request-access-token']
        })
      })
    })
  })

  it('creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ serviceAccount }: any) => {
      sa.createServiceAccount(serviceAccount.scopes)
      cy.wait(6000)
    })
    sa.saveServiceAcctCreds()
  })

it('Verify gwa gateway publish multiple config file', () => {
   cy.get('@common-testdata').then(({ namespace }: any) => {
      cy.publishApi(['service-plugin_A.yml','service-plugin_B.yml'], namespace).then((response: any) => {
        expect(response.stdout).to.contain('Gateway config published');
      })
    })
})

  it('publishes a new API for Dev environment to Kong Gateway', () => {
    cy.get('@common-testdata').then(({ namespace }: any) => {
      cy.publishApi(['service.yml'], namespace).then((response: any) => {
        expect(response.stdout).to.contain('Sync successful');
      })
    })
  })

  it('Upload dataset and Product using GWA Apply command', () => {
    cy.executeCliCommand('gwa apply -i cypress/fixtures/gw-config.yml').then((response) => {
      let wordOccurrences = (response.stdout.match(/\bcreated\b/g) || []).length;
      expect(wordOccurrences).to.equal(2)
    })
  })

  it('Associate Namespace to the organization Unit', () => {
    cy.get('@api').then(({ organization }: any) => {
      cy.setHeaders(organization.headers)
      cy.setAuthorizationToken(userSession)
      cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/' + organization.orgExpectedList.name + '/gateways/' + nameSpace, 'PUT').then((response:any) => {
        expect(response.apiRes.status).to.be.equal(200)
      })
    })
  })

  it('Verify the message when no dataset is linked to BCDC', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.checkMessageForNoDataset(product.name, "health")
    })
  })

  it('update the Dataset in BC Data Catalogue to appear the API in the Directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.updateDatasetNameToCatelogue(product.name, product.environment.name)
    })
  })

  it('publish product to directory', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.editProductEnvironment(product.name, product.environment.name)
      pd.editProductEnvironmentConfig(product.environment.config)
      pd.getKongPluginConfig(product.name, product.environment.name)
    })
  })


  it('Create a Test environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.addEnvToProduct(product.name, product.test_environment.name)
      pd.editProductEnvironment(product.name, product.test_environment.name)
      pd.editProductEnvironmentConfig(product.test_environment.config)
      pd.generateKongPluginConfig(product.name, product.test_environment.name, 'service.yml', true)
    })
  })

  it('applies authorization plugin to service published to Kong Gateway', () => {
    cy.get('@common-testdata').then(({ namespace }: any) => {
      cy.publishApi('service-plugin.yml', namespace).then((response: any) => {
        expect(response.stdout).to.contain('Sync successful');
      })
    })
  })

  it('activate the service for Test environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.activateService(product.name, product.test_environment.name, product.test_environment.config)
      cy.wait(3000)
    })
  })

  it('activate the service for Dev environment', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      // pd.editProductEnvironment(product.name, product.environment.name)
      pd.activateService(product.name, product.environment.name, product.environment.config)
      cy.wait(3000)
    })
  })

  it('verify status of the services using "gwa status" command', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.executeCliCommand('gwa status').then((response) => {
        expect(response.stdout).to.contain(product.environment.config.serviceName);
        expect(response.stdout).to.contain(product.test_environment.config.serviceName);
        const wordOccurrences = (response.stdout.match(/\b200 Response\b/g) || []).length;
        expect(wordOccurrences).to.equal(2)
      })
    })
  })

  after(() => {
    cy.logout()
  })
})
