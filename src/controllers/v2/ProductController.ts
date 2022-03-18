import {
  Controller,
  Request,
  Delete,
  Query,
  OperationId,
  Get,
  Put,
  Path,
  Route,
  Security,
  Body,
  Tags,
  FieldErrors,
  ValidateError,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import {
  syncRecords,
  getRecords,
  removeEmpty,
  removeKeys,
  transformAllRefID,
  deleteRecord,
  getRecord,
} from '../../batch/feed-worker';
import { Product } from './types';
import { BatchResult } from '../../batch/types';

import { Logger } from '../../logger';
import { gql } from 'graphql-request';
import { strict as assert } from 'assert';
import { isEnvironmentID, isProductID } from '../../services/identifiers';

const logger = Logger('controllers.Product');

@injectable()
@Route('/namespaces/{ns}/products')
@Tags('Products')
export class ProductController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Manage Products for APIs that will appear on the API Directory
   * > `Required Scope:` Namespace.Manage
   *
   * @summary Manage Products
   */
  @Put()
  @OperationId('put-product')
  @Security('jwt', ['Namespace.Manage'])
  public async put(
    @Path() ns: string,
    @Body() body: Product,
    @Request() request: any
  ): Promise<BatchResult> {
    return await syncRecords(
      this.keystone.createContext(request),
      'Product',
      body['appId'],
      body
    );
  }

  /**
   * Get Products describing APIs that will appear on the API Directory
   * > `Required Scope:` Namespace.Manage
   *
   * @summary Get Products
   */
  @Get()
  @OperationId('get-products')
  @Security('jwt', ['Namespace.Manage'])
  public async get(
    @Path() ns: string,
    @Request() request: any
  ): Promise<Product[]> {
    const ctx = this.keystone.createContext(request);
    const records: Product[] = await getRecords(
      ctx,
      'Product',
      'allProductsByNamespace',
      ['environments']
    );

    return records
      .map((o) => removeEmpty(o))
      .map((o) =>
        transformAllRefID(o, [
          'credentialIssuer',
          'dataset',
          'services',
          'legal',
        ])
      )
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
   * Delete a Product
   * > `Required Scope:` Namespace.Manage
   *
   * @summary Manage Products
   */
  @Delete('/{appId}')
  @OperationId('delete-product')
  @Security('jwt', ['Namespace.Manage'])
  public async delete(
    @Path() ns: string,
    @Path() appId: string,
    @Request() request: any
  ): Promise<BatchResult> {
    const context = this.keystone.createContext(request);

    assert.strictEqual(isProductID(appId), true, 'Invalid appId');

    const current = await getRecord(context, 'Product', appId);
    assert.strictEqual(current === null, false, 'Product not found');
    assert.strictEqual(current.namespace === ns, true, 'Product invalid');
    return await deleteRecord(context, 'Product', appId);
  }

  /**
   * Delete a Product Environment
   * > `Required Scope:` Namespace.Manage
   *
   * @summary Delete a Product Environment
   * @param ns
   * @param request
   * @returns
   */
  @Delete('/environments/{appId}')
  @OperationId('delete-product-environment')
  @Security('jwt', ['Namespace.Manage'])
  public async deleteEnvironment(
    @Path() ns: string,
    @Path() appId: string,
    @Query() force: boolean = false,
    @Request() request: any
  ): Promise<void> {
    const context = this.keystone.createContext(request);

    assert.strictEqual(isEnvironmentID(appId), true, 'Invalid appId');

    const current = await getRecord(
      this.keystone.createContext(request),
      'Environment',
      appId
    );
    assert.strictEqual(current === null, false, 'Environment not found');
    assert.strictEqual(current.namespace === ns, true, 'Environment invalid');

    const result = await this.keystone.executeGraphQL({
      context,
      query: deleteEnvironment,
      variables: { id: current.id, force },
    });
    logger.debug('Result %j', result);
    if (result.errors) {
      const errors: FieldErrors = {};
      result.errors.forEach((err: any, ind: number) => {
        errors[`d${ind}`] = { message: err.message };
      });
      throw new ValidateError(errors, 'Unable to delete product environment');
    }
    return result.data.forceDeleteEnvironment;
  }
}

const deleteEnvironment = gql`
  mutation ForceDeleteEnvironment($prodEnvId: ID!, $force: Boolean!) {
    forceDeleteEnvironment(id: $prodEnvId, force: $force)
  }
`;
