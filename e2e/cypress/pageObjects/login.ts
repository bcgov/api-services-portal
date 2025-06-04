class LoginPage {
  path: string = '/oauth2/start?kc_idp_hint=none&rd=%2Fadmin%2Fsignin%3Ff%3D%252Fauth_callback'

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
    cy.get(this.apiProviderLoginBtn).click()
  }

  selectDeveloperLoginOption(){
    cy.get(this.developerBtn).click()
    cy.get(this.developerLoginBtn).click()
  }
}

export default LoginPage
