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
  
@Route("users")
export class HelloController extends Controller {
    @Get("{userId}")
    public async getUser(
      @Path() userId: number,
      @Query() name?: string
    ): Promise<TheUser> {
      return {name: name, id: userId}
    }

}

export interface TheUser {
    id?: number;
    email?: string;
    name?: string;
    status?: "Happy" | "Sad";
    phoneNumbers?: string[];
}

