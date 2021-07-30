import {
  Controller,
  OperationId,
  Request,
  Get,
  Path,
  Route,
  Security,
} from 'tsoa';
import { KeystoneService } from './ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { syncRecords } from '../batch/feed-worker';
import { gql } from 'graphql-request';
import { Namespace, Product } from '@/services/keystone/types';
import { strict as assert } from 'assert';
import { Logger } from '../logger';

const logger = Logger('controllers.Namespace');

@injectable()
@Route('/namespaces')
@Security('jwt')
export class NamespaceController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Get()
  @OperationId('namespace-list')
  public async list(@Request() request: any): Promise<string[]> {
    logger.debug('Request %j', request);
    const result = await this.keystone.executeGraphQL({
      context: this.keystone.createContext(request),
      query: list,
    });
    logger.debug('Result %j', result);
    return result.data.allNamespaces.map((ns: Namespace) => ns.name);
  }
}

const list = gql`
  query Namespaces {
    allNamespaces {
      name
    }
  }
`;
