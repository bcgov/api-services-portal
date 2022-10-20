class LoginPage {
  path: string = '/'

  loginButton: string = '[data-testid=login-btn]'
  usernameInput: string = '[id=username]'
  passwordInput: string = '[id=password]'
  loginSubmitButton: string = '[id=kc-login]'

  checkUnsuccessfulSignIn(){
    cy.contains('Account is disabled, contact your administrator.').should('be.visible')
    cy.get(this.loginSubmitButton).should('be.visible')
  }
}

export default LoginPage
