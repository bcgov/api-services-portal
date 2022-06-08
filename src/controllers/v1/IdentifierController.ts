import { Controller, Get, Path, Route } from 'tsoa';

import {
  newProductID,
  newEnvironmentID,
  newApplicationID,
} from '../../services/identifiers';

@Route('identifiers')
export class IdentifiersController extends Controller {
  @Get('{type}')
  public async getNewID(@Path() type: string): Promise<string> {
    if (type == 'environment') {
      return newEnvironmentID();
    } else if (type == 'product') {
      return newProductID();
    } else if (type == 'application') {
      return newApplicationID();
    } else {
      return '';
    }
  }
}
