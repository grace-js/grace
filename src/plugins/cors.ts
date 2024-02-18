import {GracePlugin} from "./plugin.js";

type Origin = string | RegExp;

interface CORSProps {
    origin?: Origin | Origin[] | boolean;
    methods?: string;
    allowedHeaders?: string;
    exposedHeaders?: string;
    credentials?: boolean;
    maxAge?: number;
    preflight?: boolean;
}

export const cors = ({
                         origin = true,
                         methods = '*',
                         allowedHeaders = '*',
                         exposedHeaders = '*',
                         credentials = false,
                         maxAge = 5,
                         preflight = true
                     }: CORSProps): GracePlugin => (app) => {
    return app.registerBefore(async (request) => {
        if (request.method === 'OPTIONS') {
            return {
                code: 204,
                body: null,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': methods,
                    'Access-Control-Allow-Headers': allowedHeaders,
                    'Access-Control-Expose-Headers': exposedHeaders,
                    'Access-Control-Allow-Credentials': credentials ? 'true' : 'false',
                    'Access-Control-Max-Age': maxAge.toString()
                }
            }
        }

        return {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': methods,
                'Access-Control-Allow-Headers': allowedHeaders,
                'Access-Control-Expose-Headers': exposedHeaders,
                'Access-Control-Allow-Credentials': credentials ? 'true' : 'false',
                'Access-Control-Max-Age': maxAge.toString()
            }
        }
    });
}
