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

@Route("/namespaces/{ns}/products")
export class ProductsController extends Controller {
    @Get()
    public async getProducts(
        @Path() ns: string
    ): Promise<Product[]> {
      return [{namespace: ns, name: '', id: "0", environments: []}]
    }

    @Get("{productId}")
    public async getProduct(
      @Path() productId: string
    ): Promise<Product> {
      return {name: '', id: "0", environments: []}
    }

}
