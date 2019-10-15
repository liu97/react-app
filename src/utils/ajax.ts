import 'whatwg-fetch';
import { createAction, handleActions, ActionFunctionAny, Action } from 'redux-actions';
import Cookies from 'js-cookie';
import _ from 'lodash';
import md5 from 'md5';
import { message, Modal } from 'antd';
import { API_PREFIX, TOKEN_NAME } from '@/global';
import { initLoginTime, updateToken, updateLoginTime } from '../auth';
import { urldecode } from './str';
import { trimStringRecursion } from './obj';
import { saveToStorage, getFromStorage } from './storage';
import { any } from 'prop-types';

interface IObj {
    [key: string]: any,
}
interface IApi {
    options: IObj,
    url: string,
    [key: string]: any,
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

function getFetchParams(api: IApi, ignoreAccountValidation: boolean) {
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
function preprocessQuery(query: IObj) {
    trimStringRecursion(query)
}

const createAjaxAction = (origiApi: IApi, startAction: ActionFunctionAny<Action<any>>, endAction: ActionFunctionAny<Action<any>>, isBranchFetch: boolean, useAlert: boolean, noMsg: boolean) => (query: IObj, cb, branchKey) =>
    (dispatch) => {
        let respon
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
        console.log(query)
        let oldQuery = query || {};
        query = options.body(query);
        //query = _.isArray(query) ? query : [query]
        options.body = query;

        // mock接管数据
        //mock.start()
        //api(...data)
        fetch(url, options)
            .then(checkStatus) // eslint-disable-line no-use-before-define
            .then(response => response.json())
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

                // 如果是重新获取token的请求，则重新把刚才没有发送成功的请求重新发送一下
                /*if(oldQuery.fetchPath){
                  console.log(origiApi)
                  console.log(startAction)
                  console.log(query)
                  let failedAction = createAjaxAction(origiApi, startAction, endAction, isBranchFetch);
                  dispatch(failedAction(query, cb, branchKey))
                }*/





            })
            .then(() => {
                if (respon.status === 1) {
                    cb && cb(respon)
                }
            })
            .catch(catchError) // eslint-disable-line no-use-before-define

        //mock.end();
    }