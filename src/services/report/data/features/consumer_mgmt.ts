import { GatewayService } from '../../../keystone/types';
import { ReportOfNamespaces } from '../namespaces';
import { ReportOfProducts } from '../products';

export function has_feature_consumer_mgmt(
  ns: ReportOfNamespaces,
  product: ReportOfProducts
): Boolean {
  return Boolean(
    ['client-credentials', 'kong-api-key-acl'].indexOf(product.prod_env_flow) >=
      0 && product.prod_env_active === 'Y'
  );
}
