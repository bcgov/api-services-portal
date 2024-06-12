import {
  Controller,
  Request,
  OperationId,
  Put,
  Path,
  Route,
  Security,
  Body,
  Get,
  Tags,
  Delete,
} from 'tsoa';
import { strict as assert } from 'assert';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import {
  syncRecordsThrowErrors,
  getRecords,
  parseJsonString,
  removeEmpty,
  removeKeys,
  transformAllRefID,
  deleteRecord,
} from '../../batch/feed-worker';
import { BatchResult } from '../../batch/types';
import { Dataset, DraftDataset } from './types';

@injectable()
@Route('/organizations')
@Tags('API Directory (Administration)')
export class OrgDatasetController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Get metadata about Datasets that are available by API for this organization
   * > `Required Scope:` Dataset.Manage
   *
   * @summary Get Organization Datasets
   */
  @Get('/{org}/datasets')
  @OperationId('organization-datasets')
  @Security('jwt', ['Dataset.Manage'])
  public async getDatasets(
    @Path() org: string,
    @Request() request: any
  ): Promise<Dataset[]> {
    const ctx = this.keystone.createContext(request);

    const batchClause = {
      query: '$org: String',
      clause: '{ organization: { name: $org } }',
      variables: { org },
    };

    const records = await getRecords(
      ctx,
      'DraftDataset',
      undefined,
      [],
      batchClause
    );

    return records
      .map((o) => removeEmpty(o))
      .map((o) => transformAllRefID(o, ['organization', 'organizationUnit']))
      .map((o) => parseJsonString(o, ['tags']))
      .map((o) =>
        removeKeys(o, [
          'id',
          'namespace',
          'extSource',
          'extRecordHash',
          'extForeignKey',
        ])
      );
  }

  /**
   * Manage metadata about Datasets that are available by API for this organization
   * > `Required Scope:` Dataset.Manage
   *
   * @summary Manage Organization Datasets
   */
  @Put('{org}/datasets')
  @OperationId('put-organization-dataset')
  @Security('jwt', ['Dataset.Manage'])
  public async putDataset(
    @Path() org: string,
    @Body() body: DraftDataset,
    @Request() request: any
  ): Promise<BatchResult> {
    assert.strictEqual(org, body['organization'], 'Organization Mismatch');
    return await syncRecordsThrowErrors(
      this.keystone.createContext(request, true),
      'DraftDataset',
      body['name'],
      body
    );
  }

  /**
   * Delete a Dataset
   * > `Required Scope:` Dataset.Manage
   *
   * @summary Delete a dataset
   * @param ns
   * @param appId
   * @param request
   * @returns
   */
  @Delete('/{org}/datasets/{name}')
  @OperationId('delete-dataset')
  @Security('jwt', ['Dataset.Manage'])
  public async delete(
    @Path() org: string,
    @Path() name: string,
    @Request() request: any
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request, true);

    const records = await getRecords(
      context,
      'DraftDataset',
      undefined,
      ['organization', 'organizationUnit'],
      {
        query: '$org: String!, $name: String!',
        clause: '{ organization: { name: $org }, name: $name }',
        variables: { org, name },
      }
    );

    assert.strictEqual(records.length == 0, false, 'Dataset not found');

    return await deleteRecord(context, 'DraftDataset', records.pop().name);
  }

  /**
   * Get metadata about a Dataset that are available by API for this organization
   * > `Required Scope:` Dataset.Manage
   *
   * @summary Get Organization Dataset
   */
  @Get('/{org}/datasets/{name}')
  @OperationId('get-organization-dataset')
  @Security('jwt', ['Dataset.Manage'])
  public async getDataset(
    @Path() org: string,
    @Path() name: string,
    @Request() request: any
  ): Promise<Dataset> {
    const ctx = this.keystone.createContext(request);

    const records = await getRecords(
      ctx,
      'DraftDataset',
      undefined,
      ['organization', 'organizationUnit'],
      {
        query: '$org: String!, $name: String!',
        clause: '{ organization: { name: $org }, name: $name }',
        variables: { org, name },
      }
    );

    return records
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

export function transformResources(o: any) {
  o.resources = o.resources?.map((res: any) => ({
    name: res.name,
    url: res.url,
    bcdc_type: res.bcdc_type,
    format: res.format,
  }));
  return o;
}

export function transformContacts(o: any) {
  o.contacts = o.contacts?.map((con: any) => ({
    role: con.role,
    name: con.name,
    email: con.email,
  }));
  return o;
}
