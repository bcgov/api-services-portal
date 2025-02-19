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
  Post,
  Body,
} from 'tsoa';
import { ValidateError, FieldErrors } from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { getRecords, replaceKey } from '../../batch/feed-worker';
import { gql } from 'graphql-request';
import { WorkbookService } from '../../services/report/workbook.service';
import { Namespace, NamespaceInput } from '../../services/keystone/types';

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
import { Activity, Gateway, GatewayRoute } from './types';
import { getActivity } from '../../services/keystone/activity';
import { transformActivity } from '../../services/workflow';
import { ActivityDetail } from './types-extra';

const logger = Logger('controllers.Gateway');

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
@Route('/gateways')
@Security('jwt')
@Tags('Gateways')
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
      'attachment; filename="bcgov_app_gateways.xlsx"'
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
   * @summary List of Gateways available to the user
   * @param request
   * @returns
   */
  @Get()
  @OperationId('gateway-list')
  public async list(@Request() request: any): Promise<Gateway[]> {
    const result = await this.keystone.executeGraphQL({
      context: this.keystone.createContext(request),
      query: list,
    });
    logger.debug('Result %j', result);
    return result.data.allNamespaces
      .map((ns: Namespace): Gateway => ({ gatewayId: ns.name, displayName: ns.displayName }))
      .sort((a: Gateway, b: Gateway) => {
        const displayNameComparison = a.displayName.localeCompare(b.displayName);
        return displayNameComparison !== 0 ? displayNameComparison : a.gatewayId.localeCompare(b.gatewayId);
      });
  }

  /**
   * Get details about the gateway, such as permissions for what the gateway is setup with.
   * > `Required Scope:` Gateway.Manage
   *
   * @summary Gateway Summary
   * @param ns
   * @param request
   * @returns
   */
  @Get('/{gatewayId}')
  @OperationId('gateway-profile')
  @Security('jwt', ['Namespace.Manage'])
  public async profile(
    @Path() gatewayId: string,
    @Request() request: any
  ): Promise<Gateway> {
    const result = await this.keystone.executeGraphQL({
      context: this.keystone.createContext(request),
      query: item,
      variables: { ns: gatewayId },
    });
    logger.debug('Result %j', result);
    assert.strictEqual('errors' in result, false, 'Unable to process request');
    return result.data.namespace;
  }

  /**
   * Create a gateway
   *
   * @summary Create Gateway
   * @param ns
   * @param request
   * @returns
   */
  @Post()
  @OperationId('create-gateway')
  @Security('jwt', [])
  public async create(
    @Request() request: any,
    @Body() vars: Gateway
  ): Promise<Gateway> {
    logger.debug('Input %j', vars);
    const modifiedVars = replaceKey(vars, 'gatewayId', 'name');
    const result = await this.keystone.executeGraphQL({
      context: this.keystone.createContext(request),
      query: createNS,
      variables: modifiedVars,
    });
    logger.debug('Result %j', result);
    if (result.errors) {
      const errors: FieldErrors = {};
      result.errors.forEach((err: any, ind: number) => {
        errors[`d${ind}`] = { message: err.message };
      });
      logger.error('%j', result);
      throw new ValidateError(errors, 'Unable to create Gateway');
    }
    return {
      gatewayId: result.data.createNamespace.name,
      displayName: result.data.createNamespace.displayName,
    };
  }

  /**
   * Delete the gateway
   * > `Required Scope:` Gateway.Manage
   *
   * @summary Delete Gateway
   * @param ns
   * @param request
   * @returns
   */
  @Delete('/{gatewayId}')
  @OperationId('delete-gateway')
  @Security('jwt', ['Namespace.Manage'])
  public async delete(
    @Path() gatewayId: string,
    @Query() force: boolean = false,
    @Request() request: any
  ): Promise<Gateway> {
    const ns = gatewayId;
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
      logger.error('%j', result);
      throw new ValidateError(errors, 'Unable to delete gateway');
    }
    return result.data.forceDeleteNamespace;
  }

  /**
   * > `Required Scope:` Gateway.View
   *
   * @summary Get administration activity for this Gateway
   * @param ns
   * @param first
   * @param skip
   * @returns Activity[]
   */
  @Get('/{gatewayId}/activity')
  @OperationId('gateway-admin-activity')
  @Security('jwt', ['Namespace.View'])
  public async namespaceActivity(
    @Path() gatewayId: string,
    @Query() first: number = 20,
    @Query() skip: number = 0
  ): Promise<ActivityDetail[]> {
    const ctx = this.keystone.sudo();
    const records = await getActivity(
      ctx,
      [gatewayId],
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

  /**
   * Get a summary of your endpoints
   * > `Required Scope:` Gateway.Manage
   *
   * @summary Get endpoints
   */
  @Get('/{gatewayId}/links')
  @OperationId('get-gateway-links')
  @Security('jwt', ['Namespace.Manage'])
  public async get(
    @Path() gatewayId: string,
    @Request() request: any
  ): Promise<{ host: string }[]> {
    const ctx = this.keystone.createContext(request);
    const records = await getRecords(
      ctx,
      'GatewayRoute',
      'allGatewayRoutesByNamespace',
      []
    );

    const endpoints: string[] = [];
    records.forEach((r: GatewayRoute) =>
      r.hosts.forEach((h: string) => endpoints.push(h))
    );

    return [...new Set(endpoints)].map((host) => ({
      type: 'route-host',
      host: `https://${host}`,
    }));
  }
}

const list = gql`
  query Namespaces {
    allNamespaces {
      name
      displayName
    }
  }
`;

const item = gql`
  query Namespace($ns: String!) {
    namespace(ns: $ns) {
      name
      displayName
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

const createNS = gql`
  mutation CreateNamespace($name: String, $displayName: String) {
    createNamespace(name: $name, displayName: $displayName) {
      name
      displayName
    }
  }
`;
