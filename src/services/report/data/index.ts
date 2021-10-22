import {
  KeycloakTokenService,
  OpenidWellKnown,
  Uma2WellKnown,
} from '../../keycloak';
import { Policy, UMAPolicyService } from '../../uma2';

const getIdPAccess = function (name: string) {
  return {} as ResourceOwner;
};

const getRelatedUsernames = function (policy: Policy): string[] {
  return policy.users;
};

const getRelatedClients = function (policy: Policy): string[] {
  return policy.clients;
};

const onlyValues = (n: any) => n;

interface ResourceOwner {
  clientId: string;
  clientSecret: string;
  openidWellKnown: OpenidWellKnown;
  uma2WellKnown: Uma2WellKnown;
}

export async function processPolicies(policies: Policy[]) {
  const usernames = policies
    .map(getRelatedUsernames)
    .filter(onlyValues)
    .concat();
  const clients = policies.map(getRelatedClients).filter(onlyValues).concat();
  console.log('UN = ' + usernames);
  console.log('CL = ' + clients);
}

export async function getNamespaces() {
  return ['ns1', 'ns2'] as string[];
}

export async function getPolicies() {
  const idp = await getIdPAccess('credIssuer');

  const kcService = new KeycloakTokenService(
    idp.openidWellKnown.token_endpoint
  );
  const accessToken = await kcService.getKeycloakSession(
    idp.clientId,
    idp.clientSecret
  );

  return await new UMAPolicyService(
    idp.uma2WellKnown.policy_endpoint,
    accessToken
  ).listPolicies({});
}
