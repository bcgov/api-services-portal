import { GatewayService } from '../../../keystone/types';
import { ReportOfNamespaces } from '../namespaces';
import { ReportOfProducts } from '../products';

export function has_feature_protected_externally(
  ns: ReportOfNamespaces,
  product: ReportOfProducts
): Boolean {
  return 'protected-externally' === product.prod_env_flow;
}
