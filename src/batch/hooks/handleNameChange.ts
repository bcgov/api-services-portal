import { BatchService } from '../../services/keystone/batch-service';
import { Logger } from '../../logger';
import { dot } from '../feed-worker';

const logger = Logger('batch.handleNameChange');

/**
 *
 * @param keystone
 * @param md
 * @param eid
 * @param json
 * @returns
 */
export async function handleNameChange(
  keystone: any,
  entity: string,
  md: any,
  eid: any,
  json: any
): Promise<void> {
  const batchService = new BatchService(keystone);

  const lkup = await batchService.lookup(md.query, 'name', json['name'], [
    'extForeignKey',
  ]);
  if (lkup == null || lkup['extForeignKey'] === eid) {
    // no work to do as the record either does not exist, or the external foreign key is still the same
  } else {
    logger.debug(
      '[%s] name change detected - updating extForeignKey to %s',
      json['name'],
      eid
    );
    await batchService.update(entity, lkup['id'], { extForeignKey: eid });
  }
}
