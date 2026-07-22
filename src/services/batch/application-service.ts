import { syncRecordsThrowErrors } from '../../batch/feed-worker';

import { BatchResult } from '../../batch/types';
import { Application } from './types';
import { Application as KeystoneApplication } from '../keystone/types';

export class ApplicationService {
  upsertApplication = async (
    context: any,
    body: Application
  ): Promise<BatchResult> => {
    return await syncRecordsThrowErrors(context, 'Application', null, body);
  };

  lookupApplication = async (
    context: any,
    id: string
  ): Promise<KeystoneApplication> => {
    const result = await context.executeGraphQL({
      query: `query GetApplicationById($id: ID!) {
                      allApplications(where: {id: $id}) {
                          id
                          appId
                          name
                          description
                          owner {
                            name
                          }
                      }
                  }`,
      variables: { id },
    });
    return result.data.allApplications[0];
  };
}
