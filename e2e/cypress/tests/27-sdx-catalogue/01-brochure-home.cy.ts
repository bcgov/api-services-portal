import { SDX_UI_URL } from '../../support/sdx-commands'

// Public brochure only. No login and no API seed data. Kept off the ordered
// specPattern in cypress.config.ts; run with npm run cy:sdx-catalogue.
describe('SDX Catalogue public home', () => {
  it('renders the brochure shell with the configured site title and a Home link', () => {
    cy.visit(SDX_UI_URL)

    // site.title in local/sdx-ui/config.yaml
    cy.contains('Secure Data Exchange').should('be.visible')
    cy.get('nav[aria-label="Main navigation"]').within(() => {
      cy.contains('a', 'Home').should('be.visible')
    })
  })
})
