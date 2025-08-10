import type { UUID } from "node:crypto";
import { randomUUID } from "node:crypto";
import { Get } from "../common/get.decorator.ts";
import { PathVariable } from "../common/path-variable.decorator.ts";
import { Path } from "../common/path.decorator.ts";
import { Cat } from "./cat.dto.ts";
import { Post } from "../common/post.decorator.ts";
import { RequestBody } from "../common/request-body.decorator.ts";

const cats: Cat[] = [
  new Cat({ id: "1aefd497-bb47-47e3-b160-cb69c5ba0ff4", name: "Kami", age: 4 }),
];

@Path("/cats")
export class CatController {
  @Get
  @Path("/")
  public list(): Cat[] {
    return cats;
  }

  @Get
  @Path("/:id")
  public getById(@PathVariable() id: UUID): Cat | null {
    return cats.find((cat) => cat.id === id) ?? null;
  }

  @Post
  @Path("/")
  public create(@RequestBody(Cat) cat: Cat): Cat {
    cat.id = randomUUID();
    cats.push(cat);
    return cat;
  }
}
