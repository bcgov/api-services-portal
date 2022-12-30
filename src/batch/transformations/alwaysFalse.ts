export function alwaysFalse(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  _fieldKey: string
) {
  if (currentData != null && currentData[_fieldKey] === false) {
    return null;
  } else {
    return false;
  }
}
