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
  let namespace: string

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


  it('Check gwa command for config help', () => {
    cy.executeCliCommand('gwa config -h').then((response) => {
      expect(response.stdout).to.contain("Configuration commands");
    });
  })

})