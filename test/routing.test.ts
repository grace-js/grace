import {Trie} from "route-trie";
import {expect, test} from "bun:test";
import {TypeCompiler} from "@sinclair/typebox/compiler";
import {Type} from "@sinclair/typebox";

test('routing speed', () => {
    const trie = new Trie();

    for (let i = 0; i < 10000; i++) {
        trie.define('/' + i).handle('GET', 'owo');
        trie.define('/' + i).handle('POST', 'owo');
        trie.define('/' + i).handle('PUT', 'owo');
    }

    const start = Date.now();

    for (let i = 0; i < 1_000_000; i++) {
        const handler = trie.match('/' + Math.floor((Math.random() * 10000))).node?.getHandler('GET');

        expect(handler).toBe('owo');
    }

    console.log('Routing took ' + (Date.now() - start));
});

test('typebox decode', () => {
    const Schema = Type.Object({
        name: Type.String(),
        age: Type.Number(),
        isCool: Type.Boolean(),
        friends: Type.Array(Type.String()),
        address: Type.Object({
            street: Type.String(),
            city: Type.String(),
        })
    })

    const CompiledSchema = TypeCompiler.Compile(Schema);

    const start = Date.now();

    for (let i = 0; i < 1_000_000; i++) {
        CompiledSchema.Decode({
            name: 'owo',
            age: 18,
            isCool: true,
            friends: ['a', 'b', 'c'],
            address: {
                street: 'owo',
                city: 'owo'
            }
        });
    }

    console.log('Typebox decode took ' + (Date.now() - start));
})
