import { GatewayPlugin, GatewayService } from '../../../keystone/types';
import { ReportOfNamespaces } from '../namespaces';

export function has_feature_protected(
  ns: ReportOfNamespaces,
  service: GatewayService,
  routeName: string
): Boolean {
  return (
    // check either a `jwt-keycloak`, `oidc` or `acl`
    // plugins exists and is active
    check(service.plugins) ||
    service.routes.filter((r) => r.name == routeName && check(r.plugins))
      .length > 0
  );
}

function check(plugins: GatewayPlugin[]): boolean {
  return (
    plugins
      // .filter((p: any) => p.enabled)
      .filter((p: any) => ['jwt-keycloak', 'oidc', 'acl'].indexOf(p.name) >= 0)
      .length > 0
  );
}
