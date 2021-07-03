import isString from 'lodash/isString';

const isNotBlank = (v: any) => isString(v) && v.length > 0;

export default isNotBlank;
