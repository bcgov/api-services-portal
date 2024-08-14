describe('Organization', () => {
  before(() => {
    cy.loginByAuthAPI('', '').then((token_res: any) => {
      cy.setHeaders({ 'Content-Type': 'application/json' })
      cy.setAuthorizationToken(token_res.token)
    })
  })

  it('GET /organizations', () => {
    cy.callAPI('ds/api/v3/organizations', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(
          body.filter((o: any) => o.name == 'ministry-of-health').length
        ).to.be.equal(1)
      }
    )
  })
  it('GET /organizations/{org}', () => {
    cy.callAPI('ds/api/v3/organizations/ministry-of-health', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(
          body.orgUnits.filter((o: any) => o.name == 'public-health').length
        ).to.be.equal(1)
      }
    )
  })

  it('GET /organizations/{org}/roles', () => {
    const match = {
      name: 'ministry-of-health',
      parent: '/ca.bc.gov',
      roles: [
        {
          name: 'organization-admin',
          permissions: [
            {
              resource: 'org/ministry-of-health',
              scopes: ['Dataset.Manage', 'GroupAccess.Manage', 'Namespace.Assign'],
            },
          ],
        },
      ],
    }

    cy.callAPI('ds/api/v3/organizations/ministry-of-health/roles', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
      }
    )
  })

  it('GET /organizations/{org}/access', () => {
    // ignore specific member contents since previous tests will have created members 
    const match = {
      name: 'ministry-of-health',
      parent: '/ca.bc.gov',
    };
  
    cy.callAPI('ds/api/v3/organizations/ministry-of-health/access', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200);
        expect(body).to.include(match);
        expect(body.members).to.be.an('array');
      }
    )
  })

  it('PUT /organizations/{org}/access', () => {
    const payload = {
      name: 'planning-and-innovation-division',
      parent: '/ca.bc.gov/ministry-of-health',
      members: [
        {
          member: {
            email: 'mark@gmail.com',
          },
          roles: ['organization-admin'],
        },
      ],
    }
    cy.setRequestBody(payload)

    cy.callAPI(
      'ds/api/v3/organizations/planning-and-innovation-division/access',
      'PUT'
    ).then(({ apiRes: { status, body } }: any) => {
      expect(status).to.be.equal(204)

      cy.callAPI(
        'ds/api/v3/organizations/planning-and-innovation-division/access',
        'GET'
      ).then(({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)

        const match = {
          name: 'planning-and-innovation-division',
          parent: '/ca.bc.gov/ministry-of-health',
          members: [
            {
              member: {
                username: 'mark@idir',
                email: 'mark@gmail.com',
              },
              roles: ['organization-admin'],
            },
          ],
        }
        // ignore the ID as it will always be different
        body.members.forEach((m: any) => {
          delete m.member.id
        })
        expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
      })
    })
  })

  it('GET /organizations/{org}/gateways', () => {
    const match = {
      name: 'platform',
      orgUnit: 'planning-and-innovation-division',
      enabled: false,
      updatedAt: 0,
    }

    cy.callAPI('ds/api/v3/organizations/ministry-of-health/gateways', 'GET').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(
          JSON.stringify(body.filter((a: any) => a.name == 'platform').pop())
        ).to.be.equal(JSON.stringify(match))
      }
    )
  })

  it('GET /organizations/{org}/activity', () => {
    // Retry logic if the 422 error occurs
    cy.callAPI('ds/api/v3/organizations/ministry-of-health/activity', 'GET')
      .then(({ apiRes: { status, body } }: any) => {
        if (status === 422) {
          cy.wait(2000);
          cy.callAPI('ds/api/v3/organizations/ministry-of-health/activity', 'GET')
            .then(({ apiRes: { status, body } }: any) => {
              expect(status).to.be.equal(200);
            });
        } else {
          expect(status).to.be.equal(200);
        }
      });
  });

  it('PUT /organizations/{org}/{orgUnit}/gateways/{gatewayId}', () => {
    cy.setRequestBody({})
    cy.callAPI('ds/api/v3/gateways', 'POST').then(({ apiRes: { body, status } }: any) => {
      expect(status).to.be.equal(200)
      const myGateway = body

      cy.setRequestBody({})
      cy.callAPI(
        `ds/api/v3/organizations/ministry-of-health/planning-and-innovation-division/gateways/${myGateway.gatewayId}?enable=true`,
        'PUT'
      ).then(({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(body.result).to.be.equal('namespace-assigned')
      })
    })
  })

  it('GET /roles', () => {
    const match: any = {
      'organization-admin': {
        label: 'Organization Administrator',
        permissions: [
          {
            resourceType: 'organization',
            scopes: ['GroupAccess.Manage', 'Namespace.Assign', 'Dataset.Manage'],
          },
          { resourceType: 'namespace', scopes: ['Namespace.View'] },
        ],
      },
    }

    cy.callAPI('ds/api/v3/roles', 'GET').then(({ apiRes: { status, body } }: any) => {
      expect(status).to.be.equal(200)
      expect(JSON.stringify(body)).to.be.equal(JSON.stringify(match))
    })
  })
})
