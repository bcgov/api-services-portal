import { GatewayService } from '../../../../services/keystone/types';
import { ReportOfNamespaces } from '../namespaces';
import { ReportOfProducts } from '../products';

export function has_feature_api_directory_for_product(
  ns: ReportOfNamespaces,
  product: ReportOfProducts
): Boolean {
  return product.prod_env_active === 'Y';
}

export function has_feature_api_directory_for_service(
  ns: ReportOfNamespaces,
  service: GatewayService,
  routeName: string
): Boolean {
  return Boolean(service.environment?.active);
}
