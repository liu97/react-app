import 'whatwg-fetch';
import { createAction, handleActions, ActionFunctionAny, Action } from 'redux-actions';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import Cookies from 'js-cookie';
import _ from 'lodash';
import md5 from 'md5';
import QueryString from 'query-string';
import { message, Modal } from 'antd';
import { API_PREFIX, TOKEN_NAME, SSO_API } from '@/global';
import { initLoginTime, updateToken, updateLoginTime, logout } from '../auth';
import { urldecode } from './str';
import { trimStringRecursion } from './obj';
import { saveToStorage, getFromStorage } from './storage';
import { errorMessage } from './tip';

interface IAnyObj {
    [key: string]: any,
}
interface IApi {
    options: IAnyObj,
    url: string,
    [key: string]: any,
}
interface IFetchParams {
    url: string,
    options: IAnyObj,
    path: string,
}
interface IJSONResponse {
    data: any,
    code: number,
    [key: string]: any
}
interface ITextResponse {
    data: string,
    code: number,
    [key: string]: any
}
interface IStreamResponse {
    data: Blob,
    code: number,
    [key: string]: any
}
interface IResponsePayload {
    req: IAnyObj,
    res: IJSONResponse | ITextResponse,
    path: string,
}
interface IJsonpParams {
    url: string,
    data: IAnyObj,
    jsonp: string,
    time?: number,
    success?: (json: JSON) => {},
    error?: (json: IAnyObj) => {},
}
interface IActionObject {
    origiApi: IApi,
    startAction: TAction,
    endAction: TAction,
    isBranchFetch?: boolean,
    query: IAnyObj,
    cb?: (x: IAnyObj) => any,
    branchKey?: string,
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
}
interface INoActionObject {
    noAction: boolean,
    callback?: (obj: any) => any,
}
type TAction = ActionFunctionAny<Action<any>>

// token过期，接口层只负责通知token已经过期，具体是过期后跳转到登陆页面，
// 还是重新获取token由业务层自己处理
const requestFetchActon = createAction('request fetch');
const receiveFetchAction = createAction('receive fetch');
const tokenExpiredAction = createAction('token expired');

const API_SUFFIX: string = '';
let prevAccount: string | null | undefined;
const ignoreAccountValidationPathList = ['/user/login'];

/**
 * 检验用户是否发生变化，如果变化，跳转到首页
 * @param api api对象
 */
function validationAccout(api: IApi): void {
    if (ignoreAccountValidationPathList.indexOf(api.url) > -1) {
        return
    }
    const currentAccount: string | null | undefined = getFromStorage('accountId');
    if (prevAccount && currentAccount && prevAccount !== currentAccount) {
        window.location.replace('/');
    }
    prevAccount = currentAccount;
}

function getFetchParams(api: IApi, ignoreAccountValidation?: boolean): IFetchParams {
    if (!ignoreAccountValidation) {
        validationAccout(api);
    }
    let { url, options } = api;
    let path = url;
    let headers = {
        // 'User-Code': code,
        // credentials: 'include',
        //'X-Requested-With': 'XMLHttpRequest',
        // Connection: 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        // 'uip': returnCitySN.cip,
        ...options.headers,
    }
    if (Cookies.get(TOKEN_NAME)) {
        headers['x-token'] = Cookies.get(TOKEN_NAME);
    }
    options = {
        ...options,
        headers,
        mode: 'cors',
        credentials: "include"
    }

    url = `${API_PREFIX}${url}${API_SUFFIX}`

    return { url, options, path }
}

/**
 * 请求发送前的提交参数预处理，例如：trim字符串等等
 * @param query 请求体
 */
function preprocessQuery(query: IAnyObj): void {
    trimStringRecursion(query)
}


function handleResponse(response: Response) {
    if (response.ok) {
        let contentType = response.headers.get('content-type')
        if (contentType) {
            if (contentType.includes('application/json')) {
                return response.json();
            } else if (contentType.includes('text/plain')) {
                return response.text();
            }
        }

        return Promise.reject({
            data: response,
            status: response.status,
            statusText: response.statusText,
            err: `Sorry, content-type ${contentType} not supported`,
        })
    } else {
        return Promise.reject({
            data: response,
            status: response.status,
            statusText: response.statusText,
            err: response.statusText,
        })
    }

}

