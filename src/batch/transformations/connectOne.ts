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
  const fieldKey = 'key' in transformInfo ? transformInfo['key'] : _fieldKey;

  const lkup = await batchService.lookup(
    transformInfo['list'],
    transformInfo['refKey'],
    dot(inputData, fieldKey),
    []
  );
  if (lkup == null) {
    logger.error(
      `Lookup failed for ${transformInfo['list']} ${transformInfo['refKey']}!`
    );
    throw Error(
      'Failed to find ' +
        dot(inputData, fieldKey) +
        ' in ' +
        transformInfo['list']
    );
  } else if (
    currentData != null &&
    'id' in currentData[fieldKey] &&
    currentData[fieldKey]['id'] == lkup['id']
  ) {
    return null;
  } else {
    logger.debug('Adding: ' + JSON.stringify({ connect: { id: lkup['id'] } }));
    return { connect: { id: lkup['id'] } };
  }
}
