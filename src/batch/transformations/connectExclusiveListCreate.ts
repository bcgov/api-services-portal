import { BatchService } from '../../services/keystone/batch-service';
import { Logger } from '../../logger';
import { strict as assert } from 'assert';
import { connectExclusiveList } from './connectExclusiveList';

const logger = Logger('batch.connectExclusiveListCreate');

export async function connectExclusiveListCreate(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  fieldKey: string
) {
  logger.debug('%s %j %j', fieldKey, currentData, inputData);

  if (currentData != null) {
    return connectExclusiveList(
      keystone,
      transformInfo,
      currentData,
      inputData,
      fieldKey
    );
  }

  if (inputData[fieldKey]) {
    return {
      create: inputData[fieldKey],
    };
  } else {
    return null;
  }
}
