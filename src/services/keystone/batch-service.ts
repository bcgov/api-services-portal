import { Logger } from '../../logger';

const logger = Logger('ks.batch');

export interface BatchWhereClause {
  query: string; // '$org: String'
  clause: string; // '{ org: $org }'
  variables: object;
}
export class BatchService {
  private context: any;

  constructor(context: any) {
    this.context = context;
  }

  public async listAll(
    query: any,
    fields: string[],
    where: BatchWhereClause = undefined
  ) {
    logger.debug('[listAll] : %s', query);
    let queryString;
    if (where) {
      queryString = `query(${where.query}) {
        ${query}(where: ${where.clause}) {
          id, ${fields.join(',')}
        }
      }`;
    } else {
      queryString = `query {
        ${query} {
          id, ${fields.join(',')}
        }
      }`;
    }
    logger.debug('[listAll] %s', queryString);

    const result = await this.context.executeGraphQL({
      query: queryString,
      variables: where ? where.variables : {},
    });

    if ('errors' in result) {
      logger.error('[listAll] RESULT %j', result);
      return null;
    }

    logger.debug('[listAll] RESULT %j', result);
    return result['data'][query].length == 0 ? [] : result['data'][query];
  }

  public async list(
    query: any,
    refKey: string,
    refKeyId: string,
    fields: string[]
  ) {
    logger.debug('[list] : %s :: %s == %s', query, refKey, refKeyId);
    const queryString = `query($id: String) {
      ${query}(where: { ${refKey} : $id }) {
        id, ${fields.join(',')}
      }
    }`;
    logger.debug('[list] %s', queryString);

    const result = await this.context.executeGraphQL({
      query: queryString,
      variables: { id: refKeyId },
    });
    logger.debug('[list] RESULT %j', result);

    return result['data'][query].length == 0 ? [] : result['data'][query];
  }

  public async listRelated(
    query: any,
    refKey: string,
    refKeyId: string,
    fields: string[]
  ) {
    logger.debug('[listRelated] : %s :: %s == %s', query, refKey, refKeyId);
    const result = await this.context.executeGraphQL({
      query: `query($id: String) {
              ${query}(where: { ${refKey} : { id: $id } }) {
                id, ${fields.join(',')}
              }
            }`,
      variables: { id: refKeyId },
    });
    logger.debug('[listRelated] RESULT %j', result);

    return result['data'][query].length == 0 ? [] : result['data'][query];
  }

  public async lookup(
    query: string,
    refKey: string,
    eid: string,
    fields: string[]
  ) {
    const refKeys = refKey.split('.');
    if (refKeys.length == 2) {
      return this.lookupByChildItem(query, refKeys[0], refKeys[1], eid, fields);
    }

    logger.debug('[lookup] : %s :: %s == %s', query, refKey, eid);
    const queryString = `query($id: String) {
      ${query}(where: { ${refKey} : $id }) {
        id, ${fields.join(',')}
      }
    }`;
    logger.debug('[lookup] %s', queryString);
    const result = await this.context.executeGraphQL({
      query: queryString,
      variables: { id: eid },
    });
    logger.debug('[lookup] RESULT %j', result);
    if (result['data'][query] == null || result['data'][query].length > 1) {
      throw Error(
        'Expecting zero or one rows ' + query + ' ' + refKey + ' ' + eid
      );
    }
    return result['data'][query].length == 0 ? null : result['data'][query][0];
  }

  public async lookupByChildItem(
    query: string,
    parent: string,
    refKey: string,
    eid: string,
    fields: string[]
  ) {
    logger.debug(
      '[lookupByChildItem] : %s :: %s.%s == %s',
      query,
      parent,
      refKey,
      eid
    );
    const queryString = `query($id: String) {
      ${query}(where: { ${parent}_some: { ${refKey} : $id } }) {
        id, ${fields.join(',')}
      }
    }`;
    logger.debug('[lookupByChildItem] %s', queryString);
    const result = await this.context.executeGraphQL({
      query: queryString,
      variables: { id: eid },
    });
    logger.debug('[lookupByChildItem] RESULT %j', result);
    if (result['data'][query] == null || result['data'][query].length > 1) {
      throw Error(
        'Expecting zero or one rows ' + query + ' ' + refKey + ' ' + eid
      );
    }
    return result['data'][query].length == 0 ? null : result['data'][query][0];
  }

  public async create(entity: string, data: any) {
    logger.debug('[create] : (%s) %j', entity, data);
    const result = await this.context.executeGraphQL({
      query: `mutation ($data: ${entity}CreateInput) {
              create${entity}(data: $data) {
                id
              }
            }`,
      variables: { data },
    });
    logger.debug('[create] RESULT %j', result);

    return 'errors' in result ? null : result['data'][`create${entity}`].id;
  }

  public async update(entity: string, id: string, data: any): Promise<string> {
    logger.debug('[update] : %s %s', entity, id);
    const result = await this.context.executeGraphQL({
      query: `mutation ($id: ID!, $data: ${entity}UpdateInput) {
              update${entity}(id: $id, data: $data) {
                id
              }
            }`,
      variables: { id: id, data: data },
    });
    logger.debug('[update] RESULT %j', result);
    return 'errors' in result ? null : result['data'][`update${entity}`].id;
  }

  public async remove(entity: string, id: string): Promise<any> {
    logger.debug('[remove] : %s %s', entity, id);
    const result = await this.context.executeGraphQL({
      query: `mutation ($id: ID!) {
              delete${entity}(id: $id)
            }`,
      variables: { id: id },
    });
    logger.debug('[remove] RESULT %j', result);
    return 'errors' in result ? null : result['data'][`delete${entity}`];
  }

  public async removeAll(entity: string, ids: string[]): Promise<any> {
    logger.debug('[removeAll] : %s %s', entity, ids);
    const result = await this.context.executeGraphQL({
      query: `mutation ($ids: [ID!]) {
              delete${entity}s(ids: $ids) { id }
            }`,
      variables: { ids: ids },
    });
    logger.debug('[removeAll] RESULT %j', result);
    if ('errors' in result) {
      logger.error('[removeAll] %j', result);
    }

    return 'errors' in result ? null : result['data'][`delete${entity}s`];
  }
}
