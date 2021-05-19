import { checkStatus } from '../checkStatus'
import fetch from 'node-fetch'
import { Logger } from '../../logger'
import querystring from 'querystring'
import { headers } from './keycloak-api'

import { strict as assert } from 'assert'

import { clientTemplate } from './templates/client-template'

import { default as KcAdminClient } from 'keycloak-admin'

const logger = Logger('keycloak.ClientReg')

export interface ClientRegResponse {
    id: string,
    clientId: string,
    clientSecret: string,
    enabled: boolean,
    registrationAccessToken: string
}

export interface ClientRegistration {
    id?: string,
    clientId: string,
    clientSecret?: string,
    enabled?: boolean,
}

export class KeycloakClientRegistrationService {
    private issuerUrl : string
    private accessToken : string
    private kcAdminClient : any
    private session : boolean = false

    constructor(issuerUrl: string, accessToken: string) {
        this.issuerUrl = issuerUrl
        this.accessToken = accessToken
        if (issuerUrl != null) {
            const baseUrl = issuerUrl.substr(0, issuerUrl.indexOf('/realms'))
            const realmName = issuerUrl.substr(issuerUrl.lastIndexOf('/')+1)
            this.kcAdminClient = new KcAdminClient({baseUrl, realmName});
        }
    }

    public async clientRegistration (issuer : string, accessToken : string, clientId : string, clientSecret : string, enabled : boolean =false) : Promise<ClientRegResponse> {
        const body = Object.assign(clientTemplate, {
            enabled: enabled,
            clientId: clientId,
            secret: clientSecret
        })

        logger.debug("[clientRegistration] CALLING %s", `${issuer}/clients-registrations/default`)
        logger.debug("[clientRegistration] BODY %j", body)

        const response = await fetch(`${issuer}/clients-registrations/default`, {
            method: 'post',
            body:    JSON.stringify(body),
            headers: headers(accessToken) as any
        })
        .then(checkStatus)
        .then(res => res.json())
        logger.debug("[clientRegistration] RESULT %j", response);
        return {
            id: response['id'],
            enabled: response['enabled'],
            clientId: response['clientId'],
            clientSecret: clientSecret,
            registrationAccessToken: response['registrationAccessToken']
        } as ClientRegResponse
    }

    public async updateClientRegistration (accessToken : string, clientId : string, vars : ClientRegistration) : Promise<ClientRegResponse> {
        logger.debug("[updateClientRegistration] CALLING %s", `${this.issuerUrl}/clients-registrations/default/${clientId}`)
        logger.debug("[updateClientRegistration] BODY %j", vars)

        vars.clientId = clientId
        
        const response = await fetch(`${this.issuerUrl}/clients-registrations/default/${clientId}`, {
            method: 'put',
            body:    JSON.stringify(vars),
            headers: headers(accessToken) as any
        })
        .then(checkStatus)
        .then(res => res.json())
        logger.debug("[updateClientRegistration] RESULT %j", response);
        return {
            id: response['id'],
            enabled: response['enabled'],
            clientId: response['clientId'],
        } as ClientRegResponse
    }

    public async deleteClientRegistration (issuer: string, accessToken: string, clientId: string) : Promise<void> {
        await fetch(`${issuer}/clients-registrations/default/${clientId}`, {
            method: 'delete',
            headers: headers(accessToken) as any
        })
        .then(checkStatus)
    }

    public async syncScopes (clientId: string, desiredSetOfScopes: string[], optional: boolean) : Promise<any> {
        const listAllFunction = optional ? this.kcAdminClient.clientScopes.listDefaultOptionalClientScopes : this.kcAdminClient.clientScopes.listDefaultClientScopes
        const allScopes  = await listAllFunction()
        const scopeToId = allScopes.reduce(function(map: any, obj: any) {
            map[obj.name] = obj.id;
            return map;
        }, {});
    
        const listScopesFunction = optional ? this.kcAdminClient.clients.listOptionalClientScopes : this.kcAdminClient.clients.listDefaultClientScopes
    
        const currentScopes  = await listScopesFunction({id:clientId})
    
        const scopesToDelete = currentScopes.filter((s:any) => !desiredSetOfScopes.includes(s.name)).map((s:any) => s.id)
    
        const scopesToAdd = desiredSetOfScopes.filter((sname:string) => currentScopes.filter((s:any) => s.name == sname).length == 0)
                                .map (sname => scopeToId[sname])
        if (scopesToAdd.filter((s:any) => s == null).length != 0) {
            throw Error("Missing one of these Realm Defaults - " + (optional ? "Optional" : "Default" ) + " Scopes: " + desiredSetOfScopes)
        }
    
        // console.log(scopeToId['PatientRecord.Read'])
        // const result2  = await kcAdminClient.clients.addOptionalClientScope({id:clientId, clientScopeId: scopeToId['PatientRecord.Read']})
        // console.log(JSON.stringify(result2, null, 4))
        logger.debug("[syncScopes] (%s) [A] %j", clientId, scopesToAdd)
        logger.debug("[syncScopes] (%s) [D] %j", clientId, scopesToDelete)
        return [ scopesToAdd, scopesToDelete ]
    }
    
    public async applyChanges (clientId: string, changes: string, optional: boolean) : Promise<void> {
        const addFunction = optional ? this.kcAdminClient.clients.addOptionalClientScope : this.kcAdminClient.clients.addDefaultClientScope
        const delFunction = optional ? this.kcAdminClient.clients.delOptionalClientScope : this.kcAdminClient.clients.delDefaultClientScope
        for ( const scopeId of changes[0]) {
            await addFunction({id:clientId, clientScopeId: scopeId})
        }
        for ( const scopeId of changes[1]) {
            await delFunction({id:clientId, clientScopeId: scopeId})
        }
    }

    public async syncAndApply (clientId: string, desiredSetOfDefaultScopes: string[], desiredSetOfOptionalScopes: string[]) {
        const lkup = await this.kcAdminClient.clients.find({clientId: clientId})
        assert.strictEqual(lkup.length, 1, 'Client ID not found ' + clientId)
        const clientPK = lkup[0].id
        const changes = await this.syncScopes (clientPK, desiredSetOfDefaultScopes, false)
        await this.applyChanges(clientPK, changes, false)
        const changesOptional = await this.syncScopes (clientPK, desiredSetOfOptionalScopes, true)
        await this.applyChanges(clientPK, changesOptional, true)
    }

    public async login (clientId: string, clientSecret: string) : Promise<void> {
        await this.kcAdminClient.auth({
            grantType: 'client_credentials',
            clientId: clientId,
            clientSecret: clientSecret
        }).catch ((err:any) => {
            logger.error("Login failed %s", err)
            throw(err)
        })
        this.session = true
    }    
}