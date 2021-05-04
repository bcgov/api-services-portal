
import { KeycloakTokenService, getOpenidFromIssuer } from '../../services/keycloak'
import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from '../../services/workflow/types'

const keystoneApi = require('../../services/keystone')

export interface TokenExchangeResult {
    issuer: string
    accessToken: string
}

export async function doTokenExchangeForCredentialIssuer (keystone: any, subjectToken: string, prodEnvId: string) : Promise<TokenExchangeResult> {
    const noauthContext =  keystone.createContext({ skipAccessControl: true })
    const prodEnv = await keystoneApi.lookupEnvironmentAndIssuerById(noauthContext, prodEnvId)
    const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(prodEnv.credentialIssuer, prodEnv.name)
    
    const openid = await getOpenidFromIssuer (issuerEnvConfig.issuerUrl)

    const issuer = openid.issuer
    const accessToken = await new KeycloakTokenService(openid.issuer).tokenExchange (issuerEnvConfig.clientId, issuerEnvConfig.clientSecret, subjectToken)
    return {issuer, accessToken} as TokenExchangeResult
}
