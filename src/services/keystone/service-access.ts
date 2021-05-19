import { Logger } from "../../logger"
import { Application, Environment, ServiceAccess, ServiceAccessCreateInput } from "./types"

const assert = require('assert').strict;
const logger = Logger('keystone.svc-access')


export async function lookupCredentialReferenceByServiceAccess (context: any, id: string) : Promise<ServiceAccess> {
    const result = await context.executeGraphQL({
        query: `query GetSpecificServiceAccess($id: ID!) {
                    allServiceAccesses(where: {id: $id}) {
                        id
                        consumerType
                        productEnvironment {
                            id
                            name
                            flow
                            credentialIssuer {
                                id
                            }
                        }
                        consumer {
                            id
                            customId
                            extForeignKey
                        }
                        credentialReference
                    }
                }`,
        variables: { id: id },
    })
    logger.debug("Query [lookupCredentialReferenceByServiceAccess] result %j", result)
    result.data.allServiceAccesses[0].credentialReference = JSON.parse(result.data.allServiceAccesses[0].credentialReference)
    return result.data.allServiceAccesses[0]
}

export async function lookupServiceAccessesByNamespace (context: any, ns: string) : Promise<ServiceAccess> {
    const result = await context.executeGraphQL({
        query: `query GetServiceAccessByNamespace($ns: String!) {
                    allServiceAccesses(where: {namespace: $ns}) {
                        id
                        consumer {
                            username
                        }
                    }
                }`,
        variables: { ns: ns },
    })
    logger.debug("Query [lookupServiceAccessesByNamespace] result %j", result)
    return result.data.allServiceAccesses
}

export async function addServiceAccess (context: any, name: string, active: boolean, aclEnabled: boolean, consumerType: string, credentialReference: any, clientRoles: string[], consumerPK: string, productEnvironment: Environment, application: Application, namespace:string = null) : Promise<string> {

    const data = { name, active, aclEnabled, consumerType } as ServiceAccessCreateInput

    data.clientRoles = JSON.stringify(clientRoles == null ? []:clientRoles)
    data.consumer = { connect: { id: consumerPK } }
    data.productEnvironment = { connect: { id: productEnvironment.id } }
    application != null && (data.application = { connect: { id: application.id } })
    credentialReference != null && (data.credentialReference = JSON.stringify(credentialReference))
    data.namespace = namespace

    logger.debug("[addServiceAccess] %j", data)

    const result = await context.executeGraphQL({
        query: `mutation CreateServiceAccess($data: ServiceAccessCreateInput) {
                    createServiceAccess(data: $data) {
                        id
                    }
                }`,
        variables: { data },
    })
    logger.debug("[addServiceAccess] RESULT %j", result)
    return result.data.createServiceAccess.id        
}

export async function markActiveTheServiceAccess (context: any, serviceAccessId: string) : Promise<ServiceAccess> {
    const result = await context.executeGraphQL({
        query: `mutation UpdateConsumerInServiceAccess($serviceAccessId: ID!) {
                    updateServiceAccess(id: $serviceAccessId, data: { active: true } ) {
                        id
                    }
                }`,
        variables: { serviceAccessId },
    })
    logger.debug("[markActiveTheServiceAccess] RESULT %j", result)
    return result.data.updateServiceAccess
}

export async function linkCredRefsToServiceAccess (context: any, serviceAccessId: string, credentialReference: any) : Promise<ServiceAccess> {
    const credRefAsString = JSON.stringify(credentialReference)
    const result = await context.executeGraphQL({
        query: `mutation UpdateConsumerInServiceAccess($serviceAccessId: ID!, $credRefAsString: String) {
                    updateServiceAccess(id: $serviceAccessId, data: { active: true, credentialReference: $credRefAsString } ) {
                        id
                    }
                }`,
        variables: { serviceAccessId, credRefAsString },
    })
    logger.debug("[linkCredRefsToServiceAccess] RESULT %j", result)
    return result.data.updateServiceAccess
}

