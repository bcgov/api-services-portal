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

@Route("products")
export class ProductsController extends Controller {

    @Get("{productId}")
    public async getProduct(
      @Path() productId: string
    ): Promise<Product> {
      return {name: '', id: "0", environments: []}
    }

}
