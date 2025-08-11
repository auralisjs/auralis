import type { UUID } from "node:crypto";
import { randomUUID } from "node:crypto";
import { Delete } from "../common/delete.decorator.ts";
import { Get } from "../common/get.decorator.ts";
import { NotFoundResponseError } from "../common/not-found-response.error.ts";
import { PathVariable } from "../common/path-variable.decorator.ts";
import { Path } from "../common/path.decorator.ts";
import { Post } from "../common/post.decorator.ts";
import { Put } from "../common/put.decorator.ts";
import { RequestBody } from "../common/request-body.decorator.ts";
import { RestController } from "../common/rest-controller.decorator.ts";
import { Cat } from "./cat.dto.ts";

const cats: Cat[] = [
  new Cat({ id: "1aefd497-bb47-47e3-b160-cb69c5ba0ff4", name: "Kami", age: 4 }),
];

@RestController("/cats")
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

  @Put
  @Path("/:id")
  public update(@PathVariable() id: UUID, @RequestBody(Cat) cat: Cat): Cat {
    const index = cats.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundResponseError("Cat not found");
    }
    cats[index] = cat;
    return cat;
  }

  @Delete
  @Path("/:id")
  public delete(@PathVariable() id: UUID): void {
    const index = cats.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundResponseError("Cat not found");
    }
    cats.splice(index, 1);
  }
}
