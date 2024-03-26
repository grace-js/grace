import {Grace} from "../grace.js";

export abstract class Adapter {
    abstract listen(grace: Grace, port: number): void;

    abstract getRequestIp(request: Request): string | null;

    abstract close(): void;
}
