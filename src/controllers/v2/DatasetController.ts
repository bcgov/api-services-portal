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
import { transform } from './DirectoryController';
import { gql } from 'graphql-request';
import { Product } from '@/services/keystone/types';

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

  /**
   * Used primarily for "Preview Mode"
   * List the datasets belonging to a particular namespace
   *
   * @param ns
   * @param name
   * @param request
   * @returns
   */
  @Get()
  @OperationId('get-datasets')
  public async getDatasets(
    @Path() ns: string,
    @Request() request: any
  ): Promise<any> {
    const context = this.keystone.createContext(request);
    const result = await this.keystone.executeGraphQL({
      context,
      query: list,
    });
    // For Preview, put a placeholder Dataset so that it gets returned
    // result.data.allProductsByNamespace
    //   .filter((prod: Product) => !prod.dataset)
    //   .forEach((prod: Product) => {
    //     prod.dataset = {
    //       id: '--',
    //       name: 'Placeholder Dataset',
    //       title: 'Placeholder Dataset',
    //       isInCatalog: false,
    //       isDraft: true,
    //     };
    //   });

    return transform(result.data.allProductsByNamespace);
  }
}

const list = gql`
  query DirectoryNamespacePreview {
    allProductsByNamespace {
      name
      environments {
        name
        active
        flow
      }
      dataset {
        id
        name
        title
        notes
        license_title
        view_audience
        security_class
        record_publish_date
        tags
        organization {
          name
          title
        }
        organizationUnit {
          name
          title
        }
      }
    }
  }
`;
