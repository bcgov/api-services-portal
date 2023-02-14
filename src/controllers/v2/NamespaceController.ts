import {
  Controller,
  OperationId,
  Request,
  Get,
  Path,
  Route,
  Security,
  Tags,
  Delete,
  Query,
} from 'tsoa';
import { ValidateError, FieldErrors } from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { gql } from 'graphql-request';
import { WorkbookService } from '../../services/report/workbook.service';
import { Namespace } from '../../services/keystone/types';

import { Readable } from 'stream';
import {
  parseBlobString,
  parseJsonString,
  removeEmpty,
  removeKeys,
  transformAllRefID,
} from '../../batch/feed-worker';

import { strict as assert } from 'assert';

import { Logger } from '../../logger';
import { Activity } from './types';
import { getActivity } from '../../services/keystone/activity';
import { transformActivity } from '../../services/workflow';
import { ActivityDetail } from './types-extra';
const logger = Logger('controllers.Namespace');

/**
 * @param binary Buffer
 * returns readableInstanceStream Readable
 */
function bufferToStream(binary: any) {
  const readableInstanceStream = new Readable({
    read() {
      this.push(binary);
      this.push(null);
    },
  });

  return readableInstanceStream;
}

@injectable()
@Route('/namespaces')
@Security('jwt')
@Tags('Namespaces')
export class NamespaceController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Get('/report')
  @OperationId('report')
  public async report(
    @Request() req: any,
    @Query() ids: string = '[]'
  ): Promise<any> {
    const workbookService = new WorkbookService(
      this.keystone.createContext(req, true)
    );
    const workbook = await workbookService.buildWorkbook(JSON.parse(ids));
    const buffer = await workbook.xlsx.writeBuffer();

    req.res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    req.res.setHeader(
      'Content-Disposition',
      'attachment; filename="bcgov_app_namespaces.xlsx"'
    );

    const mystream = bufferToStream(buffer);
    mystream.pipe(req.res);
    await new Promise((resolve, reject) => {
      mystream.on('end', () => {
        req.res.end();
        resolve(null);
      });
    });

    return null;
  }

  /**
   * @summary List of Namespace names
   * @param request
   * @returns
   */
  @Get()
  @OperationId('namespace-list')
  public async list(@Request() request: any): Promise<string[]> {
    const result = await this.keystone.executeGraphQL({
      context: this.keystone.createContext(request),
      query: list,
    });
    logger.debug('Result %j', result);
    return result.data.allNamespaces.map((ns: Namespace) => ns.name);
  }

  /**
   * Get details about the namespace, such as permissions for what the namespace can do.
   * > `Required Scope:` Namespace.Manage
   *
   * @summary Namespace Summary
   * @param ns
   * @param request
   * @returns
   */
  @Get('/{ns}')
  @OperationId('namespace-profile')
  @Security('jwt', ['Namespace.Manage'])
  public async profile(
    @Path() ns: string,
    @Request() request: any
  ): Promise<Namespace> {
    const result = await this.keystone.executeGraphQL({
      context: this.keystone.createContext(request),
      query: item,
      variables: { ns },
    });
    logger.debug('Result %j', result);
    assert.strictEqual('errors' in result, false, 'Unable to process request');
    return result.data.namespace;
  }

  /**
   * Delete the namespace
   * > `Required Scope:` Namespace.Manage
   *
   * @summary Delete Namespace
   * @param ns
   * @param request
   * @returns
   */
  @Delete('/{ns}')
  @OperationId('delete-namespace')
  @Security('jwt', ['Namespace.Manage'])
  public async delete(
    @Path() ns: string,
    @Query() force: boolean = false,
    @Request() request: any
  ): Promise<Namespace> {
    const result = await this.keystone.executeGraphQL({
      context: this.keystone.createContext(request),
      query: deleteNS,
      variables: { ns, force },
    });
    logger.debug('Result %j', result);
    if (result.errors) {
      const errors: FieldErrors = {};
      result.errors.forEach((err: any, ind: number) => {
        errors[`d${ind}`] = { message: err.message };
      });
      throw new ValidateError(errors, 'Unable to delete namespace');
    }
    return result.data.forceDeleteNamespace;
  }

  /**
   * > `Required Scope:` Namespace.View
   *
   * @summary Get Namespace Activity for this namespace
   * @param ns
   * @param first
   * @param skip
   * @returns Activity[]
   */
  @Get('/{ns}/activity')
  @OperationId('namespace-activity')
  @Security('jwt', ['Namespace.View'])
  public async namespaceActivity(
    @Path() ns: string,
    @Query() first: number = 20,
    @Query() skip: number = 0
  ): Promise<ActivityDetail[]> {
    const ctx = this.keystone.sudo();
    const records = await getActivity(
      ctx,
      [ns],
      undefined,
      first > 100 ? 100 : first,
      skip
    );
    return transformActivity(records)
      .map((o) => removeKeys(o, ['id']))
      .map((o) => removeEmpty(o))
      .map((o) => parseJsonString(o, ['context']))
      .map((o) => parseBlobString(o));
  }
}

const list = gql`
  query Namespaces {
    allNamespaces {
      name
    }
  }
`;

const item = gql`
  query Namespace($ns: String!) {
    namespace(ns: $ns) {
      name
      scopes {
        name
      }
      permDomains
      permDataPlane
      permProtectedNs
      org
      orgUnit
      orgUpdatedAt
      orgEnabled
      orgAdmins
    }
  }
`;

const deleteNS = gql`
  mutation ForceDeleteNamespace($ns: String!, $force: Boolean!) {
    forceDeleteNamespace(namespace: $ns, force: $force)
  }
`;
