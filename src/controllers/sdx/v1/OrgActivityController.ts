import {
  Controller,
  Get,
  OperationId,
  Path,
  Query,
  Request,
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
import {
  getGwaProductEnvironment,
  getPermittedNamespaceNames,
  injectResSvrAccessTokenToContext,
  transformActivity,
} from '../../../services/workflow';
import { getCombinedOrganizationActivity } from '../../../services/workflow/org-activity';
import { SubsystemService } from '../../../services/batch/subsystem';
import { ActivityDetail } from '../../v3/types-extra';
import { assertEqual } from '../../ioc/assert';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { ActivitySortOptions } from '../../../services/keystone/activity';

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
   * Callers with org-wide `System.Manage` get the full activity feed. Callers who
   * only hold `Subsystem.Manage` also get the full feed, but only if they've been
   * granted `Subsystem.Manage` on at least one subsystem gateway belonging to
   * this organization; otherwise the request is denied.
   *
   * > `Required Scope:` System.Manage or Subsystem.Manage
   *
   * @summary List organization activity
   * @param org Organization name
   * @param first Maximum records to return (capped at 100)
   * @param skip Records to skip for pagination
   * @param request HTTP request object for context creation
   */
  @Get('/activity')
  @OperationId('listOrganizationActivity')
  @Security('jwt', ['System.Manage', 'Subsystem.Manage'])
  public async listOrganizationActivity(
    @Path() org: string,
    @Query() first: number = 20,
    @Query() skip: number = 0,
    @Query() sortBy: ActivitySortOptions = 'createdAtDesc',
    @Request() request: any
  ): Promise<ActivityDetail[]> {
    const callerScopes = request.user.scope || [];
    const hasOrgWideAccess = callerScopes.includes('System.Manage');

    if (!hasOrgWideAccess) {
      const accessCtx = this.keystone.createContext(request);
      const envCtx = await getGwaProductEnvironment(accessCtx, true);
      await injectResSvrAccessTokenToContext(envCtx);
      const namespaces = await getPermittedNamespaceNames(envCtx, [
        'Subsystem.Manage',
      ]);
      const orgSubsystems = await new SubsystemService().listSubsystemsByOrganization(
        accessCtx,
        org
      );
      const hasSubsystemInOrg = orgSubsystems.some((s) =>
        namespaces.includes(s.namespace)
      );
      assertEqual(
        hasSubsystemInOrg,
        true,
        'organization',
        'Not authorized to access this organization activity'
      );
    }

    const ctx = this.keystone.sudo();
    const records = await getCombinedOrganizationActivity(
      ctx,
      org,
      first > 100 ? 100 : first,
      skip,
      sortBy
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
