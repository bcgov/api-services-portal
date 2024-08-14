import {
  Controller,
  OperationId,
  Get,
  Route,
  Tags,
  Query,
  Request,
  Security,
  Path,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import {
  getRecords,
  parseJsonString,
  removeEmpty,
} from '../../batch/feed-worker';
import { GatewayRoute, GatewayService } from './types';

interface MatchList {
  serviceName: string;
  names: string[];
  hosts: string[];
}

@injectable()
@Route('/routes')
@Tags('Service Routes')
export class EndpointsController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  @Get('availability')
  @OperationId('check-availability')
  public async check(
    @Query() serviceName: string,
    @Query() gatewayId: string,
    @Request() request: any
  ): Promise<any> {
    const ctx = this.keystone.sudo();
    const records = (
      await getRecords(ctx, 'GatewayRoute', 'allGatewayRoutes', ['service'])
    ).map((o) => parseJsonString(o, ['hosts']));

    let counter = 0;
    let matchHostList: MatchList;
    do {
      counter++;
      matchHostList = this.getMatchHostList(
        counter == 1
          ? serviceName
          : counter == 2
          ? `${gatewayId}-${serviceName}`
          : `${gatewayId}-${counter}-${serviceName}`
      );
    } while (this.isTaken(records, matchHostList));

    return {
      available: counter == 1,
      suggestion: matchHostList,
    };
  }

  private getMatchHostList(serviceName: string): MatchList {
    return {
      serviceName,
      names: [`${serviceName}`, `${serviceName}-dev`, `${serviceName}-test`],
      hosts: [
        `${serviceName}.api.gov.bc.ca`,
        `${serviceName}.dev.api.gov.bc.ca`,
        `${serviceName}.test.api.gov.bc.ca`,
        `${serviceName}-api-gov-bc-ca.dev.api.gov.bc.ca`,
        `${serviceName}-api-gov-bc-ca.test.api.gov.bc.ca`,
      ],
    };
  }

  private isTaken(records: any[], matchList: MatchList): boolean {
    return (
      records.filter(
        (r: GatewayRoute) =>
          r.hosts.filter((h: string) => matchList.hosts.indexOf(h) >= 0)
            .length > 0 ||
          matchList.names.filter((n: string) => n == r.name).length > 0 ||
          matchList.names.filter(
            (n: string) => n == (r.service as GatewayService).name
          ).length > 0
      ).length > 0
    );
  }
}
