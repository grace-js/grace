import {FrameworkPlugin} from "../types/plugin";
import * as Sentry from "@sentry/node";
import {convertStatusCode} from "../types";
import {Transaction} from "@sentry/node";

export const sentry = (): FrameworkPlugin => {
    return (app) => {
        return app
            .registerBefore(async (request) => {
                const transaction = Sentry.startTransaction({name: new URL(request.url).pathname});

                (request as any).sentry = {
                    timestamp: Date.now(),
                    transaction: transaction
                }
            })
            .registerAfter(async (request, response) => {
                try {
                    const code = convertStatusCode(response.code);
                    const time = Date.now() - (request as any).sentry.timestamp;
                    const transaction: Transaction = (request as any).sentry.transaction;

                    transaction.setMeasurement('time', time, 'ms');
                    transaction.setHttpStatus(code);
                    transaction.finish();
                } catch (e) {
                    console.error('Failed to finish transaction', e);
                }
            })
            .registerError(async (request, error) => {
                try {
                    const time = Date.now() - (request as any).sentry.timestamp;
                    const transaction: Transaction = (request as any).sentry.transaction;

                    transaction.setMeasurement('time', time, 'ms');
                    transaction.setHttpStatus(500);
                    transaction.setData('error', error);
                    transaction.finish();
                } catch (e) {
                    console.error('Failed to finish transaction', e);
                }

                try {
                    const text = await request.clone().text();

                    const e = error.error ?? error;
                    Sentry.captureException(e, scope => {
                        const query = new URLSearchParams(request.url);
                        const params = new URL(request.url).pathname.split('/').slice(1);
                        const headers = request.headers.toJSON();
                        headers.authorization = '';

                        scope.setLevel('error');
                        scope.setTag('method', request.method);
                        scope.setTag('url', request.url);
                        scope.setTag('code', error.code ?? 500);
                        scope.setExtra('body', text);
                        scope.setExtra('query', query.toString());
                        scope.setExtra('params', params);
                        scope.setExtra('headers', headers);
                        scope.setExtra('user-agent', request.headers.get('user-agent'));
                        scope.setExtra('referer', request.headers.get('referer'));
                        scope.setExtra('origin', request.headers.get('origin'));
                        scope.setExtra('host', request.headers.get('host'));
                        scope.setExtra('cookies', request.headers.get('cookie'));

                        return scope;
                    });
                } catch (e) {
                    console.error('Failed to capture exception', e);
                }
            });
    }
}
