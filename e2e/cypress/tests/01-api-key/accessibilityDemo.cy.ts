/// <reference types="cypress"/>

// describe('accessibility test automation with cypress axe', () => {

//   beforeEach(() => {
//     cy.visit('https://todomvc.com/examples/react')
//     cy.injectAxe()
//   })

//   it('Check for ccebility issue -fail if issue found', () => {
//     cy.contains('React').should('be.visible')
//     cy.checkA11y()
//     // cy.checkA11yIssue();
//   })

//   it('Check for all accebility issue - pass the test and log the issue', () => {
//     cy.contains('React').should('be.visible')
//     // cy.checkA11y()
//     cy.checkA11yIssue();
//   })
// })


// describe('accessibility test automation with cypress axe', () => {

//   beforeEach(() => {
//     cy.visit('https://www.saucedemo.com')
//     cy.injectAxe()
//   })

//   it('Check for ccebility issue -fail if issue found', () => {
//     cy.get('[data-test="username"]').should('be.visible').should('be.enabled').type("standard_user")
//     cy.get('[data-test="password"]').should('be.visible').should('be.enabled').type("secret_sauce")
//     cy.get('[data-test="login-button"]').should('be.visible').should('be.enabled').click()
//     cy.contains('Open Menu').should('be.visible')
//     cy.checkA11y()
//     // cy.checkA11yIssue();
//   })

//   it('Check for all accebility issue - pass the test and log the issue', () => {
//     cy.get('[data-test="username"]').should('be.visible').should('be.enabled').type("standard_user")
//     cy.get('[data-test="password"]').should('be.visible').should('be.enabled').type("secret_sauce")
//     cy.get('[data-test="login-button"]').should('be.visible').should('be.enabled').click()
//     cy.contains('Open Menu').should('be.visible')
//     // cy.checkA11y()
//     cy.checkA11yIssue();
//   })
// })

describe('accessibility test automation with cypress axe', () => {

  beforeEach(() => {
    cy.visit('https://www.newegg.ca/')
    cy.injectAxe()
  })

  it('Check for ccebility issue -fail if issue found', () => {
    // cy.contains('NEWEGG BUSINESS').should('be.visible')
    cy.checkA11y()
    // cy.checkA11yIssue();
  })

  it('Check for all accebility issue - pass the test and log the issue', () => {
    // cy.contains('NEWEGG BUSINESS').should('be.visible')
    // cy.checkA11y()
    cy.checkA11yIssue();
  })
})
