import { GatewayService } from '../../../keystone/types';
import { ReportOfNamespaces } from '../namespaces';

// If there is a Route, then can consider gateway
// management being used
export function has_gateway_mgmt(
  ns: ReportOfNamespaces,
  service: GatewayService,
  routeName: string
): Boolean {
  return Boolean(true);
}
