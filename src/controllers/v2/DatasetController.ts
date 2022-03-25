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
import {
  getRecord,
  parseJsonString,
  removeEmpty,
  removeKeys,
  syncRecords,
  transformAllRefID,
} from '../../batch/feed-worker';
import { Dataset, DraftDataset } from './types';
import { transformContacts, transformResources } from './OrgDatasetController';
import { BatchResult } from '../../batch/types';

@injectable()
@Route('/namespaces/{ns}/datasets')
@Security('jwt', ['Namespace.Manage'])
@Tags('API Directory')
export class DatasetController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Update metadata about a Dataset
   * > `Required Scope:` Namespace.Manage
   *
   * @summary Update Dataset
   */
  @Put()
  @OperationId('put-dataset')
  public async put(
    @Path() ns: string,
    @Body() body: DraftDataset,
    @Request() request: any
  ): Promise<BatchResult> {
    // rules:
    // - isInDraft can not be changed (only by Organization)
    // - isInCatalog must be false (OrgDataset should only be updating this)
    removeKeys(body, ['isInDraft', 'isInCatalog']);

    return await syncRecords(
      this.keystone.createContext(request),
      'DraftDataset',
      request.body['name'],
      request.body
    );
  }

  /**
   * Get metadata about a Dataset
   * > `Required Scope:` Namespace.Manage
   *
   * @summary Get Dataset
   */
  @Get('{name}')
  @OperationId('get-dataset')
  public async getDataset(
    @Path() ns: string,
    @Path() name: string,
    @Request() request: any
  ): Promise<Dataset> {
    const ctx = this.keystone.createContext(request);

    const record = await getRecord(ctx, 'DraftDataset', name, [
      'organization',
      'organizationUnit',
    ]);

    return [record]
      .map((o) => removeEmpty(o))
      .map((o) => transformAllRefID(o, []))
      .map((o) => parseJsonString(o, ['tags', 'contacts', 'resources']))
      .map((o) =>
        removeKeys(o, [
          'id',
          'namespace',
          'extSource',
          'extForeignKey',
          'extRecordHash',
          'orgUnits',
        ])
      )
      .map((o) => transformContacts(o))
      .map((o) => transformResources(o))
      .pop();
  }
}
