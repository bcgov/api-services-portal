import { assertEqual } from '../../controllers/ioc/assert';
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
                        namespace
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

export async function lookupApplicationByAppId(
  context: any,
  appId: string,
  namespace?: string
): Promise<Application> {
  const where: any = { appId };
  if (namespace) {
    where.namespace = namespace;
  }
  const result = await context.executeGraphQL({
    query: `query GetApplicationByAppId($where: ApplicationWhereInput!) {
                    allApplications(where: $where) {
                        id
                        appId
                        name
                        namespace
                        description
                        owner {
                          name
                        }
                    }
                }`,
    variables: { where },
  });
  logger.debug('[lookupApplicationByAppId] result %j', result);
  return result.data.allApplications[0];
}

export async function addApplication(
  context: any,
  data: {
    name: string;
    description?: string;
    namespace?: string;
    appId?: string;
  }
): Promise<Application> {
  const result = await context.executeGraphQL({
    query: `mutation CreateApplication($data: ApplicationCreateInput!) {
                    createApplication(data: $data) {
                        id
                        appId
                        name
                        namespace
                        description
                    }
                }`,
    variables: {
      data: {
        name: data.name,
        description: data.description || '',
        namespace: data.namespace,
        ...(data.appId ? { appId: data.appId } : {}),
      },
    },
  });
  logger.debug('[addApplication] result %j', result);
  assertEqual(
    'errors' in result,
    false,
    'application',
    `Failed to create Application ${JSON.stringify(result.errors || result)}`
  );
  return result.data.createApplication;
}

export async function deleteApplication(
  context: any,
  id: string
): Promise<void> {
  const result = await context.executeGraphQL({
    query: `mutation DeleteApplication($id: ID!) {
                    deleteApplication(id: $id) {
                        id
                    }
                }`,
    variables: { id },
  });
  logger.debug('[deleteApplication] result %j', result);
  assertEqual(
    'errors' in result,
    false,
    'application',
    `Failed to delete Application ${JSON.stringify(result.errors || result)}`
  );
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
