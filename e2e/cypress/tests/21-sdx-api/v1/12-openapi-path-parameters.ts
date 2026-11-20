import { load, dump } from 'js-yaml'
import { createSubsystem } from '../../../support/sdx-commands'

describe('APS-5102-13 OpenAPI path-level parameters', () => {
  let workingData: any

  beforeEach(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  for (const format of ['YAML', 'JSON']) {
    it(`publishes only HTTP operations from a ${format} spec with path parameters`, () => {
      const { org, datasetId } = workingData
      const subsystemName = `PARAMS-${datasetId.toUpperCase()}`
      createSubsystem(org, subsystemName, () => {
        cy.fixture('toys.v1.yaml', null).then((text: any) => {
          const spec: any = load(text.toString())
          spec.paths['/v1/toys'].parameters = [
            { name: 'limit', in: 'query', required: false, schema: { type: 'integer' } },
          ]
          cy.setRequestBodyRaw(format === 'JSON' ? JSON.stringify(spec) : dump(spec))
          cy.setHeader('Content-Type', 'application/octet-stream')
          cy.callAPI(
            `ds/api/sdx/v1/organizations/${org.name}/oas-services?subsystem=${subsystemName}&environment=dev`,
            'PUT',
            false
          ).then(({ apiRes: { status, body } }: any) => {
            expect(status, JSON.stringify(body)).to.equal(200)
            cy.callAPI(
              `ds/api/sdx/v1/organizations/${org.name}/oas-services/${body.refKey}`,
              'GET'
            ).then(({ apiRes: { status, body } }: any) => {
              expect(status, JSON.stringify(body)).to.equal(200)
              expect(body.operations).to.have.length(1)
              expect(body.operations[0]).to.include({
                operationId: 'toys_list',
                method: 'GET',
                path: '/v1/toys',
              })
              expect(body.operations.map((op: any) => op.method)).not.to.include(
                'PARAMETERS'
              )
            })
          })
        })
      })
    })
  }
})
