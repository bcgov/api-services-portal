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

  it('Check for gwa help', () => {
    cy.executeCliCommand('gwa help').then((response) => {
      debugger
      assert.equal(response.stdout, cli.content.help)
    });
  })

  it('Check gwa command for login help', () => {
    cy.executeCliCommand('gwa login -h').then((response) => {
      debugger
      assert.equal(response.stdout, cli.content.login_help)
    });
  })

  it('Check gwa command to login with client ID and secret', () => {
    let url = "oauth2proxy.localtest.me:4180"
    let clientID = cli.credentials.clientID
    let clientSecret = cli.credentials.clientSecret
    cy.log('gwa login --host ${url} --scheme http')
    cy.executeCliCommand('gwa login --client-id '+clientID+' --client-secret '+clientSecret+' --host '+url+' --scheme http').then((response) => {
      assert.equal(response.stdout, "Logged in")
    });
  })

  it('Check gwa command for login with invalid client id', () => {
    let url = "oauth2proxy.localtest.me:4180"
    let clientID = "dummy-client"
    let clientSecret = cli.credentials.clientSecret
    cy.exec('gwa login --client-id '+clientID+' --client-secret '+clientSecret+' --host '+url+' --scheme http', { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      assert.equal(response.stderr, "Error: INVALID_CREDENTIALS: Invalid client credentials")
    });
  })

  it('Check gwa command for login with invalid client secret', () => {
    let url = "oauth2proxy.localtest.me:4180"
    let clientID = cli.credentials.clientID
    let clientSecret = "dummy-client-secret"
    cy.exec('gwa login --client-id '+clientID+' --client-secret '+clientSecret+' --host '+url+' --scheme http', { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      assert.equal(response.stderr, "Error: Invalid client secret")
    });
  })

  it('Check gwa command for config help', () => {
    cy.exec('gwa config -h', { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      debugger
      assert.equal(response.stdout, cli.content.config_help)
    });
  })

  it('Check gwa config command to set environment', () => {
    cy.exec('gwa config set --host oauth2proxy.localtest.me:4180 --scheme http', { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      assert.equal(response.stdout, "Config settings saved")
    });
  })

  it('Check gwa config command to set token', () => {
    cy.exec('gwa config set --token '+userSession, { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      assert.equal(response.stdout, "Config settings saved")
    });
  })

  it('Check gwa command for namespace help', () => {
    cy.exec('gwa namespace -h', { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      debugger
      assert.equal(response.stdout, cli.content.namespace_help)
    });
  })

  it('Check gwa command to create namespace', () => {
    let url = "oauth2proxy.localtest.me:4180"
    cy.exec('gwa namespace create --host '+url+' --scheme http', { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      assert.isNotNaN(response.stdout)
      namespace = response.stdout
    });
  })

  it('Check gwa namespace list command and verify the created namespace in the list', () => {
    let url = "oauth2proxy.localtest.me:4180"
    cy.exec('gwa namespace list --host '+url+' --scheme http', { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
      expect(response.stdout).to.contain(namespace);
    });
  })

  it('Check Env Variable', () => {
    // let variable = "BC Government"
    // cy.exec('yq ".api_key=\"$variable\"" ~/.gwa-config.yaml',{ timeout: 3000, failOnNonZeroExit: false }).then((response) => {
    //   const output = response.stdout;
    //   cy.log('Command output:', output);
    //   // Perform assertions or other actions with the output
    // });
    cy.readFile('/Users/nirajpatel/.gwa-config.yaml').then((content: any) => {
      debugger
      let obj = YAML.parse(content)
      const keys = Object.keys(obj);
      obj.api_key = "Test1234"
      const yamlString = YAML.stringify(obj, 'utf8');
      cy.writeFile('/Users/nirajpatel/.gwa-config.yaml', yamlString)
    })
  })
})