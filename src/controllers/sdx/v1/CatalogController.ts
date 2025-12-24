import {
  Controller,
  Request,
  Response,
  OperationId,
  Get,
  Route,
  Security,
  Tags,
  Example,
  SuccessResponse,
} from 'tsoa';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { GetCatalog } from '../../../services/gateway-patterns/catalog';
import { SDXCatalogEntry } from './types';

interface MissingCredentialsJSON {
  code: 'credentials_required' | 'invalid_token';
  message:
    | 'No authorization token was found'
    | 'Missing authorization scope. (403)';
}

@injectable()
@Route('/catalog')
@Tags('Catalog')
export class CatalogController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * @summary List services available in the catalog
   */
  @Get('/services')
  @OperationId('list-service-catalog')
  @Security('jwt', [])
  @SuccessResponse('200', 'OK')
  @Example<SDXCatalogEntry[]>([
    {
      id: 'string',
      locator: 'string',
      product: {
        name: 'string',
        namespace: 'string',
      },
      organization: {
        name: 'string',
        orgUnit: 'string',
        trustJwksEndpoint: 'string',
      },
      gateway: {
        name: 'string',
        permissions: {
          dataPlane: ['string'],
          domains: ['string'],
        },
      },
    },
  ])
  @Response<MissingCredentialsJSON>(401, 'Unauthorized', {
    code: 'credentials_required',
    message: 'No authorization token was found',
  })
  public async listCatalog(
    @Request() request: any
  ): Promise<SDXCatalogEntry[]> {
    const ctx = this.keystone.createContext(request);

    return await GetCatalog(ctx);
  }
}
