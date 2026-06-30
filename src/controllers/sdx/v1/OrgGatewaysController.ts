import {
  Body,
  Controller,
  Example,
  OperationId,
  Path,
  Put,
  Response,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Query,
  Get,
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { GetConfigUsingPattern } from '../../../services/gateway-patterns/evaluator';
import { CreateNamespaceForOrganization } from '../../../services/workflow/create-namespace-sdx';
import {
  OrgActivityService,
  isGatewayPatternPublishSuccessful,
} from '../../../services/workflow/org-activity';
import { GWAService } from '../../../services/gwaapi';
import YAML from 'js-yaml';
import getSubjectToken from '../../../auth/auth-token';
import { Logger } from '../../../logger';
import { ProvisionerService } from '../../../services/provisioner';
import { PostPatternsResponse } from '../../../services/provisioner/provisioner-service';
import { ActivityDetail } from '../../../controllers/v3/types-extra';
import { getOrgActivity } from '../../../services/keystone/activity';
import { transformActivity } from '../../../services/workflow';
import {
  parseBlobString,
  parseJsonString,
  removeEmpty,
  removeKeys,
} from '../../../batch/feed-worker';

const logger = Logger('OrgGatewaysController');

/**
 * @example {
 *   "pattern": "sdx-p2p-consumer.r1",
 *   "parameters": {
 *     "clientId": "LAB.MIN.FOOD.MY-UI",
 *     "serviceId": "LAB.MIN.FOOD.CASE-MANAGEMENT.v1",
 *     "upstreamUrl": "httpbun.com"
 *   }
 * }
 */
interface GatewayPatternConfigRequest {
  pattern: string;
  parameters: { [key: string]: any };
}

interface UnauthorizedJSON {
  code: 'invalid_token';
  message: 'Missing authorization scope. (403)';
}

interface ValidateErrorJSON {
  code: 'validation_error';
  message: 'Invalid input';
  fields: { [name: string]: { message: string } };
}

type SdxGatewayKeyScope = 'organization' | 'subsystem' | 'runtime-group';

/** Kong key tags use `type:client` for subsystem-scoped keys (see sdx-keys.r1). */
const GATEWAY_KEY_TAG_BY_SCOPE: Record<SdxGatewayKeyScope, string> = {
  organization: 'organization',
  subsystem: 'client',
  'runtime-group': 'runtime-group',
};

type GatewayKeyDocument = {
  name: string;
  kid?: string;
  tags?: string[];
  pem?: { public_key?: string };
  jwk?: string;
  set?: { name?: string };
};

function isGatewayKeyInScopes(
  key: GatewayKeyDocument,
  scopes: readonly SdxGatewayKeyScope[]
): boolean {
  const tags = key.tags ?? [];
  return scopes.some((scope) =>
    tags.includes(`type:${GATEWAY_KEY_TAG_BY_SCOPE[scope]}`)
  );
}

@injectable()
@Route('/organizations/{org}')
@Tags('Gateways')
export class OrgGatewaysController extends Controller {
  private keystone: KeystoneService;
  constructor(@inject('KeystoneService') private _keystone: KeystoneService) {
    super();
    this.keystone = _keystone;
  }

  /**
   * Retrieve organization-level activity for the SDX catalog.
   *
   * @summary List organization activity
   * @param org - Organization identifier
   * @param first - Maximum records to return (capped at 100)
   * @param skip - Records to skip for pagination
   *
   * > `Required Scope:` System.Manage
   */
  @Get('/activity')
  @OperationId('listOrgActivity')
  @Security('jwt', ['System.Manage'])
  public async listOrgActivity(
    @Path() org: string,
    @Query() first: number = 20,
    @Query() skip: number = 0
  ): Promise<ActivityDetail[]> {
    const ctx = this.keystone.sudo();
    const records = await getOrgActivity(
      ctx,
      org,
      first > 100 ? 100 : first,
      skip,
      false
    );

    return transformActivity(records)
      .map((o) => removeKeys(o, ['id', 'namespace', 'subject_email']))
      .map((o) => removeEmpty(o))
      .map((o) => parseJsonString(o, ['context']))
      .map((o) => parseBlobString(o));
  }

  /**
   * > `Required Scope:` System.Manage
   *
   * @summary Provision gateway config from pre-defined patterns
   * @produces application/yaml
   */
  @Put('/pattern')
  @OperationId('provisionConfigFromPattern')
  @Security('jwt', ['System.Manage'])
  @SuccessResponse('200', 'OK')
  @Example<any>({
    documents: [
      {
        kind: 'GatewayService',
        name: 'sdx.my-service',
        routes: [],
      },
    ],
  })
  @Response<UnauthorizedJSON>(401, 'Unauthorized', {
    code: 'invalid_token',
    message: 'Missing authorization scope. (403)',
  })
  @Response<ValidateErrorJSON>(422, 'Validation Failed', {
    code: 'validation_error',
    message: 'Invalid input',
    fields: {
      pattern: {
        message: 'unsupported pattern',
      },
    },
  })
  public async generateConfigFromPattern(
    @Path() org: string,
    @Query() action: 'preview' | 'apply' | 'diff' | 'delete',
    @Body() body: GatewayPatternConfigRequest,
    @Request() request: any
  ): Promise<any> {
    const ctx = this.keystone.createContext(request, true);

    const provisionerService = new ProvisionerService(
      process.env.PROVISIONER_URL || 'http://localhost:8080'
    );

    body.parameters['organization'] = org; // inject org into parameters for pattern evaluation

    const result: PostPatternsResponse = await provisionerService.postPatterns(
      body.pattern,
      body.parameters,
      action
    );

    if (action === 'preview') {
      request.res?.header('Content-Type', 'application/yaml; charset=utf-8');
      request.res?.send(YAML.dump(result, { noRefs: true }));
      return '';
    }

    const subjectToken = getSubjectToken(request);
    const incomingKeys = payload.keys as GatewayKeyDocument[];

    // Validate the generated config to ensure it only contains allowed configurations for the organization
    const result = await gwaService.publishGatewayConfiguration(
      action === 'remove' ? 'DELETE' : 'PUT',
      subjectToken,
      config._gateway_id,
      dryRun,
      artifact
    );
    const publishSucceeded = isGatewayPatternPublishSuccessful(
      result,
      action === 'remove' ? 'remove' : 'apply'
    );

    if (!dryRun) {
      let detail: string | undefined;
      let deckBlob: string | undefined;
      const removed = action === 'delete';
      let scope: SdxGatewayKeyScope | undefined;
      let targetName: string | undefined;
      let gatewayKeyName: string | undefined;

      if (body.pattern === 'sdx-keys.r1') {
        scope = body.parameters.runtimeGroupName
          ? 'runtime-group'
          : body.parameters.clientId
            ? 'subsystem'
            : 'organization';
        targetName =
          body.parameters.runtimeGroupName ?? body.parameters.clientId ?? org;

        const scopedKeys = incomingKeys.filter((key) =>
          isGatewayKeyInScopes(key, [scope])
        );
        gatewayKeyName = scopedKeys[0]?.name;

        const keyVerb = removed ? 'removed' : 'published';
        detail = scopedKeys
          .map((key) => `${keyVerb} key ${key.name}`)
          .join('; ');
        if (!removed) {
          deckBlob = YAML.dump(result, { noRefs: true });
        }
      } else if (removed) {
        detail = `removed ${body.pattern}`;
      }

      await new OrgActivityService(ctx, org)
        .logGatewayPatternPublish(publishSucceeded, {
          pattern: body.pattern,
          ...(detail ? { detail } : {}),
          removed,
          scope,
          targetName,
          gatewayKeyName,
          deckBlob,
        })
        .catch((e) =>
          logger.error('[OrgActivity] gateway pattern publish %s', e)
        );
    }
    return result;
  }

  /**
   * Create a gateway for an organization.
   *
   * @summary Register a gateway for an organization
   *
   * @param org - Organization identifier
   * @param name - Runtime group name
   * @param request - HTTP request object for context creation
   */
  @Put('/gateway')
  @OperationId('registerOrganizationGateway')
  @Security('jwt', ['System.Manage'])
  public async registerOrganizationGateway(
    @Path() org: string,
    @Request() request: any
  ): Promise<{ gatewayId: string }> {
    // Create read-only Keystone context
    const context = this.keystone.createContext(request, true);

    // Create the namespace for the runtime group in the SDX edge environment
    const result = await CreateNamespaceForOrganization(context, {
      organization: org,
    });

    return { gatewayId: result.name };
  }
}
