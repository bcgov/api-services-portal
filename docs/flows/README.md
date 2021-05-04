# Process Flows

# Credential Issuers

| Flow                           | Mode      | Registration            | Management                                             |
|--------------------------------|-----------|-------------------------|--------------------------------------------------------|
| Oauth2 Client Credentials Flow | Automatic | Anonymous Client Reg    | manage-clients (delete, activate, role assignment)     |
| Oauth2 Client Credentials Flow | Automatic | Managed (create-client) | Registration Token (delete, activate, role assignment) |
| Oauth2 Client Credentials Flow | Automatic | Initial Access Token    | Registration Token (delete, activate, role assignment) |
| Oauth2 Authorization Code Flow | Automatic | N/A                     | manage-users (role assignment)                         |
| Oauth2 Client Credentials Flow | Manual    | Anonymous Client Reg    | N/A                                                    |
| Oauth2 Client Credentials Flow | Manual    | Managed (create-client) | N/A                                                    |
| Oauth2 Client Credentials Flow | Manual    | Initial Access Token    | N/A                                                    |
| Oauth2 Authorization Code Flow | Manual    | N/A                     | N/A                                                    |
| Kong API Key with ACL Flow     | Automatic | Via Portal              | Via Portal                                             |

## Onboarding a new API

The USER-JOURNEY.md documentation under `gwa-api` provides the steps required to configure the Gateway and make the API available for discovery.

![New API](./images/NewAPI.png)


[new-api websequencediagram](new-api.md)

## Support Authentication Flows

### API Key w/ ACL

![API Key](./images/ApiKey.png)

### Anonymous Client Registration (auto issuing)

In this scenario, the APS Portal requires the `manage-clients` role in the Realm of the particular OIDC Provider.

![Anon Reg with Auto Issuing](./images/AnonReg.png)

### Others

* OIDC with Anonymous Client Registration (manage-clients) (auto enable) - API Portal has `manage-clients`
* OIDC with Anonymous Client Registration (manually enable) - API Portal has no authorization
* OIDC with Managed Client Registration (manage-clients) (auto enable) - API Portal has `manage-clients`
* OIDC with Managed Client Registration (create-client) (manually enable) - API Portal has `create-client`
* OIDC with IAT Client Registration - API Portal has limited `create-client` permissions

