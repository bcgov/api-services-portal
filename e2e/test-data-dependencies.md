| Test                                                        | Dependencies                                                   |
| ----------------------------------------------------------- | -------------------------------------------------------------- |
| 01-api-key                                                  |                                                                |
| │   00-get-started.cy.ts                                    | Must run without existing namespaces|
| │   01-create-api.cy.ts                                     | NA                                                             |
| │   02-team-access.cy.ts                                    | 1.1                                                            |
| │   03-request-access-inactive-env.cy.ts                    | 1.1 to 1.2                                                     |
| │   04-request-access-with-out-collecting-credentials.cy.ts | 1.1 to 1.3                                                     |
| │   05-review-request-without-collecting-credentials.cy.ts  | 1.1 to 1.4                                                     |
| │   06-collect-credentials.cy.ts                            | 1.1 to 1.5                                                     |
| │   07-approve-pending-rqst.cy.ts                           | 1.1 to 1.6                                                     |
| │   08-grant-access.cy.ts                                   | 1.1 to 1.7                                                     |
| │   09-gwa-get.ts                                           | 1.1 to 1.8                                                     |
| │   10-revoke-access.cy.ts                                  | 1.1 to 1.9                                                     |
| 02-client-credential-flow                                   |                                                                |
| │   01-client-cred-team-access.cy.ts                        | NA                                                             |
| │   02-create_authorizarion_profile.cy.ts                   | 2.1                                                            |
| │   03-client-cred-create-api-prod-auth-pro.cy.ts           | 2.1 to 2.2                                                     |
| │   04-cids-access-rqst.cy.ts                               | 2.1 to 2.3                                                     |
| │   05-cids-access-approve-api-rqst.cy.ts                   | 2.1 to 2.4                                                     |
| │   06-client-scope-in-keycloak.ts                          | 2.1 to 2.5                                                     |
| │   07-deselect-scope.ts                                    | 2.1 to 2.6                                                     |
| │   08-verify-client-scope-in-default-list.ts               | 2.1 to 2.7                                                     |
| │   09-jwt-genkp-access-rqst.cy.ts                          | 2.1 to 2.8                                                     |
| │   10-jwt-genkp-access-approve-api-rqst.cy.ts              | 2.1 to 2.9                                                     |
| │   11-jwks-url-gen-keys-access-rqst.cy.ts                  | 2.1 to 2.10                                                    |
| │   12-jwks-url-access-approval-api-rqst.cy.ts              | 2.1 to 2.11                                                    |
| │   13-jwks-publicKey-access-rqst.cy.ts                     | 2.1 to 2.12                                                    |
| │   14-jwt-publlicKey-access-approve-api-rqst.cy.ts         | 2.1 to 2.13                                                    |
| 03-manage-labels                                            |                                                                |
| │   01-rqst-access-for-labels.cy.ts                         | Folder 01-api-key                                              |
| │   02-approve-pending-rqst-for-labels.spec.cy.ts           | Folder 01-api-key and 3.1                                      |
| │   03-filter-labels.cy.ts                                  | Folder 01-api-key and 3.1 to 3.2                               |
| │   04-manage-labels.cy.ts                                  | Folder 01-api-key and 3.1 to 3.3                               |
| │   05-link-consumers.ts                                    | Folder 01-api-key and 3.1 to 3.4                               |
| 04-gateway-services                                         |                                                                |
| │   01-gateway-service-details.cy.ts                        | Folder 01-api-key                                              |
| │   02-filter-gateway-service.cy.ts                         | Folder 01-api-key                                              |
| 05-migrate-user                                             |                                                                |
| │   01-migrate-user-access.cy.ts                            | Folder 01-api-key                                              |
| 06-refresh-credential                                       |                                                                |
| │   01-api-key.cy.ts                                        | Folder 01-api-key                                              |
| │   02-client-credentials.cy.ts                             | Folder 02-client-credential-flow                               |
| 07-manage-control                                           |                                                                |
| │   01-ip-restriction.cy.ts                                 | Folders 01-api-key, 02-client-credential-flow, and 6.2         |
| │   02-rate-limiting.cy.ts                                  | Folders 01-api-key, 02-client-credential-flow, and 7.1         |
| │   03-kong-api-only-apply-rate-limiting.cy.ts              | Folders 01-api-key, 02-client-credential-flow, and 7.1 to 7.2  |
| 08-client-role                                              |                                                                |
| │   01-keycloak-set-roles.cy.ts                             | Folder 02-client-credential-flow                               |
| │   02-add-roles-authorization-profile.ts                   | Folder 02-client-credential-flow and 8.1                       |
| │   03-read-client-role.ts                                  | Folder 02-client-credential-flow and 8.1 to 8.2                |
| │   04-write-client-role.ts                                 | Folder 02-client-credential-flow and 8.1 to 8.3                |
| │   05-check-without-role.ts                                | Folder 02-client-credential-flow and 8.1 to 8.4                |
| 09-update-product-env                                       |                                                                |
| │   01-client-credential-to-kong-acl-api.cy.ts              | Folder 01-api-key and 02-client-credential-flow                |
| │   02-kong-acl-api-to-client-credential.cy.ts              | Folder 01-api-key and 02-client-credential-flow and 9.1        |
| │   03-apply-multiple-services.cy.ts                        | Folder 01-api-key and 02-client-credential-flow and 9.1 to 9.2 |
| │   04-change-env-status copy.cy.ts                         | Folder 01-api-key and 02-client-credential-flow and 9.1 to 9.3 |
| │   05-keycloak-shared-IDP-config.cy.ts                     | Folder 01-api-key and 02-client-credential-flow and 9.1 to 9.4 |
| │   06-shared-idp.cy.ts                                     | Folder 01-api-key and 02-client-credential-flow and 9.1 to 9.5 |
| │   07-kong-public-auth.ts                                  | Folder 01-api-key and 02-client-credential-flow and 9.1 to 9.6 |
| │   08-protected-externally.ts                              | Folder 01-api-key and 02-client-credential-flow and 9.1 to 9.7 |
| │   09-two-tiered-hidden.cy.ts                              | NA                                                             |
| 10-clear-resources                                          |                                                                |
| │   01-create-api.cy.ts                                     | NA (CONFIRM: Is this accurate?)                                |
| │   02-team-access.cy.ts                                    | 10.1                                                           |
| │   03-rqst-access.cy.ts                                    | 10.1 to 10.2                                                   |
| │   04-delete-consumer.ts                                   | 10.1 to 10.3                                                   |
| │   05-delete-resources.cy.ts                               | 10.1 to 10.4                                                   |
| │   06-delete-service-acc.ts                                | Folder 01-api-key and 10.1 to 10.5                             |
| 11-activity-feed                                            |                                                                |
| │   01-activity-feed.cy.ts                                  | Folder 01-api-key                                              |
| │   02-activity-feed-failure.cy.ts                          | Folder 01-api-key and 11.1                                     |
| 12-access-permission                                        |                                                                |
| │   01-create-api.cy.ts                                     | NA                                                             |
| │   02-team-access.cy.ts                                    | 12.1                                                           |
| │   03-rqst-access.cy.ts                                    | 12.1 to 12.2                                                   |
| │   04-access-manager.cy.ts                                 | 12.1 to 12.2                                                   |
| │   05-namespace-manage.cy.ts                               | 12.1 to 12.2                                                   |
| │   06-credential-issuer.cy.ts                              | 12.1 to 12.2                                                   |
| │   07-namespace-view.cy.ts                                 | 12.1 to 12.2                                                   |
| │   08-gateway-config.cy.ts                                 | 12.1 to 12.2                                                   |
| │   09-content-publish.cy.ts                                | 12.1 to 12.2                                                   |
| │   10-identity-provider.cy.ts                              | NA                                                             |
| 13-namespace-preview-mode                                   |                                                                |
| │   01-create-api.cy.ts                                     | NA                                                             |
| │   02-namespace-preview-mode.cy.ts                         | 13.1                                                           |
| 14-org-assignment                                           |                                                                |
| │   01-client-cred-team-access.ts                           | NA                                                             |
| │   02-multiple-org-admin.ts                                | 14.1                                                           |
| │   03-verify-org-admin-member-org.ts                       | 14.1 to 14.2                                                   |
| │   04-multiple-org-admin-org-unit.ts                       | 14.1 to 14.3                                                   |
| │   05-verify-org-admin-member-org-unit.ts                  | 14.1 to 14.4                                                   |
| 15-aps-api                                                  |                                                                |
| │   01-create-api.cy.ts                                     | NA                                                             |
| │   02-organization.cy.ts                                   | 1.1 and 15.1                                                   |
| │   03-documentation.cy.ts                                  | 15.1 to 15.2                                                   |
| │   04-keycloak-shared-IDP-config.cy.ts                     | 15.1 to 15.3                                                   |
| │   05-authorizationProfiles.cy.ts                          | 1.1, 2.1 to 2.3, 15.1                                          |
| │   06-products.cy.ts                                       | 1.1 and 15.1                                                   |
| │   07-api-directory.cy.ts                                  | 1.1 and 15.1                                                   |
| │   08-namespaces.cy.ts                                     | 1.1 and 15.1                                                   |
| 16-gwa-cli                                                  |                                                                |
| │   01-cli-commands.ts                                      | NA                                                             |
| │   02-cli-generate-config.ts                               | 16.1                                                           |
| 17-delete-application                                       |                                                                |
| │   01-delete-application-without-access.cy.ts              | NA                                                             |
| │   02-delete-application-with-pending-request.cy.ts        | 17.1 (CONFIRM: requires product, created in 01-api-key?)       |   
| │   03-delete-application-with-approved-request.cy.ts       | 17.1 to 17.2                                                   |
| │   04-delete-namespace-gwa.ts                              | 17.1 to 17.3                                                   |
| 18-scan-astra-result                                        |                                                                |
| |   01-store-and-scan-astra-result.ts                       | NA                                                             |
| 19-api-v3                                                   |                                                                |
| |   01-api-directory.cy.ts                                  | ?                                                              |
| |   02-organization.cy.ts                                   | ?                                                              |
| |   03-gateways.cy.ts                                       | ?                                                              |
| |   04-products.cy.ts                                       | ?                                                              |
| |   05-issuers.cy.ts                                        | ?                                                              |
| |   06-identifiers.cy.ts                                    | ?                                                              |
| |   07-endpoints.cy.ts                                      | ?                                                              |
| 20-gateways                                                 |                                                                |
| |   01-list.cy.ts                                           | NA                                                             |
| |   02-create.cy.ts                                         | NA                                                             |