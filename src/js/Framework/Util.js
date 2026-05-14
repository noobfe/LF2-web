const isUndefined = (obj) => typeof obj === 'undefined';
const isNull = (obj) => obj === null;
const isFunction = (obj) => typeof obj === 'function';
const isNumber = (obj) => typeof obj === 'number';
const isObject = (obj) => typeof obj === 'object';
const isBoolean = (obj) => typeof obj === 'boolean';
const isString = (obj) => typeof obj === 'string';
const isCanvas = (obj) => !isUndefined(obj.tagName) && obj.tagName === 'CANVAS';

const isAbout = (realValue, aboutValue, delta) =>
    realValue > aboutValue - delta && realValue < aboutValue + delta;

const findValueByKey = (targetList, key) => {
    for (let i = 0, l = targetList.length; i < l; i++) {
        if (targetList[i].name === key) return targetList[i];
    }
    return null;
};

const namespace = (ns_string) => {
    let parts = ns_string.split('.');
    let parent = Framework;
    if (parts[0] === 'Framework') parts = parts.slice(1);
    for (let i = 0; i < parts.length; i++) {
        if (isUndefined(parent[parts[i]])) parent[parts[i]] = {};
        parent = parent[parts[i]];
    }
    return parts;
};

const overrideProperty = (defaultSettings, userSettings) => {
    for (const key in defaultSettings) {
        if (isUndefined(userSettings[key])) userSettings[key] = defaultSettings[key];
    }
    return userSettings;
};

export const Util = {
    isUndefined, isNull, isFunction, isNumber, isObject,
    isBoolean, isString, isCanvas, namespace, overrideProperty,
    isAbout, findValueByKey,
};

if (isUndefined(Date.prototype.format)) {
    Date.prototype.format = function (format) {
        const o = {
            'M+': this.getMonth() + 1,
            'd+': this.getDate(),
            'h+': this.getHours(),
            'm+': this.getMinutes(),
            's+': this.getSeconds(),
            'q+': Math.floor((this.getMonth() + 3) / 3),
            'S': this.getMilliseconds(),
        };
        if (/(y+)/.test(format))
            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
        for (const k in o)
            if (new RegExp('(' + k + ')').test(format))
                format = format.replace(RegExp.$1,
                    RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
        return format;
    };
}

Framework.Util = Util;
