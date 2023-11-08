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
  syncRecordsThrowErrors,
  getRecords,
  removeEmpty,
  removeKeys,
  transformAllRefID,
  deleteRecord,
  getRecord,
  transformArrayKeyToString,
} from '../../batch/feed-worker';
import { Product } from './types';
import { BatchResult } from '../../batch/types';

import { Logger } from '../../logger';
import { gql } from 'graphql-request';
import { strict as assert } from 'assert';
import { isEnvironmentID, isProductID } from '../../services/identifiers';
import { Product as KSProduct } from '../../services/keystone/types';

const logger = Logger('controllers.Product');

@injectable()
@Route('/namespaces/{ns}')
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
   * @param ns
   * @param body
   * @param request
   */
  @Put('/products')
  @OperationId('put-product')
  @Security('jwt', ['Namespace.Manage'])
  public async put(
    @Path() ns: string,
    @Body() body: Product,
    @Request() request: any
  ): Promise<BatchResult> {
    return await syncRecordsThrowErrors(
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
   * @param ns
   * @param request
   * @returns
   */
  @Get('/products')
  @OperationId('get-products')
  @Security('jwt', ['Namespace.Manage'])
  public async get(
    @Path() ns: string,
    @Request() request: any
  ): Promise<Product[]> {
    const ctx = this.keystone.createContext(request);
    const records: KSProduct[] = await getRecords(
      ctx,
      'Product',
      'allProductsByNamespace',
      ['environments']
    );

    return records
      .map((o) => removeEmpty(o))
      .map((o) =>
        transformAllRefID(o, ['credentialIssuer', 'dataset', 'legal'])
      )
      .map((o) => transformArrayKeyToString(o, 'services', 'name'))
      .map((o) =>
        removeKeys(o, [
          'id',
          'namespace',
          'product',
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
   * @param ns
   * @param appId
   * @param request
   * @returns
   */
  @Delete('/products/{appId}')
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
   * @param appId
   * @param force
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

    const records: KSProduct[] = await getRecords(
      context,
      'Product',
      'allProductsByNamespace',
      ['environments']
    );
    const product = records
      .filter((p) => p.environments.filter((e) => e.appId === appId).length > 0)
      .pop();

    assert.strictEqual(
      typeof product === 'undefined',
      false,
      'Environment not found'
    );
    assert.strictEqual(product.namespace === ns, true, 'Environment invalid');

    const environment = product.environments
      .filter((e) => e.appId === appId)
      .pop();

    const result = await this.keystone.executeGraphQL({
      context,
      query: deleteEnvironment,
      variables: { prodEnvId: environment.id, force },
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
