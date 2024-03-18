import {createGrace} from "../src/grace.js";
import {z} from "zod";

const grace = createGrace()
    .registerRoute({
        method: "POST",
        path: "/hello",
        schema: {
            body: z.object({
                name: z.string()
            }),
            response: {
                200: z.object({
                    message: z.string()
                })
            },
            query: z.object({
                name: z.string()
            })
        },
        handler: async ({query}) => {
            return {
                code: 200,
                body: {
                    message: `Hello, ${query.name ?? 'world'}!`
                }
            }
        }
    });

it('should return the correct response', async () => {
    const response = await grace.fetch(new Request('http://localhost:3000/hello', {
        method: 'POST',
        body: JSON.stringify({
            name: 'Alessandro'
        })
    }));

    console.log(await response.json());
});
