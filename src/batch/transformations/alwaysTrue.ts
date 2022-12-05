export function alwaysTrue(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  _fieldKey: string
) {
  if (currentData != null && currentData[_fieldKey] === true) {
    return null;
  } else {
    return true;
  }
}
