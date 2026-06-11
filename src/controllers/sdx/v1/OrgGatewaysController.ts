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
import { OrgActivityService } from '../../../services/workflow/org-activity';
import { GWAService } from '../../../services/gwaapi';
import YAML from 'js-yaml';
import getSubjectToken from '../../../auth/auth-token';
import { Logger } from '../../../logger';
import { ProvisionerService } from '../../../services/provisioner';
import { PostPatternsResponse } from '../../../services/provisioner/provisioner-service';

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
      request.res?.send(result);
      return '';
    }

    if (action !== 'diff') {
      let detail: string | undefined;
      let deckBlob: string | undefined;
      const removed = action === 'delete';
      let scope: SdxGatewayKeyScope | undefined;
      let targetName: string | undefined;

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

        //   if (removed) {
        //     const removedKeyNames = incomingKeys
        //       .filter((key) => isGatewayKeyInScopes(key, [scope]))
        //       .map((key) => key.name);
        //     detail = removedKeyNames
        //       .map((name) => `removed key ${name}`)
        //       .join('; ');
        //   } else {
        //     deckBlob = YAML.dump(result, { noRefs: true });
        //   }
        // } else if (removed) {
        //   detail = `removed ${body.pattern}`;
        // }
        deckBlob = YAML.dump(result, { noRefs: true });

        await new OrgActivityService(ctx, org)
          .logGatewayPatternPublish(true, {
            pattern: body.pattern,
            ...(detail ? { detail } : {}),
            removed,
            scope,
            targetName,
            deckBlob,
          })
          .catch((e) =>
            logger.error('[OrgActivity] gateway pattern publish %s', e)
          );
      }
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
