import {Grace} from "../grace.js";

export abstract class Adapter {
    abstract listen(grace: Grace, port: number): void;

    abstract close(): void;
}
