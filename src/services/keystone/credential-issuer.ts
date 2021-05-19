import { Logger } from '../../logger'
import { CredentialIssuer } from './types'

const logger = Logger('keystone.cred-issuer')

export async function lookupCredentialIssuerById (context: any, id: string) : Promise<CredentialIssuer> {
    const result = await context.executeGraphQL({
        query: `query GetCredentialIssuerById($id: ID!) {
                    CredentialIssuer(where: {id: $id}) {
                        name
                        flow
                        mode
                        environmentDetails
                    }
                }`,
        variables: { id: id }
    })
    logger.debug("Query [lookupCredentialIssuerById] result %j", result)
    return result.data.CredentialIssuer
}
