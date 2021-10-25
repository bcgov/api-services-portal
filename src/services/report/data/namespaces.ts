import { KeycloakGroupService } from '../../keycloak';
import { getMyNamespaces } from '../../workflow';
import {
  EnvironmentContext,
  NamespaceSummary,
} from '../../workflow/get-namespaces';

export interface ReportOfNamespaces {
  resource_id: string;
  name: string;
  perm_protected_ns: string[];
  perm_domains: string[];
  perm_data_plane: string[];
}

/*
  Get Namespaces
 */
export async function getNamespaces(
  envCtx: EnvironmentContext
): Promise<ReportOfNamespaces[]> {
  const nsList: NamespaceSummary[] = await getMyNamespaces(envCtx);

  const kcGroupService = new KeycloakGroupService(
    envCtx.issuerEnvConfig.issuerUrl
  );
  await kcGroupService.login(
    envCtx.issuerEnvConfig.clientId,
    envCtx.issuerEnvConfig.clientSecret
  );

  const dataPromises = nsList.map(
    async (ns): Promise<ReportOfNamespaces> => {
      const group = await kcGroupService.getGroup('ns', ns.name);
      return {
        resource_id: ns.id,
        name: ns.name,
        perm_protected_ns: group.attributes['perm-protected-fs'],
        perm_domains: group.attributes['perm-domains'],
        perm_data_plane: group.attributes['perm-data-plane'],
      };
    }
  );

  return await Promise.all(dataPromises);
}
