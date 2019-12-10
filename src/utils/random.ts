import { getArr } from './arr';

import * as ChineseName from 'chinese-name';

const getRandomNumber = (start: number, end: number) => {
    return Math.floor(Math.random() * (end - start)) + start
}

/**
 * 获取一组随机的人名
 * @param    {Number}                 length  数组长度
 * @param    {String}                 postfix 后缀
 * @return   {Array}                          
 *
 */
export const nameArr = (length: number = 100, postfix: string = '') => {

    return getArr(length, (index) => {
        return ChineseName.random() + postfix;
    })
}

/**
 * 获取一组随机的分数 [分子/分母.....]
 * @param    {Number}                 length  数组长度
 * @param    {Number}                 start   最小分母
 * @param    {Number}                 end     最大分母
 * @param    {String}                 postfix 后缀
 * @return   {Array}                         
 *
 */
export const fractionArr = (length: number = 20, start: number = 2, end: number = 10, postfix: string = '') => {
    return getArr(length, (index) => {
        let denominator = getRandomNumber(start, end);
        let numerator = getRandomNumber(1, denominator);
        return numerator + '/' + denominator + postfix;
    })
}

export const enumArr = (enumValues: any[] = [], length: number = 50) => {
    let totalLength = enumValues.length;
    return getArr(length, (index) => {
        return enumValues[getRandomNumber(0, totalLength)];
    })
}

export const getUuid = (len: number, radix: number) => {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        var r;

        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}

export default { nameArr, fractionArr, enumArr, getUuid }