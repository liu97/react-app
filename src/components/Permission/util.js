import { ROLE_OPTIONS, getCurrentRoles } from 'constants/role';
import _ from 'lodash';

const PERMISSION_STAGES = {
    STAGE_1: 1, // interactive, 可交互
    STAGE_2: 2, // readonly, 只读
    STAGE_3: 3, // invisible, 不可见
};

/**
 * 获取当前操作权限
 * 如果用户存在多个角色，按最高权限返回
 */
const getCurrentPermission = (roleConfig = {}) => {
    const currentRoles = getCurrentRoles();
    const sortedStages = [PERMISSION_STAGES.STAGE_3, PERMISSION_STAGES.STAGE_2, PERMISSION_STAGES.STAGE_1];
    let currentStage = PERMISSION_STAGES.STAGE_1;
    for (let stage of sortedStages) {
        const stageRoles = roleConfig[stage];
        if (stageRoles && _.intersection(stageRoles, currentRoles).length > 0) {
            currentStage = stage;
        }
    }

    return currentStage;
}

export { PERMISSION_STAGES, getCurrentPermission }