export const PATH_REGISTRY: Array<
  | {
      kind: "Controller";
      name: string;
      path: string;
      controller: Function;
    }
  | {
      kind: "Route";
      name: string;
      path: string;
      fn: Function;
    }
> = [];

export function Path(path: string): ClassDecorator & MethodDecorator {
  return function (...args: any[]) {
    if (typeof args[0] === "function") {
      PATH_REGISTRY.push({
        kind: "Controller",
        name: args[0].name,
        path,
        controller: args[0],
      });
    } else {
      console.log(args[0]);
      PATH_REGISTRY.push({
        kind: "Route",
        name: args[1],
        path,
        fn: args[2].value,
      });
    }
  };
}
