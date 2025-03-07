interface IAnyObj {
    [key: string]: any
}

import _ from 'lodash'
import { RouteProps } from 'react-router';
import QueryString from 'query-string';

export const cnLen = (str: string) => {
    let len = 0;
    if (str) {
        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
                len += 2;
            } else {
                len++;
            }
        }
    }
    return len;
}

export const addQuery = (queryObj: IAnyObj, props: RouteProps & IAnyObj, path?: string) => {
    let query = props.location && QueryString.parse(props.location.search) || {};
    path = path || props.location && props.location.pathname.replace(/^\//, '');
    _.extend(query, queryObj)

    let queryString = Object.keys(query).
        map(key => query[key] ? key + '=' + query[key] : key).
        join('&')

    let url = '/' + path + '?' + queryString;

    props.history.push(url);

    return url;
}


export const updateQuery = (queryObj: IAnyObj, props: RouteProps & IAnyObj, path?: string) => {
    path = path || props.location && props.location.pathname.replace(/^\//, '');

    let query = Object.keys(queryObj).
        map(key => queryObj[key] ? key + '=' + queryObj[key] : key).
        join('&')

    let url = '/' + path + '?' + query;

    props.history.push(url);

    return url;
}

export const getQuery = (key: string, props: RouteProps & IAnyObj) => {
    let query = props.location && QueryString.parse(props.location.search) || {};
    return query[key];
}

export const getQueryString = (name: string) => {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

export const stringifyQuery = (queryObj: IAnyObj) => {

    let query = Object.keys(queryObj).
        map(key => queryObj[key] ? key + '=' + queryObj[key] : key).
        join('&')

    return query;
}

export const urldecode = (str: string, charset: string, callback: (str: string) => void) => {

    (<any>window)._urlDecodeFn_ = callback;
    const script = document.createElement('script');
    script.id = '_urlDecodeFn_';
    let src = 'data:text/javascript;charset=' + charset + ',_urlDecodeFn_("' + str + '");';
    src += 'document.getElementById("_urlDecodeFn_").parentNode.removeChild(document.getElementById("_urlDecodeFn_"));';
    script.src = src;
    document.body.appendChild(script);
}

export const openQuery = (queryObj: IAnyObj, props: RouteProps & IAnyObj, path?: string) => {
    let query = props.location && QueryString.parse(props.location.search) || {};
    path = path || props.location && props.location.pathname.replace(/^\//, '');
    _.extend(query, queryObj)

    let queryString = Object.keys(query).
        map(key => query[key] ? key + '=' + query[key] : key).
        join('&')

    let url = '/#/' + path + '?' + queryString;
    window.open(url);
}

export const addReplaceQuery = (queryObj: IAnyObj, props: RouteProps & IAnyObj, path?: string) => { // 区别于addQuery，同replaceQuery
    let query = props.location && QueryString.parse(props.location.search) || {};
    path = path || props.location && props.location.pathname.replace(/^\//, '');
    _.extend(query, queryObj)

    let queryString = Object.keys(query).
        map(key => query[key] ? key + '=' + query[key] : key).
        join('&')

    let url = '/' + path + '?' + queryString;

    history.replaceState(null, '', `#${url}`);

    return url;
}

export const replaceQuery = (queryObj: IAnyObj, props: RouteProps & IAnyObj, path?: string) => { // 区别于updateQuery的是，replaceQuery不会添加history记录
    path = path || props.location && props.location.pathname.replace(/^\//, '');

    let query = Object.keys(queryObj).
        map(key => queryObj[key] ? key + '=' + queryObj[key] : key).
        join('&')

    let url = '/' + path + '?' + query;

    history.replaceState(null, '', `#${url}`);

    return url;
}