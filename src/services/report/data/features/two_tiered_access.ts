import { GatewayPlugin, GatewayService } from '../../../keystone/types';
import { ReportOfNamespaces } from '../namespaces';

export function has_feature_two_tiered_access(
  ns: ReportOfNamespaces,
  service: GatewayService,
  routeName: string
): Boolean {
  return (
    // check either service or route plugin
    // has the "config.anonymous"
    check(service.plugins) ||
    service.routes.filter((r) => r.name == routeName && check(r.plugins))
      .length > 0
  );
}

function check(plugins: GatewayPlugin[]): boolean {
  return plugins.filter((p) => (p.config as any).anonymous).length > 0;
}
