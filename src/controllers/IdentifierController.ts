import {
    Body,
    Controller,
    Get,
    Path,
    Post,
    Query,
    Route,
    SuccessResponse,
} from "tsoa";
  
import { Product } from '../nextapp/shared/types/query.types'

import { v4 } from 'uuid'

@Route("identifiers")
export class IdentifiersController extends Controller {

    @Get("{type}")
    public async getProduct(
      @Path() type: string
    ): Promise<string> {
      if (type == 'environment') {
        return v4().replace(/-/g,'').toUpperCase().substr(0, 8)
      } else {
        return ""
      }
    }

}
