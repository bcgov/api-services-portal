import {
  Controller,
  Get,
  OperationId,
  Path,
  Query,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import {
  parseBlobString,
  parseJsonString,
  removeEmpty,
  removeKeys,
} from '../../../batch/feed-worker';
import { transformActivity } from '../../../services/workflow';
import { getCombinedOrganizationActivity } from '../../../services/workflow/org-activity';
import { ActivityDetail } from '../../v3/types-extra';
import { KeystoneService } from '../../ioc/keystoneInjector';

@injectable()
@Route('/organizations/{org}')
@Tags('Organizations')
export class OrgActivityController extends Controller {
  private keystone: KeystoneService;

  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Retrieve organization activity including gateway administration events and
   * organization-scoped SDX activity (connections, subsystems, services, etc.).
   *
   * > `Required Scope:` System.Manage
   *
   * @summary List organization activity
   * @param org Organization name
   * @param first Maximum records to return (capped at 100)
   * @param skip Records to skip for pagination
   */
  @Get('/activity')
  @OperationId('listOrganizationActivity')
  @Security('jwt', ['System.Manage'])
  public async listOrganizationActivity(
    @Path() org: string,
    @Query() first: number = 20,
    @Query() skip: number = 0
  ): Promise<ActivityDetail[]> {
    const ctx = this.keystone.sudo();
    const records = await getCombinedOrganizationActivity(
      ctx,
      org,
      first > 100 ? 100 : first,
      skip
    );

    return transformActivity(records)
      .map((o) => removeKeys(o, ['id']))
      .map((o: any) => {
        const { params, ...rest } = o;
        return { ...removeEmpty(rest), params };
      })
      .map((o) => parseJsonString(o, ['context']))
      .map((o) => parseBlobString(o));
  }
}
