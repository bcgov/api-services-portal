const yamlEntries = `
entities:
- list: AccessRequest
  fields:
    - additionalDetails
    - application
    - communication
    - controls
    - credential
    - isApproved
    - isComplete
    - isIssued
    - name
    - productEnvironment
    - requestor
    - serviceAccess
- list: Activity
  fields:
    - action
    - actor
    - blob
    - extRefId
    - message
    - name
    - namespace
    - refId
    - result
    - type
- list: Alert
  fields:
    - description
    - name
    - service
    - state
- list: Application
  fields:
    - appId
    - certificate
    - description
    - name
    - organization
    - organizationUnit
    - owner
- list: Blob
  fields:
    - blob
    - ref
- list: Content
  fields:
    - content
    - description
    - externalLink
    - githubRepository
    - isComplete
    - order
    - readme
    - slug
    - tags
    - title
- list: CredentialIssuer
  fields:
    - apiKeyName
    - authPlugin
    - availableScopes
    - clientAuthenticator
    - clientId
    - clientRegistration
    - clientRoles
    - clientSecret
    - description
    - environments
    - flow
    - initialAccessToken
    - instruction
    - mode
    - name
    - oidcDiscoveryUrl
    - owner
    - resourceType
- list: Dataset
  fields:
    - catalogContent
    - contacts
    - download_audience
    - isInCatalog
    - license_title
    - name
    - notes
    - organization
    - organizationUnit
    - private
    - record_publish_date
    - sector
    - security_class
    - tags
    - title
    - view_audience
- list: Environment
  fields:
    - active
    - additionalDetailsToRequest
    - appId
    - approval
    - credentialIssuer
    - flow
    - legal
    - name
    - product
    - services
- list: GatewayConsumer
  fields:
    - aclGroups
    - customId
    - namespace
    - plugins
    - tags
    - username
- list: GatewayGroup
  fields:
    - name
    - namespace
- list: GatewayPlugin
  fields:
    - config
    - name
    - namespace
    - route
    - service
    - tags
- list: GatewayRoute
  fields:
    - hosts
    - methods
    - name
    - namespace
    - paths
    - plugins
    - service
    - tags
- list: GatewayService
  fields:
    - environment
    - host
    - name
    - namespace
    - plugins
    - routes
    - tags
- list: Group
  fields:
    - name
- list: Legal
  fields:
    - description
    - document
    - isActive
    - link
    - reference
    - title
    - version
- list: MemberRole
  fields:
    - extRefId
    - role
    - user
- list: Metric
  fields:
    - day
    - metric
    - name
    - query
    - service
    - values
- list: Namespace
  fields:
    - extRefId
    - members
    - name
    - organization
    - organizationUnit
    - permDomains
    - resourceId
    - serviceAccounts
- list: Organization
  fields:
    - description
    - name
    - orgUnits
    - sector
    - tags
    - title
- list: OrganizationUnit
  fields:
    - description
    - name
    - sector
    - tags
    - title
- list: Product
  fields:
    - appId
    - dataset
    - description
    - environments
    - name
    - namespace
    - organization
    - organizationUnit
- list: ResourceSet
  fields:
    - displayName
    - name
    - scopes
    - type
    - uri
- list: ServiceAccess
  fields:
    - aclEnabled
    - active
    - application
    - clientRoles
    - consumer
    - consumerType
    - credential
    - credentialReference
    - name
    - namespace
    - productEnvironment
- list: TemporaryIdentity
  fields:
    - email
    - groups
    - isAdmin
    - jti
    - name
    - namespace
    - roles
    - sub
    - userId
    - username
- list: Todo
  fields:
    - content
    - description
    - grape
    - isComplete
    - name
    - yaml
- list: User
  fields:
    - email
    - isAdmin
    - legalsAgreed
    - name
    - password
    - username
`

export const entities = require('js-yaml').parse(yamlEntries)
