import {Adapter} from "../adapter.js";
import {Grace} from "../../grace.js";
import {IncomingMessage, OutgoingHttpHeaders, Server} from "node:http";

function createRequestFromIncomingMessage(req: IncomingMessage) {
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

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        req.on('data', (chunk) => {
            body.push(chunk)
        }).on('end', async () => {
            body = Buffer.concat(body);
        });
    }

    return new Request('https://a.aa' + (req.url!.startsWith('/') ? req.url! : ('/' + req.url!)), {
        method: req.method,
        headers: requestHeaders,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined
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
            const request = createRequestFromIncomingMessage(req);
            const response = await grace.fetch(request);

            res.writeHead(response.status, convertWebHeadersToNodeHeaders(response.headers));
            res.end(response.body);
        });

        this.server.listen(port);
    }

    close(): void {
        this.server?.close();
    }
}
