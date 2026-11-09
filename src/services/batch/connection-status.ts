import { Logger } from '../../logger';
import { BatchResult } from '../../batch/types';

const logger = Logger('batch.connection-status');

interface ProvisionerStatus {
  operationId?: string;
  [key: string]: unknown;
}

function parseProvisionerStatus(value: string): ProvisionerStatus {
  try {
    return JSON.parse(value || '{}');
  } catch {
    return {};
  }
}

export function operationMatches(
  current: ProvisionerStatus,
  incoming: ProvisionerStatus
): boolean {
  return (
    !current.operationId ||
    (Boolean(incoming.operationId) &&
      current.operationId === incoming.operationId)
  );
}

async function compareAndSet(
  adapter: any,
  listAdapter: any,
  connectionId: string,
  expectedStatus: string,
  nextStatus: string
): Promise<boolean> {
  const updatedAt = new Date();

  if (adapter.name === 'mongoose') {
    const updated = await listAdapter.model.findOneAndUpdate(
      { _id: connectionId, provisionerStatus: expectedStatus },
      { $set: { provisionerStatus: nextStatus, updatedAt } },
      { new: true, runValidators: true, context: 'query' }
    );
    return Boolean(updated);
  }

  if (adapter.name === 'knex') {
    const count = await listAdapter
      ._query()
      .table(listAdapter.tableName)
      .where({ id: connectionId, provisionerStatus: expectedStatus })
      .update({
        provisionerStatus: nextStatus,
        updatedAt_utc: updatedAt,
        updatedAt_offset: '+00:00',
      });
    return Array.isArray(count) ? count.length > 0 : Number(count) > 0;
  }

  return false;
}

/**
 * Atomically replaces a connection status only while the operation that
 * produced it is still current. A null result means the configured adapter
 * cannot provide compare-and-set and the caller should use its normal update.
 */
export async function updateConnectionProvisionerStatus(
  adapter: any,
  connectionId: string,
  initialStatus: string,
  nextStatus: string
): Promise<BatchResult | null> {
  if (
    !adapter ||
    !['mongoose', 'knex'].includes(adapter.name) ||
    typeof adapter.getListAdapterByKey !== 'function'
  ) {
    return null;
  }

  const listAdapter = adapter.getListAdapterByKey('ConnectionRequest');
  let expectedStatus = initialStatus || '{}';
  const incoming = parseProvisionerStatus(nextStatus);

  try {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const current = parseProvisionerStatus(expectedStatus);
      if (!operationMatches(current, incoming)) {
        logger.info(
          'Ignoring status for stale operation %s; current operation is %s',
          incoming.operationId || 'legacy',
          current.operationId
        );
        return {
          status: 200,
          result: 'no-change',
          id: connectionId,
        };
      }

      if (expectedStatus === nextStatus) {
        return {
          status: 200,
          result: 'no-change',
          id: connectionId,
        };
      }

      if (
        await compareAndSet(
          adapter,
          listAdapter,
          connectionId,
          expectedStatus,
          nextStatus
        )
      ) {
        return {
          status: 200,
          result: 'updated',
          id: connectionId,
        };
      }

      const latest = await listAdapter.findById(connectionId);
      if (!latest) {
        return {
          status: 404,
          result: 'not-found',
          id: connectionId,
        };
      }
      expectedStatus = latest.provisionerStatus || '{}';
    }
  } catch (err) {
    logger.error(
      'Unable to atomically update provisioner status for connection %s: %s',
      connectionId,
      err
    );
  }

  return {
    status: 503,
    result: 'update-failed',
    reason: 'Provisioner status changed concurrently; retry the update.',
    id: connectionId,
  };
}
