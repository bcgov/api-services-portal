import {
  Controller,
  OperationId,
  Request,
  Path,
  Route,
  Security,
  Tags,
  Get,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { transform, transformSetAnonymous } from './DirectoryController';
import { gql } from 'graphql-request';

@injectable()
@Route('/namespaces/{ns}/directory')
@Security('jwt', ['Namespace.Manage'])
@Tags('API Directory')
export class NamespaceDirectoryController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Used primarily for "Preview Mode"
   * Get a particular Dataset
   *
   * @param ns
   * @param name
   * @param request
   * @returns
   */
  @Get('{id}')
  @OperationId('get-ns-directory-dataset')
  public async getDataset(
    @Path() ns: string,
    @Path() id: string,
    @Request() request: any
  ): Promise<any> {
    const context = this.keystone.createContext(request);
    const result = await this.keystone.executeGraphQL({
      context,
      query: item,
      variables: { id },
    });

    if (result.data.allProductsByNamespace.length == 0) {
      return null;
    }

    return transform(
      transformSetAnonymous(result.data.allProductsByNamespace)
    )[0];
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
  @OperationId('get-ns-directory')
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
  query DirectoryNamespaceDataset($id: ID!) {
    allProductsByNamespace(where: { dataset: { id: $id } }) {
      id
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
