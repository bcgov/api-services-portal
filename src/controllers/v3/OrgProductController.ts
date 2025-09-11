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
  replaceKey,
} from '../../batch/feed-worker';
import { BatchResult } from '../../batch/types';
import { Dataset, DraftDataset } from './types';
import { Product } from './types';
import { ProductCatalog, ProductCatalogOperation } from './types-extra';
import { gql } from 'graphql-request';
import { Environment } from '../../services/keystone/types';
import YAML from 'yaml';
import { getGwaProductEnvironment } from '../../services/workflow';
import { NamespaceService } from '../../services/org-groups';
import { OrgNamespace } from '../../services/org-groups/types';

@injectable()
@Route('/organizations')
@Tags('API Directory (Administration)')
export class OrgProductController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Get Products that are available by API across all Organizations
   *
   * @summary Get Product Catalog
   */
  @Get('/{org}/catalog')
  @OperationId('organization-products-catalog')
  public async getProductCatalog(
    @Path() org: string,
  ): Promise<ProductCatalog[]> {
    const result = await this.keystone.executeGraphQL({
      context: this.keystone.sudo(),
      query: list,
    });
    const envs = result.data.allEnvironments.filter(
      (e: Environment) => e.product.organization != null
    );

    const output = envs.map((env: any) => {
      const spec = YAML.parse(env.spec?.blob || '{}');

      
      const operations = spec?.paths && Object.keys(spec.paths).map((path) => {
        return Object.keys(spec.paths[path]).map((method) => {
          const op = spec.paths[path][method];
          return {
            operationId: op.operationId,
            summary: op.summary || '',
            scopes: (op.security && op.security[0] && op.security[0]['bearer_auth']) ? op.security[0]['bearer_auth'] : [],
          };
        });
      });

      const flattenedOperations = [];
      if (operations) {
        for (const opList of operations) {
          for (const op of opList) {
            flattenedOperations.push(op);
          }
        }
      }

      return {
        appId: env.appId,
        name: env.name,
        spec: {
          title: spec.info?.title || '',
          version: spec.info?.version || '',
          description: spec.info?.description || '',
          operations: flattenedOperations,
        },
        product: {
          name: env.product.name,
          type: env.product.type,
          namespace: env.product.namespace,
          organization: {
            name: env.product.organization.name,
          },
        },
      };
    });

    const promises = output.filter((env:any) => env.product.namespace).map(async (env: any) => {
      const nsAttributes = await getNamespaceAttributes(
        env.product.namespace
      );
      env.namespace = nsAttributes;
    });
    await Promise.all(promises);
    return output;
  }

  /**
   * Get metadata about Datasets that are available by API for this organization
   * > `Required Scope:` Dataset.Manage
   *
   * @summary Get Organization Datasets
   */
  @Get('/{org}/products')
  @OperationId('organization-products')
  @Security('jwt', ['Dataset.Manage'])
  public async getProducts(
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
      'Product',
      undefined,
      ['environments'],
      batchClause
    );

    return records
      .map((o) => removeEmpty(o))
      .map((o) => transformAllRefID(o, ['organization', 'organizationUnit']))
      .map((o) => removeKeys(o, ['id']));
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
  @Put('/{org}/gateways/{gatewayId}/products')
  @OperationId('organization-put-product')
  @Security('jwt', ['Dataset.Manage'])
  public async put(
    @Path() gatewayId: string,
    @Path() org: string,
    @Body() body: Product,
    @Request() request: any
  ): Promise<BatchResult> {
    // TODO: Make sure namespace is allowed for this org
    body['gatewayId'] = gatewayId;
    body['organization'] = org;

    return await syncRecordsThrowErrors(
      this.keystone.createContext(request, true),
      'Product',
      body['appId'],
      replaceKey(body, 'gatewayId', 'namespace')
    );
  }
}

const list = gql`
  query OrgProductCatalog {
    allEnvironments {
      appId
      name
      spec {
        blob
      }
      product {
        name
        type
        namespace
        organization {
          name
        }
      }
    }
  }
`;


async function getNamespaceAttributes(ns: string) : Promise<OrgNamespace> {
      const prodEnv = await getGwaProductEnvironment(this.keystone.sudo(), false);
      const envConfig = prodEnv.issuerEnvConfig;
  
      const svc = new NamespaceService(envConfig.issuerUrl);
      await svc.login(envConfig.clientId, envConfig.clientSecret);
      return await svc.getNamespaceOrganizationDetails(ns);
}
