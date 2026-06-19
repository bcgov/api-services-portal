import type { FastifyBaseLogger } from 'fastify';
import type { Clients } from '../clients/index.js';
import { DirectoryService } from './directory-service.js';
import { SdxMemberService } from './subsystems-service.js';
import { GatewayAdminService } from './gateway-admin-service.js';
import { CommonSsoService } from './common-sso-service.js';
import { PolicyService } from './policy-service.js';
import { PatternsEvaluatorService } from './patterns-evaluator.js';
import { IntegrationAccessService } from './integration-access-service.js';
import { ResourceDispatcher } from './resource-dispatcher.js';
import { ActivityService } from './activity-service.js';

export {
  ActivityService,
  DirectoryService,
  SdxMemberService,
  GatewayAdminService,
  CommonSsoService,
  PatternsEvaluatorService,
};

export interface Services {
  activity: ActivityService;
  directory: DirectoryService;
  sdxMember: SdxMemberService;
  gatewayAdmin: GatewayAdminService;
  commonSso: CommonSsoService;
  integrationAccess: IntegrationAccessService;
  policyEngine: PolicyService;
  patternsEvaluator: PatternsEvaluatorService;
  resourceDispatcher: ResourceDispatcher;
}

function child(
  parent: FastifyBaseLogger | undefined,
  service: string
): FastifyBaseLogger | undefined {
  return parent?.child({ component: 'service', service });
}

export function buildServices(
  clients: Clients,
  logger?: FastifyBaseLogger
): Services {
  return {
    activity: new ActivityService(clients.feed, child(logger, 'activity')),
    directory: new DirectoryService(clients.aps, child(logger, 'directory')),
    sdxMember: new SdxMemberService(clients.sdx, child(logger, 'sdxMember')),
    gatewayAdmin: new GatewayAdminService(
      clients.gwa,
      child(logger, 'gatewayAdmin')
    ),
    commonSso: new CommonSsoService(clients.css, child(logger, 'commonSso')),
    integrationAccess: new IntegrationAccessService(
      clients.sdx,
      child(logger, 'integrationAccess')
    ),
    policyEngine: new PolicyService(child(logger, 'policyEngine')),
    patternsEvaluator: new PatternsEvaluatorService(
      clients.sdx,
      child(logger, 'patternsEvaluator')
    ),
    resourceDispatcher: new ResourceDispatcher(
      {
        directory: new DirectoryService(
          clients.aps,
          child(logger, 'directory')
        ),
        sdxMember: new SdxMemberService(
          clients.sdx,
          child(logger, 'sdxMember')
        ),
        gatewayAdmin: new GatewayAdminService(
          clients.gwa,
          child(logger, 'gatewayAdmin')
        ),
        commonSso: new CommonSsoService(
          clients.css,
          child(logger, 'commonSso')
        ),
      },
      child(logger, 'resourceDispatcher')
    ),
  };
}
