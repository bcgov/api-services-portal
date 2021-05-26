import { Controller, Request, Get, Path, Route, Security } from 'tsoa';
import { KeystoneService } from './ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { syncRecords } from '../batch/feed-worker';
import { gql } from 'graphql-request';
import { Product } from '@/services/keystone/types';
import { strict as assert } from 'assert';
@injectable()
@Route('/directory')
export class DirectoryController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Get()
  public async list(): Promise<any> {
    const result = await this.keystone.executeGraphQL({
      context: this.keystone.sudo(),
      query: list,
    });
    return result.data.allDiscoverableProducts;
  }

  @Get('{id}')
  public async get(@Path() id: string): Promise<any> {
    const product: Product = (
      await this.keystone.executeGraphQL({
        context: this.keystone.sudo(),
        query: item,
        variables: { id },
      })
    ).data.DiscoverableProduct;
    assert.strictEqual(product != null, true, `Product Not Found`);
  }
}

const list = gql`
  query Directory {
    allDiscoverableProducts(where: { environments_some: { active: true } }) {
      id
      name
      environments {
        name
        active
        flow
      }
      dataset {
        name
        title
        notes
        sector
        license_title
        view_audience
        security_class
        record_publish_date
        tags
        organization {
          title
        }
        organizationUnit {
          title
        }
      }
      organization {
        title
      }
      organizationUnit {
        title
      }
    }
  }
`;

const item = gql`
  query GetProduct($id: ID!) {
    DiscoverableProduct(where: { id: $id }) {
      id
      name
      environments {
        name
        active
        flow
        services {
          name
          host
        }
      }
      dataset {
        name
        title
        notes
        sector
        license_title
        security_class
        view_audience
        tags
        record_publish_date
        isInCatalog
        organization {
          title
        }
        organizationUnit {
          title
        }
      }
      organization {
        title
      }
      organizationUnit {
        title
      }
    }
  }
`;
