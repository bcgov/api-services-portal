import { Logger } from '../../logger';

const logger = Logger('keystone.deleteRecords');

export async function deleteRecords(
  context: any,
  entity: string,
  where: any,
  multiple: boolean = false,
  returnedFields: string[]
): Promise<any> {
  logger.debug('Deletion query %j', where);

  const qlName = entity.endsWith('s') ? `all${entity}es` : `all${entity}s`;
  const find = await context.executeGraphQL({
    query: `query Find${entity}($where: ${entity}WhereInput) {
                    ${qlName}(where: $where ) {
                        id
                    }
                }`,
    variables: { where },
  });
  logger.debug('Deletion query %j', find);

  if (find.data[qlName].length > 1) {
    if (multiple == false) {
      throw Error('Too many records returned!');
    }
    const ids = find.data[qlName].map((r: any) => r.id);
    const qlDeleteName = entity.endsWith('s')
      ? `delete${entity}es`
      : `delete${entity}s`;
    const result = await context.executeGraphQL({
      query: `mutation Delete${entity}($ids: [ID]!) {
                        ${qlDeleteName}( ids: $ids ) {
                            ${returnedFields.join(' ')}
                        }
                    }`,
      variables: { ids },
    });
    logger.debug('FINISHED DELETING IDS=%s FROM WHERE %j', ids, where);
    logger.debug('--> RESULT %j', result);
    return result.data[`${qlDeleteName}`];
  } else if (find.data[qlName].length == 0) {
    logger.debug('Already deleted');
    return null;
  } else {
    const id = find.data[qlName][0].id;
    const result = await context.executeGraphQL({
      query: `mutation Delete${entity}($id: ID!) {
                        delete${entity}( id: $id ) {
                            ${returnedFields.join(' ')}
                        }
                    }`,
      variables: { id },
    });
    logger.debug('FINISHED DELETING ID=%s FROM WHERE %j', id, where);
    logger.debug('--> RESULT %j', result);
    return result.data[`delete${entity}`];
  }
}

export async function deleteRecord(
  context: any,
  entity: string,
  where: any,
  returnedFields: string[]
): Promise<any> {
  return deleteRecords(context, entity, where, false, returnedFields);
}
