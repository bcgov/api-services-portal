import { BatchService } from '../../services/keystone/batch-service';
import { Logger } from '../../logger';

const logger = Logger('batch.connectExclusiveList');

export async function connectExclusiveList(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  fieldKey: string
) {
  if (
    currentData != null &&
    fieldKey in currentData &&
    currentData[fieldKey] &&
    currentData[fieldKey]
      .map((d: any) => d.id)
      .sort()
      .join(' ') === inputData[fieldKey + '_ids'].sort().join(' ')
  ) {
    return null;
  }
  // Because this is an exclusive list, delete records that are no longer relevant
  const deleted = currentData[fieldKey]
    .map((d: any) => d.id)
    .filter((n: string) => !inputData[fieldKey + '_ids'].includes(n));
  logger.debug('Deletions? %j', deleted);
  if (deleted.length > 0) {
    const batchService = new BatchService(keystone);
    await batchService.removeAll(transformInfo.list, deleted);
  }
  return {
    disconnectAll: true,
    connect: inputData[fieldKey + '_ids'].map((id: string) => {
      return { id: id };
    }),
  };
}
