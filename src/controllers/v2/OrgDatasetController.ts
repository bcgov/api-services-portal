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
} from 'tsoa';
import { strict as assert } from 'assert';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import {
  syncRecords,
  getRecords,
  parseJsonString,
  removeEmpty,
  removeKeys,
  transformAllRefID,
} from '../../batch/feed-worker';
import { BatchResult } from '../../batch/types';
import { Dataset } from './types';

@injectable()
@Route('/organizations')
@Tags('API Directory')
export class OrgDatasetController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Get('/{orgUnit}/datasets')
  @OperationId('organization-datasets')
  @Security('jwt', ['Dataset.Manage'])
  public async getDatasets(
    @Path() orgUnit: string,
    @Request() request: any
  ): Promise<Dataset[]> {
    const ctx = this.keystone.createContext(request);

    const batchClause = {
      query: '$orgUnit: String',
      clause: '{ organizationUnit: { name: $orgUnit } }',
      variables: { orgUnit },
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

  @Put('{orgUnit}/datasets')
  @OperationId('put-organization-dataset')
  @Security('jwt', ['Dataset.Manage'])
  public async putDataset(
    @Path() orgUnit: string,
    @Body() body: Dataset,
    @Request() request: any
  ): Promise<BatchResult> {
    assert.strictEqual(
      orgUnit,
      body['organizationUnit'],
      'Organization Unit Mismatch'
    );
    return await syncRecords(
      this.keystone.createContext(request),
      'DraftDataset',
      body['name'],
      body
    );
  }

  @Get('/{orgUnit}/datasets/{name}')
  @OperationId('get-organization-dataset')
  @Security('jwt', ['Dataset.Manage'])
  public async getDataset(
    @Path() orgUnit: string,
    @Path() name: string,
    @Request() request: any
  ): Promise<Dataset[]> {
    const ctx = this.keystone.createContext(request);

    const records = await getRecords(
      ctx,
      'DraftDataset',
      undefined,
      ['organization', 'organizationUnit'],
      {
        query: '$orgUnit: String!, $name: String!',
        clause: '{ organizationUnit: { name: $orgUnit }, name: $name }',
        variables: { orgUnit, name },
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
      .map((o) => transformResources(o));
  }
}

function transformResources(o: any) {
  o.resources = o.resources?.map((res: any) => ({
    name: res.name,
    url: res.url,
    bcdc_type: res.bcdc_type,
    format: res.format,
  }));
  return o;
}

function transformContacts(o: any) {
  o.contacts = o.contacts?.map((con: any) => ({
    role: con.role,
    name: con.name,
    email: con.email,
  }));
  return o;
}
