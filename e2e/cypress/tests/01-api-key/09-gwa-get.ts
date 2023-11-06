import ConsumersPage from '../../pageObjects/consumers'
import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import ProductPage from '../../pageObjects/products'
const yaml = require('js-yaml');

describe('Verify GWA get commands', () => {
  const login = new LoginPage()
  const consumers = new ConsumersPage()
  const home = new HomePage()
  var _namespace: string
  let userSession: any
  let resObj: any

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('api').as('api')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('common-testdata').as('common-testdata')
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@common-testdata').then(({ namespace }: any) => {
      cy.getUserSessionTokenValue(namespace, false).then((value) => {
        userSession = value
        _namespace = namespace
      })
    })
  })

  it('Check gwa config command to set token', () => {
    cy.executeCliCommand('gwa config set --token ' + userSession).then((response) => {
      expect(response.stdout).to.contain("Config settings saved")
    });
  })

  it('Verify "gwa get" for dataset', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.executeCliCommand('gwa get datasets').then((response) => {
        expect(response.stdout).not.to.contain(product);
      })
    })
  })

  it('Verify "gwa get" for dataset in JSON format', () => {
    cy.executeCliCommand('gwa get datasets --json').then((response) => {
      cy.get('@api').then(({ apiDirectory }: any) => {
        cy.setHeaders(apiDirectory.headers)
        cy.setAuthorizationToken(userSession)
        cy.makeAPIRequest(apiDirectory.endPoint + '/' + _namespace + '/directory', 'GET').then((res) => {
          resObj = res.body[0]
          Cypress._.isEqual(resObj, JSON.parse(response.stdout)[0])
        })
      })
    })
  })

  it('Verify "gwa get" for dataset in YAML format', () => {
    cy.executeCliCommand('gwa get datasets --yaml').then((response) => {
      const yamlObject = yaml.load(response.stdout)
      Cypress._.isEqual(resObj, yamlObject)
    })
  })

  it('Verify "gwa get" for products', () => {
    cy.get('@apiowner').then(({ product }: any) => {
      cy.executeCliCommand('gwa get products').then((response) => {
        expect(response.stdout).not.to.contain(product);
      })
    })
  })


  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})