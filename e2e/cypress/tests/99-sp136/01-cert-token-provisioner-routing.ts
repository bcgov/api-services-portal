import { v4 as uuidv4 } from 'uuid'

// SP136: Runtime group certificate-signing token generation must call
// step-ca through the provisioner (which resolves the target CA per
// environment) rather than the portal calling a single, global step-ca
// directly.
//
// The local stack runs two independent CA mocks so that "per-environment
// routing" is something this test can actually observe from the outside:
//   - environment 'dev' -> step-token-api.localtest.me:2020   (internally)
//   - environment 'cyp' -> step-token-api-2.localtest.me:2022 (internally)
// (see local/provisioner/environments.json - those internal hostname:port
// combinations are what the *provisioner* resolves and calls; each mock
// listens on its own internal port so the two are genuinely distinct
// endpoints on the docker network, not just distinguished by host port
// mapping). This test itself runs on the host, where both mocks resolve to
// 127.0.0.1 and are reached via their published host ports, which happen to
// match the internal ones (2020 and 2022, see docker-compose.yml). Each mock
// exposes `GET /tokens` returning how many tokens it has issued so far.
//
// Under the bug, the portal ignores the runtime group's environment and
// always calls a single global CA, so a token request for the 'cyp'
// runtime group never reaches the second mock - its count never moves.

const DEV_CA_URL = 'http://localhost:2020'
const CYP_CA_URL = 'http://localhost:2022'

function tokenCount(caUrl: string) {
  return cy
    .request({ url: `${caUrl}/tokens`, method: 'GET' })
    .then((res) => {
      expect(res.status).to.be.equal(200)
      return res.body.count as number
    })
}

function shortId(): string {
  return uuidv4().replace(/-/g, '').toLowerCase().substring(0, 6)
}

describe('SP136 - Runtime group certificate-signing token routes through the provisioner', () => {
  let workingData: any
  const runtimeGroupDev = `d${shortId()}`
  const runtimeGroupCyp = `c${shortId()}`

  before(() => {
    cy.buildOrgGatewayDatasetAndProduct().then((data) => {
      workingData = data
    })
  })

  it('creates runtime groups in two different environments', () => {
    const { org } = workingData

    cy.setRequestBody({ name: runtimeGroupDev, environment: 'dev' })
    cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'PUT').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status, JSON.stringify(body)).to.be.equal(200)
      }
    )

    cy.setRequestBody({ name: runtimeGroupCyp, environment: 'cyp' })
    cy.callAPI(`ds/api/sdx/v1/organizations/${org.name}/runtime-groups`, 'PUT').then(
      ({ apiRes: { status, body } }: any) => {
        expect(status, JSON.stringify(body)).to.be.equal(200)
      }
    )
  })

  it("routes the 'dev' runtime group's token request to the 'dev' environment's CA only", () => {
    const { org } = workingData

    let devBaseline: number
    let cypBaseline: number

    tokenCount(DEV_CA_URL).then((count) => {
      devBaseline = count
    })
    tokenCount(CYP_CA_URL).then((count) => {
      cypBaseline = count
    })

    cy.clearRequestBody()
    cy.setQueryString({})
    cy.callAPI(
      `ds/api/sdx/v1/organizations/${org.name}/runtime-groups/${runtimeGroupDev}/environments/dev/tokens`,
      'POST'
    ).then(({ apiRes: { status, body } }: any) => {
      expect(status, JSON.stringify(body)).to.be.equal(200)
      expect(body.token).to.be.a('string')
    })

    tokenCount(DEV_CA_URL).then((count) => {
      expect(count, "dev CA should have issued the 'dev' runtime group's token").to.be.equal(
        devBaseline + 1
      )
    })
    tokenCount(CYP_CA_URL).then((count) => {
      expect(
        count,
        "cyp CA should not have been called for the 'dev' runtime group's token"
      ).to.be.equal(cypBaseline)
    })
  })

  it("routes the 'cyp' runtime group's token request to the 'cyp' environment's CA only", () => {
    const { org } = workingData

    let devBaseline: number
    let cypBaseline: number

    tokenCount(DEV_CA_URL).then((count) => {
      devBaseline = count
    })
    tokenCount(CYP_CA_URL).then((count) => {
      cypBaseline = count
    })

    cy.clearRequestBody()
    cy.setQueryString({})
    cy.callAPI(
      `ds/api/sdx/v1/organizations/${org.name}/runtime-groups/${runtimeGroupCyp}/environments/cyp/tokens`,
      'POST'
    ).then(({ apiRes: { status, body } }: any) => {
      expect(status, JSON.stringify(body)).to.be.equal(200)
      expect(body.token).to.be.a('string')
    })

    // This is the assertion that fails on unfixed code: today every token
    // request - regardless of the runtime group's environment - lands on the
    // single global STEP_TOKEN_URL (the 'dev' CA), so the 'cyp' CA's count
    // never moves and this expectation fails.
    tokenCount(CYP_CA_URL).then((count) => {
      expect(count, "cyp CA should have issued the 'cyp' runtime group's token").to.be.equal(
        cypBaseline + 1
      )
    })
    tokenCount(DEV_CA_URL).then((count) => {
      expect(
        count,
        "dev CA should not have been called for the 'cyp' runtime group's token"
      ).to.be.equal(devBaseline)
    })
  })
})
