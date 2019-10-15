import { getFromStorage } from 'utils/storage'

/**
 * 系统当前所有的角色
 */
const ROLE_OPTIONS = {
    ROLE_ADMIN: 'role1', // 管理员
}

/**
 * 获取当前用户角色
 * 返回一个当前用户的角色数组
 */
const getCurrentRoles = () => {
    const roles: string[] = [];
    if(getFromStorage(ROLE_OPTIONS.ROLE_ADMIN)){
        roles.push(ROLE_OPTIONS.ROLE_ADMIN);
    }


    return roles;
}

export { ROLE_OPTIONS, getCurrentRoles }; 