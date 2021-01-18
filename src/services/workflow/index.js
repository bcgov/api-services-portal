/*
When an AccessRequest is first made, a Kong Consumer should be created (if not already existing).
And then a SyncConsumersByNamespace should be done to pull changes from Kong into KeystoneJS.

When approved, determine whether the credential issuing is automatic or 

Workflow:

- initializeConsumer()
- requestApproved()
- credentialIssued()
- issueCredential()
*/
