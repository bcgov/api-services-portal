import { BatchService } from '../../services/keystone/batch-service';
import { Logger } from '../../logger';
import { strict as assert } from 'assert';
import { connectExclusiveList } from './connectExclusiveList';
import { applyTransformationsToNewCreation } from '../feed-worker';

const logger = Logger('batch.connectExclusiveListCreate');

export async function connectExclusiveListCreate(
  keystone: any,
  transformInfo: any,
  currentData: any,
  inputData: any,
  fieldKey: string,
  parentRecord: any
) {
  logger.debug('%s %j %j %j', fieldKey, currentData, inputData, parentRecord);

  const createInputData = await applyTransformationsToNewCreation(
    keystone,
    transformInfo,
    inputData[fieldKey],
    inputData
  );

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
      create: createInputData,
    };
  } else {
    return null;
  }
}
