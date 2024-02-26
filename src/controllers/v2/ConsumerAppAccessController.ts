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

import { Application, ServiceAccess } from './types';
import { getRecords, removeEmpty } from '../../batch/feed-worker';
import { Logger } from '../../logger';
import { BatchWhereClause } from '@/services/keystone/batch-service';

const logger = Logger('controllers.AppAccess');

@injectable()
@Route('/access')
@Tags('Consumers')
export class ApplicationAccessController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Get a list of application Access
   *
   * @summary List of Access
   */
  @Get()
  @OperationId('get-application-access')
  @Security('jwt')
  @Security('pat')
  public async list(@Request() request: any): Promise<ServiceAccess[]> {
    // skip access control - since this API will be adding explicit where clause filtering
    const ctx = this.keystone.createContext(request, true);

    const where: BatchWhereClause = {
      query: '$owner: String',
      clause: '{ application: { owner: { username: $owner }}}',
      variables: {
        owner: ctx['authedItem']['username'],
      },
    };

    const records: ServiceAccess[] = await getRecords(
      ctx,
      'ServiceAccess',
      'myServiceAccesses',
      [],
      where
    );

    logger.info('Service Access %j', records);

    return records.map((o) => removeEmpty(o));
  }
}
