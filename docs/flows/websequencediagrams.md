# Web Sequence Diagrams Models

## API Owner Login

```
title API Owner Login

actor API Owner
actor APS Portal
actor APS IdP

API Owner -> APS Portal : Browse To
APS Portal -> oidc.gov.bc.ca [xtmke7ky] : Login (keycloak-oidc)
API Owner -> oidc.gov.bc.ca [xtmke7ky] : Select IDIR
oidc.gov.bc.ca [xtmke7ky] -> oidc.gov.bc.ca [idir] : Broker
oidc.gov.bc.ca [idir] -> sfs7.gov.bc.ca : Broker
sfs7.gov.bc.ca -> logon7.gov.bc.ca : Broker
API Owner -> logon7.gov.bc.ca : Submit IDIR Credentials
logon7.gov.bc.ca -> sfs7.gov.bc.ca : Callback
sfs7.gov.bc.ca -> oidc.gov.bc.ca [idir] : Callback
oidc.gov.bc.ca [idir] -> oidc.gov.bc.ca [xtmke7ky] : Callback
oidc.gov.bc.ca [xtmke7ky] -> APS Portal : Callback
```

## Switch Namespace

```
title Switch Namespace

actor API Owner
actor APS Portal
actor APS IdP

API Owner -> APS Portal : Browse To
API Owner -> APS Portal : Switch Namespace
APS Portal -> APS IdP : getUma2FromIssuer (GET .well-known)
APS Portal -> APS IdP : getRequestingPartyToken (POST uma2.token_endpoint)
APS Portal -> APS Portal : Update Session Permissions
APS Portal -> API Owner : Ack
```

## Create Service Account

```
title Create Service Account

actor APS Portal
actor ServiceAccount
actor ClientCredentials
actor KeystoneJS
actor ClientCredentials
actor Feeder API
actor IdP
actor Kong

APS Portal -> ServiceAccount : CreateServiceAccount
ServiceAccount -> KeystoneJS : lookupProductEnvironmentServicesBySlug
ServiceAccount -> ClientCredentials : registerClient
ClientCredentials -> KeystoneJS : lookupCredentialIssuerById
ClientCredentials -> IdP : getOpenidFromIssuer (GET .well-known)
ClientCredentials -> IdP : getKeycloakSession (openid.token_endpoint)
ClientCredentials -> IdP : clientRegistration (openid.registration_endpoint)
ServiceAccount -> Kong : create Kong Consumer
ServiceAccount -> KeystoneJS : AddClientConsumer
KeystoneJS -> Feeder API : Force Sync Kong Consumer
Feeder API -> Kong : Query Consumer
Feeder API -> KeystoneJS : Update Kong Consumer
ServiceAccount -> KeystoneJS : addServiceAccess
ServiceAccount -> KeystoneJS : lookupCredentialIssuerById
ServiceAccount -> IdP : getOpenidFromIssuer
ServiceAccount -> IdP : getKeycloakSession (openid.token_endpoint))
ServiceAccount -> IdP : updateClientRegistration (enable=true) (openid.registration_endpoint)
ServiceAccount -> IdP : syncAndApply (Scopes)
ServiceAccount -> IdP : getUma2FromIssuer
ServiceAccount -> IdP : getKeycloakSession (openid.token_endpoint)
ServiceAccount -> IdP : createUmaPolicy (uma2.policy_endpoint)
ServiceAccount -> KeystoneJS : markActiveTheServiceAccess

```

## Request Access

```
title Request Access

actor Developer
actor APS Portal
actor AccessRequest.Apply
actor GenerateCredentials
actor ClientCredentials
actor KeystoneJS
actor IdP

Developer -> APS Portal : Login (Redirect)
Developer -> oidc.gov.bc.ca : Login (BCeID, IDIR, Github)
oidc.gov.bc.ca -> APS Portal : Callback
Developer -> APS Portal : Request Access
APS Portal -> KeystoneJS : Create Access Request
KeystoneJS -> APS Portal : afterChange Hook Workflow Apply
APS Portal -> AccessRequest.Apply : Generate Creds
AccessRequest.Apply -> KeystoneJS : lookupEnvironmentAndApplicationByAccessRequest
AccessRequest.Apply -> GenerateCredential : lookupProductEnvironmentServices
AccessRequest.Apply -> GenerateCredential : lookupApplication
GenerateCredential -> ClientCredentials : registerClient
ClientCredentials -> KeystoneJS : lookupCredentialIssuerById
ClientCredentials -> IdP : getOpenidFromIssuer (GET .well-known)
ClientCredentials -> IdP : getKeycloakSession (openid.token_endpoint)
ClientCredentials -> IdP : clientRegistration (openid.registration_endpoint)
GenerateCredential -> Kong : create Kong Consumer
GenerateCredential -> KeystoneJS : AddClientConsumer
KeystoneJS -> Feeder API : Force Sync Kong Consumer
Feeder API -> Kong : Query Consumer
Feeder API -> KeystoneJS : Update Kong Consumer
GenerateCredential -> KeystoneJS : addServiceAccess
GenerateCredential -> KeystoneJS : linkServiceAccessToRequest
GenerateCredential -> APS Portal : NewCredential
AccessRequest.Apply -> KeystoneJS : Record Activity
AccessRequest.Apply -> APS Portal : NewCredential
APS Portal -> Developer : NewCredential

```

