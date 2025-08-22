import { Logger } from '../../logger';
import { Application } from './types';

const logger = Logger('keystone.application');

export async function lookupApplication(
  context: any,
  id: string
): Promise<Application> {
  const result = await context.executeGraphQL({
    query: `query GetApplicationById($id: ID!) {
                    allApplications(where: {id: $id}) {
                        id
                        appId
                        name
                        owner {
                          name
                        }
                    }
                }`,
    variables: { id },
  });
  logger.debug('[lookupApplication] result %j', result);
  return result.data.allApplications[0];
}

export async function lookupMyApplicationsById(
  context: any,
  id: string
): Promise<Application> {
  logger.debug('[lookupMyApplicationsById] %s', id);
  const result = await context.executeGraphQL({
    query: `query GetApplicationByAppId($id: ID!) {
                  myApplications(where: {id: $id}) {
                      id
                      appId
                  }
              }`,
    variables: { id },
  });
  logger.debug('[lookupMyApplicationsById] result %j', result);
  return result.data.myApplications[0];
}


export async function createApplication(
  context: any,
  data: { name: string, ownerId: string, description?: string }
): Promise<Application> {
  logger.debug('[createApplication] %j', data);
  const result = await context.executeGraphQL({
    query: `mutation CreateApplication($name: String!, $description: String, $ownerId: ID!) {
                  createApplication(data: {name: $name, owner: {connect: {id: $ownerId}}, description: $description}) {
                      id
                      appId
                      name
                      owner {
                        name
                      }
                  }
              }`,
    variables: data,
  });
  logger.debug('[createApplication] result %j', result);
  return result.data.createApplication;
}