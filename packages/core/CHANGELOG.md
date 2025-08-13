# @auralis/core

## 0.2.0

### Minor Changes

- [#12](https://github.com/auralisjs/auralis/pull/12) [`b7db830`](https://github.com/auralisjs/auralis/commit/b7db830e0c19278813f8c9c1cf631bf455290878) Thanks [@Shinigami92](https://github.com/Shinigami92)! - feat!: replace `@Path` with `@HttpMethod` and their respective aliases

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

- [#9](https://github.com/auralisjs/auralis/pull/9) [`fd4a071`](https://github.com/auralisjs/auralis/commit/fd4a071854b7151b34b8ea597c7e39f258211e52) Thanks [@Shinigami92](https://github.com/Shinigami92)! - feat: add `@HttpMethod` decorators

### Patch Changes

- [#11](https://github.com/auralisjs/auralis/pull/11) [`13b9003`](https://github.com/auralisjs/auralis/commit/13b900357dd328b405b0027ef1420a65200289ee) Thanks [@Shinigami92](https://github.com/Shinigami92)! - fix: await handlerRef fn

## 0.1.1

### Patch Changes

- [#7](https://github.com/auralisjs/auralis/pull/7) [`7cff5ef`](https://github.com/auralisjs/auralis/commit/7cff5ef348f830b13c2ab27638e74f0e5005ad52) Thanks [@Shinigami92](https://github.com/Shinigami92)! - fix: add AURALIS_DEBUG env
