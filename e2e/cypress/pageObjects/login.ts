class LoginPage {
  path: string = '/'

  loginButton: string = "//button[normalize-space()='Login']"
  usernameInput: string = "//input[@id='username']"
  passwordInput: string = "//input[@id='password']"
  loginSubmitButton: string = "//input[@id='kc-login']"
}

export default LoginPage
