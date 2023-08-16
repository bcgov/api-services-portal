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
    cy.deleteAllCookies()
    cy.reload()
    cy.resetState()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('api').as('api')
    cy.visit(login.path)
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      cy.getUserSessionTokenValue(namespace, false).then((value) => {
        userSession = value
      })
    })
  })

  it('Check gwa config command to set environment', () => {
    var cleanedUrl = Cypress.env('BASE_URL').replace(/^http?:\/\//i, "");
    cy.executeCliCommand('gwa config set --host '+cleanedUrl+' --scheme http').then((response) => {
      assert.equal(response.stdout, "Config settings saved")
    });
  })

  it('Check gwa config command to set token', () => {
    cy.executeCliCommand('gwa config set --token ' + userSession).then((response) => {
      assert.equal(response.stdout, "Config settings saved")
    });
  })

  it('creates new namespace', () => {
    cy.getUserSession().then(() => {
      cy.get('@apiowner').then(({ namespace }: any) => {
        nameSpace = namespace
        cy.executeCliCommand('gwa namespace create -n ' + namespace).then((response) => {
          assert.equal(response.stdout, namespace)
        })
      })
    })
  })

  it('activates new namespace', () => {
    home.useNamespace(nameSpace)
  })

  it('creates a new service account', () => {
    cy.visit(sa.path)
    cy.get('@apiowner').then(({ serviceAccount }: any) => {
      sa.createServiceAccount(serviceAccount.scopes)
      cy.wait(6000)
    })
    sa.saveServiceAcctCreds()
  })

  it('publishes a new API for Dev environment to Kong Gateway', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      cy.publishApi('service.yml', namespace).then((response: any) => {
        expect(response.stdout).to.contain('Sync successful');
      })
    })
  })

  it('creates as new product in the directory through GWA Cli command', () => {
    cy.gwaPublish('product', 'gwa-product.yaml').then((response: any) => {
      expect(response.stdout).to.contain('Product successfully published');
    })
  })

  it('Upload dataset using GWA Cli command', () => {
    cy.gwaPublish('dataset', 'gwa-dataset.yaml').then((response: any) => {
      expect(response.stdout).to.contain('Dataset successfully published');
    })
  })

  it('Associate Namespace to the organization Unit', () => {
    cy.get('@api').then(({ organization }: any) => {
      cy.setHeaders(organization.headers)
      cy.setAuthorizationToken(userSession)
      cy.makeAPIRequest(organization.endPoint + '/' + organization.orgName + '/' + organization.orgExpectedList.name + '/namespaces/' + nameSpace, 'PUT').then((response) => {
        expect(response.status).to.be.equal(200)
      })
    })
  })

  it('Verify the message when no dataset is linked to BCDC', () => {
    cy.visit(pd.path)
    cy.get('@apiowner').then(({ product }: any) => {
      pd.checkMessageForNoDataset(product.name, "health")
    })
  })

  it('update the Dataset in BC Data Catelogue to appear the API in the Directory', () => {
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
    cy.get('@apiowner').then(({ namespace }: any) => {
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
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })
})
