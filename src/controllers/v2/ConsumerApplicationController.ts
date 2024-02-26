import {
  Body,
  Controller,
  OperationId,
  Request,
  Put,
  Path,
  Route,
  Security,
  Tags,
  Get,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';

import { Application } from './types';
import { getRecords, removeEmpty } from '../../batch/feed-worker';
import { Logger } from '../../logger';
import { BatchWhereClause } from '@/services/keystone/batch-service';

const logger = Logger('controllers.Application');

@injectable()
@Route('/applications')
@Tags('Consumers')
export class ApplicationController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Update metadata about a Application
   * > `Required Scope:` Application.Manage
   *
   * @summary Update Application
   */
  @Put('/{app}')
  @OperationId('put-application')
  @Security('jwt')
  @Security('pat')
  public async put(
    @Path() app: string,
    @Body() body: Application,
    @Request() request: any
  ): Promise<any> {
    return {
      put: true,
      app,
      body,
    };
  }

  /**
   * Get a list of your Applications
   *
   * @summary List of Applications
   */
  @Get()
  @OperationId('get-applications')
  @Security('jwt')
  @Security('pat')
  public async list(@Request() request: any): Promise<Application[]> {
    // skip access control - since this API will be adding explicit where clause filtering
    const ctx = this.keystone.createContext(request, true);

    const where: BatchWhereClause = {
      query: '$owner: String',
      clause: '{ owner: { username: $owner }}',
      variables: {
        owner: ctx['authedItem']['username'],
      },
    };

    const records: Application[] = await getRecords(
      ctx,
      'Application',
      'allApplications',
      [],
      where
    );

    logger.info('Applications %j', records);

    return records.map((o) => removeEmpty(o));
  }

  // Update application owners
}
