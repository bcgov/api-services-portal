import {
  Controller,
  Request,
  Response,
  OperationId,
  Get,
  Put,
  Path,
  Route,
  Security,
  Body,
  Tags,
  Example,
  ValidateError,
  SuccessResponse,
} from 'tsoa';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { inject, injectable } from 'tsyringe';
import { GetCatalog } from '../../../services/gateway-patterns/catalog';
import { SDXSubsystem, SubsystemInput } from './types';
import { BatchResult } from '../../../batch/types';
import {
  getRecords,
  removeEmpty,
  removeKeys,
  replaceKey,
  syncRecordsThrowErrors,
} from '../../../batch/feed-worker';
import { Subsystem } from '@/controllers/v3/types';

@injectable()
@Route('/organizations/{org}/subsystems')
@Tags('Subsystems')
export class OrgSubsystemController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Create a new subsystem of an organization
   */
  @Put()
  @OperationId('create-subsystem')
  @Security('jwt', [])
  public async createSubsystem(
    @Path() org: string,
    @Body() body: SubsystemInput,
    @Request() request: any
  ): Promise<BatchResult> {
    let input: any = {};
    Object.assign(input, body);
    input['organization'] = org;

    return await syncRecordsThrowErrors(
      this.keystone.createContext(request),
      'Subsystem',
      undefined,
      replaceKey(input, 'gatewayId', 'namespace')
    );
  }

  /**
   * Retrieve the list of subsystems associated with a gateway
   */
  @Get()
  @OperationId('list-gateway-subsystems')
  @Security('jwt', [])
  public async listSubsystems(
    @Path() org: string,
    @Request() request: any
  ): Promise<SDXSubsystem[]> {
    const ctx = this.keystone.createContext(request);

    const batchClause = {
      query: '$org: String',
      clause: '{ organization: { name: $org } }',
      variables: { org },
    };

    const records: SDXSubsystem[] = await getRecords(
      ctx,
      'Subsystem',
      'allSubsystems',
      [],
      batchClause
    );

    return records.map((o) => removeEmpty(o)).map((o) => removeKeys(o, ['id']));
  }
}
