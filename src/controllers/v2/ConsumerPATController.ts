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
  Post,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { Application } from './types';
import { Logger } from '../../logger';
import { replaceApiKey } from '@/services/workflow/kong-api-key-replace';

const logger = Logger('controllers.ConsumerPAT');

@injectable()
@Route('/personalaccesstokens')
@Tags('Consumers')
export class PATController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Create PAT
   *
   * @summary Token
   */
  @Post()
  @OperationId('create-pat')
  @Security('jwt')
  public async createPersonalAccessToken(
    @Body() body: Application,
    @Request() request: any
  ): Promise<any> {
    logger.info('Create Personal Access Token');
    // Create an API Key for the particular user
    // /src/services/workflow/kong-api-key-replace.ts
    //await replaceApiKey();
    // keyAuthPK: response['id'],
    // apiKey: response['key'],
    return {
      put: true,
      body,
    };
  }
}
