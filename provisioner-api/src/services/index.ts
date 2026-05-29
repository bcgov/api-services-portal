import type { Clients } from '../clients/index.js';
import { DirectoryService } from './directory-service.js';
import { SdxMemberService } from './sdx-member-service.js';
import { GatewayAdminService } from './gateway-admin-service.js';
import { CommonSsoService } from './common-sso-service.js';

export {
  DirectoryService,
  SdxMemberService,
  GatewayAdminService,
  CommonSsoService,
};

export interface Services {
  directory: DirectoryService;
  sdxMember: SdxMemberService;
  gatewayAdmin: GatewayAdminService;
  commonSso: CommonSsoService;
}

export function buildServices(clients: Clients): Services {
  return {
    directory: new DirectoryService(clients.aps),
    sdxMember: new SdxMemberService(clients.sdx),
    gatewayAdmin: new GatewayAdminService(clients.gwa),
    commonSso: new CommonSsoService(clients.css),
  };
}