function checkCommonCode(res: IJSONResponse, path: string, useAlert?: boolean, noMsg?: boolean): IJSONResponse {
    if (res.code != 0) {
        switch (res.code) {
            case 1000:
            case 9002:
            case 9004:

                break;
            default:
                let errMsg = res.msg
                if (!noMsg) {
                    if (useAlert) {
                        errMsg = errMsg.replace(/[\[\]]/g, '').replace(/,/g, '\r\n');
                        alert(errMsg);
                    } else {
                        errorMessage(errMsg, 6);
                    }
                }
                break;
        }
    } else {
        switch (path) {
            case '/user/login':
                initLoginTime(res.data);
                break;
            case '/user/logout':
                logout();
                break;
            case '/user/auth':
                updateToken(res.data);
                break;
            default:
                updateLoginTime();
                break;
        }
    }
    return res;
}

function catchError(error: IAnyObj) {
    const { status } = error
    if (status === 401) {
        alert('请重新登录！')
        // 线上环境，刷新页面以重定向到登录页面
        process.env.NODE_ENV === 'production' && location.reload()
    } else if (status === 403) {
        alert('你缺少相关权限，部分功能无法使用')
    }
}

function resendAction(failedActionObj: IActionObject) {
    let { origiApi, startAction, endAction, isBranchFetch, query, cb, branchKey, dispatch } = failedActionObj;
    let failedAction = createAjaxAction(origiApi, startAction, endAction, isBranchFetch);
    dispatch(failedAction(query, cb, branchKey))
}

function isIActionObject(params: IActionObject | INoActionObject): params is INoActionObject {
    return (<INoActionObject>params).noAction !== undefined
}
function fetchToken(respon: IAnyObj, params: IActionObject | INoActionObject) {

    let token: string = Cookies.get(TOKEN_NAME) || '';
    let seed: string = respon.data.seed;
    seed = seed.substring(seed.length - 8);
    let apiObj = fetchJSONStringByPost('/user/auth');
    let { url, options, path } = getFetchParams(apiObj);
    options.body = options.body({
        sign: md5(token + seed)
    });

    fetch(url, options)
        .then(response => response.json())
        .then((res) => checkCommonCode(res, path))
        .then(tokenRes => {

            if (isIActionObject(params)) {
                params.callback && params.callback(tokenRes)
            } else {
                resendAction(params)
            }
        });
}

const createAjaxAction = (origiApi: IApi, startAction: TAction, endAction: TAction, isBranchFetch?: boolean, useAlert?: boolean, noMsg?: boolean) =>
    (query: IAnyObj, cb?: (x: IAnyObj) => void, branchKey?: string) =>
        (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
            let originRes: IAnyObj;
            dispatch(requestFetchActon())
            dispatch(startAction())

            let api;
            if (isBranchFetch) {
                api = _.extend({}, origiApi)[branchKey + ''];
            } else {
                api = origiApi;
            }

            let { url, options, path } = getFetchParams(api);

            preprocessQuery(query)
            let oldQuery = query || {};
            query = options.body(query);
            options.body = query;

            fetch(url, options)
                .then(handleResponse)
                .then((res) => checkCommonCode(res.data, path, useAlert, noMsg))
                .then((resp) => {
                    originRes = resp
                    dispatch(receiveFetchAction({
                        req: query,
                        res: resp,
                        path: path,
                    }))

                    dispatch(endAction({ req: query, res: resp }))

                    // 令牌过期
                    if (resp.code === 9002 && SSO_API.indexOf(path) < 0) {
                        fetchToken(originRes, {
                            origiApi, startAction, endAction, isBranchFetch,
                            query: oldQuery, cb, branchKey, dispatch
                        })

                    }
                })
                .then(() => {
                    if (originRes.status === 1) {
                        cb && cb(originRes)
                    }
                })
                .catch(catchError)
        }

const createSimpleAjaxAction = (api: IApi, name: string, isBranchFetch?: boolean) => {

    name = name.replace(/([A-Z])/g, ($0, $1) => ' ' + $1.toLowerCase());

    const requestAction = createAction('request ' + name);
    const recevieAction = createAction('receive ' + name);

    return createAjaxAction(
        api,
        requestAction,
        recevieAction,
        isBranchFetch
    );

}


const hasResponseError = (data: IAnyObj) => {

    if (data.code === 0) {
        return false;
    } else {
        return true;
    }
};

