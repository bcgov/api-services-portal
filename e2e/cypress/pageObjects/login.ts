class LoginPage {
  path: string = '/'

  loginDropDown: string = '[data-testid=login-dropdown-btn]'
  usernameInput: string = '[id=username]'
  passwordInput: string = '[id=password]'
  loginSubmitButton: string = '[id=kc-login]'
  apiProviderBtn : string ='[data-testid="login-api-provider-btn"]'
  developerBtn : string ='[data-testid="login-api-developer-btn"]'
  developerLoginBtn : string ='[data-testid="login-with-github"]'
  apiProviderLoginBtn : string ='[data-testid="login-with-idir"]'

  checkUnsuccessfulSignIn(){
    cy.contains('Account is disabled, contact your administrator.').should('be.visible')
    cy.get(this.loginSubmitButton).should('be.visible')
  }

  selectAPIProviderLoginOption(){
    cy.get(this.apiProviderBtn).click()
    cy.checkA11yIssue()
    cy.get(this.apiProviderLoginBtn).click()
  }

  selectDeveloperLoginOption(){
    cy.get(this.developerBtn).click()
    cy.checkA11yIssue()
    cy.get(this.developerLoginBtn).click()
  }
}

export default LoginPage
