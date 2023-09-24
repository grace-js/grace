export const getPath = (url: string): string => {
    const match = url.match(/^https?:\/\/[^/]+(\/[^?]*)/);

    return match ? match[1] : '';
}

export const getQuery = (url: string): string => {
    const match = url.match(/^[^?]+\?([^#]*)/);

    return match ? match[1] : '';
}

export const getQueryParams = (url: string): Record<string, string> => {
    const query = getQuery(url);
    const params: Record<string, string> = {};

    if (!query) {
        return params;
    }

    for (const param of query.split('&')) {
        const [key, value] = param.split('=');
        params[key] = value;
    }

    return params;
}

export const getParams = (path: string, url: string): Record<string, string> => {
    const params: Record<string, string> = {};
    const pathParts = path.split('/');
    const urlParts = url.split('/');

    for (let i = 0; i < pathParts.length; i++) {
        if (pathParts[i].startsWith(':')) {
            params[pathParts[i].substring(1)] = urlParts[i];
        }
    }

    return params;
}
