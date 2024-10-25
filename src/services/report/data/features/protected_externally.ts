import { GatewayService } from '../../../keystone/types';
import { ReportOfNamespaces } from '../namespaces';

// The reality is that this is not a real scenario
// by definition "protected externally" means there is no use
// of the gateway and therefore should not have Gateway Services
export function has_feature_protected_externally(
  ns: ReportOfNamespaces,
  service: GatewayService,
  routeName: string
): Boolean {
  return service.environment?.flow == 'protected-externally';
}
