import { GatewayService } from '../../../../services/keystone/types';
import { ReportOfNamespaces } from '../namespaces';

export function has_feature_api_directory(
  ns: ReportOfNamespaces,
  service: GatewayService,
  routeName: string
): Boolean {
  return Boolean(service?.environment?.active);
}
