import type { FastifyBaseLogger } from 'fastify';
import type { Clients } from '../clients/index.js';
import { DirectoryService } from './directory-service.js';
import { SdxMemberService } from './sdx-member-service.js';
import { GatewayAdminService } from './gateway-admin-service.js';
import { CommonSsoService } from './common-sso-service.js';
import { PolicyService } from './policy-service.js';
import { GatewayPatternEvaluatorService } from './gateway-pattern-evaluator.js';

export {
  DirectoryService,
  SdxMemberService,
  GatewayAdminService,
  CommonSsoService,
  GatewayPatternEvaluatorService,
};

export interface Services {
  directory: DirectoryService;
  sdxMember: SdxMemberService;
  gatewayAdmin: GatewayAdminService;
  commonSso: CommonSsoService;
  policyEngine: PolicyService;
  patternEvaluator: GatewayPatternEvaluatorService;
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
    directory: new DirectoryService(clients.aps, child(logger, 'directory')),
    sdxMember: new SdxMemberService(clients.sdx, child(logger, 'sdxMember')),
    gatewayAdmin: new GatewayAdminService(
      clients.gwa,
      child(logger, 'gatewayAdmin')
    ),
    commonSso: new CommonSsoService(clients.css, child(logger, 'commonSso')),
    policyEngine: new PolicyService(clients.aps, child(logger, 'policyEngine')),
    patternEvaluator: new GatewayPatternEvaluatorService(
      clients.sdx,
      child(logger, 'patternEvaluator')
    ),
  };
}
