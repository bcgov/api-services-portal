const { lookupCredentialIssuerById, addKongConsumer } = require('../keystone')

import { KeycloakClientRegistrationService, KeycloakClientService, KeycloakTokenService, getOpenidFromIssuer } from '../keycloak'

import {v4 as uuidv4} from 'uuid'

import { strict as assert } from 'assert'

import { CredentialIssuer } from '../keystone/types'
import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig, RequestControls } from './types'
import { ClientAuthenticator } from '../keycloak/client-registration-service'


/**
 * Steps:
 * - create the Client in the idP
 * - create the corresponding Consumer in Kong
 * - sync the Kong Consumer in KeystoneJS
 * 
 * @param {*} credentialIssuerPK 
 * @param {*} newClientId 
 */
export async function registerClient (context: any, environment: string, credentialIssuerPK: string, controls: RequestControls, newClientId: string) {

    // Find the credential issuer and based on its type, go do the appropriate action
    const issuer: CredentialIssuer = await lookupCredentialIssuerById(context, credentialIssuerPK)

    const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(issuer, environment)

    const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl)

    // token is NULL if 'iat'
    // token is retrieved from doing a /token login using the provided client ID and secret if 'managed'
    // issuer.initialAccessToken if 'iat'
    const kctoksvc = new KeycloakTokenService(openid.issuer)

    const token = issuerEnvConfig.clientRegistration == 'anonymous' ? null : (issuerEnvConfig.clientRegistration == 'managed' ? await kctoksvc.getKeycloakSession(issuerEnvConfig.clientId, issuerEnvConfig.clientSecret) : issuerEnvConfig.initialAccessToken)

    // Find the Client ID for the ProductEnvironment - that will be used to associated the clientRoles

    // lookup Application and use the ID to make sure a corresponding Consumer exists (1 -- 1)
    const client = await new KeycloakClientRegistrationService(openid.issuer, token).clientRegistration(<ClientAuthenticator> issuer.clientAuthenticator, newClientId, uuidv4(), controls.clientCertificate, false)
    assert.strictEqual(client.clientId, newClientId)

    return {
        openid,
        client
    }
}


export async function findClient (context: any, environment: string, credentialIssuerPK: string, clientId: string) {

    // Find the credential issuer and based on its type, go do the appropriate action
    const issuer: CredentialIssuer = await lookupCredentialIssuerById(context, credentialIssuerPK)

    const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(issuer, environment)

    const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl)

    const kcClientService = new KeycloakClientService(openid.issuer, null)

    await kcClientService.login(issuerEnvConfig.clientId, issuerEnvConfig.clientSecret)

    const client = await kcClientService.findByClientId(clientId)

    return {
        openid,
        client
    }
}
