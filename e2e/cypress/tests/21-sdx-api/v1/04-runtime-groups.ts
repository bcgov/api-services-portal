import { v4 as uuidv4 } from 'uuid'

describe('SDX Runtime Groups', () => {
  let workingData: any

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data

      const rg = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 6)
      workingData['runtimeGroupId'] = rg.toLowerCase()
    })
  })

  describe('Runtime Group Happy Paths', () => {
    it('PUT /organizations/{org}/runtime-groups', () => {
      const { org, gateway, dataset, runtimeGroupId, product } = workingData

      const payload = {
        name: `${runtimeGroupId}`,
      }
      cy.setRequestBody(payload)
      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'PUT').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          cy.callAPI(
            `ds/api/sdx/v1/organizations/${org.name}/runtime-groups`,
            'GET'
          ).then(({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            const rg = body.find((rg: any) => rg.name === payload.name)
            expect(rg).to.not.be.undefined
            expect(rg.host).to.be.equal(`${payload.name}.servers.sdx`)
            expect(rg.name).to.be.equal(`${payload.name}`)
            expect(rg.sdxEndpoint).to.be.equal(`https://${payload.name}.servers.sdx`)
            expect(rg.consumerEndpoint).to.be.equal(
              `http://internal.${payload.name}.servers.sdx`
            )
            expect(rg).to.have.property('gatewayId')
            expect(rg.organization).to.be.equal(org.name)
          })
        }
      )
    })

    it('DELETE /organizations/{org}/runtime-groups/{name}', () => {
      const { org, gateway, dataset, runtimeGroupId, product } = workingData

      const payload = {
        name: `${runtimeGroupId}t2`,
      }
      cy.setRequestBody(payload)
      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'PUT').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.result).to.be.equal('created')

          cy.setQueryString({ force: false })
          cy.callAPI(
            `ds/api/sdx/v1/organizations/${org.name}/runtime-groups/${payload.name}`,
            'DELETE'
          ).then(({ apiRes: { status, body } }: any) => {
            expect(status).to.be.equal(200)
            expect(body.result).to.be.equal('deleted')
          })
        }
      )
    })

    it('GET /organizations/{org}/runtime-groups', () => {
      const { org, gateway, dataset, runtimeGroupId, product } = workingData

      const payload = {
        name: runtimeGroupId,
      }

      cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'GET').then(
        ({ apiRes: { status, body } }: any) => {
          expect(status).to.be.equal(200)
          expect(body.length).to.be.equal(1)
          expect(body[0].name).to.be.equal(payload.name)
          expect(body[0]).to.have.property('gatewayId')
          expect(body[0].organization).to.be.equal(org.name)
        }
      )
    })

    it('POST /organizations/{org}/runtime-groups/{name}/tokens', () => {
      const { org, gateway, dataset, runtimeGroupId, product } = workingData

      cy.clearRequestBody()
      cy.setQueryString({})
      cy.callAPI(
        `ds/api/sdx/v1/organizations/${org.name}/runtime-groups/${runtimeGroupId}/tokens`,
        'POST'
      ).then(({ apiRes: { status, body } }: any) => {
        expect(status).to.be.equal(200)
        expect(body).to.have.property('token')
        expect(body.token).to.be.a('string')
      })
    })
  })

  // describe('Runtime Group Sad Paths', () => {
  //   it('PUT /organizations/{org}/runtime-groups (missing name)', () => {
  //     const { org, gateway, dataset, runtimeGroupId, product } = workingData

  //     const payload = {}
  //     cy.setRequestBody(payload)
  //     cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'PUT').then(
  //       ({ apiRes: { status, body } }: any) => {
  //         expect(status).to.be.equal(422)
  //         expect(body.code).to.be.equal('validation_error')
  //         expect(body.fields['body.name'].message).to.be.equal("'name' is required")
  //       }
  //     )
  //   })

  //   it('PUT /organizations/{org}/runtime-groups (long name)', () => {
  //     const { org, gateway, dataset, runtimeGroupId, product } = workingData

  //     const payload = {
  //       name: `${runtimeGroupId}longname`,
  //     }
  //     cy.setRequestBody(payload)
  //     cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'PUT').then(
  //       ({ apiRes: { status, body } }: any) => {
  //         expect(status).to.be.equal(400)
  //         expect(body.result).to.be.equal('create-failed')
  //         expect(body.reason).to.be.equal(
  //           'Runtime Group name must be between 3 and 8 lowercase alpha-numeric characters'
  //         )
  //       }
  //     )
  //   })

  //   it('DELETE /organizations/{org}/runtime-groups/{name} (not exists)', () => {
  //     const { org, gateway, dataset, runtimeGroupId, product } = workingData

  //     const payload = {
  //       name: `${runtimeGroupId}404`,
  //     }
  //     cy.setQueryString({ force: false })
  //     cy.callAPI(
  //       `ds/api/sdx/v1/organizations/${org.name}/runtime-groups/${payload.name}`,
  //       'DELETE'
  //     ).then(({ apiRes: { status, body } }: any) => {
  //       expect(status).to.be.equal(422)
  //       expect(body.message).to.be.equal('Runtime Group not found')
  //     })
  //   })
  // })
})
