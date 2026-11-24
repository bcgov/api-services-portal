import KeycloakAdminClient from '@keycloak/keycloak-admin-client';

const ADMIN_API_SCOPE = 'kc-admin-api';

/**
 * Keycloak 26 rejects Admin REST calls unless the token audience includes the
 * admin API. That audience is added by the optional kc-admin-api client scope.
 * Clients that cannot request the scope keep the previous token request.
 */
export async function authenticateAdminClient(
  kcAdminClient: KeycloakAdminClient,
  clientId: string,
  clientSecret: string
): Promise<void> {
  const credentials = {
    grantType: 'client_credentials' as const,
    clientId,
    clientSecret,
  };

  try {
    await kcAdminClient.auth({
      ...credentials,
      scopes: [ADMIN_API_SCOPE],
    });
  } catch (err) {
    if (!isInvalidScope(err)) {
      throw err;
    }
    await kcAdminClient.auth(credentials);
  }
}

function isInvalidScope(err: unknown): boolean {
  const responseData = (err as { responseData?: unknown } | null)?.responseData;
  const text = `${err instanceof Error ? err.message : String(err)} ${
    responseData == null ? '' : JSON.stringify(responseData)
  }`;
  return text.includes('invalid_scope');
}
