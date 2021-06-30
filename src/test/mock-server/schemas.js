module.exports = `
directive @cacheControl(
  maxAge: Int
  scope: CacheControlScope
) on FIELD_DEFINITION | OBJECT | INTERFACE
input UserRelateToOneInput {
  create: UserCreateInput
  connect: UserWhereUniqueInput
  disconnect: UserWhereUniqueInput
  disconnectAll: Boolean
}

input ApplicationRelateToOneInput {
  create: ApplicationCreateInput
  connect: ApplicationWhereUniqueInput
  disconnect: ApplicationWhereUniqueInput
  disconnectAll: Boolean
}

input EnvironmentRelateToOneInput {
  create: EnvironmentCreateInput
  connect: EnvironmentWhereUniqueInput
  disconnect: EnvironmentWhereUniqueInput
  disconnectAll: Boolean
}

input ServiceAccessRelateToOneInput {
  create: ServiceAccessCreateInput
  connect: ServiceAccessWhereUniqueInput
  disconnect: ServiceAccessWhereUniqueInput
  disconnectAll: Boolean
}

# DateTime custom scalar represents an ISO 8601 datetime string
scalar DateTime

#  A keystone list
type AccessRequest {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the AccessRequest List config, or
  #  2. As an alias to the field set on 'labelField' in the AccessRequest List config, or
  #  3. As an alias to a 'name' field on the AccessRequest List (if one exists), or
  #  4. As an alias to the 'id' field on the AccessRequest List.
  _label_: String
  id: ID!
  name: String
  communication: String
  isApproved: Boolean
  isIssued: Boolean
  isComplete: Boolean
  credential: String
  controls: String
  additionalDetails: String
  requestor: User
  application: Application
  productEnvironment: Environment
  serviceAccess: ServiceAccess
  updatedBy: User
  createdBy: User
  updatedAt: DateTime
  createdAt: DateTime
}

input AccessRequestWhereInput {
  AND: [AccessRequestWhereInput]
  OR: [AccessRequestWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  communication: String
  communication_not: String
  communication_contains: String
  communication_not_contains: String
  communication_starts_with: String
  communication_not_starts_with: String
  communication_ends_with: String
  communication_not_ends_with: String
  communication_i: String
  communication_not_i: String
  communication_contains_i: String
  communication_not_contains_i: String
  communication_starts_with_i: String
  communication_not_starts_with_i: String
  communication_ends_with_i: String
  communication_not_ends_with_i: String
  communication_in: [String]
  communication_not_in: [String]
  isApproved: Boolean
  isApproved_not: Boolean
  isIssued: Boolean
  isIssued_not: Boolean
  isComplete: Boolean
  isComplete_not: Boolean
  credential: String
  credential_not: String
  credential_contains: String
  credential_not_contains: String
  credential_starts_with: String
  credential_not_starts_with: String
  credential_ends_with: String
  credential_not_ends_with: String
  credential_i: String
  credential_not_i: String
  credential_contains_i: String
  credential_not_contains_i: String
  credential_starts_with_i: String
  credential_not_starts_with_i: String
  credential_ends_with_i: String
  credential_not_ends_with_i: String
  credential_in: [String]
  credential_not_in: [String]
  controls: String
  controls_not: String
  controls_contains: String
  controls_not_contains: String
  controls_starts_with: String
  controls_not_starts_with: String
  controls_ends_with: String
  controls_not_ends_with: String
  controls_i: String
  controls_not_i: String
  controls_contains_i: String
  controls_not_contains_i: String
  controls_starts_with_i: String
  controls_not_starts_with_i: String
  controls_ends_with_i: String
  controls_not_ends_with_i: String
  controls_in: [String]
  controls_not_in: [String]
  additionalDetails: String
  additionalDetails_not: String
  additionalDetails_contains: String
  additionalDetails_not_contains: String
  additionalDetails_starts_with: String
  additionalDetails_not_starts_with: String
  additionalDetails_ends_with: String
  additionalDetails_not_ends_with: String
  additionalDetails_i: String
  additionalDetails_not_i: String
  additionalDetails_contains_i: String
  additionalDetails_not_contains_i: String
  additionalDetails_starts_with_i: String
  additionalDetails_not_starts_with_i: String
  additionalDetails_ends_with_i: String
  additionalDetails_not_ends_with_i: String
  additionalDetails_in: [String]
  additionalDetails_not_in: [String]
  requestor: UserWhereInput
  requestor_is_null: Boolean
  application: ApplicationWhereInput
  application_is_null: Boolean
  productEnvironment: EnvironmentWhereInput
  productEnvironment_is_null: Boolean
  serviceAccess: ServiceAccessWhereInput
  serviceAccess_is_null: Boolean
  updatedBy: UserWhereInput
  updatedBy_is_null: Boolean
  createdBy: UserWhereInput
  createdBy_is_null: Boolean
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input AccessRequestWhereUniqueInput {
  id: ID!
}

enum SortAccessRequestsBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  communication_ASC
  communication_DESC
  isApproved_ASC
  isApproved_DESC
  isIssued_ASC
  isIssued_DESC
  isComplete_ASC
  isComplete_DESC
  credential_ASC
  credential_DESC
  controls_ASC
  controls_DESC
  additionalDetails_ASC
  additionalDetails_DESC
  requestor_ASC
  requestor_DESC
  application_ASC
  application_DESC
  productEnvironment_ASC
  productEnvironment_DESC
  serviceAccess_ASC
  serviceAccess_DESC
  updatedBy_ASC
  updatedBy_DESC
  createdBy_ASC
  createdBy_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input AccessRequestUpdateInput {
  name: String
  communication: String
  isApproved: Boolean
  isIssued: Boolean
  isComplete: Boolean
  credential: String
  controls: String
  additionalDetails: String
  requestor: UserRelateToOneInput
  application: ApplicationRelateToOneInput
  productEnvironment: EnvironmentRelateToOneInput
  serviceAccess: ServiceAccessRelateToOneInput
}

input AccessRequestsUpdateInput {
  id: ID!
  data: AccessRequestUpdateInput
}

input AccessRequestCreateInput {
  name: String
  communication: String
  isApproved: Boolean
  isIssued: Boolean
  isComplete: Boolean
  credential: String
  controls: String
  additionalDetails: String
  requestor: UserRelateToOneInput
  application: ApplicationRelateToOneInput
  productEnvironment: EnvironmentRelateToOneInput
  serviceAccess: ServiceAccessRelateToOneInput
}

input AccessRequestsCreateInput {
  data: AccessRequestCreateInput
}

input BlobRelateToOneInput {
  create: BlobCreateInput
  connect: BlobWhereUniqueInput
  disconnect: BlobWhereUniqueInput
  disconnectAll: Boolean
}

#  A keystone list
type Activity {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the Activity List config, or
  #  2. As an alias to the field set on 'labelField' in the Activity List config, or
  #  3. As an alias to a 'name' field on the Activity List (if one exists), or
  #  4. As an alias to the 'id' field on the Activity List.
  _label_: String
  id: ID!
  extRefId: String
  type: String
  name: String
  action: String
  result: String
  message: String
  context: String
  refId: String
  namespace: String
  actor: User
  blob: Blob
  updatedAt: DateTime
  createdAt: DateTime
}

input ActivityWhereInput {
  AND: [ActivityWhereInput]
  OR: [ActivityWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  extRefId: String
  extRefId_not: String
  extRefId_contains: String
  extRefId_not_contains: String
  extRefId_starts_with: String
  extRefId_not_starts_with: String
  extRefId_ends_with: String
  extRefId_not_ends_with: String
  extRefId_i: String
  extRefId_not_i: String
  extRefId_contains_i: String
  extRefId_not_contains_i: String
  extRefId_starts_with_i: String
  extRefId_not_starts_with_i: String
  extRefId_ends_with_i: String
  extRefId_not_ends_with_i: String
  extRefId_in: [String]
  extRefId_not_in: [String]
  type: String
  type_not: String
  type_contains: String
  type_not_contains: String
  type_starts_with: String
  type_not_starts_with: String
  type_ends_with: String
  type_not_ends_with: String
  type_i: String
  type_not_i: String
  type_contains_i: String
  type_not_contains_i: String
  type_starts_with_i: String
  type_not_starts_with_i: String
  type_ends_with_i: String
  type_not_ends_with_i: String
  type_in: [String]
  type_not_in: [String]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  action: String
  action_not: String
  action_contains: String
  action_not_contains: String
  action_starts_with: String
  action_not_starts_with: String
  action_ends_with: String
  action_not_ends_with: String
  action_i: String
  action_not_i: String
  action_contains_i: String
  action_not_contains_i: String
  action_starts_with_i: String
  action_not_starts_with_i: String
  action_ends_with_i: String
  action_not_ends_with_i: String
  action_in: [String]
  action_not_in: [String]
  result: String
  result_not: String
  result_contains: String
  result_not_contains: String
  result_starts_with: String
  result_not_starts_with: String
  result_ends_with: String
  result_not_ends_with: String
  result_i: String
  result_not_i: String
  result_contains_i: String
  result_not_contains_i: String
  result_starts_with_i: String
  result_not_starts_with_i: String
  result_ends_with_i: String
  result_not_ends_with_i: String
  result_in: [String]
  result_not_in: [String]
  message: String
  message_not: String
  message_contains: String
  message_not_contains: String
  message_starts_with: String
  message_not_starts_with: String
  message_ends_with: String
  message_not_ends_with: String
  message_i: String
  message_not_i: String
  message_contains_i: String
  message_not_contains_i: String
  message_starts_with_i: String
  message_not_starts_with_i: String
  message_ends_with_i: String
  message_not_ends_with_i: String
  message_in: [String]
  message_not_in: [String]
  context: String
  context_not: String
  context_contains: String
  context_not_contains: String
  context_starts_with: String
  context_not_starts_with: String
  context_ends_with: String
  context_not_ends_with: String
  context_i: String
  context_not_i: String
  context_contains_i: String
  context_not_contains_i: String
  context_starts_with_i: String
  context_not_starts_with_i: String
  context_ends_with_i: String
  context_not_ends_with_i: String
  context_in: [String]
  context_not_in: [String]
  refId: String
  refId_not: String
  refId_contains: String
  refId_not_contains: String
  refId_starts_with: String
  refId_not_starts_with: String
  refId_ends_with: String
  refId_not_ends_with: String
  refId_i: String
  refId_not_i: String
  refId_contains_i: String
  refId_not_contains_i: String
  refId_starts_with_i: String
  refId_not_starts_with_i: String
  refId_ends_with_i: String
  refId_not_ends_with_i: String
  refId_in: [String]
  refId_not_in: [String]
  namespace: String
  namespace_not: String
  namespace_contains: String
  namespace_not_contains: String
  namespace_starts_with: String
  namespace_not_starts_with: String
  namespace_ends_with: String
  namespace_not_ends_with: String
  namespace_i: String
  namespace_not_i: String
  namespace_contains_i: String
  namespace_not_contains_i: String
  namespace_starts_with_i: String
  namespace_not_starts_with_i: String
  namespace_ends_with_i: String
  namespace_not_ends_with_i: String
  namespace_in: [String]
  namespace_not_in: [String]
  actor: UserWhereInput
  actor_is_null: Boolean
  blob: BlobWhereInput
  blob_is_null: Boolean
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input ActivityWhereUniqueInput {
  id: ID!
}

enum SortActivitiesBy {
  id_ASC
  id_DESC
  extRefId_ASC
  extRefId_DESC
  type_ASC
  type_DESC
  name_ASC
  name_DESC
  action_ASC
  action_DESC
  result_ASC
  result_DESC
  message_ASC
  message_DESC
  context_ASC
  context_DESC
  refId_ASC
  refId_DESC
  namespace_ASC
  namespace_DESC
  actor_ASC
  actor_DESC
  blob_ASC
  blob_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input ActivityUpdateInput {
  extRefId: String
  type: String
  name: String
  action: String
  result: String
  message: String
  context: String
  refId: String
  namespace: String
  actor: UserRelateToOneInput
  blob: BlobRelateToOneInput
}

input ActivitiesUpdateInput {
  id: ID!
  data: ActivityUpdateInput
}

input ActivityCreateInput {
  extRefId: String
  type: String
  name: String
  action: String
  result: String
  message: String
  context: String
  refId: String
  namespace: String
  actor: UserRelateToOneInput
  blob: BlobRelateToOneInput
}

input ActivitiesCreateInput {
  data: ActivityCreateInput
}

input GatewayServiceRelateToOneInput {
  create: GatewayServiceCreateInput
  connect: GatewayServiceWhereUniqueInput
  disconnect: GatewayServiceWhereUniqueInput
  disconnectAll: Boolean
}

#  A keystone list
type Alert {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the Alert List config, or
  #  2. As an alias to the field set on 'labelField' in the Alert List config, or
  #  3. As an alias to a 'name' field on the Alert List (if one exists), or
  #  4. As an alias to the 'id' field on the Alert List.
  _label_: String
  id: ID!
  name: String
  state: String
  description: String
  service: GatewayService
  updatedAt: DateTime
  createdAt: DateTime
}

input AlertWhereInput {
  AND: [AlertWhereInput]
  OR: [AlertWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  state: String
  state_not: String
  state_contains: String
  state_not_contains: String
  state_starts_with: String
  state_not_starts_with: String
  state_ends_with: String
  state_not_ends_with: String
  state_i: String
  state_not_i: String
  state_contains_i: String
  state_not_contains_i: String
  state_starts_with_i: String
  state_not_starts_with_i: String
  state_ends_with_i: String
  state_not_ends_with_i: String
  state_in: [String]
  state_not_in: [String]
  description: String
  description_not: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  description_i: String
  description_not_i: String
  description_contains_i: String
  description_not_contains_i: String
  description_starts_with_i: String
  description_not_starts_with_i: String
  description_ends_with_i: String
  description_not_ends_with_i: String
  description_in: [String]
  description_not_in: [String]
  service: GatewayServiceWhereInput
  service_is_null: Boolean
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input AlertWhereUniqueInput {
  id: ID!
}

enum SortAlertsBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  state_ASC
  state_DESC
  description_ASC
  description_DESC
  service_ASC
  service_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input AlertUpdateInput {
  name: String
  state: String
  description: String
  service: GatewayServiceRelateToOneInput
}

input AlertsUpdateInput {
  id: ID!
  data: AlertUpdateInput
}

input AlertCreateInput {
  name: String
  state: String
  description: String
  service: GatewayServiceRelateToOneInput
}

input AlertsCreateInput {
  data: AlertCreateInput
}

input OrganizationRelateToOneInput {
  create: OrganizationCreateInput
  connect: OrganizationWhereUniqueInput
  disconnect: OrganizationWhereUniqueInput
  disconnectAll: Boolean
}

input OrganizationUnitRelateToOneInput {
  create: OrganizationUnitCreateInput
  connect: OrganizationUnitWhereUniqueInput
  disconnect: OrganizationUnitWhereUniqueInput
  disconnectAll: Boolean
}

#  A keystone list
type Application {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the Application List config, or
  #  2. As an alias to the field set on 'labelField' in the Application List config, or
  #  3. As an alias to a 'name' field on the Application List (if one exists), or
  #  4. As an alias to the 'id' field on the Application List.
  _label_: String
  id: ID!
  appId: String
  name: String
  description: String
  certificate: String
  organization: Organization
  organizationUnit: OrganizationUnit
  owner: User
  updatedAt: DateTime
  createdAt: DateTime
}

input ApplicationWhereInput {
  AND: [ApplicationWhereInput]
  OR: [ApplicationWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  appId: String
  appId_not: String
  appId_contains: String
  appId_not_contains: String
  appId_starts_with: String
  appId_not_starts_with: String
  appId_ends_with: String
  appId_not_ends_with: String
  appId_i: String
  appId_not_i: String
  appId_contains_i: String
  appId_not_contains_i: String
  appId_starts_with_i: String
  appId_not_starts_with_i: String
  appId_ends_with_i: String
  appId_not_ends_with_i: String
  appId_in: [String]
  appId_not_in: [String]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  description: String
  description_not: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  description_i: String
  description_not_i: String
  description_contains_i: String
  description_not_contains_i: String
  description_starts_with_i: String
  description_not_starts_with_i: String
  description_ends_with_i: String
  description_not_ends_with_i: String
  description_in: [String]
  description_not_in: [String]
  certificate: String
  certificate_not: String
  certificate_contains: String
  certificate_not_contains: String
  certificate_starts_with: String
  certificate_not_starts_with: String
  certificate_ends_with: String
  certificate_not_ends_with: String
  certificate_i: String
  certificate_not_i: String
  certificate_contains_i: String
  certificate_not_contains_i: String
  certificate_starts_with_i: String
  certificate_not_starts_with_i: String
  certificate_ends_with_i: String
  certificate_not_ends_with_i: String
  certificate_in: [String]
  certificate_not_in: [String]
  organization: OrganizationWhereInput
  organization_is_null: Boolean
  organizationUnit: OrganizationUnitWhereInput
  organizationUnit_is_null: Boolean
  owner: UserWhereInput
  owner_is_null: Boolean
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input ApplicationWhereUniqueInput {
  id: ID!
}

enum SortApplicationsBy {
  id_ASC
  id_DESC
  appId_ASC
  appId_DESC
  name_ASC
  name_DESC
  description_ASC
  description_DESC
  certificate_ASC
  certificate_DESC
  organization_ASC
  organization_DESC
  organizationUnit_ASC
  organizationUnit_DESC
  owner_ASC
  owner_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input ApplicationUpdateInput {
  appId: String
  name: String
  description: String
  certificate: String
  organization: OrganizationRelateToOneInput
  organizationUnit: OrganizationUnitRelateToOneInput
}

input ApplicationsUpdateInput {
  id: ID!
  data: ApplicationUpdateInput
}

input ApplicationCreateInput {
  appId: String
  name: String
  description: String
  certificate: String
  organization: OrganizationRelateToOneInput
  organizationUnit: OrganizationUnitRelateToOneInput
  owner: UserRelateToOneInput
}

input ApplicationsCreateInput {
  data: ApplicationCreateInput
}

#  A keystone list
type Blob {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the Blob List config, or
  #  2. As an alias to the field set on 'labelField' in the Blob List config, or
  #  3. As an alias to a 'name' field on the Blob List (if one exists), or
  #  4. As an alias to the 'id' field on the Blob List.
  _label_: String
  id: ID!
  ref: String
  blob: String
}

input BlobWhereInput {
  AND: [BlobWhereInput]
  OR: [BlobWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  ref: String
  ref_not: String
  ref_contains: String
  ref_not_contains: String
  ref_starts_with: String
  ref_not_starts_with: String
  ref_ends_with: String
  ref_not_ends_with: String
  ref_i: String
  ref_not_i: String
  ref_contains_i: String
  ref_not_contains_i: String
  ref_starts_with_i: String
  ref_not_starts_with_i: String
  ref_ends_with_i: String
  ref_not_ends_with_i: String
  ref_in: [String]
  ref_not_in: [String]
  blob: String
  blob_not: String
  blob_contains: String
  blob_not_contains: String
  blob_starts_with: String
  blob_not_starts_with: String
  blob_ends_with: String
  blob_not_ends_with: String
  blob_i: String
  blob_not_i: String
  blob_contains_i: String
  blob_not_contains_i: String
  blob_starts_with_i: String
  blob_not_starts_with_i: String
  blob_ends_with_i: String
  blob_not_ends_with_i: String
  blob_in: [String]
  blob_not_in: [String]
}

input BlobWhereUniqueInput {
  id: ID!
}

enum SortBlobsBy {
  id_ASC
  id_DESC
  ref_ASC
  ref_DESC
  blob_ASC
  blob_DESC
}

input BlobUpdateInput {
  ref: String
  blob: String
}

input BlobsUpdateInput {
  id: ID!
  data: BlobUpdateInput
}

input BlobCreateInput {
  ref: String
  blob: String
}

input BlobsCreateInput {
  data: BlobCreateInput
}

#  A keystone list
type Content {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the Content List config, or
  #  2. As an alias to the field set on 'labelField' in the Content List config, or
  #  3. As an alias to a 'name' field on the Content List (if one exists), or
  #  4. As an alias to the 'id' field on the Content List.
  _label_: String
  id: ID!
  title: String
  description: String
  content: String
  externalLink: String
  githubRepository: String
  readme: String
  namespace: String
  tags: String
  slug: String
  order: Int
  isComplete: Boolean
  isPublic: Boolean
  publishDate: DateTime
}

input ContentWhereInput {
  AND: [ContentWhereInput]
  OR: [ContentWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  title: String
  title_not: String
  title_contains: String
  title_not_contains: String
  title_starts_with: String
  title_not_starts_with: String
  title_ends_with: String
  title_not_ends_with: String
  title_i: String
  title_not_i: String
  title_contains_i: String
  title_not_contains_i: String
  title_starts_with_i: String
  title_not_starts_with_i: String
  title_ends_with_i: String
  title_not_ends_with_i: String
  title_in: [String]
  title_not_in: [String]
  description: String
  description_not: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  description_i: String
  description_not_i: String
  description_contains_i: String
  description_not_contains_i: String
  description_starts_with_i: String
  description_not_starts_with_i: String
  description_ends_with_i: String
  description_not_ends_with_i: String
  description_in: [String]
  description_not_in: [String]
  content: String
  content_not: String
  content_contains: String
  content_not_contains: String
  content_starts_with: String
  content_not_starts_with: String
  content_ends_with: String
  content_not_ends_with: String
  content_i: String
  content_not_i: String
  content_contains_i: String
  content_not_contains_i: String
  content_starts_with_i: String
  content_not_starts_with_i: String
  content_ends_with_i: String
  content_not_ends_with_i: String
  content_in: [String]
  content_not_in: [String]
  externalLink: String
  externalLink_not: String
  externalLink_contains: String
  externalLink_not_contains: String
  externalLink_starts_with: String
  externalLink_not_starts_with: String
  externalLink_ends_with: String
  externalLink_not_ends_with: String
  externalLink_i: String
  externalLink_not_i: String
  externalLink_contains_i: String
  externalLink_not_contains_i: String
  externalLink_starts_with_i: String
  externalLink_not_starts_with_i: String
  externalLink_ends_with_i: String
  externalLink_not_ends_with_i: String
  externalLink_in: [String]
  externalLink_not_in: [String]
  githubRepository: String
  githubRepository_not: String
  githubRepository_contains: String
  githubRepository_not_contains: String
  githubRepository_starts_with: String
  githubRepository_not_starts_with: String
  githubRepository_ends_with: String
  githubRepository_not_ends_with: String
  githubRepository_i: String
  githubRepository_not_i: String
  githubRepository_contains_i: String
  githubRepository_not_contains_i: String
  githubRepository_starts_with_i: String
  githubRepository_not_starts_with_i: String
  githubRepository_ends_with_i: String
  githubRepository_not_ends_with_i: String
  githubRepository_in: [String]
  githubRepository_not_in: [String]
  readme: String
  readme_not: String
  readme_contains: String
  readme_not_contains: String
  readme_starts_with: String
  readme_not_starts_with: String
  readme_ends_with: String
  readme_not_ends_with: String
  readme_i: String
  readme_not_i: String
  readme_contains_i: String
  readme_not_contains_i: String
  readme_starts_with_i: String
  readme_not_starts_with_i: String
  readme_ends_with_i: String
  readme_not_ends_with_i: String
  readme_in: [String]
  readme_not_in: [String]
  namespace: String
  namespace_not: String
  namespace_contains: String
  namespace_not_contains: String
  namespace_starts_with: String
  namespace_not_starts_with: String
  namespace_ends_with: String
  namespace_not_ends_with: String
  namespace_i: String
  namespace_not_i: String
  namespace_contains_i: String
  namespace_not_contains_i: String
  namespace_starts_with_i: String
  namespace_not_starts_with_i: String
  namespace_ends_with_i: String
  namespace_not_ends_with_i: String
  namespace_in: [String]
  namespace_not_in: [String]
  tags: String
  tags_not: String
  tags_contains: String
  tags_not_contains: String
  tags_starts_with: String
  tags_not_starts_with: String
  tags_ends_with: String
  tags_not_ends_with: String
  tags_i: String
  tags_not_i: String
  tags_contains_i: String
  tags_not_contains_i: String
  tags_starts_with_i: String
  tags_not_starts_with_i: String
  tags_ends_with_i: String
  tags_not_ends_with_i: String
  tags_in: [String]
  tags_not_in: [String]
  slug: String
  slug_not: String
  slug_contains: String
  slug_not_contains: String
  slug_starts_with: String
  slug_not_starts_with: String
  slug_ends_with: String
  slug_not_ends_with: String
  slug_i: String
  slug_not_i: String
  slug_contains_i: String
  slug_not_contains_i: String
  slug_starts_with_i: String
  slug_not_starts_with_i: String
  slug_ends_with_i: String
  slug_not_ends_with_i: String
  slug_in: [String]
  slug_not_in: [String]
  order: Int
  order_not: Int
  order_lt: Int
  order_lte: Int
  order_gt: Int
  order_gte: Int
  order_in: [Int]
  order_not_in: [Int]
  isComplete: Boolean
  isComplete_not: Boolean
  isPublic: Boolean
  isPublic_not: Boolean
  publishDate: DateTime
  publishDate_not: DateTime
  publishDate_lt: DateTime
  publishDate_lte: DateTime
  publishDate_gt: DateTime
  publishDate_gte: DateTime
  publishDate_in: [DateTime]
  publishDate_not_in: [DateTime]
}

input ContentWhereUniqueInput {
  id: ID!
}

enum SortContentsBy {
  id_ASC
  id_DESC
  title_ASC
  title_DESC
  description_ASC
  description_DESC
  content_ASC
  content_DESC
  externalLink_ASC
  externalLink_DESC
  githubRepository_ASC
  githubRepository_DESC
  readme_ASC
  readme_DESC
  namespace_ASC
  namespace_DESC
  tags_ASC
  tags_DESC
  slug_ASC
  slug_DESC
  order_ASC
  order_DESC
  isComplete_ASC
  isComplete_DESC
  isPublic_ASC
  isPublic_DESC
  publishDate_ASC
  publishDate_DESC
}

input ContentUpdateInput {
  title: String
  description: String
  content: String
  externalLink: String
  githubRepository: String
  readme: String
  namespace: String
  tags: String
  slug: String
  order: Int
  isComplete: Boolean
  isPublic: Boolean
  publishDate: DateTime
}

input ContentsUpdateInput {
  id: ID!
  data: ContentUpdateInput
}

input ContentCreateInput {
  title: String
  description: String
  content: String
  externalLink: String
  githubRepository: String
  readme: String
  namespace: String
  tags: String
  slug: String
  order: Int
  isComplete: Boolean
  isPublic: Boolean
  publishDate: DateTime
}

input ContentsCreateInput {
  data: ContentCreateInput
}

input EnvironmentRelateToManyInput {
  create: [EnvironmentCreateInput]
  connect: [EnvironmentWhereUniqueInput]
  disconnect: [EnvironmentWhereUniqueInput]
  disconnectAll: Boolean
}

#  A keystone list
type CredentialIssuer {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the CredentialIssuer List config, or
  #  2. As an alias to the field set on 'labelField' in the CredentialIssuer List config, or
  #  3. As an alias to a 'name' field on the CredentialIssuer List (if one exists), or
  #  4. As an alias to the 'id' field on the CredentialIssuer List.
  _label_: String
  id: ID!
  name: String
  namespace: String
  description: String
  flow: String
  clientRegistration: String
  mode: String
  clientAuthenticator: String
  authPlugin: String
  instruction: String
  environmentDetails: String
  oidcDiscoveryUrl: String
  initialAccessToken: String
  clientId: String
  clientSecret: String
  availableScopes: String
  clientRoles: String
  resourceScopes: String
  resourceType: String
  resourceAccessScope: String
  apiKeyName: String
  owner: User
  environments(
    where: EnvironmentWhereInput
    search: String
    sortBy: [SortEnvironmentsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Environment!]!
  _environmentsMeta(
    where: EnvironmentWhereInput
    search: String
    sortBy: [SortEnvironmentsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  updatedBy: User
  createdBy: User
  updatedAt: DateTime
  createdAt: DateTime
}

input CredentialIssuerWhereInput {
  AND: [CredentialIssuerWhereInput]
  OR: [CredentialIssuerWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  namespace: String
  namespace_not: String
  namespace_contains: String
  namespace_not_contains: String
  namespace_starts_with: String
  namespace_not_starts_with: String
  namespace_ends_with: String
  namespace_not_ends_with: String
  namespace_i: String
  namespace_not_i: String
  namespace_contains_i: String
  namespace_not_contains_i: String
  namespace_starts_with_i: String
  namespace_not_starts_with_i: String
  namespace_ends_with_i: String
  namespace_not_ends_with_i: String
  namespace_in: [String]
  namespace_not_in: [String]
  description: String
  description_not: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  description_i: String
  description_not_i: String
  description_contains_i: String
  description_not_contains_i: String
  description_starts_with_i: String
  description_not_starts_with_i: String
  description_ends_with_i: String
  description_not_ends_with_i: String
  description_in: [String]
  description_not_in: [String]
  flow: String
  flow_not: String
  flow_in: [String]
  flow_not_in: [String]
  clientRegistration: String
  clientRegistration_not: String
  clientRegistration_in: [String]
  clientRegistration_not_in: [String]
  mode: String
  mode_not: String
  mode_in: [String]
  mode_not_in: [String]
  clientAuthenticator: String
  clientAuthenticator_not: String
  clientAuthenticator_in: [String]
  clientAuthenticator_not_in: [String]
  authPlugin: String
  authPlugin_not: String
  authPlugin_contains: String
  authPlugin_not_contains: String
  authPlugin_starts_with: String
  authPlugin_not_starts_with: String
  authPlugin_ends_with: String
  authPlugin_not_ends_with: String
  authPlugin_i: String
  authPlugin_not_i: String
  authPlugin_contains_i: String
  authPlugin_not_contains_i: String
  authPlugin_starts_with_i: String
  authPlugin_not_starts_with_i: String
  authPlugin_ends_with_i: String
  authPlugin_not_ends_with_i: String
  authPlugin_in: [String]
  authPlugin_not_in: [String]
  instruction: String
  instruction_not: String
  instruction_contains: String
  instruction_not_contains: String
  instruction_starts_with: String
  instruction_not_starts_with: String
  instruction_ends_with: String
  instruction_not_ends_with: String
  instruction_i: String
  instruction_not_i: String
  instruction_contains_i: String
  instruction_not_contains_i: String
  instruction_starts_with_i: String
  instruction_not_starts_with_i: String
  instruction_ends_with_i: String
  instruction_not_ends_with_i: String
  instruction_in: [String]
  instruction_not_in: [String]
  environmentDetails: String
  environmentDetails_not: String
  environmentDetails_contains: String
  environmentDetails_not_contains: String
  environmentDetails_starts_with: String
  environmentDetails_not_starts_with: String
  environmentDetails_ends_with: String
  environmentDetails_not_ends_with: String
  environmentDetails_i: String
  environmentDetails_not_i: String
  environmentDetails_contains_i: String
  environmentDetails_not_contains_i: String
  environmentDetails_starts_with_i: String
  environmentDetails_not_starts_with_i: String
  environmentDetails_ends_with_i: String
  environmentDetails_not_ends_with_i: String
  environmentDetails_in: [String]
  environmentDetails_not_in: [String]
  oidcDiscoveryUrl: String
  oidcDiscoveryUrl_not: String
  oidcDiscoveryUrl_contains: String
  oidcDiscoveryUrl_not_contains: String
  oidcDiscoveryUrl_starts_with: String
  oidcDiscoveryUrl_not_starts_with: String
  oidcDiscoveryUrl_ends_with: String
  oidcDiscoveryUrl_not_ends_with: String
  oidcDiscoveryUrl_i: String
  oidcDiscoveryUrl_not_i: String
  oidcDiscoveryUrl_contains_i: String
  oidcDiscoveryUrl_not_contains_i: String
  oidcDiscoveryUrl_starts_with_i: String
  oidcDiscoveryUrl_not_starts_with_i: String
  oidcDiscoveryUrl_ends_with_i: String
  oidcDiscoveryUrl_not_ends_with_i: String
  oidcDiscoveryUrl_in: [String]
  oidcDiscoveryUrl_not_in: [String]
  initialAccessToken: String
  initialAccessToken_not: String
  initialAccessToken_contains: String
  initialAccessToken_not_contains: String
  initialAccessToken_starts_with: String
  initialAccessToken_not_starts_with: String
  initialAccessToken_ends_with: String
  initialAccessToken_not_ends_with: String
  initialAccessToken_i: String
  initialAccessToken_not_i: String
  initialAccessToken_contains_i: String
  initialAccessToken_not_contains_i: String
  initialAccessToken_starts_with_i: String
  initialAccessToken_not_starts_with_i: String
  initialAccessToken_ends_with_i: String
  initialAccessToken_not_ends_with_i: String
  initialAccessToken_in: [String]
  initialAccessToken_not_in: [String]
  clientId: String
  clientId_not: String
  clientId_contains: String
  clientId_not_contains: String
  clientId_starts_with: String
  clientId_not_starts_with: String
  clientId_ends_with: String
  clientId_not_ends_with: String
  clientId_i: String
  clientId_not_i: String
  clientId_contains_i: String
  clientId_not_contains_i: String
  clientId_starts_with_i: String
  clientId_not_starts_with_i: String
  clientId_ends_with_i: String
  clientId_not_ends_with_i: String
  clientId_in: [String]
  clientId_not_in: [String]
  clientSecret: String
  clientSecret_not: String
  clientSecret_contains: String
  clientSecret_not_contains: String
  clientSecret_starts_with: String
  clientSecret_not_starts_with: String
  clientSecret_ends_with: String
  clientSecret_not_ends_with: String
  clientSecret_i: String
  clientSecret_not_i: String
  clientSecret_contains_i: String
  clientSecret_not_contains_i: String
  clientSecret_starts_with_i: String
  clientSecret_not_starts_with_i: String
  clientSecret_ends_with_i: String
  clientSecret_not_ends_with_i: String
  clientSecret_in: [String]
  clientSecret_not_in: [String]
  availableScopes: String
  availableScopes_not: String
  availableScopes_contains: String
  availableScopes_not_contains: String
  availableScopes_starts_with: String
  availableScopes_not_starts_with: String
  availableScopes_ends_with: String
  availableScopes_not_ends_with: String
  availableScopes_i: String
  availableScopes_not_i: String
  availableScopes_contains_i: String
  availableScopes_not_contains_i: String
  availableScopes_starts_with_i: String
  availableScopes_not_starts_with_i: String
  availableScopes_ends_with_i: String
  availableScopes_not_ends_with_i: String
  availableScopes_in: [String]
  availableScopes_not_in: [String]
  clientRoles: String
  clientRoles_not: String
  clientRoles_contains: String
  clientRoles_not_contains: String
  clientRoles_starts_with: String
  clientRoles_not_starts_with: String
  clientRoles_ends_with: String
  clientRoles_not_ends_with: String
  clientRoles_i: String
  clientRoles_not_i: String
  clientRoles_contains_i: String
  clientRoles_not_contains_i: String
  clientRoles_starts_with_i: String
  clientRoles_not_starts_with_i: String
  clientRoles_ends_with_i: String
  clientRoles_not_ends_with_i: String
  clientRoles_in: [String]
  clientRoles_not_in: [String]
  resourceScopes: String
  resourceScopes_not: String
  resourceScopes_contains: String
  resourceScopes_not_contains: String
  resourceScopes_starts_with: String
  resourceScopes_not_starts_with: String
  resourceScopes_ends_with: String
  resourceScopes_not_ends_with: String
  resourceScopes_i: String
  resourceScopes_not_i: String
  resourceScopes_contains_i: String
  resourceScopes_not_contains_i: String
  resourceScopes_starts_with_i: String
  resourceScopes_not_starts_with_i: String
  resourceScopes_ends_with_i: String
  resourceScopes_not_ends_with_i: String
  resourceScopes_in: [String]
  resourceScopes_not_in: [String]
  resourceType: String
  resourceType_not: String
  resourceType_contains: String
  resourceType_not_contains: String
  resourceType_starts_with: String
  resourceType_not_starts_with: String
  resourceType_ends_with: String
  resourceType_not_ends_with: String
  resourceType_i: String
  resourceType_not_i: String
  resourceType_contains_i: String
  resourceType_not_contains_i: String
  resourceType_starts_with_i: String
  resourceType_not_starts_with_i: String
  resourceType_ends_with_i: String
  resourceType_not_ends_with_i: String
  resourceType_in: [String]
  resourceType_not_in: [String]
  resourceAccessScope: String
  resourceAccessScope_not: String
  resourceAccessScope_contains: String
  resourceAccessScope_not_contains: String
  resourceAccessScope_starts_with: String
  resourceAccessScope_not_starts_with: String
  resourceAccessScope_ends_with: String
  resourceAccessScope_not_ends_with: String
  resourceAccessScope_i: String
  resourceAccessScope_not_i: String
  resourceAccessScope_contains_i: String
  resourceAccessScope_not_contains_i: String
  resourceAccessScope_starts_with_i: String
  resourceAccessScope_not_starts_with_i: String
  resourceAccessScope_ends_with_i: String
  resourceAccessScope_not_ends_with_i: String
  resourceAccessScope_in: [String]
  resourceAccessScope_not_in: [String]
  apiKeyName: String
  apiKeyName_not: String
  apiKeyName_contains: String
  apiKeyName_not_contains: String
  apiKeyName_starts_with: String
  apiKeyName_not_starts_with: String
  apiKeyName_ends_with: String
  apiKeyName_not_ends_with: String
  apiKeyName_i: String
  apiKeyName_not_i: String
  apiKeyName_contains_i: String
  apiKeyName_not_contains_i: String
  apiKeyName_starts_with_i: String
  apiKeyName_not_starts_with_i: String
  apiKeyName_ends_with_i: String
  apiKeyName_not_ends_with_i: String
  apiKeyName_in: [String]
  apiKeyName_not_in: [String]
  owner: UserWhereInput
  owner_is_null: Boolean
  #  condition must be true for all nodes
  environments_every: EnvironmentWhereInput
  #  condition must be true for at least 1 node
  environments_some: EnvironmentWhereInput
  #  condition must be false for all nodes
  environments_none: EnvironmentWhereInput
  updatedBy: UserWhereInput
  updatedBy_is_null: Boolean
  createdBy: UserWhereInput
  createdBy_is_null: Boolean
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input CredentialIssuerWhereUniqueInput {
  id: ID!
}

enum SortCredentialIssuersBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  namespace_ASC
  namespace_DESC
  description_ASC
  description_DESC
  flow_ASC
  flow_DESC
  clientRegistration_ASC
  clientRegistration_DESC
  mode_ASC
  mode_DESC
  clientAuthenticator_ASC
  clientAuthenticator_DESC
  authPlugin_ASC
  authPlugin_DESC
  instruction_ASC
  instruction_DESC
  environmentDetails_ASC
  environmentDetails_DESC
  oidcDiscoveryUrl_ASC
  oidcDiscoveryUrl_DESC
  initialAccessToken_ASC
  initialAccessToken_DESC
  clientId_ASC
  clientId_DESC
  clientSecret_ASC
  clientSecret_DESC
  availableScopes_ASC
  availableScopes_DESC
  clientRoles_ASC
  clientRoles_DESC
  resourceScopes_ASC
  resourceScopes_DESC
  resourceType_ASC
  resourceType_DESC
  resourceAccessScope_ASC
  resourceAccessScope_DESC
  apiKeyName_ASC
  apiKeyName_DESC
  owner_ASC
  owner_DESC
  environments_ASC
  environments_DESC
  updatedBy_ASC
  updatedBy_DESC
  createdBy_ASC
  createdBy_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input CredentialIssuerUpdateInput {
  name: String
  namespace: String
  description: String
  flow: String
  clientRegistration: String
  mode: String
  clientAuthenticator: String
  authPlugin: String
  instruction: String
  environmentDetails: String
  oidcDiscoveryUrl: String
  initialAccessToken: String
  clientId: String
  clientSecret: String
  availableScopes: String
  clientRoles: String
  resourceScopes: String
  resourceType: String
  resourceAccessScope: String
  apiKeyName: String
  environments: EnvironmentRelateToManyInput
}

input CredentialIssuersUpdateInput {
  id: ID!
  data: CredentialIssuerUpdateInput
}

input CredentialIssuerCreateInput {
  name: String
  namespace: String
  description: String
  flow: String
  clientRegistration: String
  mode: String
  clientAuthenticator: String
  authPlugin: String
  instruction: String
  environmentDetails: String
  oidcDiscoveryUrl: String
  initialAccessToken: String
  clientId: String
  clientSecret: String
  availableScopes: String
  clientRoles: String
  resourceScopes: String
  resourceType: String
  resourceAccessScope: String
  apiKeyName: String
  owner: UserRelateToOneInput
  environments: EnvironmentRelateToManyInput
}

input CredentialIssuersCreateInput {
  data: CredentialIssuerCreateInput
}

#  A keystone list
type Dataset {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the Dataset List config, or
  #  2. As an alias to the field set on 'labelField' in the Dataset List config, or
  #  3. As an alias to a 'name' field on the Dataset List (if one exists), or
  #  4. As an alias to the 'id' field on the Dataset List.
  _label_: String
  id: ID!
  name: String
  sector: String
  license_title: String
  view_audience: String
  download_audience: String
  record_publish_date: String
  security_class: String
  private: Boolean
  tags: String
  contacts: String
  organization: Organization
  organizationUnit: OrganizationUnit
  notes: String
  title: String
  catalogContent: String
  isInCatalog: Boolean
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input DatasetWhereInput {
  AND: [DatasetWhereInput]
  OR: [DatasetWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  sector: String
  sector_not: String
  sector_contains: String
  sector_not_contains: String
  sector_starts_with: String
  sector_not_starts_with: String
  sector_ends_with: String
  sector_not_ends_with: String
  sector_i: String
  sector_not_i: String
  sector_contains_i: String
  sector_not_contains_i: String
  sector_starts_with_i: String
  sector_not_starts_with_i: String
  sector_ends_with_i: String
  sector_not_ends_with_i: String
  sector_in: [String]
  sector_not_in: [String]
  license_title: String
  license_title_not: String
  license_title_contains: String
  license_title_not_contains: String
  license_title_starts_with: String
  license_title_not_starts_with: String
  license_title_ends_with: String
  license_title_not_ends_with: String
  license_title_i: String
  license_title_not_i: String
  license_title_contains_i: String
  license_title_not_contains_i: String
  license_title_starts_with_i: String
  license_title_not_starts_with_i: String
  license_title_ends_with_i: String
  license_title_not_ends_with_i: String
  license_title_in: [String]
  license_title_not_in: [String]
  view_audience: String
  view_audience_not: String
  view_audience_contains: String
  view_audience_not_contains: String
  view_audience_starts_with: String
  view_audience_not_starts_with: String
  view_audience_ends_with: String
  view_audience_not_ends_with: String
  view_audience_i: String
  view_audience_not_i: String
  view_audience_contains_i: String
  view_audience_not_contains_i: String
  view_audience_starts_with_i: String
  view_audience_not_starts_with_i: String
  view_audience_ends_with_i: String
  view_audience_not_ends_with_i: String
  view_audience_in: [String]
  view_audience_not_in: [String]
  download_audience: String
  download_audience_not: String
  download_audience_contains: String
  download_audience_not_contains: String
  download_audience_starts_with: String
  download_audience_not_starts_with: String
  download_audience_ends_with: String
  download_audience_not_ends_with: String
  download_audience_i: String
  download_audience_not_i: String
  download_audience_contains_i: String
  download_audience_not_contains_i: String
  download_audience_starts_with_i: String
  download_audience_not_starts_with_i: String
  download_audience_ends_with_i: String
  download_audience_not_ends_with_i: String
  download_audience_in: [String]
  download_audience_not_in: [String]
  record_publish_date: String
  record_publish_date_not: String
  record_publish_date_contains: String
  record_publish_date_not_contains: String
  record_publish_date_starts_with: String
  record_publish_date_not_starts_with: String
  record_publish_date_ends_with: String
  record_publish_date_not_ends_with: String
  record_publish_date_i: String
  record_publish_date_not_i: String
  record_publish_date_contains_i: String
  record_publish_date_not_contains_i: String
  record_publish_date_starts_with_i: String
  record_publish_date_not_starts_with_i: String
  record_publish_date_ends_with_i: String
  record_publish_date_not_ends_with_i: String
  record_publish_date_in: [String]
  record_publish_date_not_in: [String]
  security_class: String
  security_class_not: String
  security_class_contains: String
  security_class_not_contains: String
  security_class_starts_with: String
  security_class_not_starts_with: String
  security_class_ends_with: String
  security_class_not_ends_with: String
  security_class_i: String
  security_class_not_i: String
  security_class_contains_i: String
  security_class_not_contains_i: String
  security_class_starts_with_i: String
  security_class_not_starts_with_i: String
  security_class_ends_with_i: String
  security_class_not_ends_with_i: String
  security_class_in: [String]
  security_class_not_in: [String]
  private: Boolean
  private_not: Boolean
  tags: String
  tags_not: String
  tags_contains: String
  tags_not_contains: String
  tags_starts_with: String
  tags_not_starts_with: String
  tags_ends_with: String
  tags_not_ends_with: String
  tags_i: String
  tags_not_i: String
  tags_contains_i: String
  tags_not_contains_i: String
  tags_starts_with_i: String
  tags_not_starts_with_i: String
  tags_ends_with_i: String
  tags_not_ends_with_i: String
  tags_in: [String]
  tags_not_in: [String]
  contacts: String
  contacts_not: String
  contacts_contains: String
  contacts_not_contains: String
  contacts_starts_with: String
  contacts_not_starts_with: String
  contacts_ends_with: String
  contacts_not_ends_with: String
  contacts_i: String
  contacts_not_i: String
  contacts_contains_i: String
  contacts_not_contains_i: String
  contacts_starts_with_i: String
  contacts_not_starts_with_i: String
  contacts_ends_with_i: String
  contacts_not_ends_with_i: String
  contacts_in: [String]
  contacts_not_in: [String]
  organization: OrganizationWhereInput
  organization_is_null: Boolean
  organizationUnit: OrganizationUnitWhereInput
  organizationUnit_is_null: Boolean
  notes: String
  notes_not: String
  notes_contains: String
  notes_not_contains: String
  notes_starts_with: String
  notes_not_starts_with: String
  notes_ends_with: String
  notes_not_ends_with: String
  notes_i: String
  notes_not_i: String
  notes_contains_i: String
  notes_not_contains_i: String
  notes_starts_with_i: String
  notes_not_starts_with_i: String
  notes_ends_with_i: String
  notes_not_ends_with_i: String
  notes_in: [String]
  notes_not_in: [String]
  title: String
  title_not: String
  title_contains: String
  title_not_contains: String
  title_starts_with: String
  title_not_starts_with: String
  title_ends_with: String
  title_not_ends_with: String
  title_i: String
  title_not_i: String
  title_contains_i: String
  title_not_contains_i: String
  title_starts_with_i: String
  title_not_starts_with_i: String
  title_ends_with_i: String
  title_not_ends_with_i: String
  title_in: [String]
  title_not_in: [String]
  catalogContent: String
  catalogContent_not: String
  catalogContent_contains: String
  catalogContent_not_contains: String
  catalogContent_starts_with: String
  catalogContent_not_starts_with: String
  catalogContent_ends_with: String
  catalogContent_not_ends_with: String
  catalogContent_i: String
  catalogContent_not_i: String
  catalogContent_contains_i: String
  catalogContent_not_contains_i: String
  catalogContent_starts_with_i: String
  catalogContent_not_starts_with_i: String
  catalogContent_ends_with_i: String
  catalogContent_not_ends_with_i: String
  catalogContent_in: [String]
  catalogContent_not_in: [String]
  isInCatalog: Boolean
  isInCatalog_not: Boolean
  extSource: String
  extSource_not: String
  extSource_contains: String
  extSource_not_contains: String
  extSource_starts_with: String
  extSource_not_starts_with: String
  extSource_ends_with: String
  extSource_not_ends_with: String
  extSource_i: String
  extSource_not_i: String
  extSource_contains_i: String
  extSource_not_contains_i: String
  extSource_starts_with_i: String
  extSource_not_starts_with_i: String
  extSource_ends_with_i: String
  extSource_not_ends_with_i: String
  extSource_in: [String]
  extSource_not_in: [String]
  extForeignKey: String
  extForeignKey_not: String
  extForeignKey_contains: String
  extForeignKey_not_contains: String
  extForeignKey_starts_with: String
  extForeignKey_not_starts_with: String
  extForeignKey_ends_with: String
  extForeignKey_not_ends_with: String
  extForeignKey_i: String
  extForeignKey_not_i: String
  extForeignKey_contains_i: String
  extForeignKey_not_contains_i: String
  extForeignKey_starts_with_i: String
  extForeignKey_not_starts_with_i: String
  extForeignKey_ends_with_i: String
  extForeignKey_not_ends_with_i: String
  extForeignKey_in: [String]
  extForeignKey_not_in: [String]
  extRecordHash: String
  extRecordHash_not: String
  extRecordHash_contains: String
  extRecordHash_not_contains: String
  extRecordHash_starts_with: String
  extRecordHash_not_starts_with: String
  extRecordHash_ends_with: String
  extRecordHash_not_ends_with: String
  extRecordHash_i: String
  extRecordHash_not_i: String
  extRecordHash_contains_i: String
  extRecordHash_not_contains_i: String
  extRecordHash_starts_with_i: String
  extRecordHash_not_starts_with_i: String
  extRecordHash_ends_with_i: String
  extRecordHash_not_ends_with_i: String
  extRecordHash_in: [String]
  extRecordHash_not_in: [String]
}

input DatasetWhereUniqueInput {
  id: ID!
}

enum SortDatasetsBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  sector_ASC
  sector_DESC
  license_title_ASC
  license_title_DESC
  view_audience_ASC
  view_audience_DESC
  download_audience_ASC
  download_audience_DESC
  record_publish_date_ASC
  record_publish_date_DESC
  security_class_ASC
  security_class_DESC
  private_ASC
  private_DESC
  tags_ASC
  tags_DESC
  contacts_ASC
  contacts_DESC
  organization_ASC
  organization_DESC
  organizationUnit_ASC
  organizationUnit_DESC
  notes_ASC
  notes_DESC
  title_ASC
  title_DESC
  catalogContent_ASC
  catalogContent_DESC
  isInCatalog_ASC
  isInCatalog_DESC
  extSource_ASC
  extSource_DESC
  extForeignKey_ASC
  extForeignKey_DESC
  extRecordHash_ASC
  extRecordHash_DESC
}

input DatasetUpdateInput {
  name: String
  sector: String
  license_title: String
  view_audience: String
  download_audience: String
  record_publish_date: String
  security_class: String
  private: Boolean
  tags: String
  contacts: String
  organization: OrganizationRelateToOneInput
  organizationUnit: OrganizationUnitRelateToOneInput
  notes: String
  title: String
  catalogContent: String
  isInCatalog: Boolean
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input DatasetsUpdateInput {
  id: ID!
  data: DatasetUpdateInput
}

input DatasetCreateInput {
  name: String
  sector: String
  license_title: String
  view_audience: String
  download_audience: String
  record_publish_date: String
  security_class: String
  private: Boolean
  tags: String
  contacts: String
  organization: OrganizationRelateToOneInput
  organizationUnit: OrganizationUnitRelateToOneInput
  notes: String
  title: String
  catalogContent: String
  isInCatalog: Boolean
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input DatasetsCreateInput {
  data: DatasetCreateInput
}

input LegalRelateToOneInput {
  create: LegalCreateInput
  connect: LegalWhereUniqueInput
  disconnect: LegalWhereUniqueInput
  disconnectAll: Boolean
}

input CredentialIssuerRelateToOneInput {
  create: CredentialIssuerCreateInput
  connect: CredentialIssuerWhereUniqueInput
  disconnect: CredentialIssuerWhereUniqueInput
  disconnectAll: Boolean
}

input GatewayServiceRelateToManyInput {
  create: [GatewayServiceCreateInput]
  connect: [GatewayServiceWhereUniqueInput]
  disconnect: [GatewayServiceWhereUniqueInput]
  disconnectAll: Boolean
}

input ProductRelateToOneInput {
  create: ProductCreateInput
  connect: ProductWhereUniqueInput
  disconnect: ProductWhereUniqueInput
  disconnectAll: Boolean
}

#  A keystone list
type Environment {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the Environment List config, or
  #  2. As an alias to the field set on 'labelField' in the Environment List config, or
  #  3. As an alias to a 'name' field on the Environment List (if one exists), or
  #  4. As an alias to the 'id' field on the Environment List.
  _label_: String
  id: ID!
  appId: String
  name: String
  active: Boolean
  approval: Boolean
  flow: String
  legal: Legal
  credentialIssuer: CredentialIssuer
  additionalDetailsToRequest: String
  services(
    where: GatewayServiceWhereInput
    search: String
    sortBy: [SortGatewayServicesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [GatewayService!]!
  _servicesMeta(
    where: GatewayServiceWhereInput
    search: String
    sortBy: [SortGatewayServicesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  product: Product
}

input EnvironmentWhereInput {
  AND: [EnvironmentWhereInput]
  OR: [EnvironmentWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  appId: String
  appId_not: String
  appId_contains: String
  appId_not_contains: String
  appId_starts_with: String
  appId_not_starts_with: String
  appId_ends_with: String
  appId_not_ends_with: String
  appId_i: String
  appId_not_i: String
  appId_contains_i: String
  appId_not_contains_i: String
  appId_starts_with_i: String
  appId_not_starts_with_i: String
  appId_ends_with_i: String
  appId_not_ends_with_i: String
  appId_in: [String]
  appId_not_in: [String]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  active: Boolean
  active_not: Boolean
  approval: Boolean
  approval_not: Boolean
  flow: String
  flow_not: String
  flow_in: [String]
  flow_not_in: [String]
  legal: LegalWhereInput
  legal_is_null: Boolean
  credentialIssuer: CredentialIssuerWhereInput
  credentialIssuer_is_null: Boolean
  additionalDetailsToRequest: String
  additionalDetailsToRequest_not: String
  additionalDetailsToRequest_contains: String
  additionalDetailsToRequest_not_contains: String
  additionalDetailsToRequest_starts_with: String
  additionalDetailsToRequest_not_starts_with: String
  additionalDetailsToRequest_ends_with: String
  additionalDetailsToRequest_not_ends_with: String
  additionalDetailsToRequest_i: String
  additionalDetailsToRequest_not_i: String
  additionalDetailsToRequest_contains_i: String
  additionalDetailsToRequest_not_contains_i: String
  additionalDetailsToRequest_starts_with_i: String
  additionalDetailsToRequest_not_starts_with_i: String
  additionalDetailsToRequest_ends_with_i: String
  additionalDetailsToRequest_not_ends_with_i: String
  additionalDetailsToRequest_in: [String]
  additionalDetailsToRequest_not_in: [String]
  #  condition must be true for all nodes
  services_every: GatewayServiceWhereInput
  #  condition must be true for at least 1 node
  services_some: GatewayServiceWhereInput
  #  condition must be false for all nodes
  services_none: GatewayServiceWhereInput
  product: ProductWhereInput
  product_is_null: Boolean
}

input EnvironmentWhereUniqueInput {
  id: ID!
}

enum SortEnvironmentsBy {
  id_ASC
  id_DESC
  appId_ASC
  appId_DESC
  name_ASC
  name_DESC
  active_ASC
  active_DESC
  approval_ASC
  approval_DESC
  flow_ASC
  flow_DESC
  legal_ASC
  legal_DESC
  credentialIssuer_ASC
  credentialIssuer_DESC
  additionalDetailsToRequest_ASC
  additionalDetailsToRequest_DESC
  services_ASC
  services_DESC
  product_ASC
  product_DESC
}

input EnvironmentUpdateInput {
  name: String
  active: Boolean
  approval: Boolean
  flow: String
  legal: LegalRelateToOneInput
  credentialIssuer: CredentialIssuerRelateToOneInput
  additionalDetailsToRequest: String
  services: GatewayServiceRelateToManyInput
  product: ProductRelateToOneInput
}

input EnvironmentsUpdateInput {
  id: ID!
  data: EnvironmentUpdateInput
}

input EnvironmentCreateInput {
  appId: String
  name: String
  active: Boolean
  approval: Boolean
  flow: String
  legal: LegalRelateToOneInput
  credentialIssuer: CredentialIssuerRelateToOneInput
  additionalDetailsToRequest: String
  services: GatewayServiceRelateToManyInput
  product: ProductRelateToOneInput
}

input EnvironmentsCreateInput {
  data: EnvironmentCreateInput
}

input GatewayPluginRelateToManyInput {
  create: [GatewayPluginCreateInput]
  connect: [GatewayPluginWhereUniqueInput]
  disconnect: [GatewayPluginWhereUniqueInput]
  disconnectAll: Boolean
}

#  A keystone list
type GatewayConsumer {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the GatewayConsumer List config, or
  #  2. As an alias to the field set on 'labelField' in the GatewayConsumer List config, or
  #  3. As an alias to a 'name' field on the GatewayConsumer List (if one exists), or
  #  4. As an alias to the 'id' field on the GatewayConsumer List.
  _label_: String
  id: ID!
  username: String
  customId: String
  aclGroups: String
  namespace: String
  tags: String
  plugins(
    where: GatewayPluginWhereInput
    search: String
    sortBy: [SortGatewayPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [GatewayPlugin!]!
  _pluginsMeta(
    where: GatewayPluginWhereInput
    search: String
    sortBy: [SortGatewayPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  extSource: String
  extForeignKey: String
  extRecordHash: String
  updatedAt: DateTime
  createdAt: DateTime
}

input GatewayConsumerWhereInput {
  AND: [GatewayConsumerWhereInput]
  OR: [GatewayConsumerWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  username: String
  username_not: String
  username_contains: String
  username_not_contains: String
  username_starts_with: String
  username_not_starts_with: String
  username_ends_with: String
  username_not_ends_with: String
  username_i: String
  username_not_i: String
  username_contains_i: String
  username_not_contains_i: String
  username_starts_with_i: String
  username_not_starts_with_i: String
  username_ends_with_i: String
  username_not_ends_with_i: String
  username_in: [String]
  username_not_in: [String]
  customId: String
  customId_not: String
  customId_contains: String
  customId_not_contains: String
  customId_starts_with: String
  customId_not_starts_with: String
  customId_ends_with: String
  customId_not_ends_with: String
  customId_i: String
  customId_not_i: String
  customId_contains_i: String
  customId_not_contains_i: String
  customId_starts_with_i: String
  customId_not_starts_with_i: String
  customId_ends_with_i: String
  customId_not_ends_with_i: String
  customId_in: [String]
  customId_not_in: [String]
  aclGroups: String
  aclGroups_not: String
  aclGroups_contains: String
  aclGroups_not_contains: String
  aclGroups_starts_with: String
  aclGroups_not_starts_with: String
  aclGroups_ends_with: String
  aclGroups_not_ends_with: String
  aclGroups_i: String
  aclGroups_not_i: String
  aclGroups_contains_i: String
  aclGroups_not_contains_i: String
  aclGroups_starts_with_i: String
  aclGroups_not_starts_with_i: String
  aclGroups_ends_with_i: String
  aclGroups_not_ends_with_i: String
  aclGroups_in: [String]
  aclGroups_not_in: [String]
  namespace: String
  namespace_not: String
  namespace_contains: String
  namespace_not_contains: String
  namespace_starts_with: String
  namespace_not_starts_with: String
  namespace_ends_with: String
  namespace_not_ends_with: String
  namespace_i: String
  namespace_not_i: String
  namespace_contains_i: String
  namespace_not_contains_i: String
  namespace_starts_with_i: String
  namespace_not_starts_with_i: String
  namespace_ends_with_i: String
  namespace_not_ends_with_i: String
  namespace_in: [String]
  namespace_not_in: [String]
  tags: String
  tags_not: String
  tags_contains: String
  tags_not_contains: String
  tags_starts_with: String
  tags_not_starts_with: String
  tags_ends_with: String
  tags_not_ends_with: String
  tags_i: String
  tags_not_i: String
  tags_contains_i: String
  tags_not_contains_i: String
  tags_starts_with_i: String
  tags_not_starts_with_i: String
  tags_ends_with_i: String
  tags_not_ends_with_i: String
  tags_in: [String]
  tags_not_in: [String]
  #  condition must be true for all nodes
  plugins_every: GatewayPluginWhereInput
  #  condition must be true for at least 1 node
  plugins_some: GatewayPluginWhereInput
  #  condition must be false for all nodes
  plugins_none: GatewayPluginWhereInput
  extSource: String
  extSource_not: String
  extSource_contains: String
  extSource_not_contains: String
  extSource_starts_with: String
  extSource_not_starts_with: String
  extSource_ends_with: String
  extSource_not_ends_with: String
  extSource_i: String
  extSource_not_i: String
  extSource_contains_i: String
  extSource_not_contains_i: String
  extSource_starts_with_i: String
  extSource_not_starts_with_i: String
  extSource_ends_with_i: String
  extSource_not_ends_with_i: String
  extSource_in: [String]
  extSource_not_in: [String]
  extForeignKey: String
  extForeignKey_not: String
  extForeignKey_contains: String
  extForeignKey_not_contains: String
  extForeignKey_starts_with: String
  extForeignKey_not_starts_with: String
  extForeignKey_ends_with: String
  extForeignKey_not_ends_with: String
  extForeignKey_i: String
  extForeignKey_not_i: String
  extForeignKey_contains_i: String
  extForeignKey_not_contains_i: String
  extForeignKey_starts_with_i: String
  extForeignKey_not_starts_with_i: String
  extForeignKey_ends_with_i: String
  extForeignKey_not_ends_with_i: String
  extForeignKey_in: [String]
  extForeignKey_not_in: [String]
  extRecordHash: String
  extRecordHash_not: String
  extRecordHash_contains: String
  extRecordHash_not_contains: String
  extRecordHash_starts_with: String
  extRecordHash_not_starts_with: String
  extRecordHash_ends_with: String
  extRecordHash_not_ends_with: String
  extRecordHash_i: String
  extRecordHash_not_i: String
  extRecordHash_contains_i: String
  extRecordHash_not_contains_i: String
  extRecordHash_starts_with_i: String
  extRecordHash_not_starts_with_i: String
  extRecordHash_ends_with_i: String
  extRecordHash_not_ends_with_i: String
  extRecordHash_in: [String]
  extRecordHash_not_in: [String]
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input GatewayConsumerWhereUniqueInput {
  id: ID!
}

enum SortGatewayConsumersBy {
  id_ASC
  id_DESC
  username_ASC
  username_DESC
  customId_ASC
  customId_DESC
  aclGroups_ASC
  aclGroups_DESC
  namespace_ASC
  namespace_DESC
  tags_ASC
  tags_DESC
  plugins_ASC
  plugins_DESC
  extSource_ASC
  extSource_DESC
  extForeignKey_ASC
  extForeignKey_DESC
  extRecordHash_ASC
  extRecordHash_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input GatewayConsumerUpdateInput {
  username: String
  customId: String
  aclGroups: String
  namespace: String
  tags: String
  plugins: GatewayPluginRelateToManyInput
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input GatewayConsumersUpdateInput {
  id: ID!
  data: GatewayConsumerUpdateInput
}

input GatewayConsumerCreateInput {
  username: String
  customId: String
  aclGroups: String
  namespace: String
  tags: String
  plugins: GatewayPluginRelateToManyInput
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input GatewayConsumersCreateInput {
  data: GatewayConsumerCreateInput
}

#  A keystone list
type GatewayGroup {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the GatewayGroup List config, or
  #  2. As an alias to the field set on 'labelField' in the GatewayGroup List config, or
  #  3. As an alias to a 'name' field on the GatewayGroup List (if one exists), or
  #  4. As an alias to the 'id' field on the GatewayGroup List.
  _label_: String
  id: ID!
  name: String
  namespace: String
  extSource: String
  extForeignKey: String
  extRecordHash: String
  updatedAt: DateTime
  createdAt: DateTime
}

input GatewayGroupWhereInput {
  AND: [GatewayGroupWhereInput]
  OR: [GatewayGroupWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  namespace: String
  namespace_not: String
  namespace_contains: String
  namespace_not_contains: String
  namespace_starts_with: String
  namespace_not_starts_with: String
  namespace_ends_with: String
  namespace_not_ends_with: String
  namespace_i: String
  namespace_not_i: String
  namespace_contains_i: String
  namespace_not_contains_i: String
  namespace_starts_with_i: String
  namespace_not_starts_with_i: String
  namespace_ends_with_i: String
  namespace_not_ends_with_i: String
  namespace_in: [String]
  namespace_not_in: [String]
  extSource: String
  extSource_not: String
  extSource_contains: String
  extSource_not_contains: String
  extSource_starts_with: String
  extSource_not_starts_with: String
  extSource_ends_with: String
  extSource_not_ends_with: String
  extSource_i: String
  extSource_not_i: String
  extSource_contains_i: String
  extSource_not_contains_i: String
  extSource_starts_with_i: String
  extSource_not_starts_with_i: String
  extSource_ends_with_i: String
  extSource_not_ends_with_i: String
  extSource_in: [String]
  extSource_not_in: [String]
  extForeignKey: String
  extForeignKey_not: String
  extForeignKey_contains: String
  extForeignKey_not_contains: String
  extForeignKey_starts_with: String
  extForeignKey_not_starts_with: String
  extForeignKey_ends_with: String
  extForeignKey_not_ends_with: String
  extForeignKey_i: String
  extForeignKey_not_i: String
  extForeignKey_contains_i: String
  extForeignKey_not_contains_i: String
  extForeignKey_starts_with_i: String
  extForeignKey_not_starts_with_i: String
  extForeignKey_ends_with_i: String
  extForeignKey_not_ends_with_i: String
  extForeignKey_in: [String]
  extForeignKey_not_in: [String]
  extRecordHash: String
  extRecordHash_not: String
  extRecordHash_contains: String
  extRecordHash_not_contains: String
  extRecordHash_starts_with: String
  extRecordHash_not_starts_with: String
  extRecordHash_ends_with: String
  extRecordHash_not_ends_with: String
  extRecordHash_i: String
  extRecordHash_not_i: String
  extRecordHash_contains_i: String
  extRecordHash_not_contains_i: String
  extRecordHash_starts_with_i: String
  extRecordHash_not_starts_with_i: String
  extRecordHash_ends_with_i: String
  extRecordHash_not_ends_with_i: String
  extRecordHash_in: [String]
  extRecordHash_not_in: [String]
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input GatewayGroupWhereUniqueInput {
  id: ID!
}

enum SortGatewayGroupsBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  namespace_ASC
  namespace_DESC
  extSource_ASC
  extSource_DESC
  extForeignKey_ASC
  extForeignKey_DESC
  extRecordHash_ASC
  extRecordHash_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input GatewayGroupUpdateInput {
  name: String
  namespace: String
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input GatewayGroupsUpdateInput {
  id: ID!
  data: GatewayGroupUpdateInput
}

input GatewayGroupCreateInput {
  name: String
  namespace: String
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input GatewayGroupsCreateInput {
  data: GatewayGroupCreateInput
}

input GatewayRouteRelateToOneInput {
  create: GatewayRouteCreateInput
  connect: GatewayRouteWhereUniqueInput
  disconnect: GatewayRouteWhereUniqueInput
  disconnectAll: Boolean
}

#  A keystone list
type GatewayPlugin {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the GatewayPlugin List config, or
  #  2. As an alias to the field set on 'labelField' in the GatewayPlugin List config, or
  #  3. As an alias to a 'name' field on the GatewayPlugin List (if one exists), or
  #  4. As an alias to the 'id' field on the GatewayPlugin List.
  _label_: String
  id: ID!
  name: String
  namespace: String
  tags: String
  config: String
  service: GatewayService
  route: GatewayRoute
  extSource: String
  extForeignKey: String
  extRecordHash: String
  updatedAt: DateTime
  createdAt: DateTime
}

input GatewayPluginWhereInput {
  AND: [GatewayPluginWhereInput]
  OR: [GatewayPluginWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  namespace: String
  namespace_not: String
  namespace_contains: String
  namespace_not_contains: String
  namespace_starts_with: String
  namespace_not_starts_with: String
  namespace_ends_with: String
  namespace_not_ends_with: String
  namespace_i: String
  namespace_not_i: String
  namespace_contains_i: String
  namespace_not_contains_i: String
  namespace_starts_with_i: String
  namespace_not_starts_with_i: String
  namespace_ends_with_i: String
  namespace_not_ends_with_i: String
  namespace_in: [String]
  namespace_not_in: [String]
  tags: String
  tags_not: String
  tags_contains: String
  tags_not_contains: String
  tags_starts_with: String
  tags_not_starts_with: String
  tags_ends_with: String
  tags_not_ends_with: String
  tags_i: String
  tags_not_i: String
  tags_contains_i: String
  tags_not_contains_i: String
  tags_starts_with_i: String
  tags_not_starts_with_i: String
  tags_ends_with_i: String
  tags_not_ends_with_i: String
  tags_in: [String]
  tags_not_in: [String]
  config: String
  config_not: String
  config_contains: String
  config_not_contains: String
  config_starts_with: String
  config_not_starts_with: String
  config_ends_with: String
  config_not_ends_with: String
  config_i: String
  config_not_i: String
  config_contains_i: String
  config_not_contains_i: String
  config_starts_with_i: String
  config_not_starts_with_i: String
  config_ends_with_i: String
  config_not_ends_with_i: String
  config_in: [String]
  config_not_in: [String]
  service: GatewayServiceWhereInput
  service_is_null: Boolean
  route: GatewayRouteWhereInput
  route_is_null: Boolean
  extSource: String
  extSource_not: String
  extSource_contains: String
  extSource_not_contains: String
  extSource_starts_with: String
  extSource_not_starts_with: String
  extSource_ends_with: String
  extSource_not_ends_with: String
  extSource_i: String
  extSource_not_i: String
  extSource_contains_i: String
  extSource_not_contains_i: String
  extSource_starts_with_i: String
  extSource_not_starts_with_i: String
  extSource_ends_with_i: String
  extSource_not_ends_with_i: String
  extSource_in: [String]
  extSource_not_in: [String]
  extForeignKey: String
  extForeignKey_not: String
  extForeignKey_contains: String
  extForeignKey_not_contains: String
  extForeignKey_starts_with: String
  extForeignKey_not_starts_with: String
  extForeignKey_ends_with: String
  extForeignKey_not_ends_with: String
  extForeignKey_i: String
  extForeignKey_not_i: String
  extForeignKey_contains_i: String
  extForeignKey_not_contains_i: String
  extForeignKey_starts_with_i: String
  extForeignKey_not_starts_with_i: String
  extForeignKey_ends_with_i: String
  extForeignKey_not_ends_with_i: String
  extForeignKey_in: [String]
  extForeignKey_not_in: [String]
  extRecordHash: String
  extRecordHash_not: String
  extRecordHash_contains: String
  extRecordHash_not_contains: String
  extRecordHash_starts_with: String
  extRecordHash_not_starts_with: String
  extRecordHash_ends_with: String
  extRecordHash_not_ends_with: String
  extRecordHash_i: String
  extRecordHash_not_i: String
  extRecordHash_contains_i: String
  extRecordHash_not_contains_i: String
  extRecordHash_starts_with_i: String
  extRecordHash_not_starts_with_i: String
  extRecordHash_ends_with_i: String
  extRecordHash_not_ends_with_i: String
  extRecordHash_in: [String]
  extRecordHash_not_in: [String]
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input GatewayPluginWhereUniqueInput {
  id: ID!
}

enum SortGatewayPluginsBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  namespace_ASC
  namespace_DESC
  tags_ASC
  tags_DESC
  config_ASC
  config_DESC
  service_ASC
  service_DESC
  route_ASC
  route_DESC
  extSource_ASC
  extSource_DESC
  extForeignKey_ASC
  extForeignKey_DESC
  extRecordHash_ASC
  extRecordHash_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input GatewayPluginUpdateInput {
  name: String
  namespace: String
  tags: String
  config: String
  service: GatewayServiceRelateToOneInput
  route: GatewayRouteRelateToOneInput
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input GatewayPluginsUpdateInput {
  id: ID!
  data: GatewayPluginUpdateInput
}

input GatewayPluginCreateInput {
  name: String
  namespace: String
  tags: String
  config: String
  service: GatewayServiceRelateToOneInput
  route: GatewayRouteRelateToOneInput
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input GatewayPluginsCreateInput {
  data: GatewayPluginCreateInput
}

#  A keystone list
type GatewayRoute {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the GatewayRoute List config, or
  #  2. As an alias to the field set on 'labelField' in the GatewayRoute List config, or
  #  3. As an alias to a 'name' field on the GatewayRoute List (if one exists), or
  #  4. As an alias to the 'id' field on the GatewayRoute List.
  _label_: String
  id: ID!
  name: String
  namespace: String
  methods: String
  paths: String
  hosts: String
  tags: String
  service: GatewayService
  plugins(
    where: GatewayPluginWhereInput
    search: String
    sortBy: [SortGatewayPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [GatewayPlugin!]!
  _pluginsMeta(
    where: GatewayPluginWhereInput
    search: String
    sortBy: [SortGatewayPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  extSource: String
  extForeignKey: String
  extRecordHash: String
  updatedAt: DateTime
  createdAt: DateTime
}

input GatewayRouteWhereInput {
  AND: [GatewayRouteWhereInput]
  OR: [GatewayRouteWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  namespace: String
  namespace_not: String
  namespace_contains: String
  namespace_not_contains: String
  namespace_starts_with: String
  namespace_not_starts_with: String
  namespace_ends_with: String
  namespace_not_ends_with: String
  namespace_i: String
  namespace_not_i: String
  namespace_contains_i: String
  namespace_not_contains_i: String
  namespace_starts_with_i: String
  namespace_not_starts_with_i: String
  namespace_ends_with_i: String
  namespace_not_ends_with_i: String
  namespace_in: [String]
  namespace_not_in: [String]
  methods: String
  methods_not: String
  methods_contains: String
  methods_not_contains: String
  methods_starts_with: String
  methods_not_starts_with: String
  methods_ends_with: String
  methods_not_ends_with: String
  methods_i: String
  methods_not_i: String
  methods_contains_i: String
  methods_not_contains_i: String
  methods_starts_with_i: String
  methods_not_starts_with_i: String
  methods_ends_with_i: String
  methods_not_ends_with_i: String
  methods_in: [String]
  methods_not_in: [String]
  paths: String
  paths_not: String
  paths_contains: String
  paths_not_contains: String
  paths_starts_with: String
  paths_not_starts_with: String
  paths_ends_with: String
  paths_not_ends_with: String
  paths_i: String
  paths_not_i: String
  paths_contains_i: String
  paths_not_contains_i: String
  paths_starts_with_i: String
  paths_not_starts_with_i: String
  paths_ends_with_i: String
  paths_not_ends_with_i: String
  paths_in: [String]
  paths_not_in: [String]
  hosts: String
  hosts_not: String
  hosts_contains: String
  hosts_not_contains: String
  hosts_starts_with: String
  hosts_not_starts_with: String
  hosts_ends_with: String
  hosts_not_ends_with: String
  hosts_i: String
  hosts_not_i: String
  hosts_contains_i: String
  hosts_not_contains_i: String
  hosts_starts_with_i: String
  hosts_not_starts_with_i: String
  hosts_ends_with_i: String
  hosts_not_ends_with_i: String
  hosts_in: [String]
  hosts_not_in: [String]
  tags: String
  tags_not: String
  tags_contains: String
  tags_not_contains: String
  tags_starts_with: String
  tags_not_starts_with: String
  tags_ends_with: String
  tags_not_ends_with: String
  tags_i: String
  tags_not_i: String
  tags_contains_i: String
  tags_not_contains_i: String
  tags_starts_with_i: String
  tags_not_starts_with_i: String
  tags_ends_with_i: String
  tags_not_ends_with_i: String
  tags_in: [String]
  tags_not_in: [String]
  service: GatewayServiceWhereInput
  service_is_null: Boolean
  #  condition must be true for all nodes
  plugins_every: GatewayPluginWhereInput
  #  condition must be true for at least 1 node
  plugins_some: GatewayPluginWhereInput
  #  condition must be false for all nodes
  plugins_none: GatewayPluginWhereInput
  extSource: String
  extSource_not: String
  extSource_contains: String
  extSource_not_contains: String
  extSource_starts_with: String
  extSource_not_starts_with: String
  extSource_ends_with: String
  extSource_not_ends_with: String
  extSource_i: String
  extSource_not_i: String
  extSource_contains_i: String
  extSource_not_contains_i: String
  extSource_starts_with_i: String
  extSource_not_starts_with_i: String
  extSource_ends_with_i: String
  extSource_not_ends_with_i: String
  extSource_in: [String]
  extSource_not_in: [String]
  extForeignKey: String
  extForeignKey_not: String
  extForeignKey_contains: String
  extForeignKey_not_contains: String
  extForeignKey_starts_with: String
  extForeignKey_not_starts_with: String
  extForeignKey_ends_with: String
  extForeignKey_not_ends_with: String
  extForeignKey_i: String
  extForeignKey_not_i: String
  extForeignKey_contains_i: String
  extForeignKey_not_contains_i: String
  extForeignKey_starts_with_i: String
  extForeignKey_not_starts_with_i: String
  extForeignKey_ends_with_i: String
  extForeignKey_not_ends_with_i: String
  extForeignKey_in: [String]
  extForeignKey_not_in: [String]
  extRecordHash: String
  extRecordHash_not: String
  extRecordHash_contains: String
  extRecordHash_not_contains: String
  extRecordHash_starts_with: String
  extRecordHash_not_starts_with: String
  extRecordHash_ends_with: String
  extRecordHash_not_ends_with: String
  extRecordHash_i: String
  extRecordHash_not_i: String
  extRecordHash_contains_i: String
  extRecordHash_not_contains_i: String
  extRecordHash_starts_with_i: String
  extRecordHash_not_starts_with_i: String
  extRecordHash_ends_with_i: String
  extRecordHash_not_ends_with_i: String
  extRecordHash_in: [String]
  extRecordHash_not_in: [String]
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input GatewayRouteWhereUniqueInput {
  id: ID!
}

enum SortGatewayRoutesBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  namespace_ASC
  namespace_DESC
  methods_ASC
  methods_DESC
  paths_ASC
  paths_DESC
  hosts_ASC
  hosts_DESC
  tags_ASC
  tags_DESC
  service_ASC
  service_DESC
  plugins_ASC
  plugins_DESC
  extSource_ASC
  extSource_DESC
  extForeignKey_ASC
  extForeignKey_DESC
  extRecordHash_ASC
  extRecordHash_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input GatewayRouteUpdateInput {
  name: String
  namespace: String
  methods: String
  paths: String
  hosts: String
  tags: String
  service: GatewayServiceRelateToOneInput
  plugins: GatewayPluginRelateToManyInput
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input GatewayRoutesUpdateInput {
  id: ID!
  data: GatewayRouteUpdateInput
}

input GatewayRouteCreateInput {
  name: String
  namespace: String
  methods: String
  paths: String
  hosts: String
  tags: String
  service: GatewayServiceRelateToOneInput
  plugins: GatewayPluginRelateToManyInput
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input GatewayRoutesCreateInput {
  data: GatewayRouteCreateInput
}

input GatewayRouteRelateToManyInput {
  create: [GatewayRouteCreateInput]
  connect: [GatewayRouteWhereUniqueInput]
  disconnect: [GatewayRouteWhereUniqueInput]
  disconnectAll: Boolean
}

#  A keystone list
type GatewayService {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the GatewayService List config, or
  #  2. As an alias to the field set on 'labelField' in the GatewayService List config, or
  #  3. As an alias to a 'name' field on the GatewayService List (if one exists), or
  #  4. As an alias to the 'id' field on the GatewayService List.
  _label_: String
  id: ID!
  name: String
  namespace: String
  host: String
  tags: String
  routes(
    where: GatewayRouteWhereInput
    search: String
    sortBy: [SortGatewayRoutesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [GatewayRoute!]!
  _routesMeta(
    where: GatewayRouteWhereInput
    search: String
    sortBy: [SortGatewayRoutesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  plugins(
    where: GatewayPluginWhereInput
    search: String
    sortBy: [SortGatewayPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [GatewayPlugin!]!
  _pluginsMeta(
    where: GatewayPluginWhereInput
    search: String
    sortBy: [SortGatewayPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  environment: Environment
  extSource: String
  extForeignKey: String
  extRecordHash: String
  updatedAt: DateTime
  createdAt: DateTime
}

input GatewayServiceWhereInput {
  AND: [GatewayServiceWhereInput]
  OR: [GatewayServiceWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  namespace: String
  namespace_not: String
  namespace_contains: String
  namespace_not_contains: String
  namespace_starts_with: String
  namespace_not_starts_with: String
  namespace_ends_with: String
  namespace_not_ends_with: String
  namespace_i: String
  namespace_not_i: String
  namespace_contains_i: String
  namespace_not_contains_i: String
  namespace_starts_with_i: String
  namespace_not_starts_with_i: String
  namespace_ends_with_i: String
  namespace_not_ends_with_i: String
  namespace_in: [String]
  namespace_not_in: [String]
  host: String
  host_not: String
  host_contains: String
  host_not_contains: String
  host_starts_with: String
  host_not_starts_with: String
  host_ends_with: String
  host_not_ends_with: String
  host_i: String
  host_not_i: String
  host_contains_i: String
  host_not_contains_i: String
  host_starts_with_i: String
  host_not_starts_with_i: String
  host_ends_with_i: String
  host_not_ends_with_i: String
  host_in: [String]
  host_not_in: [String]
  tags: String
  tags_not: String
  tags_contains: String
  tags_not_contains: String
  tags_starts_with: String
  tags_not_starts_with: String
  tags_ends_with: String
  tags_not_ends_with: String
  tags_i: String
  tags_not_i: String
  tags_contains_i: String
  tags_not_contains_i: String
  tags_starts_with_i: String
  tags_not_starts_with_i: String
  tags_ends_with_i: String
  tags_not_ends_with_i: String
  tags_in: [String]
  tags_not_in: [String]
  #  condition must be true for all nodes
  routes_every: GatewayRouteWhereInput
  #  condition must be true for at least 1 node
  routes_some: GatewayRouteWhereInput
  #  condition must be false for all nodes
  routes_none: GatewayRouteWhereInput
  #  condition must be true for all nodes
  plugins_every: GatewayPluginWhereInput
  #  condition must be true for at least 1 node
  plugins_some: GatewayPluginWhereInput
  #  condition must be false for all nodes
  plugins_none: GatewayPluginWhereInput
  environment: EnvironmentWhereInput
  environment_is_null: Boolean
  extSource: String
  extSource_not: String
  extSource_contains: String
  extSource_not_contains: String
  extSource_starts_with: String
  extSource_not_starts_with: String
  extSource_ends_with: String
  extSource_not_ends_with: String
  extSource_i: String
  extSource_not_i: String
  extSource_contains_i: String
  extSource_not_contains_i: String
  extSource_starts_with_i: String
  extSource_not_starts_with_i: String
  extSource_ends_with_i: String
  extSource_not_ends_with_i: String
  extSource_in: [String]
  extSource_not_in: [String]
  extForeignKey: String
  extForeignKey_not: String
  extForeignKey_contains: String
  extForeignKey_not_contains: String
  extForeignKey_starts_with: String
  extForeignKey_not_starts_with: String
  extForeignKey_ends_with: String
  extForeignKey_not_ends_with: String
  extForeignKey_i: String
  extForeignKey_not_i: String
  extForeignKey_contains_i: String
  extForeignKey_not_contains_i: String
  extForeignKey_starts_with_i: String
  extForeignKey_not_starts_with_i: String
  extForeignKey_ends_with_i: String
  extForeignKey_not_ends_with_i: String
  extForeignKey_in: [String]
  extForeignKey_not_in: [String]
  extRecordHash: String
  extRecordHash_not: String
  extRecordHash_contains: String
  extRecordHash_not_contains: String
  extRecordHash_starts_with: String
  extRecordHash_not_starts_with: String
  extRecordHash_ends_with: String
  extRecordHash_not_ends_with: String
  extRecordHash_i: String
  extRecordHash_not_i: String
  extRecordHash_contains_i: String
  extRecordHash_not_contains_i: String
  extRecordHash_starts_with_i: String
  extRecordHash_not_starts_with_i: String
  extRecordHash_ends_with_i: String
  extRecordHash_not_ends_with_i: String
  extRecordHash_in: [String]
  extRecordHash_not_in: [String]
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input GatewayServiceWhereUniqueInput {
  id: ID!
}

enum SortGatewayServicesBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  namespace_ASC
  namespace_DESC
  host_ASC
  host_DESC
  tags_ASC
  tags_DESC
  routes_ASC
  routes_DESC
  plugins_ASC
  plugins_DESC
  environment_ASC
  environment_DESC
  extSource_ASC
  extSource_DESC
  extForeignKey_ASC
  extForeignKey_DESC
  extRecordHash_ASC
  extRecordHash_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input GatewayServiceUpdateInput {
  name: String
  namespace: String
  host: String
  tags: String
  routes: GatewayRouteRelateToManyInput
  plugins: GatewayPluginRelateToManyInput
  environment: EnvironmentRelateToOneInput
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input GatewayServicesUpdateInput {
  id: ID!
  data: GatewayServiceUpdateInput
}

input GatewayServiceCreateInput {
  name: String
  namespace: String
  host: String
  tags: String
  routes: GatewayRouteRelateToManyInput
  plugins: GatewayPluginRelateToManyInput
  environment: EnvironmentRelateToOneInput
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input GatewayServicesCreateInput {
  data: GatewayServiceCreateInput
}

#  A keystone list
type Legal {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the Legal List config, or
  #  2. As an alias to the field set on 'labelField' in the Legal List config, or
  #  3. As an alias to a 'name' field on the Legal List (if one exists), or
  #  4. As an alias to the 'id' field on the Legal List.
  _label_: String
  id: ID!
  title: String
  description: String
  link: String
  document: String
  reference: String
  version: Int
  isActive: Boolean
  updatedBy: User
  createdBy: User
  updatedAt: DateTime
  createdAt: DateTime
}

input LegalWhereInput {
  AND: [LegalWhereInput]
  OR: [LegalWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  title: String
  title_not: String
  title_contains: String
  title_not_contains: String
  title_starts_with: String
  title_not_starts_with: String
  title_ends_with: String
  title_not_ends_with: String
  title_i: String
  title_not_i: String
  title_contains_i: String
  title_not_contains_i: String
  title_starts_with_i: String
  title_not_starts_with_i: String
  title_ends_with_i: String
  title_not_ends_with_i: String
  title_in: [String]
  title_not_in: [String]
  description: String
  description_not: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  description_i: String
  description_not_i: String
  description_contains_i: String
  description_not_contains_i: String
  description_starts_with_i: String
  description_not_starts_with_i: String
  description_ends_with_i: String
  description_not_ends_with_i: String
  description_in: [String]
  description_not_in: [String]
  link: String
  link_not: String
  link_contains: String
  link_not_contains: String
  link_starts_with: String
  link_not_starts_with: String
  link_ends_with: String
  link_not_ends_with: String
  link_i: String
  link_not_i: String
  link_contains_i: String
  link_not_contains_i: String
  link_starts_with_i: String
  link_not_starts_with_i: String
  link_ends_with_i: String
  link_not_ends_with_i: String
  link_in: [String]
  link_not_in: [String]
  document: String
  document_not: String
  document_in: [String]
  document_not_in: [String]
  reference: String
  reference_not: String
  reference_contains: String
  reference_not_contains: String
  reference_starts_with: String
  reference_not_starts_with: String
  reference_ends_with: String
  reference_not_ends_with: String
  reference_i: String
  reference_not_i: String
  reference_contains_i: String
  reference_not_contains_i: String
  reference_starts_with_i: String
  reference_not_starts_with_i: String
  reference_ends_with_i: String
  reference_not_ends_with_i: String
  reference_in: [String]
  reference_not_in: [String]
  version: Int
  version_not: Int
  version_lt: Int
  version_lte: Int
  version_gt: Int
  version_gte: Int
  version_in: [Int]
  version_not_in: [Int]
  isActive: Boolean
  isActive_not: Boolean
  updatedBy: UserWhereInput
  updatedBy_is_null: Boolean
  createdBy: UserWhereInput
  createdBy_is_null: Boolean
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input LegalWhereUniqueInput {
  id: ID!
}

enum SortLegalsBy {
  id_ASC
  id_DESC
  title_ASC
  title_DESC
  description_ASC
  description_DESC
  link_ASC
  link_DESC
  document_ASC
  document_DESC
  reference_ASC
  reference_DESC
  version_ASC
  version_DESC
  isActive_ASC
  isActive_DESC
  updatedBy_ASC
  updatedBy_DESC
  createdBy_ASC
  createdBy_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input LegalUpdateInput {
  title: String
  description: String
  link: String
  document: String
  reference: String
  version: Int
  isActive: Boolean
}

input LegalsUpdateInput {
  id: ID!
  data: LegalUpdateInput
}

input LegalCreateInput {
  title: String
  description: String
  link: String
  document: String
  reference: String
  version: Int
  isActive: Boolean
}

input LegalsCreateInput {
  data: LegalCreateInput
}

#  A keystone list
type Metric {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the Metric List config, or
  #  2. As an alias to the field set on 'labelField' in the Metric List config, or
  #  3. As an alias to a 'name' field on the Metric List (if one exists), or
  #  4. As an alias to the 'id' field on the Metric List.
  _label_: String
  id: ID!
  name: String
  query: String
  day: String
  metric: String
  values: String
  service: GatewayService
  updatedAt: DateTime
  createdAt: DateTime
}

input MetricWhereInput {
  AND: [MetricWhereInput]
  OR: [MetricWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  query: String
  query_not: String
  query_contains: String
  query_not_contains: String
  query_starts_with: String
  query_not_starts_with: String
  query_ends_with: String
  query_not_ends_with: String
  query_i: String
  query_not_i: String
  query_contains_i: String
  query_not_contains_i: String
  query_starts_with_i: String
  query_not_starts_with_i: String
  query_ends_with_i: String
  query_not_ends_with_i: String
  query_in: [String]
  query_not_in: [String]
  day: String
  day_not: String
  day_contains: String
  day_not_contains: String
  day_starts_with: String
  day_not_starts_with: String
  day_ends_with: String
  day_not_ends_with: String
  day_i: String
  day_not_i: String
  day_contains_i: String
  day_not_contains_i: String
  day_starts_with_i: String
  day_not_starts_with_i: String
  day_ends_with_i: String
  day_not_ends_with_i: String
  day_in: [String]
  day_not_in: [String]
  metric: String
  metric_not: String
  metric_contains: String
  metric_not_contains: String
  metric_starts_with: String
  metric_not_starts_with: String
  metric_ends_with: String
  metric_not_ends_with: String
  metric_i: String
  metric_not_i: String
  metric_contains_i: String
  metric_not_contains_i: String
  metric_starts_with_i: String
  metric_not_starts_with_i: String
  metric_ends_with_i: String
  metric_not_ends_with_i: String
  metric_in: [String]
  metric_not_in: [String]
  values: String
  values_not: String
  values_contains: String
  values_not_contains: String
  values_starts_with: String
  values_not_starts_with: String
  values_ends_with: String
  values_not_ends_with: String
  values_i: String
  values_not_i: String
  values_contains_i: String
  values_not_contains_i: String
  values_starts_with_i: String
  values_not_starts_with_i: String
  values_ends_with_i: String
  values_not_ends_with_i: String
  values_in: [String]
  values_not_in: [String]
  service: GatewayServiceWhereInput
  service_is_null: Boolean
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input MetricWhereUniqueInput {
  id: ID!
}

enum SortMetricsBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  query_ASC
  query_DESC
  day_ASC
  day_DESC
  metric_ASC
  metric_DESC
  values_ASC
  values_DESC
  service_ASC
  service_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input MetricUpdateInput {
  name: String
  query: String
  day: String
  metric: String
  values: String
  service: GatewayServiceRelateToOneInput
}

input MetricsUpdateInput {
  id: ID!
  data: MetricUpdateInput
}

input MetricCreateInput {
  name: String
  query: String
  day: String
  metric: String
  values: String
  service: GatewayServiceRelateToOneInput
}

input MetricsCreateInput {
  data: MetricCreateInput
}

input OrganizationUnitRelateToManyInput {
  create: [OrganizationUnitCreateInput]
  connect: [OrganizationUnitWhereUniqueInput]
  disconnect: [OrganizationUnitWhereUniqueInput]
  disconnectAll: Boolean
}

#  A keystone list
type Organization {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the Organization List config, or
  #  2. As an alias to the field set on 'labelField' in the Organization List config, or
  #  3. As an alias to a 'name' field on the Organization List (if one exists), or
  #  4. As an alias to the 'id' field on the Organization List.
  _label_: String
  id: ID!
  name: String
  sector: String
  title: String
  tags: String
  description: String
  orgUnits(
    where: OrganizationUnitWhereInput
    search: String
    sortBy: [SortOrganizationUnitsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [OrganizationUnit!]!
  _orgUnitsMeta(
    where: OrganizationUnitWhereInput
    search: String
    sortBy: [SortOrganizationUnitsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input OrganizationWhereInput {
  AND: [OrganizationWhereInput]
  OR: [OrganizationWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  sector: String
  sector_not: String
  sector_contains: String
  sector_not_contains: String
  sector_starts_with: String
  sector_not_starts_with: String
  sector_ends_with: String
  sector_not_ends_with: String
  sector_i: String
  sector_not_i: String
  sector_contains_i: String
  sector_not_contains_i: String
  sector_starts_with_i: String
  sector_not_starts_with_i: String
  sector_ends_with_i: String
  sector_not_ends_with_i: String
  sector_in: [String]
  sector_not_in: [String]
  title: String
  title_not: String
  title_contains: String
  title_not_contains: String
  title_starts_with: String
  title_not_starts_with: String
  title_ends_with: String
  title_not_ends_with: String
  title_i: String
  title_not_i: String
  title_contains_i: String
  title_not_contains_i: String
  title_starts_with_i: String
  title_not_starts_with_i: String
  title_ends_with_i: String
  title_not_ends_with_i: String
  title_in: [String]
  title_not_in: [String]
  tags: String
  tags_not: String
  tags_contains: String
  tags_not_contains: String
  tags_starts_with: String
  tags_not_starts_with: String
  tags_ends_with: String
  tags_not_ends_with: String
  tags_i: String
  tags_not_i: String
  tags_contains_i: String
  tags_not_contains_i: String
  tags_starts_with_i: String
  tags_not_starts_with_i: String
  tags_ends_with_i: String
  tags_not_ends_with_i: String
  tags_in: [String]
  tags_not_in: [String]
  description: String
  description_not: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  description_i: String
  description_not_i: String
  description_contains_i: String
  description_not_contains_i: String
  description_starts_with_i: String
  description_not_starts_with_i: String
  description_ends_with_i: String
  description_not_ends_with_i: String
  description_in: [String]
  description_not_in: [String]
  #  condition must be true for all nodes
  orgUnits_every: OrganizationUnitWhereInput
  #  condition must be true for at least 1 node
  orgUnits_some: OrganizationUnitWhereInput
  #  condition must be false for all nodes
  orgUnits_none: OrganizationUnitWhereInput
  extSource: String
  extSource_not: String
  extSource_contains: String
  extSource_not_contains: String
  extSource_starts_with: String
  extSource_not_starts_with: String
  extSource_ends_with: String
  extSource_not_ends_with: String
  extSource_i: String
  extSource_not_i: String
  extSource_contains_i: String
  extSource_not_contains_i: String
  extSource_starts_with_i: String
  extSource_not_starts_with_i: String
  extSource_ends_with_i: String
  extSource_not_ends_with_i: String
  extSource_in: [String]
  extSource_not_in: [String]
  extForeignKey: String
  extForeignKey_not: String
  extForeignKey_contains: String
  extForeignKey_not_contains: String
  extForeignKey_starts_with: String
  extForeignKey_not_starts_with: String
  extForeignKey_ends_with: String
  extForeignKey_not_ends_with: String
  extForeignKey_i: String
  extForeignKey_not_i: String
  extForeignKey_contains_i: String
  extForeignKey_not_contains_i: String
  extForeignKey_starts_with_i: String
  extForeignKey_not_starts_with_i: String
  extForeignKey_ends_with_i: String
  extForeignKey_not_ends_with_i: String
  extForeignKey_in: [String]
  extForeignKey_not_in: [String]
  extRecordHash: String
  extRecordHash_not: String
  extRecordHash_contains: String
  extRecordHash_not_contains: String
  extRecordHash_starts_with: String
  extRecordHash_not_starts_with: String
  extRecordHash_ends_with: String
  extRecordHash_not_ends_with: String
  extRecordHash_i: String
  extRecordHash_not_i: String
  extRecordHash_contains_i: String
  extRecordHash_not_contains_i: String
  extRecordHash_starts_with_i: String
  extRecordHash_not_starts_with_i: String
  extRecordHash_ends_with_i: String
  extRecordHash_not_ends_with_i: String
  extRecordHash_in: [String]
  extRecordHash_not_in: [String]
}

input OrganizationWhereUniqueInput {
  id: ID!
}

enum SortOrganizationsBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  sector_ASC
  sector_DESC
  title_ASC
  title_DESC
  tags_ASC
  tags_DESC
  description_ASC
  description_DESC
  orgUnits_ASC
  orgUnits_DESC
  extSource_ASC
  extSource_DESC
  extForeignKey_ASC
  extForeignKey_DESC
  extRecordHash_ASC
  extRecordHash_DESC
}

input OrganizationUpdateInput {
  name: String
  sector: String
  title: String
  tags: String
  description: String
  orgUnits: OrganizationUnitRelateToManyInput
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input OrganizationsUpdateInput {
  id: ID!
  data: OrganizationUpdateInput
}

input OrganizationCreateInput {
  name: String
  sector: String
  title: String
  tags: String
  description: String
  orgUnits: OrganizationUnitRelateToManyInput
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input OrganizationsCreateInput {
  data: OrganizationCreateInput
}

#  A keystone list
type OrganizationUnit {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the OrganizationUnit List config, or
  #  2. As an alias to the field set on 'labelField' in the OrganizationUnit List config, or
  #  3. As an alias to a 'name' field on the OrganizationUnit List (if one exists), or
  #  4. As an alias to the 'id' field on the OrganizationUnit List.
  _label_: String
  id: ID!
  name: String
  sector: String
  title: String
  tags: String
  description: String
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input OrganizationUnitWhereInput {
  AND: [OrganizationUnitWhereInput]
  OR: [OrganizationUnitWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  sector: String
  sector_not: String
  sector_contains: String
  sector_not_contains: String
  sector_starts_with: String
  sector_not_starts_with: String
  sector_ends_with: String
  sector_not_ends_with: String
  sector_i: String
  sector_not_i: String
  sector_contains_i: String
  sector_not_contains_i: String
  sector_starts_with_i: String
  sector_not_starts_with_i: String
  sector_ends_with_i: String
  sector_not_ends_with_i: String
  sector_in: [String]
  sector_not_in: [String]
  title: String
  title_not: String
  title_contains: String
  title_not_contains: String
  title_starts_with: String
  title_not_starts_with: String
  title_ends_with: String
  title_not_ends_with: String
  title_i: String
  title_not_i: String
  title_contains_i: String
  title_not_contains_i: String
  title_starts_with_i: String
  title_not_starts_with_i: String
  title_ends_with_i: String
  title_not_ends_with_i: String
  title_in: [String]
  title_not_in: [String]
  tags: String
  tags_not: String
  tags_contains: String
  tags_not_contains: String
  tags_starts_with: String
  tags_not_starts_with: String
  tags_ends_with: String
  tags_not_ends_with: String
  tags_i: String
  tags_not_i: String
  tags_contains_i: String
  tags_not_contains_i: String
  tags_starts_with_i: String
  tags_not_starts_with_i: String
  tags_ends_with_i: String
  tags_not_ends_with_i: String
  tags_in: [String]
  tags_not_in: [String]
  description: String
  description_not: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  description_i: String
  description_not_i: String
  description_contains_i: String
  description_not_contains_i: String
  description_starts_with_i: String
  description_not_starts_with_i: String
  description_ends_with_i: String
  description_not_ends_with_i: String
  description_in: [String]
  description_not_in: [String]
  extSource: String
  extSource_not: String
  extSource_contains: String
  extSource_not_contains: String
  extSource_starts_with: String
  extSource_not_starts_with: String
  extSource_ends_with: String
  extSource_not_ends_with: String
  extSource_i: String
  extSource_not_i: String
  extSource_contains_i: String
  extSource_not_contains_i: String
  extSource_starts_with_i: String
  extSource_not_starts_with_i: String
  extSource_ends_with_i: String
  extSource_not_ends_with_i: String
  extSource_in: [String]
  extSource_not_in: [String]
  extForeignKey: String
  extForeignKey_not: String
  extForeignKey_contains: String
  extForeignKey_not_contains: String
  extForeignKey_starts_with: String
  extForeignKey_not_starts_with: String
  extForeignKey_ends_with: String
  extForeignKey_not_ends_with: String
  extForeignKey_i: String
  extForeignKey_not_i: String
  extForeignKey_contains_i: String
  extForeignKey_not_contains_i: String
  extForeignKey_starts_with_i: String
  extForeignKey_not_starts_with_i: String
  extForeignKey_ends_with_i: String
  extForeignKey_not_ends_with_i: String
  extForeignKey_in: [String]
  extForeignKey_not_in: [String]
  extRecordHash: String
  extRecordHash_not: String
  extRecordHash_contains: String
  extRecordHash_not_contains: String
  extRecordHash_starts_with: String
  extRecordHash_not_starts_with: String
  extRecordHash_ends_with: String
  extRecordHash_not_ends_with: String
  extRecordHash_i: String
  extRecordHash_not_i: String
  extRecordHash_contains_i: String
  extRecordHash_not_contains_i: String
  extRecordHash_starts_with_i: String
  extRecordHash_not_starts_with_i: String
  extRecordHash_ends_with_i: String
  extRecordHash_not_ends_with_i: String
  extRecordHash_in: [String]
  extRecordHash_not_in: [String]
}

input OrganizationUnitWhereUniqueInput {
  id: ID!
}

enum SortOrganizationUnitsBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  sector_ASC
  sector_DESC
  title_ASC
  title_DESC
  tags_ASC
  tags_DESC
  description_ASC
  description_DESC
  extSource_ASC
  extSource_DESC
  extForeignKey_ASC
  extForeignKey_DESC
  extRecordHash_ASC
  extRecordHash_DESC
}

input OrganizationUnitUpdateInput {
  name: String
  sector: String
  title: String
  tags: String
  description: String
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input OrganizationUnitsUpdateInput {
  id: ID!
  data: OrganizationUnitUpdateInput
}

input OrganizationUnitCreateInput {
  name: String
  sector: String
  title: String
  tags: String
  description: String
  extSource: String
  extForeignKey: String
  extRecordHash: String
}

input OrganizationUnitsCreateInput {
  data: OrganizationUnitCreateInput
}

input DatasetRelateToOneInput {
  create: DatasetCreateInput
  connect: DatasetWhereUniqueInput
  disconnect: DatasetWhereUniqueInput
  disconnectAll: Boolean
}

#  A keystone list
type Product {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the Product List config, or
  #  2. As an alias to the field set on 'labelField' in the Product List config, or
  #  3. As an alias to a 'name' field on the Product List (if one exists), or
  #  4. As an alias to the 'id' field on the Product List.
  _label_: String
  id: ID!
  appId: String
  name: String
  namespace: String
  description: String
  dataset: Dataset
  organization: Organization
  organizationUnit: OrganizationUnit
  environments(
    where: EnvironmentWhereInput
    search: String
    sortBy: [SortEnvironmentsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Environment!]!
  _environmentsMeta(
    where: EnvironmentWhereInput
    search: String
    sortBy: [SortEnvironmentsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
}

input ProductWhereInput {
  AND: [ProductWhereInput]
  OR: [ProductWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  appId: String
  appId_not: String
  appId_contains: String
  appId_not_contains: String
  appId_starts_with: String
  appId_not_starts_with: String
  appId_ends_with: String
  appId_not_ends_with: String
  appId_i: String
  appId_not_i: String
  appId_contains_i: String
  appId_not_contains_i: String
  appId_starts_with_i: String
  appId_not_starts_with_i: String
  appId_ends_with_i: String
  appId_not_ends_with_i: String
  appId_in: [String]
  appId_not_in: [String]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  namespace: String
  namespace_not: String
  namespace_contains: String
  namespace_not_contains: String
  namespace_starts_with: String
  namespace_not_starts_with: String
  namespace_ends_with: String
  namespace_not_ends_with: String
  namespace_i: String
  namespace_not_i: String
  namespace_contains_i: String
  namespace_not_contains_i: String
  namespace_starts_with_i: String
  namespace_not_starts_with_i: String
  namespace_ends_with_i: String
  namespace_not_ends_with_i: String
  namespace_in: [String]
  namespace_not_in: [String]
  description: String
  description_not: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  description_i: String
  description_not_i: String
  description_contains_i: String
  description_not_contains_i: String
  description_starts_with_i: String
  description_not_starts_with_i: String
  description_ends_with_i: String
  description_not_ends_with_i: String
  description_in: [String]
  description_not_in: [String]
  dataset: DatasetWhereInput
  dataset_is_null: Boolean
  organization: OrganizationWhereInput
  organization_is_null: Boolean
  organizationUnit: OrganizationUnitWhereInput
  organizationUnit_is_null: Boolean
  #  condition must be true for all nodes
  environments_every: EnvironmentWhereInput
  #  condition must be true for at least 1 node
  environments_some: EnvironmentWhereInput
  #  condition must be false for all nodes
  environments_none: EnvironmentWhereInput
}

input ProductWhereUniqueInput {
  id: ID!
}

enum SortProductsBy {
  id_ASC
  id_DESC
  appId_ASC
  appId_DESC
  name_ASC
  name_DESC
  namespace_ASC
  namespace_DESC
  description_ASC
  description_DESC
  dataset_ASC
  dataset_DESC
  organization_ASC
  organization_DESC
  organizationUnit_ASC
  organizationUnit_DESC
  environments_ASC
  environments_DESC
}

input ProductUpdateInput {
  appId: String
  name: String
  namespace: String
  description: String
  dataset: DatasetRelateToOneInput
  organization: OrganizationRelateToOneInput
  organizationUnit: OrganizationUnitRelateToOneInput
  environments: EnvironmentRelateToManyInput
}

input ProductsUpdateInput {
  id: ID!
  data: ProductUpdateInput
}

input ProductCreateInput {
  appId: String
  name: String
  namespace: String
  description: String
  dataset: DatasetRelateToOneInput
  organization: OrganizationRelateToOneInput
  organizationUnit: OrganizationUnitRelateToOneInput
  environments: EnvironmentRelateToManyInput
}

input ProductsCreateInput {
  data: ProductCreateInput
}

enum ServiceAccessConsumerTypeType {
  client
  user
}

input GatewayConsumerRelateToOneInput {
  create: GatewayConsumerCreateInput
  connect: GatewayConsumerWhereUniqueInput
  disconnect: GatewayConsumerWhereUniqueInput
  disconnectAll: Boolean
}

#  A keystone list
type ServiceAccess {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the ServiceAccess List config, or
  #  2. As an alias to the field set on 'labelField' in the ServiceAccess List config, or
  #  3. As an alias to a 'name' field on the ServiceAccess List (if one exists), or
  #  4. As an alias to the 'id' field on the ServiceAccess List.
  _label_: String
  id: ID!
  name: String
  namespace: String
  active: Boolean
  aclEnabled: Boolean
  consumerType: ServiceAccessConsumerTypeType
  credentialReference: String
  credential: String
  clientRoles: String
  consumer: GatewayConsumer
  application: Application
  productEnvironment: Environment
  updatedAt: DateTime
  createdAt: DateTime
}

input ServiceAccessWhereInput {
  AND: [ServiceAccessWhereInput]
  OR: [ServiceAccessWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  namespace: String
  namespace_not: String
  namespace_contains: String
  namespace_not_contains: String
  namespace_starts_with: String
  namespace_not_starts_with: String
  namespace_ends_with: String
  namespace_not_ends_with: String
  namespace_i: String
  namespace_not_i: String
  namespace_contains_i: String
  namespace_not_contains_i: String
  namespace_starts_with_i: String
  namespace_not_starts_with_i: String
  namespace_ends_with_i: String
  namespace_not_ends_with_i: String
  namespace_in: [String]
  namespace_not_in: [String]
  active: Boolean
  active_not: Boolean
  aclEnabled: Boolean
  aclEnabled_not: Boolean
  consumerType: ServiceAccessConsumerTypeType
  consumerType_not: ServiceAccessConsumerTypeType
  consumerType_in: [ServiceAccessConsumerTypeType]
  consumerType_not_in: [ServiceAccessConsumerTypeType]
  credentialReference: String
  credentialReference_not: String
  credentialReference_contains: String
  credentialReference_not_contains: String
  credentialReference_starts_with: String
  credentialReference_not_starts_with: String
  credentialReference_ends_with: String
  credentialReference_not_ends_with: String
  credentialReference_i: String
  credentialReference_not_i: String
  credentialReference_contains_i: String
  credentialReference_not_contains_i: String
  credentialReference_starts_with_i: String
  credentialReference_not_starts_with_i: String
  credentialReference_ends_with_i: String
  credentialReference_not_ends_with_i: String
  credentialReference_in: [String]
  credentialReference_not_in: [String]
  credential: String
  credential_not: String
  credential_contains: String
  credential_not_contains: String
  credential_starts_with: String
  credential_not_starts_with: String
  credential_ends_with: String
  credential_not_ends_with: String
  credential_i: String
  credential_not_i: String
  credential_contains_i: String
  credential_not_contains_i: String
  credential_starts_with_i: String
  credential_not_starts_with_i: String
  credential_ends_with_i: String
  credential_not_ends_with_i: String
  credential_in: [String]
  credential_not_in: [String]
  clientRoles: String
  clientRoles_not: String
  clientRoles_contains: String
  clientRoles_not_contains: String
  clientRoles_starts_with: String
  clientRoles_not_starts_with: String
  clientRoles_ends_with: String
  clientRoles_not_ends_with: String
  clientRoles_i: String
  clientRoles_not_i: String
  clientRoles_contains_i: String
  clientRoles_not_contains_i: String
  clientRoles_starts_with_i: String
  clientRoles_not_starts_with_i: String
  clientRoles_ends_with_i: String
  clientRoles_not_ends_with_i: String
  clientRoles_in: [String]
  clientRoles_not_in: [String]
  consumer: GatewayConsumerWhereInput
  consumer_is_null: Boolean
  application: ApplicationWhereInput
  application_is_null: Boolean
  productEnvironment: EnvironmentWhereInput
  productEnvironment_is_null: Boolean
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input ServiceAccessWhereUniqueInput {
  id: ID!
}

enum SortServiceAccessesBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  namespace_ASC
  namespace_DESC
  active_ASC
  active_DESC
  aclEnabled_ASC
  aclEnabled_DESC
  consumerType_ASC
  consumerType_DESC
  credentialReference_ASC
  credentialReference_DESC
  credential_ASC
  credential_DESC
  clientRoles_ASC
  clientRoles_DESC
  consumer_ASC
  consumer_DESC
  application_ASC
  application_DESC
  productEnvironment_ASC
  productEnvironment_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input ServiceAccessUpdateInput {
  name: String
  namespace: String
  active: Boolean
  aclEnabled: Boolean
  consumerType: ServiceAccessConsumerTypeType
  credentialReference: String
  credential: String
  clientRoles: String
  consumer: GatewayConsumerRelateToOneInput
  application: ApplicationRelateToOneInput
  productEnvironment: EnvironmentRelateToOneInput
}

input ServiceAccessesUpdateInput {
  id: ID!
  data: ServiceAccessUpdateInput
}

input ServiceAccessCreateInput {
  name: String
  namespace: String
  active: Boolean
  aclEnabled: Boolean
  consumerType: ServiceAccessConsumerTypeType
  credentialReference: String
  credential: String
  clientRoles: String
  consumer: GatewayConsumerRelateToOneInput
  application: ApplicationRelateToOneInput
  productEnvironment: EnvironmentRelateToOneInput
}

input ServiceAccessesCreateInput {
  data: ServiceAccessCreateInput
}

#  A keystone list
type TemporaryIdentity {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the TemporaryIdentity List config, or
  #  2. As an alias to the field set on 'labelField' in the TemporaryIdentity List config, or
  #  3. As an alias to a 'name' field on the TemporaryIdentity List (if one exists), or
  #  4. As an alias to the 'id' field on the TemporaryIdentity List.
  _label_: String
  id: ID!
  jti: String
  sub: String
  name: String
  username: String
  email: String
  isAdmin: Boolean
  userId: String
  namespace: String
  groups: String
  roles: String
  scopes: String
  updatedAt: DateTime
  createdAt: DateTime
}

input TemporaryIdentityWhereInput {
  AND: [TemporaryIdentityWhereInput]
  OR: [TemporaryIdentityWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  jti: String
  jti_not: String
  jti_contains: String
  jti_not_contains: String
  jti_starts_with: String
  jti_not_starts_with: String
  jti_ends_with: String
  jti_not_ends_with: String
  jti_i: String
  jti_not_i: String
  jti_contains_i: String
  jti_not_contains_i: String
  jti_starts_with_i: String
  jti_not_starts_with_i: String
  jti_ends_with_i: String
  jti_not_ends_with_i: String
  jti_in: [String]
  jti_not_in: [String]
  sub: String
  sub_not: String
  sub_contains: String
  sub_not_contains: String
  sub_starts_with: String
  sub_not_starts_with: String
  sub_ends_with: String
  sub_not_ends_with: String
  sub_i: String
  sub_not_i: String
  sub_contains_i: String
  sub_not_contains_i: String
  sub_starts_with_i: String
  sub_not_starts_with_i: String
  sub_ends_with_i: String
  sub_not_ends_with_i: String
  sub_in: [String]
  sub_not_in: [String]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  username: String
  username_not: String
  username_contains: String
  username_not_contains: String
  username_starts_with: String
  username_not_starts_with: String
  username_ends_with: String
  username_not_ends_with: String
  username_i: String
  username_not_i: String
  username_contains_i: String
  username_not_contains_i: String
  username_starts_with_i: String
  username_not_starts_with_i: String
  username_ends_with_i: String
  username_not_ends_with_i: String
  username_in: [String]
  username_not_in: [String]
  email: String
  email_not: String
  email_contains: String
  email_not_contains: String
  email_starts_with: String
  email_not_starts_with: String
  email_ends_with: String
  email_not_ends_with: String
  email_i: String
  email_not_i: String
  email_contains_i: String
  email_not_contains_i: String
  email_starts_with_i: String
  email_not_starts_with_i: String
  email_ends_with_i: String
  email_not_ends_with_i: String
  email_in: [String]
  email_not_in: [String]
  isAdmin: Boolean
  isAdmin_not: Boolean
  userId: String
  userId_not: String
  userId_contains: String
  userId_not_contains: String
  userId_starts_with: String
  userId_not_starts_with: String
  userId_ends_with: String
  userId_not_ends_with: String
  userId_i: String
  userId_not_i: String
  userId_contains_i: String
  userId_not_contains_i: String
  userId_starts_with_i: String
  userId_not_starts_with_i: String
  userId_ends_with_i: String
  userId_not_ends_with_i: String
  userId_in: [String]
  userId_not_in: [String]
  namespace: String
  namespace_not: String
  namespace_contains: String
  namespace_not_contains: String
  namespace_starts_with: String
  namespace_not_starts_with: String
  namespace_ends_with: String
  namespace_not_ends_with: String
  namespace_i: String
  namespace_not_i: String
  namespace_contains_i: String
  namespace_not_contains_i: String
  namespace_starts_with_i: String
  namespace_not_starts_with_i: String
  namespace_ends_with_i: String
  namespace_not_ends_with_i: String
  namespace_in: [String]
  namespace_not_in: [String]
  groups: String
  groups_not: String
  groups_contains: String
  groups_not_contains: String
  groups_starts_with: String
  groups_not_starts_with: String
  groups_ends_with: String
  groups_not_ends_with: String
  groups_i: String
  groups_not_i: String
  groups_contains_i: String
  groups_not_contains_i: String
  groups_starts_with_i: String
  groups_not_starts_with_i: String
  groups_ends_with_i: String
  groups_not_ends_with_i: String
  groups_in: [String]
  groups_not_in: [String]
  roles: String
  roles_not: String
  roles_contains: String
  roles_not_contains: String
  roles_starts_with: String
  roles_not_starts_with: String
  roles_ends_with: String
  roles_not_ends_with: String
  roles_i: String
  roles_not_i: String
  roles_contains_i: String
  roles_not_contains_i: String
  roles_starts_with_i: String
  roles_not_starts_with_i: String
  roles_ends_with_i: String
  roles_not_ends_with_i: String
  roles_in: [String]
  roles_not_in: [String]
  scopes: String
  scopes_not: String
  scopes_contains: String
  scopes_not_contains: String
  scopes_starts_with: String
  scopes_not_starts_with: String
  scopes_ends_with: String
  scopes_not_ends_with: String
  scopes_i: String
  scopes_not_i: String
  scopes_contains_i: String
  scopes_not_contains_i: String
  scopes_starts_with_i: String
  scopes_not_starts_with_i: String
  scopes_ends_with_i: String
  scopes_not_ends_with_i: String
  scopes_in: [String]
  scopes_not_in: [String]
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_in: [DateTime]
  updatedAt_not_in: [DateTime]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_in: [DateTime]
  createdAt_not_in: [DateTime]
}

input TemporaryIdentityWhereUniqueInput {
  id: ID!
}

enum SortTemporaryIdentitiesBy {
  id_ASC
  id_DESC
  jti_ASC
  jti_DESC
  sub_ASC
  sub_DESC
  name_ASC
  name_DESC
  username_ASC
  username_DESC
  email_ASC
  email_DESC
  isAdmin_ASC
  isAdmin_DESC
  userId_ASC
  userId_DESC
  namespace_ASC
  namespace_DESC
  groups_ASC
  groups_DESC
  roles_ASC
  roles_DESC
  scopes_ASC
  scopes_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

input TemporaryIdentityUpdateInput {
  jti: String
  sub: String
  name: String
  username: String
  email: String
  isAdmin: Boolean
  userId: String
  namespace: String
  groups: String
  roles: String
  scopes: String
}

input TemporaryIdentitiesUpdateInput {
  id: ID!
  data: TemporaryIdentityUpdateInput
}

input TemporaryIdentityCreateInput {
  jti: String
  sub: String
  name: String
  username: String
  email: String
  isAdmin: Boolean
  userId: String
  namespace: String
  groups: String
  roles: String
  scopes: String
}

input TemporaryIdentitiesCreateInput {
  data: TemporaryIdentityCreateInput
}

#  A keystone list
type User {
  # This virtual field will be resolved in one of the following ways (in this order):
  #  1. Execution of 'labelResolver' set on the User List config, or
  #  2. As an alias to the field set on 'labelField' in the User List config, or
  #  3. As an alias to a 'name' field on the User List (if one exists), or
  #  4. As an alias to the 'id' field on the User List.
  _label_: String
  id: ID!
  name: String
  username: String
  email: String
  isAdmin: Boolean
  password_is_set: Boolean
  legalsAgreed: String
}

input UserWhereInput {
  AND: [UserWhereInput]
  OR: [UserWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  name: String
  name_not: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  name_i: String
  name_not_i: String
  name_contains_i: String
  name_not_contains_i: String
  name_starts_with_i: String
  name_not_starts_with_i: String
  name_ends_with_i: String
  name_not_ends_with_i: String
  name_in: [String]
  name_not_in: [String]
  username: String
  username_not: String
  username_contains: String
  username_not_contains: String
  username_starts_with: String
  username_not_starts_with: String
  username_ends_with: String
  username_not_ends_with: String
  username_i: String
  username_not_i: String
  username_contains_i: String
  username_not_contains_i: String
  username_starts_with_i: String
  username_not_starts_with_i: String
  username_ends_with_i: String
  username_not_ends_with_i: String
  username_in: [String]
  username_not_in: [String]
  email: String
  email_not: String
  email_contains: String
  email_not_contains: String
  email_starts_with: String
  email_not_starts_with: String
  email_ends_with: String
  email_not_ends_with: String
  email_i: String
  email_not_i: String
  email_contains_i: String
  email_not_contains_i: String
  email_starts_with_i: String
  email_not_starts_with_i: String
  email_ends_with_i: String
  email_not_ends_with_i: String
  email_in: [String]
  email_not_in: [String]
  isAdmin: Boolean
  isAdmin_not: Boolean
  password_is_set: Boolean
  legalsAgreed: String
  legalsAgreed_not: String
  legalsAgreed_contains: String
  legalsAgreed_not_contains: String
  legalsAgreed_starts_with: String
  legalsAgreed_not_starts_with: String
  legalsAgreed_ends_with: String
  legalsAgreed_not_ends_with: String
  legalsAgreed_i: String
  legalsAgreed_not_i: String
  legalsAgreed_contains_i: String
  legalsAgreed_not_contains_i: String
  legalsAgreed_starts_with_i: String
  legalsAgreed_not_starts_with_i: String
  legalsAgreed_ends_with_i: String
  legalsAgreed_not_ends_with_i: String
  legalsAgreed_in: [String]
  legalsAgreed_not_in: [String]
}

input UserWhereUniqueInput {
  id: ID!
}

enum SortUsersBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  username_ASC
  username_DESC
  email_ASC
  email_DESC
  isAdmin_ASC
  isAdmin_DESC
  legalsAgreed_ASC
  legalsAgreed_DESC
}

input UserUpdateInput {
  name: String
  username: String
  email: String
  isAdmin: Boolean
  password: String
  legalsAgreed: String
}

input UsersUpdateInput {
  id: ID!
  data: UserUpdateInput
}

input UserCreateInput {
  name: String
  username: String
  email: String
  isAdmin: Boolean
  password: String
  legalsAgreed: String
}

input UsersCreateInput {
  data: UserCreateInput
}

# The  scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
scalar JSON

type _ListAccess {
  # Access Control settings for the currently logged in (or anonymous)
  # user when performing 'create' operations.
  # NOTE: 'create' can only return a Boolean.
  # It is not possible to specify a declarative Where clause for this
  # operation
  create: Boolean
  # Access Control settings for the currently logged in (or anonymous)
  # user when performing 'read' operations.
  read: JSON
  # Access Control settings for the currently logged in (or anonymous)
  # user when performing 'update' operations.
  update: JSON
  # Access Control settings for the currently logged in (or anonymous)
  # user when performing 'delete' operations.
  delete: JSON
  # Access Control settings for the currently logged in (or anonymous)
  # user when performing 'auth' operations.
  auth: JSON
}

type _ListQueries {
  # Single-item query name
  item: String
  # All-items query name
  list: String
  # List metadata query name
  meta: String
}

type _ListMutations {
  # Create mutation name
  create: String
  # Create many mutation name
  createMany: String
  # Update mutation name
  update: String
  # Update many mutation name
  updateMany: String
  # Delete mutation name
  delete: String
  # Delete many mutation name
  deleteMany: String
}

type _ListInputTypes {
  # Input type for matching multiple items
  whereInput: String
  # Input type for matching a unique item
  whereUniqueInput: String
  # Create mutation input type name
  createInput: String
  # Create many mutation input type name
  createManyInput: String
  # Update mutation name input
  updateInput: String
  # Update many mutation name input
  updateManyInput: String
}

type _ListSchemaFields {
  # The path of the field in its list
  path: String
  # The name of the field in its list
  name: String @deprecated(reason: "Use path instead")
  # The field type (ie, Checkbox, Text, etc)
  type: String
}

type _ListSchemaRelatedFields {
  # The typename as used in GraphQL queries
  type: String
  # A list of GraphQL field names
  fields: [String]
}

type _ListSchema {
  # The typename as used in GraphQL queries
  type: String
  # Top level GraphQL query names which either return this type, or
  # provide aggregate information about this type
  queries: _ListQueries
  # Top-level GraphQL mutation names
  mutations: _ListMutations
  # Top-level GraphQL input types
  inputTypes: _ListInputTypes
  # Information about fields defined on this list
  fields(where: _ListSchemaFieldsInput): [_ListSchemaFields]
  # Information about fields on other types which return this type, or
  # provide aggregate information about this type
  relatedFields: [_ListSchemaRelatedFields]
}

type _ListMeta {
  # The Keystone list key
  key: String
  # The Keystone List name
  name: String @deprecated(reason: "Use key instead")
  # The list's user-facing description
  description: String
  # The list's display name in the Admin UI
  label: String
  # The list's singular display name
  singular: String
  # The list's plural display name
  plural: String
  # The list's data path
  path: String
  # Access control configuration for the currently authenticated request
  access: _ListAccess
  # Information on the generated GraphQL schema
  schema: _ListSchema
}

type _QueryMeta {
  count: Int
}

input _ksListsMetaInput {
  key: String
  # Whether this is an auxiliary helper list
  auxiliary: Boolean
}

input _ListSchemaFieldsInput {
  type: String
}

type ApplicationSummary {
  appId: String
  name: String
}

type BusinessProfile {
  user: UserDetails
  institution: InstitutionDetails
}

type UserDetails {
  guid: String
  displayName: String
  firstname: String
  surname: String
  email: String
  isSuspended: Boolean
  isManagerDisabled: Boolean
}

type InstitutionDetails {
  guid: String
  type: String
  legalName: String
  address: AddressDetails
  isSuspended: Boolean
  businessTypeOther: String
}

type AddressDetails {
  addressLine1: String
  addressLine2: String
  city: String
  postal: String
  province: String
  country: String
}

type ConsumerScopesAndRoles {
  id: String!
  consumerType: String!
  defaultScopes: [String]!
  optionalScopes: [String]!
  clientRoles: [String]!
}

input ConsumerScopesAndRolesInput {
  id: String!
  defaultScopes: [String]!
  optionalScopes: [String]!
  clientRoles: [String]!
}

type Namespace {
  id: String!
  name: String!
  scopes: [UMAScope]!
  prodEnvId: String
}

input NamespaceInput {
  name: String!
}

type ServiceAccount {
  id: String!
  name: String!
  credentials: String
}

type ServiceAccountInput {
  id: String!
  name: String!
  scopes: [String]
}

type UMAPolicy {
  id: String!
  name: String!
  description: String
  type: String!
  logic: String!
  decisionStrategy: String!
  owner: String!
  users: [String]
  clients: [String]
  scopes: [String]!
}

input UMAPolicyInput {
  name: String!
  description: String
  users: [String]
  clients: [String]
  scopes: [String]!
}

type UMAScope {
  name: String!
}

type UMAResourceSet {
  id: String!
  name: String!
  type: String!
  owner: String!
  ownerManagedAccess: Boolean
  uris: [String]
  resource_scopes: [UMAScope]
}

type UMAPermissionTicket {
  id: String!
  scope: String!
  scopeName: String!
  resource: String!
  resourceName: String!
  requester: String!
  requesterName: String!
  owner: String!
  ownerName: String!
  granted: Boolean!
}

input UMAPermissionTicketInput {
  resourceId: String!
  username: String!
  granted: Boolean
  scopes: [String]!
}

type unauthenticateTemporaryIdentityOutput {
  # true when unauthentication succeeds.
  # NOTE: unauthentication always succeeds when the request has an invalid or missing authentication token.
  success: Boolean
}

type authenticateTemporaryIdentityOutput {
  #  Used to make subsequent authenticated requests by setting this token in a header: 'Authorization: Bearer <token>'.
  token: String
  #  Retrieve information on the newly authenticated TemporaryIdentity here.
  item: TemporaryIdentity
}

type Query {
  #  Search for all AccessRequest items which match the where clause.
  allAccessRequests(
    where: AccessRequestWhereInput
    search: String
    sortBy: [SortAccessRequestsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [AccessRequest]
  #  Search for the AccessRequest item with the matching ID.
  AccessRequest(where: AccessRequestWhereUniqueInput!): AccessRequest
  #  Perform a meta-query on all AccessRequest items which match the where clause.
  _allAccessRequestsMeta(
    where: AccessRequestWhereInput
    search: String
    sortBy: [SortAccessRequestsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the AccessRequest list.
  _AccessRequestsMeta: _ListMeta
  #  Search for all Activity items which match the where clause.
  allActivities(
    where: ActivityWhereInput
    search: String
    sortBy: [SortActivitiesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Activity]
  #  Search for the Activity item with the matching ID.
  Activity(where: ActivityWhereUniqueInput!): Activity
  #  Perform a meta-query on all Activity items which match the where clause.
  _allActivitiesMeta(
    where: ActivityWhereInput
    search: String
    sortBy: [SortActivitiesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the Activity list.
  _ActivitiesMeta: _ListMeta
  #  Search for all Alert items which match the where clause.
  allAlerts(
    where: AlertWhereInput
    search: String
    sortBy: [SortAlertsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Alert]
  #  Search for the Alert item with the matching ID.
  Alert(where: AlertWhereUniqueInput!): Alert
  #  Perform a meta-query on all Alert items which match the where clause.
  _allAlertsMeta(
    where: AlertWhereInput
    search: String
    sortBy: [SortAlertsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the Alert list.
  _AlertsMeta: _ListMeta
  #  Search for all Application items which match the where clause.
  allApplications(
    where: ApplicationWhereInput
    search: String
    sortBy: [SortApplicationsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Application]
  #  Search for the Application item with the matching ID.
  Application(where: ApplicationWhereUniqueInput!): Application
  #  Perform a meta-query on all Application items which match the where clause.
  _allApplicationsMeta(
    where: ApplicationWhereInput
    search: String
    sortBy: [SortApplicationsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the Application list.
  _ApplicationsMeta: _ListMeta
  #  Search for all Blob items which match the where clause.
  allBlobs(
    where: BlobWhereInput
    search: String
    sortBy: [SortBlobsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Blob]
  #  Search for the Blob item with the matching ID.
  Blob(where: BlobWhereUniqueInput!): Blob
  #  Perform a meta-query on all Blob items which match the where clause.
  _allBlobsMeta(
    where: BlobWhereInput
    search: String
    sortBy: [SortBlobsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the Blob list.
  _BlobsMeta: _ListMeta
  #  Search for all Content items which match the where clause.
  allContents(
    where: ContentWhereInput
    search: String
    sortBy: [SortContentsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Content]
  #  Search for the Content item with the matching ID.
  Content(where: ContentWhereUniqueInput!): Content
  #  Perform a meta-query on all Content items which match the where clause.
  _allContentsMeta(
    where: ContentWhereInput
    search: String
    sortBy: [SortContentsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the Content list.
  _ContentsMeta: _ListMeta
  #  Search for all CredentialIssuer items which match the where clause.
  allCredentialIssuers(
    where: CredentialIssuerWhereInput
    search: String
    sortBy: [SortCredentialIssuersBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [CredentialIssuer]
  #  Search for the CredentialIssuer item with the matching ID.
  CredentialIssuer(where: CredentialIssuerWhereUniqueInput!): CredentialIssuer
  #  Perform a meta-query on all CredentialIssuer items which match the where clause.
  _allCredentialIssuersMeta(
    where: CredentialIssuerWhereInput
    search: String
    sortBy: [SortCredentialIssuersBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the CredentialIssuer list.
  _CredentialIssuersMeta: _ListMeta
  #  Search for all Dataset items which match the where clause.
  allDatasets(
    where: DatasetWhereInput
    search: String
    sortBy: [SortDatasetsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Dataset]
  #  Search for the Dataset item with the matching ID.
  Dataset(where: DatasetWhereUniqueInput!): Dataset
  #  Perform a meta-query on all Dataset items which match the where clause.
  _allDatasetsMeta(
    where: DatasetWhereInput
    search: String
    sortBy: [SortDatasetsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the Dataset list.
  _DatasetsMeta: _ListMeta
  #  Search for all Environment items which match the where clause.
  allEnvironments(
    where: EnvironmentWhereInput
    search: String
    sortBy: [SortEnvironmentsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Environment]
  #  Search for the Environment item with the matching ID.
  Environment(where: EnvironmentWhereUniqueInput!): Environment
  #  Perform a meta-query on all Environment items which match the where clause.
  _allEnvironmentsMeta(
    where: EnvironmentWhereInput
    search: String
    sortBy: [SortEnvironmentsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the Environment list.
  _EnvironmentsMeta: _ListMeta
  #  Search for all GatewayConsumer items which match the where clause.
  allGatewayConsumers(
    where: GatewayConsumerWhereInput
    search: String
    sortBy: [SortGatewayConsumersBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [GatewayConsumer]
  #  Search for the GatewayConsumer item with the matching ID.
  GatewayConsumer(where: GatewayConsumerWhereUniqueInput!): GatewayConsumer
  #  Perform a meta-query on all GatewayConsumer items which match the where clause.
  _allGatewayConsumersMeta(
    where: GatewayConsumerWhereInput
    search: String
    sortBy: [SortGatewayConsumersBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the GatewayConsumer list.
  _GatewayConsumersMeta: _ListMeta
  #  Search for all GatewayGroup items which match the where clause.
  allGatewayGroups(
    where: GatewayGroupWhereInput
    search: String
    sortBy: [SortGatewayGroupsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [GatewayGroup]
  #  Search for the GatewayGroup item with the matching ID.
  GatewayGroup(where: GatewayGroupWhereUniqueInput!): GatewayGroup
  #  Perform a meta-query on all GatewayGroup items which match the where clause.
  _allGatewayGroupsMeta(
    where: GatewayGroupWhereInput
    search: String
    sortBy: [SortGatewayGroupsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the GatewayGroup list.
  _GatewayGroupsMeta: _ListMeta
  #  Search for all GatewayPlugin items which match the where clause.
  allGatewayPlugins(
    where: GatewayPluginWhereInput
    search: String
    sortBy: [SortGatewayPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [GatewayPlugin]
  #  Search for the GatewayPlugin item with the matching ID.
  GatewayPlugin(where: GatewayPluginWhereUniqueInput!): GatewayPlugin
  #  Perform a meta-query on all GatewayPlugin items which match the where clause.
  _allGatewayPluginsMeta(
    where: GatewayPluginWhereInput
    search: String
    sortBy: [SortGatewayPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the GatewayPlugin list.
  _GatewayPluginsMeta: _ListMeta
  #  Search for all GatewayRoute items which match the where clause.
  allGatewayRoutes(
    where: GatewayRouteWhereInput
    search: String
    sortBy: [SortGatewayRoutesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [GatewayRoute]
  #  Search for the GatewayRoute item with the matching ID.
  GatewayRoute(where: GatewayRouteWhereUniqueInput!): GatewayRoute
  #  Perform a meta-query on all GatewayRoute items which match the where clause.
  _allGatewayRoutesMeta(
    where: GatewayRouteWhereInput
    search: String
    sortBy: [SortGatewayRoutesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the GatewayRoute list.
  _GatewayRoutesMeta: _ListMeta
  #  Search for all GatewayService items which match the where clause.
  allGatewayServices(
    where: GatewayServiceWhereInput
    search: String
    sortBy: [SortGatewayServicesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [GatewayService]
  #  Search for the GatewayService item with the matching ID.
  GatewayService(where: GatewayServiceWhereUniqueInput!): GatewayService
  #  Perform a meta-query on all GatewayService items which match the where clause.
  _allGatewayServicesMeta(
    where: GatewayServiceWhereInput
    search: String
    sortBy: [SortGatewayServicesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the GatewayService list.
  _GatewayServicesMeta: _ListMeta
  #  Search for all Legal items which match the where clause.
  allLegals(
    where: LegalWhereInput
    search: String
    sortBy: [SortLegalsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Legal]
  #  Search for the Legal item with the matching ID.
  Legal(where: LegalWhereUniqueInput!): Legal
  #  Perform a meta-query on all Legal items which match the where clause.
  _allLegalsMeta(
    where: LegalWhereInput
    search: String
    sortBy: [SortLegalsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the Legal list.
  _LegalsMeta: _ListMeta
  #  Search for all Metric items which match the where clause.
  allMetrics(
    where: MetricWhereInput
    search: String
    sortBy: [SortMetricsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Metric]
  #  Search for the Metric item with the matching ID.
  Metric(where: MetricWhereUniqueInput!): Metric
  #  Perform a meta-query on all Metric items which match the where clause.
  _allMetricsMeta(
    where: MetricWhereInput
    search: String
    sortBy: [SortMetricsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the Metric list.
  _MetricsMeta: _ListMeta
  #  Search for all Organization items which match the where clause.
  allOrganizations(
    where: OrganizationWhereInput
    search: String
    sortBy: [SortOrganizationsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Organization]
  #  Search for the Organization item with the matching ID.
  Organization(where: OrganizationWhereUniqueInput!): Organization
  #  Perform a meta-query on all Organization items which match the where clause.
  _allOrganizationsMeta(
    where: OrganizationWhereInput
    search: String
    sortBy: [SortOrganizationsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the Organization list.
  _OrganizationsMeta: _ListMeta
  #  Search for all OrganizationUnit items which match the where clause.
  allOrganizationUnits(
    where: OrganizationUnitWhereInput
    search: String
    sortBy: [SortOrganizationUnitsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [OrganizationUnit]
  #  Search for the OrganizationUnit item with the matching ID.
  OrganizationUnit(where: OrganizationUnitWhereUniqueInput!): OrganizationUnit
  #  Perform a meta-query on all OrganizationUnit items which match the where clause.
  _allOrganizationUnitsMeta(
    where: OrganizationUnitWhereInput
    search: String
    sortBy: [SortOrganizationUnitsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the OrganizationUnit list.
  _OrganizationUnitsMeta: _ListMeta
  #  Search for all Product items which match the where clause.
  allProducts(
    where: ProductWhereInput
    search: String
    sortBy: [SortProductsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Product]
  #  Search for the Product item with the matching ID.
  Product(where: ProductWhereUniqueInput!): Product
  #  Perform a meta-query on all Product items which match the where clause.
  _allProductsMeta(
    where: ProductWhereInput
    search: String
    sortBy: [SortProductsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the Product list.
  _ProductsMeta: _ListMeta
  #  Search for all ServiceAccess items which match the where clause.
  allServiceAccesses(
    where: ServiceAccessWhereInput
    search: String
    sortBy: [SortServiceAccessesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [ServiceAccess]
  #  Search for the ServiceAccess item with the matching ID.
  ServiceAccess(where: ServiceAccessWhereUniqueInput!): ServiceAccess
  #  Perform a meta-query on all ServiceAccess items which match the where clause.
  _allServiceAccessesMeta(
    where: ServiceAccessWhereInput
    search: String
    sortBy: [SortServiceAccessesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the ServiceAccess list.
  _ServiceAccessesMeta: _ListMeta
  #  Search for all TemporaryIdentity items which match the where clause.
  allTemporaryIdentities(
    where: TemporaryIdentityWhereInput
    search: String
    sortBy: [SortTemporaryIdentitiesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [TemporaryIdentity]
  #  Search for the TemporaryIdentity item with the matching ID.
  TemporaryIdentity(
    where: TemporaryIdentityWhereUniqueInput!
  ): TemporaryIdentity
  #  Perform a meta-query on all TemporaryIdentity items which match the where clause.
  _allTemporaryIdentitiesMeta(
    where: TemporaryIdentityWhereInput
    search: String
    sortBy: [SortTemporaryIdentitiesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the TemporaryIdentity list.
  _TemporaryIdentitiesMeta: _ListMeta
  #  Search for all User items which match the where clause.
  allUsers(
    where: UserWhereInput
    search: String
    sortBy: [SortUsersBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [User]
  #  Search for the User item with the matching ID.
  User(where: UserWhereUniqueInput!): User
  #  Perform a meta-query on all User items which match the where clause.
  _allUsersMeta(
    where: UserWhereInput
    search: String
    sortBy: [SortUsersBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  #  Retrieve the meta-data for the User list.
  _UsersMeta: _ListMeta
  #  Retrieve the meta-data for all lists.
  _ksListsMeta(where: _ksListsMetaInput): [_ListMeta]
  allApplicationNames: [ApplicationSummary]
  getGatewayConsumerPlugins(id: ID!): GatewayConsumer
  allDiscoverableProducts(
    first: Int
    skip: Int
    orderBy: String
    where: ProductWhereInput
  ): [Product]
  allGatewayServicesByNamespace(
    first: Int
    skip: Int
    orderBy: String
    where: GatewayServiceWhereInput
  ): [GatewayService]
  allProductsByNamespace(
    first: Int
    skip: Int
    orderBy: String
    where: ProductWhereInput
  ): [Product]
  allAccessRequestsByNamespace(
    first: Int
    skip: Int
    orderBy: String
    where: AccessRequestWhereInput
  ): [AccessRequest]
  allServiceAccessesByNamespace(
    first: Int
    skip: Int
    orderBy: String
    where: ServiceAccessWhereInput
  ): [ServiceAccess]
  allCredentialIssuersByNamespace(
    first: Int
    skip: Int
    orderBy: String
    where: CredentialIssuerWhereInput
  ): [CredentialIssuer]
  allNamespaceServiceAccounts(
    first: Int
    skip: Int
    orderBy: String
    where: ServiceAccessWhereInput
  ): [ServiceAccess]
  DiscoverableProduct(where: ProductWhereInput): Product
  myServiceAccesses(
    first: Int
    skip: Int
    orderBy: String
    where: ServiceAccessWhereInput
  ): [ServiceAccess]
  myApplications(
    first: Int
    skip: Int
    orderBy: String
    where: ApplicationWhereInput
  ): [Application]
  mySelf(where: UserWhereInput): User
  CredentialIssuerSummary(where: CredentialIssuerWhereInput): CredentialIssuer
  allDiscoverableContents(
    first: Int
    skip: Int
    orderBy: String
    where: ContentWhereInput
  ): [Content]
  BusinessProfile(serviceAccessId: ID!): BusinessProfile
  consumerScopesAndRoles(
    prodEnvId: ID!
    consumerUsername: ID!
  ): ConsumerScopesAndRoles
  currentNamespace: Namespace
  allNamespaces: [Namespace]
  getUmaPoliciesForResource(prodEnvId: ID!, resourceId: String!): [UMAPolicy]
  allResourceSets(prodEnvId: ID!, type: String): [UMAResourceSet]
  getResourceSet(prodEnvId: ID!, resourceId: String!): UMAResourceSet
  allPermissionTickets(prodEnvId: ID!): [UMAPermissionTicket]
  getPermissionTicketsForResource(
    prodEnvId: ID!
    resourceId: String!
  ): [UMAPermissionTicket]
  # The version of the Keystone application serving this API.
  appVersion: String
  authenticatedTemporaryIdentity: TemporaryIdentity
}

type Mutation {
  #  Create a single AccessRequest item.
  createAccessRequest(data: AccessRequestCreateInput): AccessRequest
  #  Create multiple AccessRequest items.
  createAccessRequests(data: [AccessRequestsCreateInput]): [AccessRequest]
  #  Update a single AccessRequest item by ID.
  updateAccessRequest(id: ID!, data: AccessRequestUpdateInput): AccessRequest
  #  Update multiple AccessRequest items by ID.
  updateAccessRequests(data: [AccessRequestsUpdateInput]): [AccessRequest]
  #  Delete a single AccessRequest item by ID.
  deleteAccessRequest(id: ID!): AccessRequest
  #  Delete multiple AccessRequest items by ID.
  deleteAccessRequests(ids: [ID!]): [AccessRequest]
  #  Create a single Activity item.
  createActivity(data: ActivityCreateInput): Activity
  #  Create multiple Activity items.
  createActivities(data: [ActivitiesCreateInput]): [Activity]
  #  Update a single Activity item by ID.
  updateActivity(id: ID!, data: ActivityUpdateInput): Activity
  #  Update multiple Activity items by ID.
  updateActivities(data: [ActivitiesUpdateInput]): [Activity]
  #  Delete a single Activity item by ID.
  deleteActivity(id: ID!): Activity
  #  Delete multiple Activity items by ID.
  deleteActivities(ids: [ID!]): [Activity]
  #  Create a single Alert item.
  createAlert(data: AlertCreateInput): Alert
  #  Create multiple Alert items.
  createAlerts(data: [AlertsCreateInput]): [Alert]
  #  Update a single Alert item by ID.
  updateAlert(id: ID!, data: AlertUpdateInput): Alert
  #  Update multiple Alert items by ID.
  updateAlerts(data: [AlertsUpdateInput]): [Alert]
  #  Delete a single Alert item by ID.
  deleteAlert(id: ID!): Alert
  #  Delete multiple Alert items by ID.
  deleteAlerts(ids: [ID!]): [Alert]
  #  Create a single Application item.
  createApplication(data: ApplicationCreateInput): Application
  #  Create multiple Application items.
  createApplications(data: [ApplicationsCreateInput]): [Application]
  #  Update a single Application item by ID.
  updateApplication(id: ID!, data: ApplicationUpdateInput): Application
  #  Update multiple Application items by ID.
  updateApplications(data: [ApplicationsUpdateInput]): [Application]
  #  Delete a single Application item by ID.
  deleteApplication(id: ID!): Application
  #  Delete multiple Application items by ID.
  deleteApplications(ids: [ID!]): [Application]
  #  Create a single Blob item.
  createBlob(data: BlobCreateInput): Blob
  #  Create multiple Blob items.
  createBlobs(data: [BlobsCreateInput]): [Blob]
  #  Update a single Blob item by ID.
  updateBlob(id: ID!, data: BlobUpdateInput): Blob
  #  Update multiple Blob items by ID.
  updateBlobs(data: [BlobsUpdateInput]): [Blob]
  #  Delete a single Blob item by ID.
  deleteBlob(id: ID!): Blob
  #  Delete multiple Blob items by ID.
  deleteBlobs(ids: [ID!]): [Blob]
  #  Create a single Content item.
  createContent(data: ContentCreateInput): Content
  #  Create multiple Content items.
  createContents(data: [ContentsCreateInput]): [Content]
  #  Update a single Content item by ID.
  updateContent(id: ID!, data: ContentUpdateInput): Content
  #  Update multiple Content items by ID.
  updateContents(data: [ContentsUpdateInput]): [Content]
  #  Delete a single Content item by ID.
  deleteContent(id: ID!): Content
  #  Delete multiple Content items by ID.
  deleteContents(ids: [ID!]): [Content]
  #  Create a single CredentialIssuer item.
  createCredentialIssuer(data: CredentialIssuerCreateInput): CredentialIssuer
  #  Create multiple CredentialIssuer items.
  createCredentialIssuers(
    data: [CredentialIssuersCreateInput]
  ): [CredentialIssuer]
  #  Update a single CredentialIssuer item by ID.
  updateCredentialIssuer(
    id: ID!
    data: CredentialIssuerUpdateInput
  ): CredentialIssuer
  #  Update multiple CredentialIssuer items by ID.
  updateCredentialIssuers(
    data: [CredentialIssuersUpdateInput]
  ): [CredentialIssuer]
  #  Delete a single CredentialIssuer item by ID.
  deleteCredentialIssuer(id: ID!): CredentialIssuer
  #  Delete multiple CredentialIssuer items by ID.
  deleteCredentialIssuers(ids: [ID!]): [CredentialIssuer]
  #  Create a single Dataset item.
  createDataset(data: DatasetCreateInput): Dataset
  #  Create multiple Dataset items.
  createDatasets(data: [DatasetsCreateInput]): [Dataset]
  #  Update a single Dataset item by ID.
  updateDataset(id: ID!, data: DatasetUpdateInput): Dataset
  #  Update multiple Dataset items by ID.
  updateDatasets(data: [DatasetsUpdateInput]): [Dataset]
  #  Delete a single Dataset item by ID.
  deleteDataset(id: ID!): Dataset
  #  Delete multiple Dataset items by ID.
  deleteDatasets(ids: [ID!]): [Dataset]
  #  Create a single Environment item.
  createEnvironment(data: EnvironmentCreateInput): Environment
  #  Create multiple Environment items.
  createEnvironments(data: [EnvironmentsCreateInput]): [Environment]
  #  Update a single Environment item by ID.
  updateEnvironment(id: ID!, data: EnvironmentUpdateInput): Environment
  #  Update multiple Environment items by ID.
  updateEnvironments(data: [EnvironmentsUpdateInput]): [Environment]
  #  Delete a single Environment item by ID.
  deleteEnvironment(id: ID!): Environment
  #  Delete multiple Environment items by ID.
  deleteEnvironments(ids: [ID!]): [Environment]
  #  Create a single GatewayConsumer item.
  createGatewayConsumer(data: GatewayConsumerCreateInput): GatewayConsumer
  #  Create multiple GatewayConsumer items.
  createGatewayConsumers(data: [GatewayConsumersCreateInput]): [GatewayConsumer]
  #  Update a single GatewayConsumer item by ID.
  updateGatewayConsumer(
    id: ID!
    data: GatewayConsumerUpdateInput
  ): GatewayConsumer
  #  Update multiple GatewayConsumer items by ID.
  updateGatewayConsumers(data: [GatewayConsumersUpdateInput]): [GatewayConsumer]
  #  Delete a single GatewayConsumer item by ID.
  deleteGatewayConsumer(id: ID!): GatewayConsumer
  #  Delete multiple GatewayConsumer items by ID.
  deleteGatewayConsumers(ids: [ID!]): [GatewayConsumer]
  #  Create a single GatewayGroup item.
  createGatewayGroup(data: GatewayGroupCreateInput): GatewayGroup
  #  Create multiple GatewayGroup items.
  createGatewayGroups(data: [GatewayGroupsCreateInput]): [GatewayGroup]
  #  Update a single GatewayGroup item by ID.
  updateGatewayGroup(id: ID!, data: GatewayGroupUpdateInput): GatewayGroup
  #  Update multiple GatewayGroup items by ID.
  updateGatewayGroups(data: [GatewayGroupsUpdateInput]): [GatewayGroup]
  #  Delete a single GatewayGroup item by ID.
  deleteGatewayGroup(id: ID!): GatewayGroup
  #  Delete multiple GatewayGroup items by ID.
  deleteGatewayGroups(ids: [ID!]): [GatewayGroup]
  #  Create a single GatewayPlugin item.
  createGatewayPlugin(data: GatewayPluginCreateInput): GatewayPlugin
  #  Create multiple GatewayPlugin items.
  createGatewayPlugins(data: [GatewayPluginsCreateInput]): [GatewayPlugin]
  #  Update a single GatewayPlugin item by ID.
  updateGatewayPlugin(id: ID!, data: GatewayPluginUpdateInput): GatewayPlugin
  #  Update multiple GatewayPlugin items by ID.
  updateGatewayPlugins(data: [GatewayPluginsUpdateInput]): [GatewayPlugin]
  #  Delete a single GatewayPlugin item by ID.
  deleteGatewayPlugin(id: ID!): GatewayPlugin
  #  Delete multiple GatewayPlugin items by ID.
  deleteGatewayPlugins(ids: [ID!]): [GatewayPlugin]
  #  Create a single GatewayRoute item.
  createGatewayRoute(data: GatewayRouteCreateInput): GatewayRoute
  #  Create multiple GatewayRoute items.
  createGatewayRoutes(data: [GatewayRoutesCreateInput]): [GatewayRoute]
  #  Update a single GatewayRoute item by ID.
  updateGatewayRoute(id: ID!, data: GatewayRouteUpdateInput): GatewayRoute
  #  Update multiple GatewayRoute items by ID.
  updateGatewayRoutes(data: [GatewayRoutesUpdateInput]): [GatewayRoute]
  #  Delete a single GatewayRoute item by ID.
  deleteGatewayRoute(id: ID!): GatewayRoute
  #  Delete multiple GatewayRoute items by ID.
  deleteGatewayRoutes(ids: [ID!]): [GatewayRoute]
  #  Create a single GatewayService item.
  createGatewayService(data: GatewayServiceCreateInput): GatewayService
  #  Create multiple GatewayService items.
  createGatewayServices(data: [GatewayServicesCreateInput]): [GatewayService]
  #  Update a single GatewayService item by ID.
  updateGatewayService(id: ID!, data: GatewayServiceUpdateInput): GatewayService
  #  Update multiple GatewayService items by ID.
  updateGatewayServices(data: [GatewayServicesUpdateInput]): [GatewayService]
  #  Delete a single GatewayService item by ID.
  deleteGatewayService(id: ID!): GatewayService
  #  Delete multiple GatewayService items by ID.
  deleteGatewayServices(ids: [ID!]): [GatewayService]
  #  Create a single Legal item.
  createLegal(data: LegalCreateInput): Legal
  #  Create multiple Legal items.
  createLegals(data: [LegalsCreateInput]): [Legal]
  #  Update a single Legal item by ID.
  updateLegal(id: ID!, data: LegalUpdateInput): Legal
  #  Update multiple Legal items by ID.
  updateLegals(data: [LegalsUpdateInput]): [Legal]
  #  Delete a single Legal item by ID.
  deleteLegal(id: ID!): Legal
  #  Delete multiple Legal items by ID.
  deleteLegals(ids: [ID!]): [Legal]
  #  Create a single Metric item.
  createMetric(data: MetricCreateInput): Metric
  #  Create multiple Metric items.
  createMetrics(data: [MetricsCreateInput]): [Metric]
  #  Update a single Metric item by ID.
  updateMetric(id: ID!, data: MetricUpdateInput): Metric
  #  Update multiple Metric items by ID.
  updateMetrics(data: [MetricsUpdateInput]): [Metric]
  #  Delete a single Metric item by ID.
  deleteMetric(id: ID!): Metric
  #  Delete multiple Metric items by ID.
  deleteMetrics(ids: [ID!]): [Metric]
  #  Create a single Organization item.
  createOrganization(data: OrganizationCreateInput): Organization
  #  Create multiple Organization items.
  createOrganizations(data: [OrganizationsCreateInput]): [Organization]
  #  Update a single Organization item by ID.
  updateOrganization(id: ID!, data: OrganizationUpdateInput): Organization
  #  Update multiple Organization items by ID.
  updateOrganizations(data: [OrganizationsUpdateInput]): [Organization]
  #  Delete a single Organization item by ID.
  deleteOrganization(id: ID!): Organization
  #  Delete multiple Organization items by ID.
  deleteOrganizations(ids: [ID!]): [Organization]
  #  Create a single OrganizationUnit item.
  createOrganizationUnit(data: OrganizationUnitCreateInput): OrganizationUnit
  #  Create multiple OrganizationUnit items.
  createOrganizationUnits(
    data: [OrganizationUnitsCreateInput]
  ): [OrganizationUnit]
  #  Update a single OrganizationUnit item by ID.
  updateOrganizationUnit(
    id: ID!
    data: OrganizationUnitUpdateInput
  ): OrganizationUnit
  #  Update multiple OrganizationUnit items by ID.
  updateOrganizationUnits(
    data: [OrganizationUnitsUpdateInput]
  ): [OrganizationUnit]
  #  Delete a single OrganizationUnit item by ID.
  deleteOrganizationUnit(id: ID!): OrganizationUnit
  #  Delete multiple OrganizationUnit items by ID.
  deleteOrganizationUnits(ids: [ID!]): [OrganizationUnit]
  #  Create a single Product item.
  createProduct(data: ProductCreateInput): Product
  #  Create multiple Product items.
  createProducts(data: [ProductsCreateInput]): [Product]
  #  Update a single Product item by ID.
  updateProduct(id: ID!, data: ProductUpdateInput): Product
  #  Update multiple Product items by ID.
  updateProducts(data: [ProductsUpdateInput]): [Product]
  #  Delete a single Product item by ID.
  deleteProduct(id: ID!): Product
  #  Delete multiple Product items by ID.
  deleteProducts(ids: [ID!]): [Product]
  #  Create a single ServiceAccess item.
  createServiceAccess(data: ServiceAccessCreateInput): ServiceAccess
  #  Create multiple ServiceAccess items.
  createServiceAccesses(data: [ServiceAccessesCreateInput]): [ServiceAccess]
  #  Update a single ServiceAccess item by ID.
  updateServiceAccess(id: ID!, data: ServiceAccessUpdateInput): ServiceAccess
  #  Update multiple ServiceAccess items by ID.
  updateServiceAccesses(data: [ServiceAccessesUpdateInput]): [ServiceAccess]
  #  Delete a single ServiceAccess item by ID.
  deleteServiceAccess(id: ID!): ServiceAccess
  #  Delete multiple ServiceAccess items by ID.
  deleteServiceAccesses(ids: [ID!]): [ServiceAccess]
  #  Create a single TemporaryIdentity item.
  createTemporaryIdentity(data: TemporaryIdentityCreateInput): TemporaryIdentity
  #  Create multiple TemporaryIdentity items.
  createTemporaryIdentities(
    data: [TemporaryIdentitiesCreateInput]
  ): [TemporaryIdentity]
  #  Update a single TemporaryIdentity item by ID.
  updateTemporaryIdentity(
    id: ID!
    data: TemporaryIdentityUpdateInput
  ): TemporaryIdentity
  #  Update multiple TemporaryIdentity items by ID.
  updateTemporaryIdentities(
    data: [TemporaryIdentitiesUpdateInput]
  ): [TemporaryIdentity]
  #  Delete a single TemporaryIdentity item by ID.
  deleteTemporaryIdentity(id: ID!): TemporaryIdentity
  #  Delete multiple TemporaryIdentity items by ID.
  deleteTemporaryIdentities(ids: [ID!]): [TemporaryIdentity]
  #  Create a single User item.
  createUser(data: UserCreateInput): User
  #  Create multiple User items.
  createUsers(data: [UsersCreateInput]): [User]
  #  Update a single User item by ID.
  updateUser(id: ID!, data: UserUpdateInput): User
  #  Update multiple User items by ID.
  updateUsers(data: [UsersUpdateInput]): [User]
  #  Delete a single User item by ID.
  deleteUser(id: ID!): User
  #  Delete multiple User items by ID.
  deleteUsers(ids: [ID!]): [User]
  createGatewayConsumerPlugin(id: ID!, plugin: String!): GatewayConsumer
  updateGatewayConsumerPlugin(
    id: ID!
    pluginExtForeignKey: String!
    plugin: String!
  ): GatewayConsumer
  deleteGatewayConsumerPlugin(
    id: ID!
    pluginExtForeignKey: String!
  ): GatewayConsumer
  acceptLegal(productEnvironmentId: ID!, acceptLegal: Boolean!): User
  updateConsumerGroupMembership(
    prodEnvId: ID!
    consumerId: ID!
    group: String!
    grant: Boolean!
  ): Boolean
  linkConsumerToNamespace(username: String!): Boolean
  updateConsumerRoleAssignment(
    prodEnvId: ID!
    consumerUsername: String!
    roleName: String!
    grant: Boolean!
  ): Boolean
  createNamespace(namespace: String!): Namespace
  deleteNamespace(namespace: String!): Boolean
  createServiceAccount(resourceId: String!, scopes: [String]!): ServiceAccount
  createUmaPolicy(
    prodEnvId: ID!
    resourceId: String!
    data: UMAPolicyInput!
  ): UMAPolicy
  deleteUmaPolicy(
    prodEnvId: ID!
    resourceId: String!
    policyId: String!
  ): Boolean
  grantPermissions(
    prodEnvId: ID!
    data: UMAPermissionTicketInput!
  ): [UMAPermissionTicket]
  revokePermissions(
    prodEnvId: ID!
    resourceId: String!
    ids: [String]!
  ): Boolean
  approvePermissions(
    prodEnvId: ID!
    resourceId: String!
    requesterId: String!
    scopes: [String]!
  ): Boolean
  #  Authenticate and generate a token for a TemporaryIdentity with the Password Authentication Strategy.
  authenticateTemporaryIdentityWithPassword(
    email: String
    password: String
  ): authenticateTemporaryIdentityOutput
  unauthenticateTemporaryIdentity: unauthenticateTemporaryIdentityOutput
  updateAuthenticatedTemporaryIdentity(
    data: TemporaryIdentityUpdateInput
  ): TemporaryIdentity
}

# The Upload scalar type represents a file upload.
scalar Upload

enum CacheControlScope {
  PUBLIC
  PRIVATE
}

`;
