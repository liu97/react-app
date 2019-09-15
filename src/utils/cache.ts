interface Icache {
    [key: string]: any;
}

const cache: Icache = {};

function set(key: string, value: any) {
    cache[key] = value;
    return value;
}

function get(key: string) {
    return cache[key];
}

export default { set, get }