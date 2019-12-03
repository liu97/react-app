import _ from 'lodash'

interface IAnyObject {
    [key: string]: any
}
type TSameKeyObject<T> = { [key in keyof T]?: any }

export const mergeInitValue = (originObj: IAnyObject, sourceObj: IAnyObject, diffKeysObj: IAnyObject) => {
    Object.keys(diffKeysObj).forEach(originKey => {
        originObj[originKey].initialValue = sourceObj[diffKeysObj[originKey]]
    })
}

export const getInitValue = <T extends IAnyObject>(obj: T) => {
    let valueObj: TSameKeyObject<T> = {};
    _.forIn(obj, (item, key) => {
        valueObj[<keyof T>key] = item.initialValue;
    })
    return valueObj;
}

export const setInitValue = (obj: IAnyObject, sourceObj: IAnyObject) => {
    _.forIn(obj, (item, key) => {
        item.initialValue = sourceObj[key];
    })
    return obj;
}

export const isEmpty = (obj: any) => {
    if (obj == null) { return true; }
    if (obj.length > 0) { return false; }
    if (obj.length === 0) { return true; }

    for (const key in obj) {
        return false;
    }

    return typeof obj === 'object';
}

// 递归遍历obj把字段类型为字符串的属性都进行trim处理，此方法直接修改入参obj
export function trimStringRecursion(obj: IAnyObject) {
    if (isEmpty(obj)) {
        return
    }
    if (_.isPlainObject(obj)) {
        Object.keys(obj).forEach(key => {
            const inner = obj[key]
            if (_.isString(inner)) {
                obj[key] = _.trim(inner)
            } else {
                trimStringRecursion(inner)
            }
        })
    } else if (_.isArray(obj)) {
        obj.forEach((inner, index) => {
            if (_.isString(inner)) {
                obj[index] = _.trim(inner)
            } else {
                trimStringRecursion(inner)
            }
        })
    }
}
