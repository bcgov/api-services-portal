import stringify from 'json-stable-stringify';

export function toStringDefaultArray(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  key: string
) {
  if (inputData[key] == null) {
    return '[]';
  }
  return currentData != null && currentData[key] === stringify(inputData[key])
    ? null
    : stringify(inputData[key]);
}
