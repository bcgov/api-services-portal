Cypress.Commands.add('callApi', (options: Cypress.RequestOptions) => {
  cy.request({
    ...options,
  }).then((res: Cypress.Response<any>) => {
    expect([200, 201]).to.contain(res.status)
    cy.log(JSON.stringify(res))
    cy.wrap(res)
  })
})
