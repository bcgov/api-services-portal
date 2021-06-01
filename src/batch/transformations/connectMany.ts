import { BatchService } from '../../services/keystone/batch-service';
import { dot } from '../feed-worker';
import { Logger } from '../../logger';

const logger = Logger('batch.connectMany');

export async function connectMany(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  _fieldKey: string
) {
  const fieldKey = 'key' in transformInfo ? transformInfo['key'] : _fieldKey;
  const idList = dot(inputData, fieldKey);
  const refIds = [];
  const batchService = new BatchService(keystone);
  if (idList != null) {
    for (const uniqueKey of idList) {
      const lkup = await batchService.lookup(
        transformInfo['list'],
        transformInfo['refKey'],
        uniqueKey,
        []
      );
      if (lkup == null) {
        logger.error(
          `Lookup failed for ${transformInfo['list']} ${transformInfo['refKey']}!`
        );
        throw Error(
          'Failed to find ' + uniqueKey + ' in ' + transformInfo['list']
        );
      }
      refIds.push(lkup['id']);
    }
  }
  if (
    currentData != null &&
    fieldKey in currentData &&
    currentData[fieldKey] != null &&
    currentData[fieldKey]
      .map((d: any) => d.id)
      .sort()
      .join(' ') === refIds.sort().join(' ')
  ) {
    return null;
  }

  if (refIds.length == 0) {
    return { disconnectAll: true };
  } else {
    return {
      disconnectAll: true,
      connect: refIds.map((id) => {
        return { id: id };
      }),
    };
  }
}
