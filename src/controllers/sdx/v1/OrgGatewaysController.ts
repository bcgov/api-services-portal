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
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { KeystoneService } from '../../ioc/keystoneInjector';
import { CreateNamespaceForOrganization } from '../../../services/workflow/create-namespace-sdx';
import {
  OrgActivityService,
  isGatewayPatternPublishSuccessful,
} from '../../../services/workflow/org-activity';
import YAML from 'js-yaml';
import { Logger } from '../../../logger';
import { ProvisionerService } from '../../../services/provisioner';
import { PostPatternsResponse } from '../../../services/provisioner/provisioner-service';

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
   * > `Required Scope:` System.Manage or GatewayPattern.Publish
   *
   * @summary Provision gateway config from pre-defined patterns
   * @produces application/yaml
   */
  @Put('/patterns/{pattern}')
  @OperationId('provisionConfigFromPattern')
  @Security('jwt', ['System.Manage', 'GatewayPattern.Publish'])
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
  public async provisionConfigFromPattern(
    @Path() org: string,
    @Path() pattern: string,
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
      pattern,
      body.parameters,
      action
    );

    if (action === 'preview') {
      request.res?.header('Content-Type', 'application/yaml; charset=utf-8');
      request.res?.send(YAML.dump(result, { noRefs: true }));
      return '';
    }

    // const subjectToken = getSubjectToken(request);
    // const incomingKeys = payload.keys as GatewayKeyDocument[];

    if (action == 'apply' || action == 'delete') {
      // Validate the generated config to ensure it only contains allowed configurations for the organization
      const publishSucceeded = isGatewayPatternPublishSuccessful(
        result,
        action === 'delete' ? 'delete' : 'apply'
      );

      let detail: string | undefined;
      let deckBlob: string | undefined;
      const removed = action === 'delete';
      let scope: SdxGatewayKeyScope | undefined;
      let targetName: string | undefined;
      let gatewayKeyName: string | undefined;

      if (pattern === 'sdx-keys.r1') {
        scope = body.parameters.runtimeGroupName
          ? 'runtime-group'
          : body.parameters.clientId
          ? 'subsystem'
          : 'organization';
        targetName =
          body.parameters.runtimeGroupName ?? body.parameters.clientId ?? org;

        // const scopedKeys = incomingKeys.filter((key) =>
        //   isGatewayKeyInScopes(key, [scope])
        // );
        // gatewayKeyName = scopedKeys[0]?.name;

        // const keyVerb = removed ? 'removed' : 'published';
        // detail = scopedKeys
        //   .map((key) => `${keyVerb} key ${key.name}`)
        //   .join('; ');
        if (!removed) {
          deckBlob = YAML.dump(result, { noRefs: true });
        }
      } else if (removed) {
        detail = `removed ${pattern}`;
      }

      await new OrgActivityService(ctx, org)
        .logGatewayPatternPublish(publishSucceeded, {
          pattern,
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
