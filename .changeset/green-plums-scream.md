---
"@auralis/core": minor
---

feat!: replace `@Path` with `@HttpMethod` and their respective aliases

BREAKING CHANGE:

- Removed `@Path` decorator from the public API
- Http method decorators now require a path, e.g. `@Get("/cats")`

Migration:

- Before:
  ```ts
  @Get
  @Path("/cats/:id")
  getById(@PathVariable("id") id: string) {}
  ```
- After:
  ```ts
  @Get("/cats/:id")
  getById(@PathVariable("id") id: string) {}
  ```
