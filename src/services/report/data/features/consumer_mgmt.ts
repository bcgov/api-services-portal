import { GatewayService } from '../../../keystone/types';
import { ReportOfNamespaces } from '../namespaces';

export function has_feature_consumer_mgmt(
  ns: ReportOfNamespaces,
  service: GatewayService,
  routeName: string
): Boolean {
  return (
    ['client-credentials', 'kong-api-key-acl'].indexOf(
      service.environment?.flow
    ) >= 0
  );
}
