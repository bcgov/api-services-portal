import stringify from 'json-stable-stringify';

export function toStringDefaultArray(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  key: string
) {
  return inputData[key] == null ||
    (currentData != null && currentData[key] === stringify(inputData[key]))
    ? null
    : stringify(inputData[key]);
}
