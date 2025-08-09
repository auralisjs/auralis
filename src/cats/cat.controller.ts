import { Get } from "../common/get.decorator.ts";
import { Path } from "../common/path.decorator.ts";
import { Cat } from "./cat.dto.ts";

@Path("/cats")
export class CatController {
  @Get()
  @Path("/")
  public list(): Cat[] {
    return [{ id: "1", name: "Kami", age: 4 }];
  }
}
