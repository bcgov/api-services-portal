import {
  Controller,
  OperationId,
  Get,
  Route,
  Tags,
  Query,
  Request,
} from 'tsoa';
import { KeystoneService } from '../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { getRecords } from '../../batch/feed-worker';
import { GatewayRoute } from './types';

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
    @Request() request: any
  ): Promise<any> {
    const ctx = this.keystone.sudo();
    const records = await getRecords(
      ctx,
      'GatewayRoute',
      'allGatewayRoutes',
      []
    );

    let counter = 0;
    let matchHostList;
    do {
      counter++;
      matchHostList = this.getMatchHostList(
        counter == 1 ? serviceName : `${serviceName}-${counter}`
      );
    } while (this.isTaken(records, matchHostList.hosts));

    return {
      available: counter == 1,
      name: matchHostList.serviceName,
      host: matchHostList.hosts[0],
    };
  }

  private getMatchHostList(
    serviceName: string
  ): { serviceName: string; hosts: string[] } {
    return {
      serviceName,
      hosts: [
        `${serviceName}.api.gov.bc.ca`,
        `${serviceName}-api-gov-bc-ca.dev.api.gov.bc.ca`,
        `${serviceName}-api-gov-bc-ca.test.api.gov.bc.ca`,
      ],
    };
  }

  private isTaken(records: any[], matchHosts: string[]): boolean {
    return (
      records.filter(
        (r: GatewayRoute) =>
          r.hosts.filter((h: string) => matchHosts.indexOf(h) >= 0).length > 0
      ).length > 0
    );
  }
}
