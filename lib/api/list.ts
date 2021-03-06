import { asBoolean, asList, asString, VM, wrapFunc } from "cumlisp";
import { CONV_TO_BOOL, wrapSync } from "../utils";

export default (vm: VM) =>
  vm.install({
    head: wrapSync("head", 1, (args) => asList(args[0])[0]),
    tail: wrapSync("tail", 1, (args) => asList(args[0]).slice(1)),
    "@": wrapSync("@", -1, (args) => {
      const list = asList(args[0]);
      let working = [];
      for (const item of list)
        if (Array.isArray(item)) working.push(...item);
        else working.push(item);

      return working;
    }),
    "::": wrapSync("::", 2, (args) => [args[0]].concat(asList(args[1]))),

    reverse: wrapSync("reverse", 1, (args) =>
      asList(args[0]).slice().reverse()
    ),
    map: wrapFunc("map", 2, (args, scope) =>
      Promise.all(
        asList(args[1]).map(
          async (x) => await vm.run([asString(args[0]), asString(x)], scope)
        )
      )
    ),
    filter: wrapFunc("filter", 2, (args, scope) =>
      Promise.all(
        asList(args[1]).filter(async (x) => {
          CONV_TO_BOOL(await vm.run([asString(args[0]), asString(x)], scope));
        })
      )
    ),
    "index-of": wrapSync("index-of", 2, (args) =>
      asList(args[0]).indexOf(args[1])
    ),
    // now i can't just not include my favourite list function ever...
    // imagine map except nulls are filtered out in the process
    choose: wrapFunc("choose", 2, async (args, scope) =>
      (
        await Promise.all(
          asList(args[1]).map(
            async (x) => await vm.run([asString(args[0]), asString(x)], scope)
          )
        )
      ).filter((x) => asBoolean(x))
    ),
  });
