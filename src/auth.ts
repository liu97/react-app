interface IObj {
    [key: string]: any
}

import Cookies from 'js-cookie';
import { getQuery } from 'utils/str';
import { TOKEN_NAME } from '@/global';
// import {requestSudoLogin} from '@/utils/ajax';
import { saveToStorage } from '@/utils/storage';
// import { getCurrentRoles } from 'components/Permission/util';
import { Modal } from 'antd';

let expiresAddTime = 120; // 默认120分钟后token过期

function updateLoginTime() {

    let token = Cookies.get(TOKEN_NAME);
    if (token) {
        let expiresTime = new Date();
        expiresTime.setMinutes(expiresTime.getMinutes() + expiresAddTime)
        Cookies.set(TOKEN_NAME, token, {
            expires: expiresTime
        })
    }

}

function initLoginTime(data: IObj) {

    let expiresTime = new Date();
    expiresAddTime = data.validTime || expiresAddTime; // 过期时间改成用login接口返回的过期时间
    expiresTime.setMinutes(expiresTime.getMinutes() + expiresAddTime)

    Cookies.set(TOKEN_NAME, data.webToken, {
        expires: expiresTime
    })
    saveToStorage({ accountId: data.accountId })
    saveToStorage({ accountName: encodeURIComponent(data.accountName) })
}

function updateToken(data: IObj) {

    let expiresTime = new Date();

    expiresTime.setMinutes(expiresTime.getMinutes() + expiresAddTime);

    Cookies.set(TOKEN_NAME, data.webToken, {
        expires: expiresTime
    })

}

function logout() {
    Cookies.remove(TOKEN_NAME);
}

/*let showLoginTimeout

window.addEventListener('click', ()=>{
	let tokenName = window.TOKEN_NAME;
	let isAE = tokenName==='ae-token';
	console.log(Modal.confirm)
	if(!cookie(tokenName)&&!showLoginTimeout&&location.hash.indexOf('#/login')!==0){
		showLoginTimeout = Modal.warning({
			title: '登录过期',
			content: '登录已过期，是否' + isAE ? '马上关闭页面' : '马上跳转跳转到登录页',
			okText: isAE ? '马上关闭' : '马上跳转',
			onOk: ()=>{
				isAE ? window.close() : location.href='#/login'
				showLoginTimeout.destroy()
				showLoginTimeout = null;
			}
		})
	}
}, true)*/

export { updateLoginTime, initLoginTime, updateToken }