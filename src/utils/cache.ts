interface Icache {
    [key: string]: any;
}

const cache: Icache = {};

function cacheSet(key: string, value: any) {
    cache[key] = value;
    return value;
}

function cacheGet(key: string) {
    return cache[key];
}

export default { cacheSet, cacheGet }