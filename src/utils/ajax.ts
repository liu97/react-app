import 'whatwg-fetch';
import { createAction, handleActions, ActionFunctionAny, Action } from 'redux-actions';
import { Dispatch } from 'redux';
import Cookies from 'js-cookie';
import _ from 'lodash';
import md5 from 'md5';
import { message, Modal } from 'antd';
import { API_PREFIX, TOKEN_NAME } from '@/global';
import { initLoginTime, updateToken, updateLoginTime, logout } from '../auth';
import { urldecode } from './str';
import { trimStringRecursion } from './obj';
import { saveToStorage, getFromStorage } from './storage';
import { errorMessage } from './tip';
import { any } from 'prop-types';

interface IObj {
    [key: string]: any,
}
interface IApi {
    options: IObj,
    url: string,
    [key: string]: any,
}
interface IFetchParams {
    url: string,
    options: IObj,
    path: string,
}

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
function preprocessQuery(query: IObj): void {
    trimStringRecursion(query)
}


function handleResponse(response: Response) {

    let contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
        return handleJSONResponse(response)
    } else if (contentType && contentType.includes('text/html')) {
        return handleTextResponse(response)
    } else {
        throw new Error(`Sorry, content-type ${contentType} not supported`)
    }
}

function handleJSONResponse(response: Response): Promise<IObj> {
    return response.json()
        .then(json => {
            if (response.ok) {
                return json
            } else {
                return Promise.reject(Object.assign({}, json, {
                    status: response.status,
                    statusText: response.statusText
                }))
            }
        })
}
function handleTextResponse(response: Response): Promise<string> {
    return response.text()
        .then(text => {
            if (response.ok) {
                return text
            } else {
                return Promise.reject({
                    status: response.status,
                    statusText: response.statusText,
                    err: text
                })
            }
        })

}

function checkCommonCode(res: IObj, options: IObj, path: string, dispatch: Dispatch, query: IObj, oldQuery: IObj, useAlert: boolean, noMsg: boolean): IObj {
    if (res.code != 0) {
        switch (res.code) {
            case 1000:
            case 9002:
            case 9004:

                break;
            case 9005:
            case 9001:
                if (getFromStorage('loginFrom', 'session') === 'sudoLogin') {
                    Modal.confirm({
                        title: '伪登录过期,请重新登录',
                        content: '点击确定关闭当前窗口',
                        onOk: () => {
                            window.close();
                        },
                        okText: '确定'
                    });
                } else {
                    location.hash = '#/login';
                }
                break;
            default:
                let errMsg = res.msg
                if (noMsg) {
                    return {};
                } else {
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

const createAjaxAction = (origiApi: IApi, startAction: ActionFunctionAny<Action<any>>, endAction: ActionFunctionAny<Action<any>>, isBranchFetch: boolean, useAlert: boolean, noMsg: boolean) =>
    (query: IObj, cb: (x: IObj) => void, branchKey: string) =>
        (dispatch: Dispatch) => {
            let respon: IObj;
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
                .then((res) => checkCommonCode(res, options, path, dispatch, query, oldQuery, useAlert, noMsg))
                .then((resp) => {
                    respon = resp
                    dispatch(receiveFetchAction({
                        req: query,
                        res: resp,
                        path: path,
                        fetchPath: oldQuery.fetchPath
                    }))

                    dispatch(endAction({ req: query, res: resp }))


                    // 令牌过期
                    if (resp.code === 9002 && SSO_API.indexOf(path) < 0) {

                        fetchToken(respon, {
                            origiApi, startAction, endAction, isBranchFetch,
                            query: oldQuery, cb, branchKey, dispatch
                        })

                    }
                })
                .then(() => {
                    if (respon.status === 1) {
                        cb && cb(respon)
                    }
                })
                .catch(catchError)

        }