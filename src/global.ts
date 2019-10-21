const TOKEN_NAME: string = 'x-token';
(<any>window).TOKEN_NAME = TOKEN_NAME;

let protocol: string = location.protocol;
let API_PREFIX: string;

const SSO_API = ['/user/login', '/user/logout', '/user/auth']

const APPID: string = 'xxxxxx'; // passport为各个业务线分配的专属appid 
(<any>window).APPID = APPID;

switch (process.env.NODE_ENV) {
    case 'development':
        API_PREFIX = protocol + '//test.ads.sohu.com'
        break;
    case 'test':
        API_PREFIX = protocol + '//sky.ads.sohu.com'
        break;
    case 'production':
        API_PREFIX = protocol + '//ads.sohu.com'
        break;
}

export { API_PREFIX, TOKEN_NAME, APPID, SSO_API }