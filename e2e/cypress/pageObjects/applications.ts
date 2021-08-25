class ApplicationPage {
  path: string = '/devportal/applications'
  createAppBtn: string = '[data-testid=create-app-btn]'
  appName: string = '[data-testid=create-app-name-input]'
  appDescription: string = '[data-testid=create-app-description-input]'
  createAppSubmitBtn: string = '[data-testid=create-app-submit-btn]'

  createApplication(app: any) {
    cy.get(this.createAppBtn).first().click()
    cy.get(this.appName).type(app.name)
    cy.get(this.appDescription).type(app.description)
    cy.get(this.createAppSubmitBtn).click()
  }
}

export default ApplicationPage
