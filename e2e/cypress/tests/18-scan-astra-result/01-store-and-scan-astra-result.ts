describe('Store scan result and scan Astra result', () => {
    it('Store astra acan result and fail the step for any unexpected security vulnerabilities', () => {
        cy.checkAstraScanResultForVulnerability()
    })
})