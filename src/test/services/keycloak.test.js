var keycloak = require('../../services/keycloak');

import { rest } from 'msw'
import { setupServer } from 'msw/node'

describe("Keycloak Service", function() {

    const server = setupServer(
        rest.get('https://provider/auth/realms/my-realm/.well-known/openid-configuration', (req, res, ctx) => {
            return res(ctx.json({ issuer: 'https://provider/auth/realms/my-realm' }))
        }),
        rest.post('https://provider/auth/realms/my-realm/clients-registrations/default', (req, res, ctx) => {
            return res(ctx.json({
                id: '001',
                clientId: 'cid',
                clientSecret: 'csecret',
                registrationAccessToken: 'token-123'
            }))
        })
    )

    // Enable API mocking before tests.
    beforeAll(() => server.listen())

    // Reset any runtime request handlers we may add during the tests.
    afterEach(() => server.resetHandlers())

    // Disable API mocking after the tests are done.
    afterAll(() => server.close())

    describe('keycloak ', function () {
        it('it should getOpenidFromDiscovery', async function () {
            const openid = await keycloak.getOpenidFromDiscovery("https://provider/auth/realms/my-realm/.well-known/openid-configuration")
            expect(openid.issuer).toBe('https://provider/auth/realms/my-realm')
        })
        it('it should error due to bad url', async function() {
            await expect(keycloak.getOpenidFromDiscovery('https://elsewhere/auth/realms/my-realm/.well-known/openid-configuration')).rejects.toThrow()
        })
    })

    describe('keycloak client registration', function() {
        it('it should return a successful response', async function() {
            const result = await keycloak.clientRegistration('https://provider/auth/realms/my-realm', 'token', 'cid', 'csecret')
            expect(result.registrationAccessToken).toBe('token-123')
        })

        it('it should error due to bad url', async function() {
            await expect(keycloak.clientRegistration('https://provider/auth/realms/xxxxx', 'token', 'cid', 'csecret')).rejects.toThrow()
        })
    })
})
