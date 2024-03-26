import {Adapter} from "../adapter.js";
import {Grace} from "../../grace.js";
import {IncomingMessage, OutgoingHttpHeaders, Server} from "node:http";
import {IP_HEADERS} from "../../utils/headers.js";

async function createRequestFromIncomingMessage(req: IncomingMessage, verbose: boolean): Promise<Request> {
    return new Promise((resolve, reject) => {
        const requestHeaders = new Headers();
        let body: any = [];
        Object.entries(req.headers).forEach(([key, value]) => {
            if (typeof value === 'string') {
                requestHeaders.append(key, value);
            }

            if (Array.isArray(value)) {
                value.forEach((v) => {
                    requestHeaders.append(key, v);
                });
            }
        });

        if (req.socket.remoteAddress) {
            requestHeaders.append('Grace-Client-IP', req.socket.remoteAddress);
        }

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            req.on('data', (chunk) => {
                body.push(chunk)
            }).on('end', async () => {
                body = Buffer.concat(body);

                resolve(new Request('https://a.aa' + (req.url!.startsWith('/') ? req.url! : ('/' + req.url!)), {
                    method: req.method,
                    headers: requestHeaders,
                    body: body
                }));
            });
        } else {
            resolve(new Request('https://a.aa' + (req.url!.startsWith('/') ? req.url! : ('/' + req.url!)), {
                method: req.method,
                headers: requestHeaders,
                body: undefined
            }));
        }
    });
}

function convertWebHeadersToNodeHeaders(headers: Headers): OutgoingHttpHeaders {
    const result: OutgoingHttpHeaders = {};

    headers.forEach((value: string, key: string) => {
        result[key] = value;
    });

    return result;
}

export class NodeAdapter implements Adapter {
    server?: Server;

    listen(grace: Grace, port: number): void {
        this.server = new Server(async (req, res) => {
            const request = await createRequestFromIncomingMessage(req, grace.verbose);
            const response = await grace.fetch(request);

            res.writeHead(response.status, convertWebHeadersToNodeHeaders(response.headers));

            const reader = response.body?.getReader();
            const chunks = [];

            while (reader) {
                const {
                    done,
                    value
                } = await reader.read();

                if (done) {
                    break;
                }

                chunks.push(value);
            }

            const combined = new Uint8Array(chunks.reduce((acc, val) => acc.concat(Array.from(val)), [] as number[]));
            res.end(combined);
        });

        this.server.listen(port);
    }

    getRequestIp(request: Request): string | null {
        for (const header of IP_HEADERS) {
            if (request.headers.has(header)) {
                return request.headers.get(header)!;
            }
        }

        return null;
    }

    close(): void {
        this.server?.close();
    }
}
