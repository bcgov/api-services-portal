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

const logger = Logger('OrgGatewaysController');

/**
 * @example {
 *   "pattern": "sdx-p2p-consumer.r1",
 *   "parameters": {
 *     "client_id": "LAB.MIN.FOOD.MY-UI",
 *     "service_id": "LAB.MIN.FOOD.CASE-MANAGEMENT.v1",
 *     "upstream_url": "httpbun.com"
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

  /**
   * Create a new gateway for an organization
   * PUT /gateway
   */

  /**
   * > `Required Scope:` System.Manage
   *
   * @summary Generate gateway config from pre-defined patterns
   * @produces application/yaml
   */
  @Put('/pattern')
  @OperationId('generateConfigFromPattern')
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
    @Query() action: 'preview' | 'apply' | 'remove',
    @Query() dryRun: boolean,
    @Body() body: GatewayPatternConfigRequest,
    @Request() request: any
  ): Promise<any> {
    const ctx = this.keystone.createContext(request, true);

    body.parameters['organization'] = org; // inject org into parameters for pattern evaluation

    const config = await GetConfigUsingPattern(ctx, body);

    const gwaService = new GWAService(process.env.GWA_API_URL);

    const payload: any = {
      services: [],
      keys: [],
      key_sets: [],
    };

    config.documents.forEach((doc: any) => {
      if (doc.kind === 'GatewayService') {
        delete doc.kind;
        payload.services.push(doc);
      } else if (doc.kind === 'GatewayKey') {
        delete doc.kind;
        payload.keys.push(doc);
      } else if (doc.kind === 'GatewayKeySet') {
        delete doc.kind;
        payload.key_sets.push(doc);
      }
    });

    logger.debug('Artifacts %j', payload);

    const artifact = YAML.dump(payload, { noRefs: true });

    if (action === 'preview') {
      request.res?.header('Content-Type', 'application/yaml; charset=utf-8');
      request.res?.send(artifact);
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
    const publishSucceeded = isGatewayPatternPublishSuccessful(result);

    if (!dryRun) {
      let detail: string | undefined;
      let deckBlob: string | undefined;
      const removed = action === 'remove';
      let scope: SdxGatewayKeyScope | undefined;
      let targetName: string | undefined;
      let gatewayKeyName: string | undefined;

      if (body.pattern === 'sdx-keys.r1') {
        scope = body.parameters.runtime_group_name
          ? 'runtime-group'
          : body.parameters.client_id
            ? 'subsystem'
            : 'organization';
        targetName =
          body.parameters.runtime_group_name ??
          body.parameters.client_id ??
          org;

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

    request.res?.header('Content-Type', 'application/yaml; charset=utf-8');
    request.res?.send(YAML.dump(result, { noRefs: true }));
    return '';
  }
}
