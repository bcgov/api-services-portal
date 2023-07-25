import LoginPage from '../../pageObjects/login'
import ApplicationPage from '../../pageObjects/applications'
import ApiDirectoryPage from '../../pageObjects/apiDirectory'
import MyAccessPage from '../../pageObjects/myAccess'
const YAML = require('yamljs');
let userSession: any
let cli = require("../../fixtures/test_data/gwa-cli.json")

const jose = require('node-jose')

describe('Verify CLI commands', () => {
  const login = new LoginPage()
  const apiDir = new ApiDirectoryPage()
  const app = new ApplicationPage()
  const ma = new MyAccessPage()
  let namespace : string

  before(() => {
    // cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('apiowner').as('apiowner')
    // cy.visit(login.path)
  })

  it('authenticates Janis (api owner) to get the user session token', () => {
    cy.get('@apiowner').then(({ apiTest }: any) => {
        cy.getUserSessionTokenValue(apiTest.namespace, false).then((value) => {
            userSession = value
        })
    })
})

  // it('Check for gwa help', () => {
  //   cy.executeCliCommand('gwa help').then((response) => {
  //     debugger
  //     assert.equal(response.stdout, cli.content.help)
  //   });
  // })

  // it('Check gwa command for login help', () => {
  //   cy.executeCliCommand('gwa login -h').then((response) => {
  //     debugger
  //     assert.equal(response.stdout, cli.content.login_help)
  //   });
  // })

  it('Check gwa command to login with client ID and secret', () => {
    let url = "oauth2proxy.localtest.me:4180"
    let clientID = cli.credentials.clientID
    let clientSecret = cli.credentials.clientSecret
    cy.log('gwa login --host ${url} --scheme http')
    cy.executeCliCommand('gwa login --client-id '+clientID+' --client-secret '+clientSecret+' --host '+url+' --scheme http').then((response) => {
      assert.equal(response.stdout, "Logged in")
    });
  })

  // it('Check gwa command for login with invalid client id', () => {
  //   let url = "oauth2proxy.localtest.me:4180"
  //   let clientID = "dummy-client"
  //   let clientSecret = cli.credentials.clientSecret
  //   cy.executeCliCommand('gwa login --client-id '+clientID+' --client-secret '+clientSecret+' --host '+url+' --scheme http').then((response) => {
  //     assert.equal(response.stderr, "Error: INVALID_CREDENTIALS: Invalid client credentials")
  //   });
  // })

  // it('Check gwa command for login with invalid client secret', () => {
  //   let url = "oauth2proxy.localtest.me:4180"
  //   let clientID = cli.credentials.clientID
  //   let clientSecret = "dummy-client-secret"
  //   cy.executeCliCommand('gwa login --client-id '+clientID+' --client-secret '+clientSecret+' --host '+url+' --scheme http').then((response) => {
  //     assert.equal(response.stderr, "Error: Invalid client secret")
  //   });
  // })

  // it('Check gwa command for config help', () => {
  //   cy.executeCliCommand('gwa config -h').then((response) => {
  //     debugger
  //     assert.equal(response.stdout, cli.content.config_help)
  //   });
  // })

  it('Check gwa config command to set environment', () => {
    cy.executeCliCommand('gwa config set --host oauth2proxy.localtest.me:4180 --scheme http').then((response) => {
      assert.equal(response.stdout, "Config settings saved")
    });
  })

  it('Check gwa config command to set token', () => {
    cy.executeCliCommand('gwa config set --token '+userSession).then((response) => {
      assert.equal(response.stdout, "Config settings saved")
    });
  })

  it('Check gwa command for namespace help', () => {
    cy.executeCliCommand('gwa namespace -h').then((response) => {
      debugger
      assert.equal(response.stdout, cli.content.namespace_help)
    });
  })

  it('Check gwa command to create namespace', () => {
    let url = "oauth2proxy.localtest.me:4180"
    cy.executeCliCommand('gwa namespace create --host '+url+' --scheme http').then((response) => {
      assert.isNotNaN(response.stdout)
      namespace = response.stdout
      cy.replaceWordInJsonObject('newplatform',namespace,'service-gwa.yml')
      cy.updateJsonValue('apiowner.json','namespace' , namespace)
      cy.updateJsonValue('apiowner.json','product.environment.config.serviceName' , 'a-service-for-'+namespace)
      cy.updateJsonValue('apiowner.json','product.test_environment.config.serviceName' , 'a-service-for-'+namespace+'-test')
      cy.executeCliCommand("gwa config set --namespace "+namespace)
    });
  })

  it('Check gwa namespace list command and verify the created namespace in the list', () => {
    let url = "oauth2proxy.localtest.me:4180"
    cy.executeCliCommand('gwa namespace list --host '+url+' --scheme http').then((response) => {
      expect(response.stdout).to.contain(namespace);
    });
  })

})