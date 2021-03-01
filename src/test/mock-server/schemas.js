module.exports = `
directive @cacheControl(
  maxAge: Int
  scope: CacheControlScope
) on FIELD_DEFINITION | OBJECT | INTERFACE
directive @specifiedBy(url: String!) on SCALAR
input _ksListsMetaInput {
  key: String
  auxiliary: Boolean
}

type _ListAccess {
  create: Boolean
  read: JSON
  update: JSON
  delete: JSON
  auth: JSON
}

type _ListInputTypes {
  whereInput: String
  whereUniqueInput: String
  createInput: String
  createManyInput: String
  updateInput: String
  updateManyInput: String
}

type _ListMeta {
  key: String
  name: String 
  description: String
  label: String
  singular: String
  plural: String
  path: String
  access: _ListAccess
  schema: _ListSchema
}

type _ListMutations {
  create: String
  createMany: String
  update: String
  updateMany: String
  delete: String
  deleteMany: String
}

type _ListQueries {
  item: String
  list: String
  meta: String
}

type _ListSchema {
  type: String
  queries: _ListQueries
  mutations: _ListMutations
  inputTypes: _ListInputTypes
  fields(where: _ListSchemaFieldsInput): [_ListSchemaFields]
  relatedFields: [_ListSchemaRelatedFields]
}

type _ListSchemaFields {
  path: String
  name: String 
  type: String
}

input _ListSchemaFieldsInput {
  type: String
}

type _ListSchemaRelatedFields {
  type: String
  fields: [String]
}

type _QueryMeta {
  count: Int
}

type AccessRequest {
  _label_: String
  id: ID!
  name: String
  communication: String
  isApproved: Boolean
  isIssued: Boolean
  isComplete: Boolean
  consumerId: String
  credential: String
  requestor: User
  application: Application
  consumer: Consumer
  productEnvironment: Environment
  activity(
    where: ActivityWhereInput
    search: String
    sortBy: [SortActivitiesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Activity!]!
  _activityMeta(
    where: ActivityWhereInput
    search: String
    sortBy: [SortActivitiesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  updatedBy: User
  createdBy: User
  updatedAt: DateTime
  createdAt: DateTime
}

input AccessRequestCreateInput {
  name: String
  communication: String
  isApproved: Boolean
  isIssued: Boolean
  isComplete: Boolean
  consumerId: String
  credential: String
  requestor: UserRelateToOneInput
  application: ApplicationRelateToOneInput
  consumer: ConsumerRelateToOneInput
  productEnvironment: EnvironmentRelateToOneInput
  activity: ActivityRelateToManyInput
}

input AccessRequestsCreateInput {
  data: AccessRequestCreateInput
}

input AccessRequestsUpdateInput {
  id: ID!
  data: AccessRequestUpdateInput
}

input AccessRequestUpdateInput {
  name: String
  communication: String
  isApproved: Boolean
  isIssued: Boolean
  isComplete: Boolean
  consumerId: String
  credential: String
  requestor: UserRelateToOneInput
  application: ApplicationRelateToOneInput
  consumer: ConsumerRelateToOneInput
  productEnvironment: EnvironmentRelateToOneInput
  activity: ActivityRelateToManyInput
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
  consumerId: String
  consumerId_not: String
  consumerId_contains: String
  consumerId_not_contains: String
  consumerId_starts_with: String
  consumerId_not_starts_with: String
  consumerId_ends_with: String
  consumerId_not_ends_with: String
  consumerId_i: String
  consumerId_not_i: String
  consumerId_contains_i: String
  consumerId_not_contains_i: String
  consumerId_starts_with_i: String
  consumerId_not_starts_with_i: String
  consumerId_ends_with_i: String
  consumerId_not_ends_with_i: String
  consumerId_in: [String]
  consumerId_not_in: [String]
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
  requestor: UserWhereInput
  requestor_is_null: Boolean
  application: ApplicationWhereInput
  application_is_null: Boolean
  consumer: ConsumerWhereInput
  consumer_is_null: Boolean
  productEnvironment: EnvironmentWhereInput
  productEnvironment_is_null: Boolean
  activity_every: ActivityWhereInput
  activity_some: ActivityWhereInput
  activity_none: ActivityWhereInput
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

input ActivitiesCreateInput {
  data: ActivityCreateInput
}

input ActivitiesUpdateInput {
  id: ID!
  data: ActivityUpdateInput
}

type Activity {
  _label_: String
  id: ID!
  extRefId: String
  type: String
  name: String
  action: String
  message: String
  refId: String
  namespace: String
  actor: User
  updatedAt: DateTime
  createdAt: DateTime
}

input ActivityCreateInput {
  extRefId: String
  type: String
  name: String
  action: String
  message: String
  refId: String
  namespace: String
  actor: UserRelateToOneInput
}

input ActivityRelateToManyInput {
  create: [ActivityCreateInput]
  connect: [ActivityWhereUniqueInput]
  disconnect: [ActivityWhereUniqueInput]
  disconnectAll: Boolean
}

input ActivityUpdateInput {
  extRefId: String
  type: String
  name: String
  action: String
  message: String
  refId: String
  namespace: String
  actor: UserRelateToOneInput
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

type Alert {
  _label_: String
  id: ID!
  name: String
  state: String
  description: String
  service: GatewayService
  updatedAt: DateTime
  createdAt: DateTime
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

input AlertsUpdateInput {
  id: ID!
  data: AlertUpdateInput
}

input AlertUpdateInput {
  name: String
  state: String
  description: String
  service: GatewayServiceRelateToOneInput
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

type Application {
  _label_: String
  id: ID!
  appId: String
  name: String
  description: String
  owner: User
  updatedBy: User
  createdBy: User
  updatedAt: DateTime
  createdAt: DateTime
}

input ApplicationCreateInput {
  appId: String
  name: String
  description: String
  owner: UserRelateToOneInput
}

input ApplicationRelateToOneInput {
  create: ApplicationCreateInput
  connect: ApplicationWhereUniqueInput
  disconnect: ApplicationWhereUniqueInput
  disconnectAll: Boolean
}

input ApplicationsCreateInput {
  data: ApplicationCreateInput
}

input ApplicationsUpdateInput {
  id: ID!
  data: ApplicationUpdateInput
}

input ApplicationUpdateInput {
  appId: String
  name: String
  description: String
  owner: UserRelateToOneInput
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
  owner: UserWhereInput
  owner_is_null: Boolean
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

input ApplicationWhereUniqueInput {
  id: ID!
}

type authenticateUserOutput {
  token: String
  item: User
}

enum CacheControlScope {
  PUBLIC
  PRIVATE
}

type Consumer {
  _label_: String
  id: ID!
  username: String
  customId: String
  kongConsumerId: String
  namespace: String
  tags: String
  plugins(
    where: PluginWhereInput
    search: String
    sortBy: [SortPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Plugin!]!
  _pluginsMeta(
    where: PluginWhereInput
    search: String
    sortBy: [SortPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  updatedBy: User
  createdBy: User
  updatedAt: DateTime
  createdAt: DateTime
}

input ConsumerCreateInput {
  username: String
  customId: String
  kongConsumerId: String
  namespace: String
  tags: String
  plugins: PluginRelateToManyInput
}

input ConsumerRelateToOneInput {
  create: ConsumerCreateInput
  connect: ConsumerWhereUniqueInput
  disconnect: ConsumerWhereUniqueInput
  disconnectAll: Boolean
}

input ConsumersCreateInput {
  data: ConsumerCreateInput
}

input ConsumersUpdateInput {
  id: ID!
  data: ConsumerUpdateInput
}

input ConsumerUpdateInput {
  username: String
  customId: String
  kongConsumerId: String
  namespace: String
  tags: String
  plugins: PluginRelateToManyInput
}

input ConsumerWhereInput {
  AND: [ConsumerWhereInput]
  OR: [ConsumerWhereInput]
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
  kongConsumerId: String
  kongConsumerId_not: String
  kongConsumerId_contains: String
  kongConsumerId_not_contains: String
  kongConsumerId_starts_with: String
  kongConsumerId_not_starts_with: String
  kongConsumerId_ends_with: String
  kongConsumerId_not_ends_with: String
  kongConsumerId_i: String
  kongConsumerId_not_i: String
  kongConsumerId_contains_i: String
  kongConsumerId_not_contains_i: String
  kongConsumerId_starts_with_i: String
  kongConsumerId_not_starts_with_i: String
  kongConsumerId_ends_with_i: String
  kongConsumerId_not_ends_with_i: String
  kongConsumerId_in: [String]
  kongConsumerId_not_in: [String]
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
  plugins_every: PluginWhereInput
  plugins_some: PluginWhereInput
  plugins_none: PluginWhereInput
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

input ConsumerWhereUniqueInput {
  id: ID!
}

type Content {
  _label_: String
  id: ID!
  title: String
  description: String
  content: String
  externalLink: String
  githubRepository: String
  readme: String
  slug: String
  order: Int
  isComplete: Boolean
}

input ContentCreateInput {
  title: String
  description: String
  content: String
  externalLink: String
  githubRepository: String
  readme: String
  slug: String
  order: Int
  isComplete: Boolean
}

input ContentsCreateInput {
  data: ContentCreateInput
}

input ContentsUpdateInput {
  id: ID!
  data: ContentUpdateInput
}

input ContentUpdateInput {
  title: String
  description: String
  content: String
  externalLink: String
  githubRepository: String
  readme: String
  slug: String
  order: Int
  isComplete: Boolean
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
}

input ContentWhereUniqueInput {
  id: ID!
}

type CredentialIssuer {
  _label_: String
  id: ID!
  name: String
  description: String
  authMethod: CredentialIssuerAuthMethodType
  mode: CredentialIssuerModeType
  instruction: String
  oidcDiscoveryUrl: String
  initialAccessToken: String
  clientId: String
  clientSecret: String
  contact: User
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

enum CredentialIssuerAuthMethodType {
  oidc
  keys
}

input CredentialIssuerCreateInput {
  name: String
  description: String
  authMethod: CredentialIssuerAuthMethodType
  mode: CredentialIssuerModeType
  oidcDiscoveryUrl: String
  initialAccessToken: String
  clientId: String
  clientSecret: String
  contact: UserRelateToOneInput
  environments: EnvironmentRelateToManyInput
}

enum CredentialIssuerModeType {
  manual
  auto
}

input CredentialIssuerRelateToOneInput {
  create: CredentialIssuerCreateInput
  connect: CredentialIssuerWhereUniqueInput
  disconnect: CredentialIssuerWhereUniqueInput
  disconnectAll: Boolean
}

input CredentialIssuersCreateInput {
  data: CredentialIssuerCreateInput
}

input CredentialIssuersUpdateInput {
  id: ID!
  data: CredentialIssuerUpdateInput
}

input CredentialIssuerUpdateInput {
  name: String
  description: String
  authMethod: CredentialIssuerAuthMethodType
  mode: CredentialIssuerModeType
  oidcDiscoveryUrl: String
  initialAccessToken: String
  clientId: String
  clientSecret: String
  contact: UserRelateToOneInput
  environments: EnvironmentRelateToManyInput
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
  authMethod: CredentialIssuerAuthMethodType
  authMethod_not: CredentialIssuerAuthMethodType
  authMethod_in: [CredentialIssuerAuthMethodType]
  authMethod_not_in: [CredentialIssuerAuthMethodType]
  mode: CredentialIssuerModeType
  mode_not: CredentialIssuerModeType
  mode_in: [CredentialIssuerModeType]
  mode_not_in: [CredentialIssuerModeType]
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
  contact: UserWhereInput
  contact_is_null: Boolean
  environments_every: EnvironmentWhereInput
  environments_some: EnvironmentWhereInput
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

type Dataset {
  _label_: String
  id: ID!
  name: String
  bcdc_id: String
  sector: String
  license_title: String
  view_audience: String
  private: Boolean
  tags: String
  contacts: String
  organization: Organization
  organizationUnit: OrganizationUnit
  securityClass: String
  notes: String
  title: String
  catalogContent: String
  isInCatalog: Boolean
}

input DatasetCreateInput {
  name: String
  bcdc_id: String
  sector: String
  license_title: String
  view_audience: String
  private: Boolean
  tags: String
  contacts: String
  organization: OrganizationRelateToOneInput
  organizationUnit: OrganizationUnitRelateToOneInput
  securityClass: String
  notes: String
  title: String
  catalogContent: String
  isInCatalog: Boolean
}

input DatasetRelateToOneInput {
  create: DatasetCreateInput
  connect: DatasetWhereUniqueInput
  disconnect: DatasetWhereUniqueInput
  disconnectAll: Boolean
}

input DatasetsCreateInput {
  data: DatasetCreateInput
}

input DatasetsUpdateInput {
  id: ID!
  data: DatasetUpdateInput
}

input DatasetUpdateInput {
  name: String
  bcdc_id: String
  sector: String
  license_title: String
  view_audience: String
  private: Boolean
  tags: String
  contacts: String
  organization: OrganizationRelateToOneInput
  organizationUnit: OrganizationUnitRelateToOneInput
  securityClass: String
  notes: String
  title: String
  catalogContent: String
  isInCatalog: Boolean
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
  bcdc_id: String
  bcdc_id_not: String
  bcdc_id_contains: String
  bcdc_id_not_contains: String
  bcdc_id_starts_with: String
  bcdc_id_not_starts_with: String
  bcdc_id_ends_with: String
  bcdc_id_not_ends_with: String
  bcdc_id_i: String
  bcdc_id_not_i: String
  bcdc_id_contains_i: String
  bcdc_id_not_contains_i: String
  bcdc_id_starts_with_i: String
  bcdc_id_not_starts_with_i: String
  bcdc_id_ends_with_i: String
  bcdc_id_not_ends_with_i: String
  bcdc_id_in: [String]
  bcdc_id_not_in: [String]
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
  securityClass: String
  securityClass_not: String
  securityClass_contains: String
  securityClass_not_contains: String
  securityClass_starts_with: String
  securityClass_not_starts_with: String
  securityClass_ends_with: String
  securityClass_not_ends_with: String
  securityClass_i: String
  securityClass_not_i: String
  securityClass_contains_i: String
  securityClass_not_contains_i: String
  securityClass_starts_with_i: String
  securityClass_not_starts_with_i: String
  securityClass_ends_with_i: String
  securityClass_not_ends_with_i: String
  securityClass_in: [String]
  securityClass_not_in: [String]
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
}

input DatasetWhereUniqueInput {
  id: ID!
}

scalar DateTime

type Environment {
  _label_: String
  id: ID!
  name: String
  active: Boolean
  authMethod: EnvironmentAuthMethodType
  plugins(
    where: PluginWhereInput
    search: String
    sortBy: [SortPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Plugin!]!
  _pluginsMeta(
    where: PluginWhereInput
    search: String
    sortBy: [SortPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  description: String
  credentialIssuer: CredentialIssuer
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

enum EnvironmentAuthMethodType {
  private
  public
  JWT
  keys
}

input EnvironmentCreateInput {
  name: String
  active: Boolean
  authMethod: EnvironmentAuthMethodType
  plugins: PluginRelateToManyInput
  description: String
  credentialIssuer: CredentialIssuerRelateToOneInput
  services: GatewayServiceRelateToManyInput
  product: ProductRelateToOneInput
}

input EnvironmentRelateToManyInput {
  create: [EnvironmentCreateInput]
  connect: [EnvironmentWhereUniqueInput]
  disconnect: [EnvironmentWhereUniqueInput]
  disconnectAll: Boolean
}

input EnvironmentRelateToOneInput {
  create: EnvironmentCreateInput
  connect: EnvironmentWhereUniqueInput
  disconnect: EnvironmentWhereUniqueInput
  disconnectAll: Boolean
}

input EnvironmentsCreateInput {
  data: EnvironmentCreateInput
}

input EnvironmentsUpdateInput {
  id: ID!
  data: EnvironmentUpdateInput
}

input EnvironmentUpdateInput {
  name: String
  active: Boolean
  authMethod: EnvironmentAuthMethodType
  plugins: PluginRelateToManyInput
  description: String
  credentialIssuer: CredentialIssuerRelateToOneInput
  services: GatewayServiceRelateToManyInput
  product: ProductRelateToOneInput
}

input EnvironmentWhereInput {
  AND: [EnvironmentWhereInput]
  OR: [EnvironmentWhereInput]
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
  active: Boolean
  active_not: Boolean
  authMethod: EnvironmentAuthMethodType
  authMethod_not: EnvironmentAuthMethodType
  authMethod_in: [EnvironmentAuthMethodType]
  authMethod_not_in: [EnvironmentAuthMethodType]
  plugins_every: PluginWhereInput
  plugins_some: PluginWhereInput
  plugins_none: PluginWhereInput
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
  credentialIssuer: CredentialIssuerWhereInput
  credentialIssuer_is_null: Boolean
  services_every: GatewayServiceWhereInput
  services_some: GatewayServiceWhereInput
  services_none: GatewayServiceWhereInput
  product: ProductWhereInput
  product_is_null: Boolean
}

input EnvironmentWhereUniqueInput {
  id: ID!
}

type GatewayMetric {
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

input GatewayMetricCreateInput {
  name: String
  query: String
  day: String
  metric: String
  values: String
  service: GatewayServiceRelateToOneInput
}

input GatewayMetricsCreateInput {
  data: GatewayMetricCreateInput
}

input GatewayMetricsUpdateInput {
  id: ID!
  data: GatewayMetricUpdateInput
}

input GatewayMetricUpdateInput {
  name: String
  query: String
  day: String
  metric: String
  values: String
  service: GatewayServiceRelateToOneInput
}

input GatewayMetricWhereInput {
  AND: [GatewayMetricWhereInput]
  OR: [GatewayMetricWhereInput]
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

input GatewayMetricWhereUniqueInput {
  id: ID!
}

type GatewayRoute {
  _label_: String
  id: ID!
  name: String
  kongRouteId: String
  namespace: String
  methods: String
  paths: String
  hosts: String
  tags: String
  service: GatewayService
  plugins(
    where: PluginWhereInput
    search: String
    sortBy: [SortPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Plugin!]!
  _pluginsMeta(
    where: PluginWhereInput
    search: String
    sortBy: [SortPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  updatedBy: User
  createdBy: User
  updatedAt: DateTime
  createdAt: DateTime
}

input GatewayRouteCreateInput {
  name: String
  kongRouteId: String
  namespace: String
  methods: String
  paths: String
  hosts: String
  tags: String
  service: GatewayServiceRelateToOneInput
  plugins: PluginRelateToManyInput
}

input GatewayRouteRelateToManyInput {
  create: [GatewayRouteCreateInput]
  connect: [GatewayRouteWhereUniqueInput]
  disconnect: [GatewayRouteWhereUniqueInput]
  disconnectAll: Boolean
}

input GatewayRouteRelateToOneInput {
  create: GatewayRouteCreateInput
  connect: GatewayRouteWhereUniqueInput
  disconnect: GatewayRouteWhereUniqueInput
  disconnectAll: Boolean
}

input GatewayRoutesCreateInput {
  data: GatewayRouteCreateInput
}

input GatewayRoutesUpdateInput {
  id: ID!
  data: GatewayRouteUpdateInput
}

input GatewayRouteUpdateInput {
  name: String
  kongRouteId: String
  namespace: String
  methods: String
  paths: String
  hosts: String
  tags: String
  service: GatewayServiceRelateToOneInput
  plugins: PluginRelateToManyInput
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
  kongRouteId: String
  kongRouteId_not: String
  kongRouteId_contains: String
  kongRouteId_not_contains: String
  kongRouteId_starts_with: String
  kongRouteId_not_starts_with: String
  kongRouteId_ends_with: String
  kongRouteId_not_ends_with: String
  kongRouteId_i: String
  kongRouteId_not_i: String
  kongRouteId_contains_i: String
  kongRouteId_not_contains_i: String
  kongRouteId_starts_with_i: String
  kongRouteId_not_starts_with_i: String
  kongRouteId_ends_with_i: String
  kongRouteId_not_ends_with_i: String
  kongRouteId_in: [String]
  kongRouteId_not_in: [String]
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
  plugins_every: PluginWhereInput
  plugins_some: PluginWhereInput
  plugins_none: PluginWhereInput
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

input GatewayRouteWhereUniqueInput {
  id: ID!
}

type GatewayService {
  _label_: String
  id: ID!
  name: String
  kongServiceId: String
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
    where: PluginWhereInput
    search: String
    sortBy: [SortPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Plugin!]!
  _pluginsMeta(
    where: PluginWhereInput
    search: String
    sortBy: [SortPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  environment: Environment
  updatedBy: User
  createdBy: User
  updatedAt: DateTime
  createdAt: DateTime
}

input GatewayServiceCreateInput {
  name: String
  kongServiceId: String
  namespace: String
  host: String
  tags: String
  routes: GatewayRouteRelateToManyInput
  plugins: PluginRelateToManyInput
  environment: EnvironmentRelateToOneInput
}

input GatewayServiceRelateToManyInput {
  create: [GatewayServiceCreateInput]
  connect: [GatewayServiceWhereUniqueInput]
  disconnect: [GatewayServiceWhereUniqueInput]
  disconnectAll: Boolean
}

input GatewayServiceRelateToOneInput {
  create: GatewayServiceCreateInput
  connect: GatewayServiceWhereUniqueInput
  disconnect: GatewayServiceWhereUniqueInput
  disconnectAll: Boolean
}

input GatewayServicesCreateInput {
  data: GatewayServiceCreateInput
}

input GatewayServicesUpdateInput {
  id: ID!
  data: GatewayServiceUpdateInput
}

input GatewayServiceUpdateInput {
  name: String
  kongServiceId: String
  namespace: String
  host: String
  tags: String
  routes: GatewayRouteRelateToManyInput
  plugins: PluginRelateToManyInput
  environment: EnvironmentRelateToOneInput
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
  kongServiceId: String
  kongServiceId_not: String
  kongServiceId_contains: String
  kongServiceId_not_contains: String
  kongServiceId_starts_with: String
  kongServiceId_not_starts_with: String
  kongServiceId_ends_with: String
  kongServiceId_not_ends_with: String
  kongServiceId_i: String
  kongServiceId_not_i: String
  kongServiceId_contains_i: String
  kongServiceId_not_contains_i: String
  kongServiceId_starts_with_i: String
  kongServiceId_not_starts_with_i: String
  kongServiceId_ends_with_i: String
  kongServiceId_not_ends_with_i: String
  kongServiceId_in: [String]
  kongServiceId_not_in: [String]
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
  routes_every: GatewayRouteWhereInput
  routes_some: GatewayRouteWhereInput
  routes_none: GatewayRouteWhereInput
  plugins_every: PluginWhereInput
  plugins_some: PluginWhereInput
  plugins_none: PluginWhereInput
  environment: EnvironmentWhereInput
  environment_is_null: Boolean
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

input GatewayServiceWhereUniqueInput {
  id: ID!
}

type Group {
  _label_: String
  id: ID!
  name: String
  updatedBy: User
  createdBy: User
  updatedAt: DateTime
  createdAt: DateTime
}

input GroupCreateInput {
  name: String
}

input GroupsCreateInput {
  data: GroupCreateInput
}

input GroupsUpdateInput {
  id: ID!
  data: GroupUpdateInput
}

input GroupUpdateInput {
  name: String
}

input GroupWhereInput {
  AND: [GroupWhereInput]
  OR: [GroupWhereInput]
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

input GroupWhereUniqueInput {
  id: ID!
}

scalar JSON

type MemberRole {
  _label_: String
  id: ID!
  role: String
  extRefId: String
  user: User
  updatedBy: User
  createdBy: User
  updatedAt: DateTime
  createdAt: DateTime
}

input MemberRoleCreateInput {
  role: String
  extRefId: String
  user: UserRelateToOneInput
}

input MemberRoleRelateToManyInput {
  create: [MemberRoleCreateInput]
  connect: [MemberRoleWhereUniqueInput]
  disconnect: [MemberRoleWhereUniqueInput]
  disconnectAll: Boolean
}

input MemberRolesCreateInput {
  data: MemberRoleCreateInput
}

input MemberRolesUpdateInput {
  id: ID!
  data: MemberRoleUpdateInput
}

input MemberRoleUpdateInput {
  role: String
  extRefId: String
  user: UserRelateToOneInput
}

input MemberRoleWhereInput {
  AND: [MemberRoleWhereInput]
  OR: [MemberRoleWhereInput]
  id: ID
  id_not: ID
  id_in: [ID]
  id_not_in: [ID]
  role: String
  role_not: String
  role_contains: String
  role_not_contains: String
  role_starts_with: String
  role_not_starts_with: String
  role_ends_with: String
  role_not_ends_with: String
  role_i: String
  role_not_i: String
  role_contains_i: String
  role_not_contains_i: String
  role_starts_with_i: String
  role_not_starts_with_i: String
  role_ends_with_i: String
  role_not_ends_with_i: String
  role_in: [String]
  role_not_in: [String]
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
  user: UserWhereInput
  user_is_null: Boolean
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

input MemberRoleWhereUniqueInput {
  id: ID!
}

type Mutation {
  createAccessRequest(data: AccessRequestCreateInput): AccessRequest
  createAccessRequests(data: [AccessRequestsCreateInput]): [AccessRequest]
  updateAccessRequest(id: ID!, data: AccessRequestUpdateInput): AccessRequest
  updateAccessRequests(data: [AccessRequestsUpdateInput]): [AccessRequest]
  deleteAccessRequest(id: ID!): AccessRequest
  deleteAccessRequests(ids: [ID!]): [AccessRequest]
  createActivity(data: ActivityCreateInput): Activity
  createActivities(data: [ActivitiesCreateInput]): [Activity]
  updateActivity(id: ID!, data: ActivityUpdateInput): Activity
  updateActivities(data: [ActivitiesUpdateInput]): [Activity]
  deleteActivity(id: ID!): Activity
  deleteActivities(ids: [ID!]): [Activity]
  createAlert(data: AlertCreateInput): Alert
  createAlerts(data: [AlertsCreateInput]): [Alert]
  updateAlert(id: ID!, data: AlertUpdateInput): Alert
  updateAlerts(data: [AlertsUpdateInput]): [Alert]
  deleteAlert(id: ID!): Alert
  deleteAlerts(ids: [ID!]): [Alert]
  createApplication(data: ApplicationCreateInput): Application
  createApplications(data: [ApplicationsCreateInput]): [Application]
  updateApplication(id: ID!, data: ApplicationUpdateInput): Application
  updateApplications(data: [ApplicationsUpdateInput]): [Application]
  deleteApplication(id: ID!): Application
  deleteApplications(ids: [ID!]): [Application]
  createConsumer(data: ConsumerCreateInput): Consumer
  createConsumers(data: [ConsumersCreateInput]): [Consumer]
  updateConsumer(id: ID!, data: ConsumerUpdateInput): Consumer
  updateConsumers(data: [ConsumersUpdateInput]): [Consumer]
  deleteConsumer(id: ID!): Consumer
  deleteConsumers(ids: [ID!]): [Consumer]
  createContent(data: ContentCreateInput): Content
  createContents(data: [ContentsCreateInput]): [Content]
  updateContent(id: ID!, data: ContentUpdateInput): Content
  updateContents(data: [ContentsUpdateInput]): [Content]
  deleteContent(id: ID!): Content
  deleteContents(ids: [ID!]): [Content]
  createCredentialIssuer(data: CredentialIssuerCreateInput): CredentialIssuer
  createCredentialIssuers(
    data: [CredentialIssuersCreateInput]
  ): [CredentialIssuer]
  updateCredentialIssuer(
    id: ID!
    data: CredentialIssuerUpdateInput
  ): CredentialIssuer
  updateCredentialIssuers(
    data: [CredentialIssuersUpdateInput]
  ): [CredentialIssuer]
  deleteCredentialIssuer(id: ID!): CredentialIssuer
  deleteCredentialIssuers(ids: [ID!]): [CredentialIssuer]
  createDataset(data: DatasetCreateInput): Dataset
  createDatasets(data: [DatasetsCreateInput]): [Dataset]
  updateDataset(id: ID!, data: DatasetUpdateInput): Dataset
  updateDatasets(data: [DatasetsUpdateInput]): [Dataset]
  deleteDataset(id: ID!): Dataset
  deleteDatasets(ids: [ID!]): [Dataset]
  createEnvironment(data: EnvironmentCreateInput): Environment
  createEnvironments(data: [EnvironmentsCreateInput]): [Environment]
  updateEnvironment(id: ID!, data: EnvironmentUpdateInput): Environment
  updateEnvironments(data: [EnvironmentsUpdateInput]): [Environment]
  deleteEnvironment(id: ID!): Environment
  deleteEnvironments(ids: [ID!]): [Environment]
  createGatewayMetric(data: GatewayMetricCreateInput): GatewayMetric
  createGatewayMetrics(data: [GatewayMetricsCreateInput]): [GatewayMetric]
  updateGatewayMetric(id: ID!, data: GatewayMetricUpdateInput): GatewayMetric
  updateGatewayMetrics(data: [GatewayMetricsUpdateInput]): [GatewayMetric]
  deleteGatewayMetric(id: ID!): GatewayMetric
  deleteGatewayMetrics(ids: [ID!]): [GatewayMetric]
  createGatewayRoute(data: GatewayRouteCreateInput): GatewayRoute
  createGatewayRoutes(data: [GatewayRoutesCreateInput]): [GatewayRoute]
  updateGatewayRoute(id: ID!, data: GatewayRouteUpdateInput): GatewayRoute
  updateGatewayRoutes(data: [GatewayRoutesUpdateInput]): [GatewayRoute]
  deleteGatewayRoute(id: ID!): GatewayRoute
  deleteGatewayRoutes(ids: [ID!]): [GatewayRoute]
  createGatewayService(data: GatewayServiceCreateInput): GatewayService
  createGatewayServices(data: [GatewayServicesCreateInput]): [GatewayService]
  updateGatewayService(id: ID!, data: GatewayServiceUpdateInput): GatewayService
  updateGatewayServices(data: [GatewayServicesUpdateInput]): [GatewayService]
  deleteGatewayService(id: ID!): GatewayService
  deleteGatewayServices(ids: [ID!]): [GatewayService]
  createGroup(data: GroupCreateInput): Group
  createGroups(data: [GroupsCreateInput]): [Group]
  updateGroup(id: ID!, data: GroupUpdateInput): Group
  updateGroups(data: [GroupsUpdateInput]): [Group]
  deleteGroup(id: ID!): Group
  deleteGroups(ids: [ID!]): [Group]
  createMemberRole(data: MemberRoleCreateInput): MemberRole
  createMemberRoles(data: [MemberRolesCreateInput]): [MemberRole]
  updateMemberRole(id: ID!, data: MemberRoleUpdateInput): MemberRole
  updateMemberRoles(data: [MemberRolesUpdateInput]): [MemberRole]
  deleteMemberRole(id: ID!): MemberRole
  deleteMemberRoles(ids: [ID!]): [MemberRole]
  createNamespace(data: NamespaceCreateInput): Namespace
  createNamespaces(data: [NamespacesCreateInput]): [Namespace]
  updateNamespace(id: ID!, data: NamespaceUpdateInput): Namespace
  updateNamespaces(data: [NamespacesUpdateInput]): [Namespace]
  deleteNamespace(id: ID!): Namespace
  deleteNamespaces(ids: [ID!]): [Namespace]
  createOrganization(data: OrganizationCreateInput): Organization
  createOrganizations(data: [OrganizationsCreateInput]): [Organization]
  updateOrganization(id: ID!, data: OrganizationUpdateInput): Organization
  updateOrganizations(data: [OrganizationsUpdateInput]): [Organization]
  deleteOrganization(id: ID!): Organization
  deleteOrganizations(ids: [ID!]): [Organization]
  createOrganizationUnit(data: OrganizationUnitCreateInput): OrganizationUnit
  createOrganizationUnits(
    data: [OrganizationUnitsCreateInput]
  ): [OrganizationUnit]
  updateOrganizationUnit(
    id: ID!
    data: OrganizationUnitUpdateInput
  ): OrganizationUnit
  updateOrganizationUnits(
    data: [OrganizationUnitsUpdateInput]
  ): [OrganizationUnit]
  deleteOrganizationUnit(id: ID!): OrganizationUnit
  deleteOrganizationUnits(ids: [ID!]): [OrganizationUnit]
  createProduct(data: ProductCreateInput): Product
  createProducts(data: [ProductsCreateInput]): [Product]
  updateProduct(id: ID!, data: ProductUpdateInput): Product
  updateProducts(data: [ProductsUpdateInput]): [Product]
  deleteProduct(id: ID!): Product
  deleteProducts(ids: [ID!]): [Product]
  createPlugin(data: PluginCreateInput): Plugin
  createPlugins(data: [PluginsCreateInput]): [Plugin]
  updatePlugin(id: ID!, data: PluginUpdateInput): Plugin
  updatePlugins(data: [PluginsUpdateInput]): [Plugin]
  deletePlugin(id: ID!): Plugin
  deletePlugins(ids: [ID!]): [Plugin]
  createTemporaryIdentity(data: TemporaryIdentityCreateInput): TemporaryIdentity
  createTemporaryIdentities(
    data: [TemporaryIdentitiesCreateInput]
  ): [TemporaryIdentity]
  updateTemporaryIdentity(
    id: ID!
    data: TemporaryIdentityUpdateInput
  ): TemporaryIdentity
  updateTemporaryIdentities(
    data: [TemporaryIdentitiesUpdateInput]
  ): [TemporaryIdentity]
  deleteTemporaryIdentity(id: ID!): TemporaryIdentity
  deleteTemporaryIdentities(ids: [ID!]): [TemporaryIdentity]
  createTodo(data: TodoCreateInput): Todo
  createTodos(data: [TodosCreateInput]): [Todo]
  updateTodo(id: ID!, data: TodoUpdateInput): Todo
  updateTodos(data: [TodosUpdateInput]): [Todo]
  deleteTodo(id: ID!): Todo
  deleteTodos(ids: [ID!]): [Todo]
  createUser(data: UserCreateInput): User
  createUsers(data: [UsersCreateInput]): [User]
  updateUser(id: ID!, data: UserUpdateInput): User
  updateUsers(data: [UsersUpdateInput]): [User]
  deleteUser(id: ID!): User
  deleteUsers(ids: [ID!]): [User]
  authenticateUserWithPassword(
    email: String
    password: String
  ): authenticateUserOutput
  unauthenticateUser: unauthenticateUserOutput
  updateAuthenticatedUser(data: UserUpdateInput): User
}

type Namespace {
  _label_: String
  id: ID!
  name: String
  serviceAccounts: String
  permDomains: String
  extRefId: String
  members(
    where: MemberRoleWhereInput
    search: String
    sortBy: [SortMemberRolesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [MemberRole!]!
  _membersMeta(
    where: MemberRoleWhereInput
    search: String
    sortBy: [SortMemberRolesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  updatedBy: User
  createdBy: User
  updatedAt: DateTime
  createdAt: DateTime
}

input NamespaceCreateInput {
  name: String
  serviceAccounts: String
  permDomains: String
  extRefId: String
  members: MemberRoleRelateToManyInput
}

input NamespacesCreateInput {
  data: NamespaceCreateInput
}

input NamespacesUpdateInput {
  id: ID!
  data: NamespaceUpdateInput
}

input NamespaceUpdateInput {
  name: String
  serviceAccounts: String
  permDomains: String
  extRefId: String
  members: MemberRoleRelateToManyInput
}

input NamespaceWhereInput {
  AND: [NamespaceWhereInput]
  OR: [NamespaceWhereInput]
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
  serviceAccounts: String
  serviceAccounts_not: String
  serviceAccounts_contains: String
  serviceAccounts_not_contains: String
  serviceAccounts_starts_with: String
  serviceAccounts_not_starts_with: String
  serviceAccounts_ends_with: String
  serviceAccounts_not_ends_with: String
  serviceAccounts_i: String
  serviceAccounts_not_i: String
  serviceAccounts_contains_i: String
  serviceAccounts_not_contains_i: String
  serviceAccounts_starts_with_i: String
  serviceAccounts_not_starts_with_i: String
  serviceAccounts_ends_with_i: String
  serviceAccounts_not_ends_with_i: String
  serviceAccounts_in: [String]
  serviceAccounts_not_in: [String]
  permDomains: String
  permDomains_not: String
  permDomains_contains: String
  permDomains_not_contains: String
  permDomains_starts_with: String
  permDomains_not_starts_with: String
  permDomains_ends_with: String
  permDomains_not_ends_with: String
  permDomains_i: String
  permDomains_not_i: String
  permDomains_contains_i: String
  permDomains_not_contains_i: String
  permDomains_starts_with_i: String
  permDomains_not_starts_with_i: String
  permDomains_ends_with_i: String
  permDomains_not_ends_with_i: String
  permDomains_in: [String]
  permDomains_not_in: [String]
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
  members_every: MemberRoleWhereInput
  members_some: MemberRoleWhereInput
  members_none: MemberRoleWhereInput
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

input NamespaceWhereUniqueInput {
  id: ID!
}

type Organization {
  _label_: String
  id: ID!
  name: String
  sector: String
  title: String
  bcdc_id: String
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
}

input OrganizationCreateInput {
  name: String
  sector: String
  title: String
  bcdc_id: String
  tags: String
  description: String
  orgUnits: OrganizationUnitRelateToManyInput
}

input OrganizationRelateToOneInput {
  create: OrganizationCreateInput
  connect: OrganizationWhereUniqueInput
  disconnect: OrganizationWhereUniqueInput
  disconnectAll: Boolean
}

input OrganizationsCreateInput {
  data: OrganizationCreateInput
}

input OrganizationsUpdateInput {
  id: ID!
  data: OrganizationUpdateInput
}

type OrganizationUnit {
  _label_: String
  id: ID!
  name: String
  sector: String
  title: String
  bcdc_id: String
  tags: String
  description: String
}

input OrganizationUnitCreateInput {
  name: String
  sector: String
  title: String
  bcdc_id: String
  tags: String
  description: String
}

input OrganizationUnitRelateToManyInput {
  create: [OrganizationUnitCreateInput]
  connect: [OrganizationUnitWhereUniqueInput]
  disconnect: [OrganizationUnitWhereUniqueInput]
  disconnectAll: Boolean
}

input OrganizationUnitRelateToOneInput {
  create: OrganizationUnitCreateInput
  connect: OrganizationUnitWhereUniqueInput
  disconnect: OrganizationUnitWhereUniqueInput
  disconnectAll: Boolean
}

input OrganizationUnitsCreateInput {
  data: OrganizationUnitCreateInput
}

input OrganizationUnitsUpdateInput {
  id: ID!
  data: OrganizationUnitUpdateInput
}

input OrganizationUnitUpdateInput {
  name: String
  sector: String
  title: String
  bcdc_id: String
  tags: String
  description: String
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
  bcdc_id: String
  bcdc_id_not: String
  bcdc_id_contains: String
  bcdc_id_not_contains: String
  bcdc_id_starts_with: String
  bcdc_id_not_starts_with: String
  bcdc_id_ends_with: String
  bcdc_id_not_ends_with: String
  bcdc_id_i: String
  bcdc_id_not_i: String
  bcdc_id_contains_i: String
  bcdc_id_not_contains_i: String
  bcdc_id_starts_with_i: String
  bcdc_id_not_starts_with_i: String
  bcdc_id_ends_with_i: String
  bcdc_id_not_ends_with_i: String
  bcdc_id_in: [String]
  bcdc_id_not_in: [String]
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
}

input OrganizationUnitWhereUniqueInput {
  id: ID!
}

input OrganizationUpdateInput {
  name: String
  sector: String
  title: String
  bcdc_id: String
  tags: String
  description: String
  orgUnits: OrganizationUnitRelateToManyInput
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
  bcdc_id: String
  bcdc_id_not: String
  bcdc_id_contains: String
  bcdc_id_not_contains: String
  bcdc_id_starts_with: String
  bcdc_id_not_starts_with: String
  bcdc_id_ends_with: String
  bcdc_id_not_ends_with: String
  bcdc_id_i: String
  bcdc_id_not_i: String
  bcdc_id_contains_i: String
  bcdc_id_not_contains_i: String
  bcdc_id_starts_with_i: String
  bcdc_id_not_starts_with_i: String
  bcdc_id_ends_with_i: String
  bcdc_id_not_ends_with_i: String
  bcdc_id_in: [String]
  bcdc_id_not_in: [String]
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
  orgUnits_every: OrganizationUnitWhereInput
  orgUnits_some: OrganizationUnitWhereInput
  orgUnits_none: OrganizationUnitWhereInput
}

input OrganizationWhereUniqueInput {
  id: ID!
}

type Plugin {
  _label_: String
  id: ID!
  name: String
  kongPluginId: String
  tags: String
  config: String
  service: GatewayService
  route: GatewayRoute
  updatedBy: User
  createdBy: User
  updatedAt: DateTime
  createdAt: DateTime
}

input PluginCreateInput {
  name: String
  kongPluginId: String
  tags: String
  config: String
  service: GatewayServiceRelateToOneInput
  route: GatewayRouteRelateToOneInput
}

input PluginRelateToManyInput {
  create: [PluginCreateInput]
  connect: [PluginWhereUniqueInput]
  disconnect: [PluginWhereUniqueInput]
  disconnectAll: Boolean
}

input PluginsCreateInput {
  data: PluginCreateInput
}

input PluginsUpdateInput {
  id: ID!
  data: PluginUpdateInput
}

input PluginUpdateInput {
  name: String
  kongPluginId: String
  tags: String
  config: String
  service: GatewayServiceRelateToOneInput
  route: GatewayRouteRelateToOneInput
}

input PluginWhereInput {
  AND: [PluginWhereInput]
  OR: [PluginWhereInput]
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
  kongPluginId: String
  kongPluginId_not: String
  kongPluginId_contains: String
  kongPluginId_not_contains: String
  kongPluginId_starts_with: String
  kongPluginId_not_starts_with: String
  kongPluginId_ends_with: String
  kongPluginId_not_ends_with: String
  kongPluginId_i: String
  kongPluginId_not_i: String
  kongPluginId_contains_i: String
  kongPluginId_not_contains_i: String
  kongPluginId_starts_with_i: String
  kongPluginId_not_starts_with_i: String
  kongPluginId_ends_with_i: String
  kongPluginId_not_ends_with_i: String
  kongPluginId_in: [String]
  kongPluginId_not_in: [String]
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

input PluginWhereUniqueInput {
  id: ID!
}

type Product {
  _label_: String
  id: ID!
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

input ProductCreateInput {
  name: String
  namespace: String
  description: String
  dataset: DatasetRelateToOneInput
  organization: OrganizationRelateToOneInput
  organizationUnit: OrganizationUnitRelateToOneInput
  environments: EnvironmentRelateToManyInput
}

input ProductRelateToOneInput {
  create: ProductCreateInput
  connect: ProductWhereUniqueInput
  disconnect: ProductWhereUniqueInput
  disconnectAll: Boolean
}

input ProductsCreateInput {
  data: ProductCreateInput
}

input ProductsUpdateInput {
  id: ID!
  data: ProductUpdateInput
}

input ProductUpdateInput {
  name: String
  namespace: String
  description: String
  dataset: DatasetRelateToOneInput
  organization: OrganizationRelateToOneInput
  organizationUnit: OrganizationUnitRelateToOneInput
  environments: EnvironmentRelateToManyInput
}

input ProductWhereInput {
  AND: [ProductWhereInput]
  OR: [ProductWhereInput]
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
  dataset: DatasetWhereInput
  dataset_is_null: Boolean
  organization: OrganizationWhereInput
  organization_is_null: Boolean
  organizationUnit: OrganizationUnitWhereInput
  organizationUnit_is_null: Boolean
  environments_every: EnvironmentWhereInput
  environments_some: EnvironmentWhereInput
  environments_none: EnvironmentWhereInput
}

input ProductWhereUniqueInput {
  id: ID!
}

type Query {
  allAccessRequests(
    where: AccessRequestWhereInput
    search: String
    sortBy: [SortAccessRequestsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [AccessRequest]
  AccessRequest(where: AccessRequestWhereUniqueInput!): AccessRequest
  _allAccessRequestsMeta(
    where: AccessRequestWhereInput
    search: String
    sortBy: [SortAccessRequestsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _AccessRequestsMeta: _ListMeta
  allActivities(
    where: ActivityWhereInput
    search: String
    sortBy: [SortActivitiesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Activity]
  Activity(where: ActivityWhereUniqueInput!): Activity
  _allActivitiesMeta(
    where: ActivityWhereInput
    search: String
    sortBy: [SortActivitiesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _ActivitiesMeta: _ListMeta
  allAlerts(
    where: AlertWhereInput
    search: String
    sortBy: [SortAlertsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Alert]
  Alert(where: AlertWhereUniqueInput!): Alert
  _allAlertsMeta(
    where: AlertWhereInput
    search: String
    sortBy: [SortAlertsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _AlertsMeta: _ListMeta
  allApplications(
    where: ApplicationWhereInput
    search: String
    sortBy: [SortApplicationsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Application]
  Application(where: ApplicationWhereUniqueInput!): Application
  _allApplicationsMeta(
    where: ApplicationWhereInput
    search: String
    sortBy: [SortApplicationsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _ApplicationsMeta: _ListMeta
  allConsumers(
    where: ConsumerWhereInput
    search: String
    sortBy: [SortConsumersBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Consumer]
  Consumer(where: ConsumerWhereUniqueInput!): Consumer
  _allConsumersMeta(
    where: ConsumerWhereInput
    search: String
    sortBy: [SortConsumersBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _ConsumersMeta: _ListMeta
  allContents(
    where: ContentWhereInput
    search: String
    sortBy: [SortContentsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Content]
  Content(where: ContentWhereUniqueInput!): Content
  _allContentsMeta(
    where: ContentWhereInput
    search: String
    sortBy: [SortContentsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _ContentsMeta: _ListMeta
  allCredentialIssuers(
    where: CredentialIssuerWhereInput
    search: String
    sortBy: [SortCredentialIssuersBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [CredentialIssuer]
  CredentialIssuer(where: CredentialIssuerWhereUniqueInput!): CredentialIssuer
  _allCredentialIssuersMeta(
    where: CredentialIssuerWhereInput
    search: String
    sortBy: [SortCredentialIssuersBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _CredentialIssuersMeta: _ListMeta
  allDatasets(
    where: DatasetWhereInput
    search: String
    sortBy: [SortDatasetsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Dataset]
  Dataset(where: DatasetWhereUniqueInput!): Dataset
  _allDatasetsMeta(
    where: DatasetWhereInput
    search: String
    sortBy: [SortDatasetsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _DatasetsMeta: _ListMeta
  allEnvironments(
    where: EnvironmentWhereInput
    search: String
    sortBy: [SortEnvironmentsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Environment]
  Environment(where: EnvironmentWhereUniqueInput!): Environment
  _allEnvironmentsMeta(
    where: EnvironmentWhereInput
    search: String
    sortBy: [SortEnvironmentsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _EnvironmentsMeta: _ListMeta
  allGatewayMetrics(
    where: GatewayMetricWhereInput
    search: String
    sortBy: [SortGatewayMetricsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [GatewayMetric]
  GatewayMetric(where: GatewayMetricWhereUniqueInput!): GatewayMetric
  _allGatewayMetricsMeta(
    where: GatewayMetricWhereInput
    search: String
    sortBy: [SortGatewayMetricsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _GatewayMetricsMeta: _ListMeta
  allGatewayRoutes(
    where: GatewayRouteWhereInput
    search: String
    sortBy: [SortGatewayRoutesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [GatewayRoute]
  GatewayRoute(where: GatewayRouteWhereUniqueInput!): GatewayRoute
  _allGatewayRoutesMeta(
    where: GatewayRouteWhereInput
    search: String
    sortBy: [SortGatewayRoutesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _GatewayRoutesMeta: _ListMeta
  allGatewayServices(
    where: GatewayServiceWhereInput
    search: String
    sortBy: [SortGatewayServicesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [GatewayService]
  GatewayService(where: GatewayServiceWhereUniqueInput!): GatewayService
  _allGatewayServicesMeta(
    where: GatewayServiceWhereInput
    search: String
    sortBy: [SortGatewayServicesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _GatewayServicesMeta: _ListMeta
  allGroups(
    where: GroupWhereInput
    search: String
    sortBy: [SortGroupsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Group]
  Group(where: GroupWhereUniqueInput!): Group
  _allGroupsMeta(
    where: GroupWhereInput
    search: String
    sortBy: [SortGroupsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _GroupsMeta: _ListMeta
  allMemberRoles(
    where: MemberRoleWhereInput
    search: String
    sortBy: [SortMemberRolesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [MemberRole]
  MemberRole(where: MemberRoleWhereUniqueInput!): MemberRole
  _allMemberRolesMeta(
    where: MemberRoleWhereInput
    search: String
    sortBy: [SortMemberRolesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _MemberRolesMeta: _ListMeta
  allNamespaces(
    where: NamespaceWhereInput
    search: String
    sortBy: [SortNamespacesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Namespace]
  Namespace(where: NamespaceWhereUniqueInput!): Namespace
  _allNamespacesMeta(
    where: NamespaceWhereInput
    search: String
    sortBy: [SortNamespacesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _NamespacesMeta: _ListMeta
  allOrganizations(
    where: OrganizationWhereInput
    search: String
    sortBy: [SortOrganizationsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Organization]
  Organization(where: OrganizationWhereUniqueInput!): Organization
  _allOrganizationsMeta(
    where: OrganizationWhereInput
    search: String
    sortBy: [SortOrganizationsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _OrganizationsMeta: _ListMeta
  allOrganizationUnits(
    where: OrganizationUnitWhereInput
    search: String
    sortBy: [SortOrganizationUnitsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [OrganizationUnit]
  OrganizationUnit(where: OrganizationUnitWhereUniqueInput!): OrganizationUnit
  _allOrganizationUnitsMeta(
    where: OrganizationUnitWhereInput
    search: String
    sortBy: [SortOrganizationUnitsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _OrganizationUnitsMeta: _ListMeta
  allProducts(
    where: ProductWhereInput
    search: String
    sortBy: [SortProductsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Product]
  Product(where: ProductWhereUniqueInput!): Product
  _allProductsMeta(
    where: ProductWhereInput
    search: String
    sortBy: [SortProductsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _ProductsMeta: _ListMeta
  allPlugins(
    where: PluginWhereInput
    search: String
    sortBy: [SortPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Plugin]
  Plugin(where: PluginWhereUniqueInput!): Plugin
  _allPluginsMeta(
    where: PluginWhereInput
    search: String
    sortBy: [SortPluginsBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _PluginsMeta: _ListMeta
  allTemporaryIdentities(
    where: TemporaryIdentityWhereInput
    search: String
    sortBy: [SortTemporaryIdentitiesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [TemporaryIdentity]
  TemporaryIdentity(
    where: TemporaryIdentityWhereUniqueInput!
  ): TemporaryIdentity
  _allTemporaryIdentitiesMeta(
    where: TemporaryIdentityWhereInput
    search: String
    sortBy: [SortTemporaryIdentitiesBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _TemporaryIdentitiesMeta: _ListMeta
  allTodos(
    where: TodoWhereInput
    search: String
    sortBy: [SortTodosBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [Todo]
  Todo(where: TodoWhereUniqueInput!): Todo
  _allTodosMeta(
    where: TodoWhereInput
    search: String
    sortBy: [SortTodosBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _TodosMeta: _ListMeta
  allUsers(
    where: UserWhereInput
    search: String
    sortBy: [SortUsersBy!]
    orderBy: String
    first: Int
    skip: Int
  ): [User]
  User(where: UserWhereUniqueInput!): User
  _allUsersMeta(
    where: UserWhereInput
    search: String
    sortBy: [SortUsersBy!]
    orderBy: String
    first: Int
    skip: Int
  ): _QueryMeta
  _UsersMeta: _ListMeta
  _ksListsMeta(where: _ksListsMetaInput): [_ListMeta]
  appVersion: String
  authenticatedUser: User
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
  consumerId_ASC
  consumerId_DESC
  credential_ASC
  credential_DESC
  requestor_ASC
  requestor_DESC
  application_ASC
  application_DESC
  consumer_ASC
  consumer_DESC
  productEnvironment_ASC
  productEnvironment_DESC
  activity_ASC
  activity_DESC
  updatedBy_ASC
  updatedBy_DESC
  createdBy_ASC
  createdBy_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
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
  message_ASC
  message_DESC
  refId_ASC
  refId_DESC
  namespace_ASC
  namespace_DESC
  actor_ASC
  actor_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
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

enum SortApplicationsBy {
  id_ASC
  id_DESC
  appId_ASC
  appId_DESC
  name_ASC
  name_DESC
  description_ASC
  description_DESC
  owner_ASC
  owner_DESC
  updatedBy_ASC
  updatedBy_DESC
  createdBy_ASC
  createdBy_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

enum SortConsumersBy {
  id_ASC
  id_DESC
  username_ASC
  username_DESC
  customId_ASC
  customId_DESC
  kongConsumerId_ASC
  kongConsumerId_DESC
  namespace_ASC
  namespace_DESC
  tags_ASC
  tags_DESC
  plugins_ASC
  plugins_DESC
  updatedBy_ASC
  updatedBy_DESC
  createdBy_ASC
  createdBy_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
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
  slug_ASC
  slug_DESC
  order_ASC
  order_DESC
  isComplete_ASC
  isComplete_DESC
}

enum SortCredentialIssuersBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  description_ASC
  description_DESC
  authMethod_ASC
  authMethod_DESC
  mode_ASC
  mode_DESC
  oidcDiscoveryUrl_ASC
  oidcDiscoveryUrl_DESC
  initialAccessToken_ASC
  initialAccessToken_DESC
  clientId_ASC
  clientId_DESC
  clientSecret_ASC
  clientSecret_DESC
  contact_ASC
  contact_DESC
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

enum SortDatasetsBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  bcdc_id_ASC
  bcdc_id_DESC
  sector_ASC
  sector_DESC
  license_title_ASC
  license_title_DESC
  view_audience_ASC
  view_audience_DESC
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
  securityClass_ASC
  securityClass_DESC
  notes_ASC
  notes_DESC
  title_ASC
  title_DESC
  catalogContent_ASC
  catalogContent_DESC
  isInCatalog_ASC
  isInCatalog_DESC
}

enum SortEnvironmentsBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  active_ASC
  active_DESC
  authMethod_ASC
  authMethod_DESC
  plugins_ASC
  plugins_DESC
  description_ASC
  description_DESC
  credentialIssuer_ASC
  credentialIssuer_DESC
  services_ASC
  services_DESC
  product_ASC
  product_DESC
}

enum SortGatewayMetricsBy {
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

enum SortGatewayRoutesBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  kongRouteId_ASC
  kongRouteId_DESC
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
  updatedBy_ASC
  updatedBy_DESC
  createdBy_ASC
  createdBy_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

enum SortGatewayServicesBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  kongServiceId_ASC
  kongServiceId_DESC
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
  updatedBy_ASC
  updatedBy_DESC
  createdBy_ASC
  createdBy_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

enum SortGroupsBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  updatedBy_ASC
  updatedBy_DESC
  createdBy_ASC
  createdBy_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

enum SortMemberRolesBy {
  id_ASC
  id_DESC
  role_ASC
  role_DESC
  extRefId_ASC
  extRefId_DESC
  user_ASC
  user_DESC
  updatedBy_ASC
  updatedBy_DESC
  createdBy_ASC
  createdBy_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

enum SortNamespacesBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  serviceAccounts_ASC
  serviceAccounts_DESC
  permDomains_ASC
  permDomains_DESC
  extRefId_ASC
  extRefId_DESC
  members_ASC
  members_DESC
  updatedBy_ASC
  updatedBy_DESC
  createdBy_ASC
  createdBy_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
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
  bcdc_id_ASC
  bcdc_id_DESC
  tags_ASC
  tags_DESC
  description_ASC
  description_DESC
  orgUnits_ASC
  orgUnits_DESC
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
  bcdc_id_ASC
  bcdc_id_DESC
  tags_ASC
  tags_DESC
  description_ASC
  description_DESC
}

enum SortPluginsBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  kongPluginId_ASC
  kongPluginId_DESC
  tags_ASC
  tags_DESC
  config_ASC
  config_DESC
  service_ASC
  service_DESC
  route_ASC
  route_DESC
  updatedBy_ASC
  updatedBy_DESC
  createdBy_ASC
  createdBy_DESC
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

enum SortProductsBy {
  id_ASC
  id_DESC
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
  updatedAt_ASC
  updatedAt_DESC
  createdAt_ASC
  createdAt_DESC
}

enum SortTodosBy {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  description_ASC
  description_DESC
  content_ASC
  content_DESC
  grape_ASC
  grape_DESC
  yaml_ASC
  yaml_DESC
  isComplete_ASC
  isComplete_DESC
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
}

input TemporaryIdentitiesCreateInput {
  data: TemporaryIdentityCreateInput
}

input TemporaryIdentitiesUpdateInput {
  id: ID!
  data: TemporaryIdentityUpdateInput
}

type TemporaryIdentity {
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
  updatedAt: DateTime
  createdAt: DateTime
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

type Todo {
  _label_: String
  id: ID!
  name: String
  description: String
  content: String
  grape: String
  yaml: String
  isComplete: Boolean
}

input TodoCreateInput {
  name: String
  description: String
  content: String
  grape: String
  yaml: String
  isComplete: Boolean
}

input TodosCreateInput {
  data: TodoCreateInput
}

input TodosUpdateInput {
  id: ID!
  data: TodoUpdateInput
}

input TodoUpdateInput {
  name: String
  description: String
  content: String
  grape: String
  yaml: String
  isComplete: Boolean
}

input TodoWhereInput {
  AND: [TodoWhereInput]
  OR: [TodoWhereInput]
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
  grape: String
  grape_not: String
  grape_contains: String
  grape_not_contains: String
  grape_starts_with: String
  grape_not_starts_with: String
  grape_ends_with: String
  grape_not_ends_with: String
  grape_i: String
  grape_not_i: String
  grape_contains_i: String
  grape_not_contains_i: String
  grape_starts_with_i: String
  grape_not_starts_with_i: String
  grape_ends_with_i: String
  grape_not_ends_with_i: String
  grape_in: [String]
  grape_not_in: [String]
  yaml: String
  yaml_not: String
  yaml_contains: String
  yaml_not_contains: String
  yaml_starts_with: String
  yaml_not_starts_with: String
  yaml_ends_with: String
  yaml_not_ends_with: String
  yaml_i: String
  yaml_not_i: String
  yaml_contains_i: String
  yaml_not_contains_i: String
  yaml_starts_with_i: String
  yaml_not_starts_with_i: String
  yaml_ends_with_i: String
  yaml_not_ends_with_i: String
  yaml_in: [String]
  yaml_not_in: [String]
  isComplete: Boolean
  isComplete_not: Boolean
}

input TodoWhereUniqueInput {
  id: ID!
}

type unauthenticateUserOutput {
  success: Boolean
}

scalar Upload

type User {
  _label_: String
  id: ID!
  name: String
  username: String
  email: String
  isAdmin: Boolean
  password_is_set: Boolean
}

input UserCreateInput {
  name: String
  username: String
  email: String
  isAdmin: Boolean
  password: String
}

input UserRelateToOneInput {
  create: UserCreateInput
  connect: UserWhereUniqueInput
  disconnect: UserWhereUniqueInput
  disconnectAll: Boolean
}

input UsersCreateInput {
  data: UserCreateInput
}

input UsersUpdateInput {
  id: ID!
  data: UserUpdateInput
}

input UserUpdateInput {
  name: String
  username: String
  email: String
  isAdmin: Boolean
  password: String
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
}

input UserWhereUniqueInput {
  id: ID!
}
`;
