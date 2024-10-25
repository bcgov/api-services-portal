import { GatewayService } from '../../../keystone/types';
import { ReportOfNamespaces } from '../namespaces';

const re = /(dev.|test.|tst.|dlv.|delivery.|-dev|-test|-d.|-t.).*$/;

export function is_production(
  ns: ReportOfNamespaces,
  service: GatewayService,
  routeName: string
): Boolean {
  return (
    service.routes.filter(
      (r) =>
        r.name == routeName &&
        (r.hosts as any).filter((h: string) => checkNonProd(h) == false)
          .length > 0
    ).length > 0
  );
}

function checkNonProd(host: string) {
  return re.test(host);
}
