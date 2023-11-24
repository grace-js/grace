import { Trie } from "route-trie";
import { expect, test } from "bun:test";
import { Type } from "@sinclair/typebox";
import { createGrace, createRoute, t } from "src";
import { Value } from "@sinclair/typebox/value";

test("old routing speed", () => {
  const trie = new Trie();

  for (let i = 0; i < 10000; i++) {
    trie.define("/" + i).handle("GET", "owo");
    trie.define("/" + i).handle("POST", "owo");
    trie.define("/" + i).handle("PUT", "owo");
  }

  const start = Date.now();

  for (let i = 0; i < 1_000_000; i++) {
    const handler = trie
      .match("/" + Math.floor(Math.random() * 10000))
      .node?.getHandler("GET");

    expect(handler).toBe("owo");
  }

  console.log("Old Trie Routing took " + (Date.now() - start) / 1_000_000);
});

//
// test('typebox decode', () => {
//     const Schema = Type.Object({
//         name: Type.String(),
//         age: Type.Number(),
//         isCool: Type.Boolean(),
//         friends: Type.Array(Type.String()),
//         address: Type.Object({
//             street: Type.String(),
//             city: Type.String(),
//         })
//     })
//
//     const CompiledSchema = TypeCompiler.Compile(Schema);
//
//     const start = Date.now();
//
//     for (let i = 0; i < 1_000_000; i++) {
//         CompiledSchema.Decode({
//             name: 'owo',
//             age: 18,
//             isCool: true,
//             friends: ['a', 'b', 'c'],
//             address: {
//                 street: 'owo',
//                 city: 'owo'
//             }
//         });
//     }
//
//     console.log('Typebox decode took ' + (Date.now() - start));
// })
//
test("typebox convert", () => {
  const Schema = Type.Object({
    name: Type.String(),
    age: Type.Number(),
    isCool: Type.Boolean(),
    address: Type.Object({
      street: Type.String(),
      city: Type.String(),
    }),
  });

  const start = Date.now();

  for (let i = 0; i < 1_000_000; i++) {
    const converted = Value.Convert(Schema, {
      name: "owo",
      age: "18",
      isCool: "true",
      address: {
        street: "owo",
        city: "owo",
      },
    });

    if (!Value.Check(Schema, converted)) {
      throw new Error("Invalid type");
    }
  }

  console.log("Typebox convert took " + (Date.now() - start) / 1_000_000);
});

test("handle internally", async () => {
  const app = createGrace().registerRoute(
    createRoute({
      method: "GET",
      path: "/id/:id",
      schema: {
        response: {
          200: t.String(),
        },
        query: t.Object({
          name: t.String(),
        }),
        params: t.Object({
          id: t.Number(),
        }),
      },
      handler: async (c) => {
        return {
          code: 200,
          body: c.params.id + " " + c.query.name,
        };
      },
    })
  );

  const start = Date.now();

  for (let i = 0; i < 10_000_000; i++) {
    const response = await app.handleInternally(
      new Request("http://localhost/id/1?name=owo", {
        method: "GET",
      })
    );
  }

  console.log("Handle internally took " + (Date.now() - start) / 1_000_000);
});

test("handle", async () => {
  const app = createGrace().registerRoute(
    createRoute({
      method: "GET",
      path: "/id/:id",
      schema: {
        response: {
          200: t.String(),
        },
        query: t.Object({
          name: t.String(),
        }),
        params: t.Object({
          id: t.Number(),
        }),
      },
      handler: async (c) => {
        return {
          code: 200,
          body: c.params.id + " " + c.query.name,
        };
      },
    })
  );

  const start = Date.now();

  for (let i = 0; i < 10_000_000; i++) {
    const response = await app.handle(
      new Request("http://localhost/id/1?name=owo", {
        method: "GET",
      })
    );
  }

  console.log("Handle internally took " + (Date.now() - start) / 1_000_000);
});
