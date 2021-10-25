import getSubjectToken from 'auth/auth-token';
import { PolicyQuery, UMAPolicyService } from '../../uma2';
import { getMyNamespaces } from '../../workflow';
import {
  EnvironmentContext,
  NamespaceSummary,
} from '../../workflow/get-namespaces';
import { ReportOfNamespaces } from './namespaces';

interface ReportOfNamespaceAccess {
  namespace: string;
  subject: string;
  scope: string;
}

/*
  Get Namespace Access
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
        if (policy.clients) {
          policy.clients.forEach((subject) => {
            policy.scopes.forEach((scope) => {
              data.push({
                namespace: ns.name,
                subject,
                scope,
              });
            });
          });
        } else {
          policy.users.forEach((subject) => {
            policy.scopes.forEach((scope) => {
              data.push({
                namespace: ns.name,
                subject,
                scope,
              });
            });
          });
        }
      });
      return data;
    }
  );

  const reportOfReports = await Promise.all(dataPromises);
  return [].concat.apply([], reportOfReports);
}
