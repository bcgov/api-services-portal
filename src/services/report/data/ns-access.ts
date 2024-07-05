import { KeycloakUserService } from '../../keycloak';
import { lookupUsersByUsernames } from '../../keystone';
import { Keystone } from '@keystonejs/keystone';
import { PolicyQuery, UMAPolicyService } from '../../uma2';
import { EnvironmentContext } from '../../workflow/get-namespaces';
import { ReportOfNamespaces } from './namespaces';

interface ReportOfNamespaceAccess {
  namespace: string;
  displayName?: string;
  subject: string;
  subjectName: string;
  subjectEmail: string;
  scope: string;
}

/*
 */
export async function getNamespaceAccess(
  context: Keystone,
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
              displayName: ns.displayName,
              subject,
              subjectName: '',
              subjectEmail: '',
              scope,
            });
          });
        }

        if (policy.clients) {
          policy.clients.forEach(doScopes);
        } else if (policy.users) {
          policy.users.forEach(doScopes);
        } else if (policy.groups) {
          policy.groups.forEach(doScopes);
        }
      });

      const usernames = data.map((d) => d.subject);
      const users = await lookupUsersByUsernames(context, usernames);
      data.forEach((d) => {
        const user = users.filter((u) => u.username === d.subject).pop();
        d.subjectName = user?.name;
        d.subjectEmail = user?.email;
      });

      return data;
    }
  );

  const reportOfReports = await Promise.all(dataPromises);
  return [].concat.apply([], reportOfReports);
}
