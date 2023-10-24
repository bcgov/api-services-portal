import { BatchService } from '../../services/keystone/batch-service';
import { Logger } from '../../logger';
import { dot } from '../feed-worker';

const logger = Logger('batch.connectOne');

export async function connectOne(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  _fieldKey: string
) {
  const batchService = new BatchService(keystone);

  // fieldKey: The field that has the new value in the input
  const fieldKey = 'key' in transformInfo ? transformInfo['key'] : _fieldKey;

  const value = dot(inputData, fieldKey);

  // undefined value is one that was never passed in (rather than explicitely passed in null)
  if (typeof value === 'undefined') {
    return null;
  } else if (value == null) {
    if (currentData == null || currentData[_fieldKey] == null) {
      return null;
    } else {
      return { disconnectAll: true };
    }
  }

  const lkup = await batchService.lookup(
    transformInfo['list'],
    transformInfo['refKey'],
    value,
    []
  );
  if (lkup == null) {
    logger.error(
      `Lookup failed for ${transformInfo['list']} ${transformInfo['refKey']}!`
    );
    throw Error(`Record not found [${_fieldKey}] ${value}`);
  } else if (
    currentData != null &&
    currentData[_fieldKey] &&
    'id' in currentData[_fieldKey] &&
    currentData[_fieldKey]['id'] == lkup['id']
  ) {
    return null;
  } else {
    logger.debug('Adding: ' + JSON.stringify({ connect: { id: lkup['id'] } }));
    return { connect: { id: lkup['id'] } };
  }
}
