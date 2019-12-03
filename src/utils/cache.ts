interface IAnyObject {
    [key: string]: any;
}

const cache: IAnyObject = {};

function cacheSet(key: string | number, value: any) {
    cache[key] = value;
    return value;
}

function cacheGet(key: string | number) {
    return cache[key];
}

export default { cacheSet, cacheGet }