const createSimpleAjaxReduce = (name: string, initState = {}, isBranchFetch?: boolean) => {

    name = name.replace(/([A-Z])/g, ($0, $1) => ' ' + $1.toLowerCase());
    return handleActions<IAnyObj, IResponsePayload>({
        ['request ' + name]: (state, action) => {
            return { ...state, loading: true }
        },
        ['receive ' + name]: (state, action) => {
            const { req, res } = action.payload

            if (hasResponseError(res)) {
                return { ...state, loading: false, hasError: true }
            }
            return { ...res.data, loading: false, hasError: false }
        },
        ['reset ' + name]: (state, action) => {
            return initState
        }
    }, initState)
}

function createAjax(api: IApi, query: IAnyObj, cb?: (x: IJSONResponse) => void) {

    let { url, options, path } = getFetchParams(api)

    preprocessQuery(query)
    let oldQuery = query || {};
    query = options.body(query);
    options.body = query;

    fetch(url, options)
        .then(handleResponse)
        .then((res) => checkCommonCode(res, path))
        .then((resp) => {
            if (resp.code === 9002 && SSO_API.indexOf(path) < 0) {
                fetchToken(resp, {
                    noAction: true,
                    callback: () => createAjax(api, oldQuery, cb)
                })
            } else {
                cb && cb(resp)
            }

        })
        .catch(catchError)
}

function requestDownloadFile(api: IApi, query: IAnyObj = {}, cb?: (x: IJSONResponse) => void) {
    let { url, options, path } = getFetchParams(api)
    preprocessQuery(query)
    query = options.body(query);
    options.body = query;

    let originRes: Response;

    fetch(url, options)
        .then((response) => {
            let contentType = response.headers.get('content-type')
            if (contentType && contentType.includes('application/octet-stream')) {
                return response.blob();
            } else {
                return Promise.reject();
            }
        })
        .then((respons) => {
            let filename = 'download';

            let disposition = originRes.headers.get('Content-Disposition');
            if (disposition) {
                let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                let matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            urldecode(escape(filename), 'gbk', (str) => {
                filename = str;
                const URL = window.URL || (<any>window).webkitURL;
                const downloadUrl = URL.createObjectURL(respons);
                if (filename) {
                    const a = document.createElement("a");
                    if (typeof a.download === 'undefined') {
                        window.location.href = downloadUrl;
                    } else {
                        a.href = downloadUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                    }
                } else {
                    window.location.href = downloadUrl;
                }
                setTimeout(() => {
                    URL.revokeObjectURL(downloadUrl);
                }, 100);
            });
        })
        .catch(catchError)

}

const fetchJSONStringByGet = (url: string) => {
    const options = {
        method: 'GET',
        body: (query: IAnyObj) => QueryString.stringify(query),
        headers: {
            'Content-Type': 'application/json',
        },
    }
    return { url, options }
}

const fetchJSONStringByPost = (url: string) => {

    const options = {
        method: 'POST',
        body: (query: IAnyObj) => (<any>window).JSON.stringify(query),
        headers: {
            'Content-Type': 'application/json',
        },
    }
    return { url, options }
}

function formatParams(data: IAnyObj) {
    var arr = [];
    for (var name in data) {
        arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
    };
    // 添加一个随机数，防止缓存
    arr.push('v=' + random());
    return arr.join('&');
}
function random() {
    return Math.floor(Math.random() * 10000 + 500);
}

//jsonp请求
const ajaxJsonP = (params: IJsonpParams) => {

    //创建script标签并加入到页面中
    let head = document.getElementsByTagName('head')[0];
    let callbackName = params.jsonp;

    // 设置传递给后台的回调参数名
    params.data['callback'] = callbackName;
    let data = formatParams(params.data);

    let script = document.createElement('script');
    head.appendChild(script);

    //创建jsonp回调函数
    (window as any)[callbackName] = function (json: JSON) {
        head.removeChild(script);
        clearTimeout((script as any).timer);
        (window as any)[callbackName] = null;
        params.success && params.success(json);
    };

    //发送请求
    script.src = params.url + '?' + data;

    //为了得知此次请求是否成功，设置超时处理
    if (params.time) {
        (script as any).timer = setTimeout(function () {
            (window as any)[callbackName] = null;
            head.removeChild(script);
            params.error && params.error({
                message: '超时'
            });
        }, params.time);
    }
}

export { createAjaxAction, createSimpleAjaxAction, createSimpleAjaxReduce, createAjax, fetchJSONStringByGet, fetchJSONStringByPost, requestDownloadFile, ajaxJsonP }