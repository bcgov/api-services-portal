import { Controller, OperationId, Get, Path, Route } from 'tsoa';
import { KeystoneService } from './ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { gql } from 'graphql-request';
import { Product } from '@/services/keystone/types';
@injectable()
@Route('/directory')
export class DirectoryController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Get()
  @OperationId('directory-list')
  public async list(): Promise<any> {
    const result = await this.keystone.executeGraphQL({
      context: this.keystone.sudo(),
      query: list,
    });
    return transform(result.data.allDiscoverableProducts);
  }

  @Get('{id}')
  @OperationId('directory-item')
  public async get(@Path() id: string): Promise<any> {
    const result = await this.keystone.executeGraphQL({
      context: this.keystone.sudo(),
      query: item,
      variables: { id },
    });
    return transform(result.data.allDiscoverableProducts)[0];
  }
}

function transform(products: Product[]) {
  return products.reduce((accumulator: any, prod: any) => {
    if (prod.dataset === null) {
      // drop it
    } else {
      const dataset = accumulator.filter(
        (a: any) => a.name === prod.dataset?.name
      );
      if (dataset.length == 0) {
        accumulator.push(prod.dataset);
        prod.dataset.products = [{ ...prod, dataset: null }];
      } else {
        dataset[0].products.push({ ...prod, dataset: null });
      }
    }
    return accumulator;
  }, []);
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
        id
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
    }
  }
`;

const item = gql`
  query GetProduct($id: ID!) {
    allDiscoverableProducts(where: { dataset: { id: $id } }) {
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
    }
  }
`;
