import { GatewayService } from '../../../keystone/types';
import { ReportOfNamespaces } from '../namespaces';
import { ReportOfProducts } from '../products';

export function has_feature_dataset_in_catalog(
  ns: ReportOfNamespaces,
  product: ReportOfProducts
): Boolean {
  return product.dataset_in_catalog;
}
