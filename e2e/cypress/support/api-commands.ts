Cypress.Commands.add('callApi', (options: any) => {
  cy.request({
    ...options,
  }).then((res) => {
    expect([200, 201]).to.contain(res.status)
    cy.wrap(res)
  })
})
