import {
  Controller,
  Get,
  OperationId,
  Query,
  Request,
  Response,
  Route,
  Security,
  Tags,
} from '@tsoa/runtime';
import { inject, injectable } from 'tsyringe';
import { ForbiddenError } from '../../../auth/forbidden-error';
import {
  ActivitySortOptions,
  getPersonalActivity,
} from '../../../services/keystone/activity';
import { transformActivity } from '../../../services/workflow';
import { ActivityDetail } from '../../v3/types-extra';
import { KeystoneService } from '../../ioc/keystoneInjector';

interface PersonalActivityDetail extends ActivityDetail {
  result: string;
}

@injectable()
@Route('/activity')
@Tags('Activity')
export class ActivityController extends Controller {
  constructor(@inject('KeystoneService') private keystone: KeystoneService) {
    super();
  }

  /**
   * List activity associated with the authenticated caller's email.
   *
   * @summary List my activity
   * @param filter Use me to match the authenticated user's email
   * @param first Maximum records to return (capped at 100)
   * @param skip Records to skip for pagination
   */
  @Get()
  @OperationId('listPersonalActivity')
  @Security('jwt')
  @Response(403, 'The authenticated user has no email address')
  public async listPersonalActivity(
    @Query() filter: 'me',
    @Request() request: any,
    @Query() first: number = 20,
    @Query() skip: number = 0,
    @Query() sortBy: ActivitySortOptions = 'createdAtDesc'
  ): Promise<PersonalActivityDetail[]> {
    const claim = request.user?.email;
    const email = typeof claim === 'string' ? claim.trim().toLowerCase() : '';
    if (!email) {
      throw new ForbiddenError('permission_denied', {
        message: 'An email address is required to view personal activity',
      });
    }

    const records = await getPersonalActivity(
      this.keystone.sudo(),
      email,
      first,
      skip,
      sortBy
    );

    return transformActivity(records).map(
      ({ message, params, result, activityAt, blob }) => {
        const payload = blob?.blob ? JSON.parse(blob.blob) : undefined;
        const displayName = payload?.requester?.displayName;
        if (
          params.actor === 'Unknown Actor' &&
          typeof displayName === 'string' &&
          displayName.trim()
        ) {
          params = { ...params, actor: displayName.trim() };
        }

        return {
          message,
          params,
          result,
          activityAt,
          blob: payload,
        };
      }
    );
  }
}
