import stringify from 'json-stable-stringify';

export function toStringDefaultArray(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  key: string
) {
  // if new and not passed, then set an empty array as a default
  if (inputData[key] == null && currentData == null) {
    return '[]';
  }
  return inputData[key] == null ||
    (currentData != null && currentData[key] === stringify(inputData[key]))
    ? null
    : stringify(inputData[key]);
}
