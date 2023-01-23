import { Logger } from '../../logger';
import { dot } from '../feed-worker';

export async function byKey(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  _fieldKey: string
) {
  // fieldKey: The field that has the new value in the input
  const fieldKey = 'key' in transformInfo ? transformInfo['key'] : _fieldKey;

  const value = dot(inputData, fieldKey);

  if (typeof value === 'undefined') {
    return null;
  } else {
    return currentData != null &&
      _fieldKey in currentData &&
      currentData[_fieldKey] === value
      ? null
      : value;
  }
}
