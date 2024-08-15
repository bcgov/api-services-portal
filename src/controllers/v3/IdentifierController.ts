import { Controller, Get, Path, Route, Tags } from 'tsoa';

import {
  newProductID,
  newEnvironmentID,
  newApplicationID,
  newGatewayID,
} from '../../services/identifiers';

@Route('identifiers')
@Tags('New Identifiers')
export class IdentifiersController extends Controller {
  @Get('{type}')
  public async getNewID(
    @Path() type: 'environment' | 'product' | 'application' | 'gateway'
  ): Promise<string> {
    if (type == 'environment') {
      return newEnvironmentID();
    } else if (type == 'gateway') {
      return newGatewayID();
    } else if (type == 'product') {
      return newProductID();
    } else if (type == 'application') {
      return newApplicationID();
    } else {
      return '';
    }
  }
}
