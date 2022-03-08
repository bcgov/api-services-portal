import { Controller, OperationId, Get, Path, Route, Tags } from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { gql } from 'graphql-request';
import { Product } from '@/services/keystone/types';
import {
  removeEmpty,
  removeKeys,
  parseJsonString,
  transformAllRefID,
} from '../../batch/feed-worker';

@injectable()
@Route('/directory')
@Tags('API Directory')
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
    return transform(
      transformSetAnonymous(result.data.allDiscoverableProducts)
    )[0];
  }
}

function transformSetAnonymous(products: Product[]) {
  products.forEach((prod) => {
    prod.environments.forEach((env) => {
      env.services.forEach((svc) => {
        function setAnonymousIfApplicable(plugins: any[]) {
          plugins
            ?.filter(
              (plugin) =>
                plugin.name == 'key-auth' || plugin.name == 'jwt-keycloak'
            )
            .forEach((plugin) => {
              const config = JSON.parse(plugin.config);
              if (config.anonymous) {
                (env as any).anonymous = true;
              }
            });
        }
        setAnonymousIfApplicable(svc.plugins);
        svc.routes?.forEach((route) => {
          setAnonymousIfApplicable(route.plugins);
        });
      });
    });
  });
  return products;
}
function transform(products: Product[]) {
  const records: Product[] = products.reduce((accumulator: any, prod: any) => {
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

  return records
    .map((o) => removeEmpty(o))
    .map((o) => parseJsonString(o, ['tags']));
}

const list = gql`
  query Directory {
    allDiscoverableProducts(where: { environments_some: { active: true } }) {
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

const item = gql`
  query GetProduct($id: ID!) {
    allDiscoverableProducts(where: { dataset: { id: $id } }) {
      name
      environments {
        name
        active
        flow
        services {
          name
          host
          plugins {
            name
            config
          }
          routes {
            plugins {
              name
              config
            }
          }
        }
      }
      dataset {
        name
        title
        notes
        license_title
        security_class
        view_audience
        tags
        record_publish_date
        isInCatalog
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
