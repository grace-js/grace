import {AnyRoute} from "../routes/route.js";
import {RouteMatch, Router} from "./router.js";

export class TrieNode {
    children: Map<string, TrieNode>;
    dynamicChild: TrieNode | null;
    dynamicParamName: string | null;
    regexChild: TrieNode | null;
    regex: RegExp | null;
    isEndOfPath: boolean;
    routes: Map<string, AnyRoute>;

    constructor() {
        this.children = new Map();
        this.dynamicChild = null;
        this.dynamicParamName = null;
        this.regexChild = null;
        this.regex = null;
        this.isEndOfPath = false;
        this.routes = new Map();
    }
}

export class TrieRouter implements Router {
    root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    addRoute(route: AnyRoute) {
        let node = this.root;
        const parts = route.path!.split('/').filter(Boolean);

        for (const part of parts) {
            if (part.startsWith(':')) {
                if (!node.dynamicChild) {
                    node.dynamicChild = new TrieNode();
                    node.dynamicParamName = part.slice(1);
                }
                node = node.dynamicChild;
            } else if (part.startsWith('(') && part.endsWith(')')) {
                const regex = new RegExp(part.slice(1, -1));
                if (!node.regexChild || node.regex!.toString() !== regex.toString()) {
                    node.regexChild = new TrieNode();
                    node.regex = regex;
                }
                node = node.regexChild;
            } else {
                if (!node.children.has(part)) {
                    node.children.set(part, new TrieNode());
                }
                node = node.children.get(part)!;
            }
        }

        node.isEndOfPath = true;

        if (!node.routes.has(route.method!)) {
            node.routes.set(route.method!, route);
        } else {
            throw new Error(`Route with method ${route.method} already exists`);
        }
    }

    match(path: string, method: string): RouteMatch | null {
        let node = this.root;
        const parts = path.split('/').filter(Boolean);
        const params: {
            [key: string]: string
        } = {};

        for (const part of parts) {
            if (node.children.has(part)) {
                node = node.children.get(part)!;
            } else if (node.dynamicChild) {
                params[node.dynamicParamName!] = part;
                node = node.dynamicChild;
            } else if (node.regexChild && node.regex!.test(part)) {
                node = node.regexChild;
            } else {
                return null;
            }
        }

        if (node.isEndOfPath && node.routes.has(method)) {
            return {
                route: node.routes.get(method)!,
                params
            };
        }

        return null;
    }
}
