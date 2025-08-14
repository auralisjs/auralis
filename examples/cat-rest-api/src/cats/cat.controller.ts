import {
  Delete,
  Get,
  NotFoundResponseError,
  Patch,
  PathVariable,
  Post,
  Put,
  RequestBody,
  RestController,
} from "@auralis/core";
import type { UUID } from "node:crypto";
import { randomUUID } from "node:crypto";
import { Cat } from "./cat.dto.ts";

const cats: Cat[] = [
  new Cat({ id: "1aefd497-bb47-47e3-b160-cb69c5ba0ff4", name: "Kami", age: 4 }),
];

@RestController("/cats")
export class CatController {
  @Get("/")
  public list(): Cat[] {
    return cats;
  }

  @Get("/:id")
  public getById(@PathVariable() id: UUID): Cat {
    const foundCat = cats.find((cat) => cat.id === id);

    if (!foundCat) {
      throw new NotFoundResponseError("Cat not found");
    }

    return foundCat;
  }

  @Post("/")
  public create(@RequestBody(Cat) cat: Cat): Cat {
    cat.id = randomUUID();
    cats.push(cat);
    return cat;
  }

  @Put("/:id")
  public update(@PathVariable() id: UUID, @RequestBody(Cat) cat: Cat): Cat {
    const foundCat = cats.find((c) => c.id === id);
    if (!foundCat) {
      throw new NotFoundResponseError("Cat not found");
    }

    Object.assign(foundCat, cat);
    foundCat.id = id; // Ensure the ID remains the same
    return foundCat;
  }

  @Patch("/:id")
  public partialUpdate(
    @PathVariable() id: UUID,
    @RequestBody(Cat) cat: Partial<Cat>
  ): Cat {
    const foundCat = cats.find((c) => c.id === id);
    if (!foundCat) {
      throw new NotFoundResponseError("Cat not found");
    }

    Object.assign(foundCat, cat);
    foundCat.id = id; // Ensure the ID remains the same
    return foundCat;
  }

  @Delete("/:id")
  public delete(@PathVariable() id: UUID): void {
    const index = cats.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundResponseError("Cat not found");
    }

    cats.splice(index, 1);
  }
}
