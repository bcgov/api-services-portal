Cypress.Commands.add('getKeycloakAdminToken', () => {
  return cy.fixture('admin').then(({ user }: any) => {
    return cy
      .request({
        method: 'POST',
        url:
          Cypress.env('KEYCLOAK_URL') +
          '/auth/realms/' +
          Cypress.env('KEYCLOAK_REALM') +
          '/protocol/openid-connect/token',
        body: {
          grant_type: 'password',
          username: user.credentials.username,
          password: user.credentials.password,
          client_id: 'admin-cli',
        },
        form: true,
      })
      .then(({ body }: any) => {
        return body.access_token
      })
  })
})

Cypress.Commands.add('getKeycloakGroupByName', (groupName: string) => {
  return cy.getKeycloakAdminToken().then((token: string) => {
    return cy
      .request({
        method: 'GET',
        url:
          Cypress.env('KEYCLOAK_URL') +
          '/auth/admin/realms/' +
          Cypress.env('KEYCLOAK_REALM') +
          '/groups',
        qs: {
          search: groupName,
          exact: true,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(({ body }: any) => {
        const flattenGroups = (groups: any[] = []): any[] =>
          groups.flatMap((g: any) => [g, ...flattenGroups(g.subGroups || [])])

        const match = flattenGroups(body || []).find((g: any) => g.name === groupName)

        expect(
          match,
          `Keycloak group ${groupName} should exist. Response: ${JSON.stringify(body)}`
        ).to.exist

        return match
      })
  })
})

Cypress.Commands.add('getKeycloakGroupDetails', (groupId: string) => {
  return cy.getKeycloakAdminToken().then((token: string) => {
    return cy
      .request({
        method: 'GET',
        url:
          Cypress.env('KEYCLOAK_URL') +
          '/auth/admin/realms/' +
          Cypress.env('KEYCLOAK_REALM') +
          '/groups/' +
          groupId,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(({ body }: any) => {
        return body
      })
  })
})