## Approve Access

```
title Approve Access

actor Access Manager
actor APS Portal
actor AccessRequest.Apply
actor ClientCredentials
actor KeystoneJS
actor ClientCredentials
actor Feeder API
actor IdP
actor Email
actor Kong

Access Manager -> APS Portal : Approve Access Request
APS Portal -> AccessRequest.Apply : Approve
AccessRequest.Apply -> KeystoneJS : lookupEnvironmentAndApplicationByAccessRequest
AccessRequest.Apply -> KeystoneJS : lookupCredentialIssuerById
AccessRequest.Apply -> IdP : getOpenidFromIssuer
AccessRequest.Apply -> IdP : getKeycloakSession (openid.token_endpoint))
AccessRequest.Apply -> IdP : updateClientRegistration (enable=true) (openid.registration_endpoint)
AccessRequest.Apply -> IdP : syncAndApply (Scopes)
AccessRequest.Apply -> KeystoneJS : markActiveTheServiceAccess
AccessRequest.Apply -> APS Portal : Ack
APS Portal -> Email : Notify Requester
APS Portal -> Access Manager : Ack

```

## Maintain Consumer Scopes and Roles

```
title Maintain Consumer Roles

actor Access Manager
actor APS Portal
actor ConsumerScopesAndRoles
actor List.Common
actor KeystoneJS
actor IdP

Access Manager -> APS Portal : View Consumer Detail
Access Manager -> APS Portal : Change Roles
APS Portal -> ConsumerScopesAndRoles : updateConsumerRoleAssignment
ConsumerScopesAndRoles -> List.Common : getEnvironmentContext
List.Common -> KeystoneJS : lookupEnvironmentAndIssuerUsingWhereClause
List.Common -> IdP : getOpenidFromIssuer (.well-known)
List.Common -> IdP : getUma2FromIssuer (.well-known)
List.Common -> List.Common : getSubjectToken
ConsumerScopesAndRoles -> IdP : login
ConsumerScopesAndRoles -> IdP : findByClientId (Issuer Client ID)
ConsumerScopesAndRoles -> IdP : list(Client)Roles
ConsumerScopesAndRoles -> IdP : findByClientId (Consumer Username)
ConsumerScopesAndRoles -> IdP : lookupServiceAccountUserId
ConsumerScopesAndRoles -> IdP : syncUserClientRoles
ConsumerScopesAndRoles -> APS Portal : Ack
APS Portal -> Access Manager : Ack

```

```
title Maintain Consumer Scopes

actor Access Manager
actor APS Portal
actor ConsumerScopesAndRoles
actor List.Common
actor KeystoneJS
actor IdP

Access Manager -> APS Portal : View Consumer Detail
Access Manager -> APS Portal : Change Scopes
APS Portal -> ConsumerScopesAndRoles : updateConsumerScopeAssignment
ConsumerScopesAndRoles -> List.Common : getEnvironmentContext
List.Common -> KeystoneJS : lookupEnvironmentAndIssuerUsingWhereClause
List.Common -> IdP : getOpenidFromIssuer (.well-known)
List.Common -> IdP : getUma2FromIssuer (.well-known)
List.Common -> List.Common : getSubjectToken
ConsumerScopesAndRoles -> IdP : login
ConsumerScopesAndRoles -> IdP : findByClientId (Issuer Client ID)
ConsumerScopesAndRoles -> IdP : listDefaultClientScopes
ConsumerScopesAndRoles -> IdP : syncClientScopes (openid.registration_endpoint)
ConsumerScopesAndRoles -> APS Portal : Ack
APS Portal -> Access Manager : Ack

```
