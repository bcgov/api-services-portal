import stringify from 'json-stable-stringify';

export function toString(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  key: string
) {
  const value = stringify(inputData[key]);
  return inputData[key] == null ||
    (currentData != null && currentData[key] === value)
    ? null
    : value;
}
