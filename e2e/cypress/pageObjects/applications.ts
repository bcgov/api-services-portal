class ApplicationPage {
  path: string = '/devportal/applications'
  createAppBtn: string = '[data-testid=create-app-btn]'
  appName: string = '[data-testid=create-app-name-input]'
  appDescription: string = '[data-testid=create-app-description-input]'
  createAppSubmitBtn: string = '[data-testid=create-app-submit-btn]'
  applicationTbl = '[role="table"]'

  createApplication(app: any) {
    cy.get(this.createAppBtn).first().click()
    cy.get(this.appName).type(app.name)
    cy.get(this.appDescription).type(app.description)
    cy.get(this.createAppSubmitBtn).click()
    cy.get('table').contains('td', app.name).should('be.visible');
  }

  deleteApplication(appName: any) {
    cy.get(this.applicationTbl).find('tr').each(($e1, index, $list) => {
      let applicationName = $e1.find('td:nth-child(1)').text()
      if (applicationName.toLowerCase() === appName.toLowerCase() ) {
        cy.wrap($e1).find('button').first().click()
        cy.get('[data-testid="delete-application-btn"]').filter(':visible').first().click()
      }
    })
  }

  checkDeletedApplication(appName: any) {
    cy.get(this.applicationTbl).find('tr').each(($e1, index, $list) => {
      let applicationName = $e1.find('td:nth-child(1)').text()
      debugger
      if (applicationName.toLowerCase() === appName.toLowerCase() ) {
        assert.fail("Application is not deleted")
      }
    })
  }
}

export default ApplicationPage
