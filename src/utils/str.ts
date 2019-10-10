interface IObj {
    [key: string]: any
}

import _ from 'lodash'
import { RouteProps } from 'react-router';

export const cnLen = (str: string) => {
    var len = 0;
    if (str) {
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
                len += 2;
            } else {
                len++;
            }
        }
    }
    return len;
}

export const addQuery = (queryObj: IObj, props: RouteProps, path: string) => {
    let query = props.location && props.location.query || {};
    path = path || props.location.pathname.replace(/^\//, '');
    _.extend(query, queryObj)

    query = Object.keys(query).
        map(key => query[key] ? key + '=' + query[key] : key).
        join('&')

    let url = '/' + path + '?' + query;

    props.history.push(url);

    return url;
}


export const updateQuery = (query, props, path) => {
    path = path || props.location.pathname.replace(/^\//, '');

    query = Object.keys(query).
        map(key => query[key] ? key + '=' + query[key] : key).
        join('&')

    let url = '/' + path + '?' + query;

    props.history.push(url);

    return url;
}

export const getQuery = (key, props) => {
    let query = props.location.query || {};
    return query[key];
}

export const getQueryString = (name) => {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

export const stringifyQuery = (query) => {

    query = Object.keys(query).
        map(key => query[key] ? key + '=' + query[key] : key).
        join('&')

    return query;
}

export const urldecode = (str, charset, callback) => {
    window._urlDecodeFn_ = callback;
    const script = document.createElement('script');
    script.id = '_urlDecodeFn_';
    let src = 'data:text/javascript;charset=' + charset + ',_urlDecodeFn_("' + str + '");';
    src += 'document.getElementById("_urlDecodeFn_").parentNode.removeChild(document.getElementById("_urlDecodeFn_"));';
    script.src = src;
    document.body.appendChild(script);
}

export const openQuery = (queryObj, props, path) => {
    let query = props.location.query || {};
    path = path || props.location.pathname.replace(/^\//, '');
    _.extend(query, queryObj)

    query = Object.keys(query).
        map(key => query[key] ? key + '=' + query[key] : key).
        join('&')

    let url = '/#/' + path + '?' + query;
    window.open(url);
}