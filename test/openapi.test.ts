import {createGrace} from "../src/grace.js";
import {z} from "zod";

const grace = createGrace()
    .registerRoute({
        method: "GET",
        path: "/hello",
        schema: {
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
