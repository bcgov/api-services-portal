import { BatchService } from '../../services/keystone/batch-service';
import { Logger } from '../../logger';

const logger = Logger('batch.handleNameChange');

/**
 * This is needed in two scenarios:
 * (1) GatewayService/Route name goes from: A -> B -> A
 *     So renamed to something else, then renamed back to its original name.
 *
 * (2) If the GatewayService/Route is deleted and re-created
 * (3) If the GatewayConsumer is deleted and re-created (client credentials)
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
    logger.info(
      '[%s] name change detected - updating extForeignKey to %s',
      json['name'],
      eid
    );
    await batchService.update(entity, lkup['id'], { extForeignKey: eid });
  }
}
