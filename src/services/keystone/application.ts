import { Logger } from "../../logger"
import { Application } from "./types"

const logger = Logger('keystone.application')

export async function lookupApplication (context: any, id: string) : Promise<Application> {
    const result = await context.executeGraphQL({
        query: `query GetApplicationById($id: ID!) {
                    allApplications(where: {id: $id}) {
                        id
                        appId
                    }
                }`,
        variables: { id: id },
    })
    logger.debug("[lookupApplication] result %j", result)
    return result.data.allApplications[0]
}
