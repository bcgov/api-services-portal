import { grant, grantsUrl, run, submission, submitUrl } from './helpers'

const storedScopes = ['read', 'write']
const declaredScopes = [...storedScopes, 'manage']
const serviceId = 'claims-dev'
const newRequest = 'submitted approval request'
const pendingUpdate = 'updated scopes, pending approval'
const revoke = 'revoked scopes applied'
const add = 'added scopes, submitted for re-approval'
const replace = 'revoked scopes applied; added scopes submitted for re-approval'

const submissions = [
  {
    name: 'new_scopes',
    scopes: ['manage'],
    requiresNoConnection: true,
  },
  { name: 'remove_one_scope', scopes: ['read'], approvedResult: revoke },
  { name: 'remove_and_add_scope', scopes: ['manage', 'read'], approvedResult: replace },
  { name: 'remove_all_scopes', scopes: [], approvedResult: revoke },
  { name: 'add_one_scope', scopes: ['manage', 'read', 'write'], approvedResult: add },
]

const states = [
  { name: 'client_not_onboarded', onboarded: false },
  { name: 'no_connection_request', onboarded: true },
  { name: 'cr_approved_active', onboarded: true, approved: true, active: true },
  { name: 'cr_approved_inactive', onboarded: true, approved: true, active: false },
  { name: 'cr_pending_active', onboarded: true, approved: false, active: true },
  { name: 'cr_pending_inactive', onboarded: true, approved: false, active: false },
  {
    name: 'cr_provisioning_inprogress',
    onboarded: true,
    approved: true,
    active: true,
    provisionerStatus: { status: 'pending', operation: 'provision' },
  },
]

describe('Common SSO scope submissions across SDX connection states', () => {
  for (const state of states) {
    describe(state.name, () => {
      const hasConnection = state.approved !== undefined
      for (const change of submissions) {
        if (change.requiresNoConnection && hasConnection) {
          it.skip(`${change.name} (N/A)`, () => {})
          continue
        }

        it(change.name, () => {
          const submit = {
            mutate: {
              scopes: declaredScopes,
              connectionScopes: storedScopes,
              approved: state.approved,
              active: state.active,
              provisionerStatus: state.provisionerStatus,
            },
            method: 'POST',
            url: submitUrl,
            body: submission('dev', { scopes: change.scopes }),
          }

          run({
            initial: hasConnection ? 'approved' : 'empty',
            onboarded: state.onboarded,
            steps: state.onboarded && !state.approved
              ? [submit, { url: grantsUrl('dev', 'pending') }]
              : [submit],
          }).then((result) => {
            expect(result.callbacks, 'synchronous Common SSO callbacks').deep.eq([])
            const mutations = result.upstreamCalls.filter(
              (call: string) => /^(PUT|POST|PATCH|DELETE) /.test(call)
            )

            if (!state.onboarded) {
              expect(result.status).eq(200)
              expect(result.body.results).deep.eq({
                [serviceId]: 'held for onboarding',
              })
              expect(result.body.submissionId).to.be.a('string').and.not.be.empty
              expect(result.connections).deep.eq([])
              expect(result.writes).deep.eq([])
              expect(mutations).deep.eq([])
              return
            }

            const expectedResult = !hasConnection
              ? newRequest
              : state.approved
                ? change.approvedResult
                : pendingUpdate
            expect(result.status).eq(200)
            expect(result.body.results).deep.eq({ [serviceId]: expectedResult })
            expect(result.body.submissionId).to.be.a('string').and.not.be.empty
            expect(mutations, 'SDX writes without lifecycle actions').deep.eq([
              'PUT /sdx/organizations/org/connections',
            ])
            expect(result.writes).have.length(1)
            const [write] = result.writes
            expect(write).include({ clientId: 'consumer', serviceId })
            expect(write).not.have.property('isActive')
            expect(write).not.have.property('lifecycleIntent')
            expect(write).not.have.property('provisionerStatus')
            expect(write.requesterDetails).include({
              submissionId: result.body.submissionId,
            })
            expect(write.requesterDetails.scopes).deep.eq(change.scopes)
            expect(write.requesterDetails.client).include({
              integrationId: 'integration',
              clientId: 'client-dev',
            })

            if (hasConnection) {
              // This is the SDX update payload. The real SDX store decides which
              // scopes are immediately revoked and which changes need approval.
              expect(write).have.property('isApproved', false)
              expect(write).not.have.property('proposedConfiguration')
            } else {
              expect(write).include({ environment: 'dev', policyVersion: 'SDX.R1.00' })
              expect(write).not.have.property('isApproved')
            }

            if (!state.approved) {
              const pending = result.results[1]
              expect(pending.status).eq(200)
              expect(pending.body.resourceServers).deep.eq(
                grant('dev', '1.0.0', change.scopes)
              )
              const devConnections = result.connections.filter(
                (connection: { serviceId: string }) => connection.serviceId === serviceId
              )
              expect(devConnections).have.length(1)
              expect(devConnections[0]).include({
                isApproved: false,
                isActive: state.active ?? false,
              })
            }
          })
        })
      }
    })
  }
})
