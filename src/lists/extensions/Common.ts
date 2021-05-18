
import { KeycloakTokenService, KeycloakClientService, getOpenidFromIssuer } from '../../services/keycloak'
import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from '../../services/workflow/types'

import { Logger } from '../../logger'

const keystoneApi = require('../../services/keystone')

const logger = Logger('List.Ext.Common')
export interface TokenExchangeResult {
    issuer: string
    accessToken: string
    clientUuid?: string
}

export async function doTokenExchangeForCredentialIssuer (keystone: any, subjectToken: string, prodEnvId: string) : Promise<TokenExchangeResult> {
    logger.debug("doTokenExchangeForCredentialIssuer for %s", prodEnvId)
    const noauthContext =  keystone.createContext({ skipAccessControl: true })
    const prodEnv = await keystoneApi.lookupEnvironmentAndIssuerById(noauthContext, prodEnvId)
    const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(prodEnv.credentialIssuer, prodEnv.name)
    
    const openid = await getOpenidFromIssuer (issuerEnvConfig.issuerUrl)

    const issuer = openid.issuer
    const accessToken = await new KeycloakTokenService(openid.issuer).tokenExchange (issuerEnvConfig.clientId, issuerEnvConfig.clientSecret, subjectToken)
    logger.debug("doTokenExchangeForCredentialIssuer returned ok %s", prodEnvId)
    return {issuer, accessToken} as TokenExchangeResult
}

export async function doClientLoginForCredentialIssuer (keystone: any, prodEnvId: string) : Promise<TokenExchangeResult> {
    logger.debug("doClientLoginForCredentialIssuer for %s", prodEnvId)
    const noauthContext =  keystone.createContext({ skipAccessControl: true })
    const prodEnv = await keystoneApi.lookupEnvironmentAndIssuerById(noauthContext, prodEnvId)
    const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(prodEnv.credentialIssuer, prodEnv.name)
    
    const openid = await getOpenidFromIssuer (issuerEnvConfig.issuerUrl)

    const kcClientService = new KeycloakClientService(openid.issuer)
    await kcClientService.login(issuerEnvConfig.clientId, issuerEnvConfig.clientSecret)
    const client = await kcClientService.findByClientId(issuerEnvConfig.clientId)

    const issuer = openid.issuer
    const clientUuid = client.id
    const accessToken = await new KeycloakTokenService(openid.issuer).getKeycloakSession (issuerEnvConfig.clientId, issuerEnvConfig.clientSecret)
    logger.debug("doClientLoginForCredentialIssuer returned ok %s", prodEnvId)
    return {issuer, accessToken, clientUuid} as TokenExchangeResult

}