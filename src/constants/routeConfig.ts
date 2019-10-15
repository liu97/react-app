import { ROLE_OPTIONS } from '@/constants/role';
import { PERMISSION_STAGES } from '@/components/Permission/util'
interface IObj {
    [key: string]: any,
}

const ROUTE_AUTH_CONFIG: IObj = {
    '^/': {
        [PERMISSION_STAGES.STAGE_1]: [ROLE_OPTIONS.ROLE_ADMIN],
    }
}

export { ROUTE_AUTH_CONFIG };