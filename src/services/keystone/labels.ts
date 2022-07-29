import { Keystone } from '@keystonejs/keystone';
import { Logger } from '../../logger';
import {
  Application,
  Label,
  LabelCreateInput,
  LabelsCreateInput,
  LabelUpdateInput,
} from './types';
import { strict as assert } from 'assert';

const logger = Logger('keystone.labels');

export async function lookupConsumerIdsByLabels(
  context: any,
  ns: string,
  labelGroup: string,
  value: string
): Promise<string[]> {
  logger.debug('[lookupConsumersByLabels] result %s=%s', labelGroup, value);
  const result = await context.executeGraphQL({
    query: `query GetConsumersByLabels($ns: String!, $labelGroup: String, $value: String) {
                    allLabels(where: { name: $labelGroup, value_contains: $value, namespace: $ns}) {
                        name
                        value
                        consumer {
                          id
                        }
                    }
                }`,
    variables: { ns, labelGroup, value },
  });
  logger.debug('[lookupConsumersByLabels] result %j', result);
  return [
    ...new Set(
      result.data.allLabels.map((m: Label) => m.consumer?.id) as string[]
    ),
  ];
}

export async function getConsumerLabels(
  context: any,
  ns: string,
  consumerIds: string[]
): Promise<Label[]> {
  const result = await context.executeGraphQL({
    query: `query GetConsumerLabels($ns: String!, $consumerIds: [ID]!) {
                    allLabels(where: { namespace: $ns, consumer: { id_in: $consumerIds } }) {
                        id
                        name
                        value
                        consumer {
                          id
                        }
                    }
                }`,
    variables: { ns, consumerIds },
  });
  logger.debug('[getConsumerLabels] result %j', result);
  return result.data.allLabels;
}

export async function addConsumerLabel(context: any, data: LabelCreateInput) {
  const result = await context.executeGraphQL({
    query: `mutation SaveConsumerLabel($data: LabelCreateInput!) {
        createLabel(data: $data) {
            id
        }
    }`,
    variables: { data },
  });
  logger.debug('[addConsumerLabel] result %j', result);
  assert.strictEqual('errors' in result, false, `Failed to add label`);
}

export async function delConsumerLabel(context: any, id: String) {
  const result = await context.executeGraphQL({
    query: `mutation DeleteConsumerLabel($id: ID!) {
        deleteLabel(id: $id) {
            id
        }
    }`,
    variables: { id },
  });
  logger.debug('[delConsumerLabel] result %j', result);
  assert.strictEqual('errors' in result, false, `Failed to delete label`);
}

export async function updateConsumerLabel(
  context: any,
  id: String,
  label: LabelUpdateInput
) {
  const result = await context.executeGraphQL({
    query: `mutation SaveConsumerLabel($id: ID!, $label: LabelUpdateInput!) {
      updateLabel(id: $id, data: $label) {
          id
      }
  }`,
    variables: { id, label },
  });
  logger.debug('[updateConsumerLabel] result %j', result);
  assert.strictEqual('errors' in result, false, `Failed to update labels`);
}

export async function delAllConsumerLabels(
  context: any,
  ns: string,
  id: string
) {
  const labels = await getConsumerLabels(context, ns, [id]);

  const ids = labels.map((label) => label.id);

  const result = await context.executeGraphQL({
    query: `mutation DeleteAllConsumerLabels($ids: [ID]!) {
        deleteLabels(ids: $ids) {
            id
        }
    }`,
    variables: { ids },
  });
  logger.debug('[delAllConsumerLabels] result %j', result);
  assert.strictEqual('errors' in result, false, `Failed to delete label`);
}
