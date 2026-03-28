import { GatewayService } from '../../../keystone/types';
import { ReportOfNamespaces } from '../namespaces';

export function has_feature_shared_idp(
  ns: ReportOfNamespaces,
  service: GatewayService,
  routeName: string
): Boolean {
  return Boolean(service.environment?.credentialIssuer?.inheritFrom?.name);
}
