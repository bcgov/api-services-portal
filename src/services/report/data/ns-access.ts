import { PolicyQuery, UMAPolicyService } from '../../uma2';
import { EnvironmentContext } from '../../workflow/get-namespaces';
import { ReportOfNamespaces } from './namespaces';

interface ReportOfNamespaceAccess {
  namespace: string;
  subject: string;
  scope: string;
}

/*
 */
export async function getNamespaceAccess(
  envCtx: EnvironmentContext,
  namespaces: ReportOfNamespaces[]
): Promise<ReportOfNamespaceAccess[]> {
  const policyApi = new UMAPolicyService(
    envCtx.uma2.policy_endpoint,
    envCtx.accessToken
  );

  const dataPromises = namespaces.map(
    async (ns): Promise<ReportOfNamespaceAccess[]> => {
      const policies = await policyApi.listPolicies({
        resource: ns.resource_id,
      } as PolicyQuery);

      // policies will either have users or clients
      let data: ReportOfNamespaceAccess[] = [];
      policies.forEach((policy) => {
        function doScopes(subject: string) {
          policy.scopes.forEach((scope) => {
            data.push({
              namespace: ns.name,
              subject,
              scope,
            });
          });
        }

        if (policy.clients) {
          policy.clients.forEach(doScopes);
        } else {
          policy.users.forEach(doScopes);
        }
      });
      return data;
    }
  );

  const reportOfReports = await Promise.all(dataPromises);
  return [].concat.apply([], reportOfReports);
}
