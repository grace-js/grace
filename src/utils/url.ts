export const getPath = (url: string): string => {
    const match = url.match(/^https?:\/\/[^/]+(\/[^?]*)/);

    return match ? match[1] : '';
}

export const getQuery = (url: string): string => {
    const match = url.match(/^[^?]+\?([^#]*)/);

    return match ? match[1] : '';
}
