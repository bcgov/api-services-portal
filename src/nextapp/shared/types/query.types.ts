export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** DateTime custom scalar represents an ISO 8601 datetime string */
  DateTime: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};


export type UserRelateToOneInput = {
  create?: Maybe<UserCreateInput>;
  connect?: Maybe<UserWhereUniqueInput>;
  disconnect?: Maybe<UserWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type ApplicationRelateToOneInput = {
  create?: Maybe<ApplicationCreateInput>;
  connect?: Maybe<ApplicationWhereUniqueInput>;
  disconnect?: Maybe<ApplicationWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type ConsumerRelateToOneInput = {
  create?: Maybe<ConsumerCreateInput>;
  connect?: Maybe<ConsumerWhereUniqueInput>;
  disconnect?: Maybe<ConsumerWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type EnvironmentRelateToOneInput = {
  create?: Maybe<EnvironmentCreateInput>;
  connect?: Maybe<EnvironmentWhereUniqueInput>;
  disconnect?: Maybe<EnvironmentWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type ActivityRelateToManyInput = {
  create?: Maybe<Array<Maybe<ActivityCreateInput>>>;
  connect?: Maybe<Array<Maybe<ActivityWhereUniqueInput>>>;
  disconnect?: Maybe<Array<Maybe<ActivityWhereUniqueInput>>>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};


/**  A keystone list  */
export type AccessRequest = {
  __typename?: 'AccessRequest';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the AccessRequest List config, or
   *  2. As an alias to the field set on 'labelField' in the AccessRequest List config, or
   *  3. As an alias to a 'name' field on the AccessRequest List (if one exists), or
   *  4. As an alias to the 'id' field on the AccessRequest List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  communication?: Maybe<Scalars['String']>;
  isApproved?: Maybe<Scalars['Boolean']>;
  isIssued?: Maybe<Scalars['Boolean']>;
  isComplete?: Maybe<Scalars['Boolean']>;
  consumerId?: Maybe<Scalars['String']>;
  credential?: Maybe<Scalars['String']>;
  requestor?: Maybe<User>;
  application?: Maybe<Application>;
  consumer?: Maybe<Consumer>;
  packageEnvironment?: Maybe<Environment>;
  activity: Array<Activity>;
  _activityMeta?: Maybe<_QueryMeta>;
  updatedBy?: Maybe<User>;
  createdBy?: Maybe<User>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};


/**  A keystone list  */
export type AccessRequestActivityArgs = {
  where?: Maybe<ActivityWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortActivitiesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type AccessRequest_ActivityMetaArgs = {
  where?: Maybe<ActivityWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortActivitiesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type AccessRequestWhereInput = {
  AND?: Maybe<Array<Maybe<AccessRequestWhereInput>>>;
  OR?: Maybe<Array<Maybe<AccessRequestWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  communication?: Maybe<Scalars['String']>;
  communication_not?: Maybe<Scalars['String']>;
  communication_contains?: Maybe<Scalars['String']>;
  communication_not_contains?: Maybe<Scalars['String']>;
  communication_starts_with?: Maybe<Scalars['String']>;
  communication_not_starts_with?: Maybe<Scalars['String']>;
  communication_ends_with?: Maybe<Scalars['String']>;
  communication_not_ends_with?: Maybe<Scalars['String']>;
  communication_i?: Maybe<Scalars['String']>;
  communication_not_i?: Maybe<Scalars['String']>;
  communication_contains_i?: Maybe<Scalars['String']>;
  communication_not_contains_i?: Maybe<Scalars['String']>;
  communication_starts_with_i?: Maybe<Scalars['String']>;
  communication_not_starts_with_i?: Maybe<Scalars['String']>;
  communication_ends_with_i?: Maybe<Scalars['String']>;
  communication_not_ends_with_i?: Maybe<Scalars['String']>;
  communication_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  communication_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  isApproved?: Maybe<Scalars['Boolean']>;
  isApproved_not?: Maybe<Scalars['Boolean']>;
  isIssued?: Maybe<Scalars['Boolean']>;
  isIssued_not?: Maybe<Scalars['Boolean']>;
  isComplete?: Maybe<Scalars['Boolean']>;
  isComplete_not?: Maybe<Scalars['Boolean']>;
  consumerId?: Maybe<Scalars['String']>;
  consumerId_not?: Maybe<Scalars['String']>;
  consumerId_contains?: Maybe<Scalars['String']>;
  consumerId_not_contains?: Maybe<Scalars['String']>;
  consumerId_starts_with?: Maybe<Scalars['String']>;
  consumerId_not_starts_with?: Maybe<Scalars['String']>;
  consumerId_ends_with?: Maybe<Scalars['String']>;
  consumerId_not_ends_with?: Maybe<Scalars['String']>;
  consumerId_i?: Maybe<Scalars['String']>;
  consumerId_not_i?: Maybe<Scalars['String']>;
  consumerId_contains_i?: Maybe<Scalars['String']>;
  consumerId_not_contains_i?: Maybe<Scalars['String']>;
  consumerId_starts_with_i?: Maybe<Scalars['String']>;
  consumerId_not_starts_with_i?: Maybe<Scalars['String']>;
  consumerId_ends_with_i?: Maybe<Scalars['String']>;
  consumerId_not_ends_with_i?: Maybe<Scalars['String']>;
  consumerId_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  consumerId_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  credential?: Maybe<Scalars['String']>;
  credential_not?: Maybe<Scalars['String']>;
  credential_contains?: Maybe<Scalars['String']>;
  credential_not_contains?: Maybe<Scalars['String']>;
  credential_starts_with?: Maybe<Scalars['String']>;
  credential_not_starts_with?: Maybe<Scalars['String']>;
  credential_ends_with?: Maybe<Scalars['String']>;
  credential_not_ends_with?: Maybe<Scalars['String']>;
  credential_i?: Maybe<Scalars['String']>;
  credential_not_i?: Maybe<Scalars['String']>;
  credential_contains_i?: Maybe<Scalars['String']>;
  credential_not_contains_i?: Maybe<Scalars['String']>;
  credential_starts_with_i?: Maybe<Scalars['String']>;
  credential_not_starts_with_i?: Maybe<Scalars['String']>;
  credential_ends_with_i?: Maybe<Scalars['String']>;
  credential_not_ends_with_i?: Maybe<Scalars['String']>;
  credential_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  credential_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  requestor?: Maybe<UserWhereInput>;
  requestor_is_null?: Maybe<Scalars['Boolean']>;
  application?: Maybe<ApplicationWhereInput>;
  application_is_null?: Maybe<Scalars['Boolean']>;
  consumer?: Maybe<ConsumerWhereInput>;
  consumer_is_null?: Maybe<Scalars['Boolean']>;
  packageEnvironment?: Maybe<EnvironmentWhereInput>;
  packageEnvironment_is_null?: Maybe<Scalars['Boolean']>;
  /**  condition must be true for all nodes  */
  activity_every?: Maybe<ActivityWhereInput>;
  /**  condition must be true for at least 1 node  */
  activity_some?: Maybe<ActivityWhereInput>;
  /**  condition must be false for all nodes  */
  activity_none?: Maybe<ActivityWhereInput>;
  updatedBy?: Maybe<UserWhereInput>;
  updatedBy_is_null?: Maybe<Scalars['Boolean']>;
  createdBy?: Maybe<UserWhereInput>;
  createdBy_is_null?: Maybe<Scalars['Boolean']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedAt_not?: Maybe<Scalars['DateTime']>;
  updatedAt_lt?: Maybe<Scalars['DateTime']>;
  updatedAt_lte?: Maybe<Scalars['DateTime']>;
  updatedAt_gt?: Maybe<Scalars['DateTime']>;
  updatedAt_gte?: Maybe<Scalars['DateTime']>;
  updatedAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  updatedAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdAt_not?: Maybe<Scalars['DateTime']>;
  createdAt_lt?: Maybe<Scalars['DateTime']>;
  createdAt_lte?: Maybe<Scalars['DateTime']>;
  createdAt_gt?: Maybe<Scalars['DateTime']>;
  createdAt_gte?: Maybe<Scalars['DateTime']>;
  createdAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
};

export type AccessRequestWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortAccessRequestsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  CommunicationAsc = 'communication_ASC',
  CommunicationDesc = 'communication_DESC',
  IsApprovedAsc = 'isApproved_ASC',
  IsApprovedDesc = 'isApproved_DESC',
  IsIssuedAsc = 'isIssued_ASC',
  IsIssuedDesc = 'isIssued_DESC',
  IsCompleteAsc = 'isComplete_ASC',
  IsCompleteDesc = 'isComplete_DESC',
  ConsumerIdAsc = 'consumerId_ASC',
  ConsumerIdDesc = 'consumerId_DESC',
  CredentialAsc = 'credential_ASC',
  CredentialDesc = 'credential_DESC',
  RequestorAsc = 'requestor_ASC',
  RequestorDesc = 'requestor_DESC',
  ApplicationAsc = 'application_ASC',
  ApplicationDesc = 'application_DESC',
  ConsumerAsc = 'consumer_ASC',
  ConsumerDesc = 'consumer_DESC',
  PackageEnvironmentAsc = 'packageEnvironment_ASC',
  PackageEnvironmentDesc = 'packageEnvironment_DESC',
  ActivityAsc = 'activity_ASC',
  ActivityDesc = 'activity_DESC',
  UpdatedByAsc = 'updatedBy_ASC',
  UpdatedByDesc = 'updatedBy_DESC',
  CreatedByAsc = 'createdBy_ASC',
  CreatedByDesc = 'createdBy_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type AccessRequestUpdateInput = {
  name?: Maybe<Scalars['String']>;
  communication?: Maybe<Scalars['String']>;
  isApproved?: Maybe<Scalars['Boolean']>;
  isIssued?: Maybe<Scalars['Boolean']>;
  isComplete?: Maybe<Scalars['Boolean']>;
  consumerId?: Maybe<Scalars['String']>;
  credential?: Maybe<Scalars['String']>;
  requestor?: Maybe<UserRelateToOneInput>;
  application?: Maybe<ApplicationRelateToOneInput>;
  consumer?: Maybe<ConsumerRelateToOneInput>;
  packageEnvironment?: Maybe<EnvironmentRelateToOneInput>;
  activity?: Maybe<ActivityRelateToManyInput>;
};

export type AccessRequestsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<AccessRequestUpdateInput>;
};

export type AccessRequestCreateInput = {
  name?: Maybe<Scalars['String']>;
  communication?: Maybe<Scalars['String']>;
  isApproved?: Maybe<Scalars['Boolean']>;
  isIssued?: Maybe<Scalars['Boolean']>;
  isComplete?: Maybe<Scalars['Boolean']>;
  consumerId?: Maybe<Scalars['String']>;
  credential?: Maybe<Scalars['String']>;
  requestor?: Maybe<UserRelateToOneInput>;
  application?: Maybe<ApplicationRelateToOneInput>;
  consumer?: Maybe<ConsumerRelateToOneInput>;
  packageEnvironment?: Maybe<EnvironmentRelateToOneInput>;
  activity?: Maybe<ActivityRelateToManyInput>;
};

export type AccessRequestsCreateInput = {
  data?: Maybe<AccessRequestCreateInput>;
};

/**  A keystone list  */
export type Activity = {
  __typename?: 'Activity';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Activity List config, or
   *  2. As an alias to the field set on 'labelField' in the Activity List config, or
   *  3. As an alias to a 'name' field on the Activity List (if one exists), or
   *  4. As an alias to the 'id' field on the Activity List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  action?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
  refId?: Maybe<Scalars['String']>;
  actor?: Maybe<User>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type ActivityWhereInput = {
  AND?: Maybe<Array<Maybe<ActivityWhereInput>>>;
  OR?: Maybe<Array<Maybe<ActivityWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  type?: Maybe<Scalars['String']>;
  type_not?: Maybe<Scalars['String']>;
  type_contains?: Maybe<Scalars['String']>;
  type_not_contains?: Maybe<Scalars['String']>;
  type_starts_with?: Maybe<Scalars['String']>;
  type_not_starts_with?: Maybe<Scalars['String']>;
  type_ends_with?: Maybe<Scalars['String']>;
  type_not_ends_with?: Maybe<Scalars['String']>;
  type_i?: Maybe<Scalars['String']>;
  type_not_i?: Maybe<Scalars['String']>;
  type_contains_i?: Maybe<Scalars['String']>;
  type_not_contains_i?: Maybe<Scalars['String']>;
  type_starts_with_i?: Maybe<Scalars['String']>;
  type_not_starts_with_i?: Maybe<Scalars['String']>;
  type_ends_with_i?: Maybe<Scalars['String']>;
  type_not_ends_with_i?: Maybe<Scalars['String']>;
  type_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  type_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  action?: Maybe<Scalars['String']>;
  action_not?: Maybe<Scalars['String']>;
  action_contains?: Maybe<Scalars['String']>;
  action_not_contains?: Maybe<Scalars['String']>;
  action_starts_with?: Maybe<Scalars['String']>;
  action_not_starts_with?: Maybe<Scalars['String']>;
  action_ends_with?: Maybe<Scalars['String']>;
  action_not_ends_with?: Maybe<Scalars['String']>;
  action_i?: Maybe<Scalars['String']>;
  action_not_i?: Maybe<Scalars['String']>;
  action_contains_i?: Maybe<Scalars['String']>;
  action_not_contains_i?: Maybe<Scalars['String']>;
  action_starts_with_i?: Maybe<Scalars['String']>;
  action_not_starts_with_i?: Maybe<Scalars['String']>;
  action_ends_with_i?: Maybe<Scalars['String']>;
  action_not_ends_with_i?: Maybe<Scalars['String']>;
  action_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  action_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  message?: Maybe<Scalars['String']>;
  message_not?: Maybe<Scalars['String']>;
  message_contains?: Maybe<Scalars['String']>;
  message_not_contains?: Maybe<Scalars['String']>;
  message_starts_with?: Maybe<Scalars['String']>;
  message_not_starts_with?: Maybe<Scalars['String']>;
  message_ends_with?: Maybe<Scalars['String']>;
  message_not_ends_with?: Maybe<Scalars['String']>;
  message_i?: Maybe<Scalars['String']>;
  message_not_i?: Maybe<Scalars['String']>;
  message_contains_i?: Maybe<Scalars['String']>;
  message_not_contains_i?: Maybe<Scalars['String']>;
  message_starts_with_i?: Maybe<Scalars['String']>;
  message_not_starts_with_i?: Maybe<Scalars['String']>;
  message_ends_with_i?: Maybe<Scalars['String']>;
  message_not_ends_with_i?: Maybe<Scalars['String']>;
  message_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  message_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  refId?: Maybe<Scalars['String']>;
  refId_not?: Maybe<Scalars['String']>;
  refId_contains?: Maybe<Scalars['String']>;
  refId_not_contains?: Maybe<Scalars['String']>;
  refId_starts_with?: Maybe<Scalars['String']>;
  refId_not_starts_with?: Maybe<Scalars['String']>;
  refId_ends_with?: Maybe<Scalars['String']>;
  refId_not_ends_with?: Maybe<Scalars['String']>;
  refId_i?: Maybe<Scalars['String']>;
  refId_not_i?: Maybe<Scalars['String']>;
  refId_contains_i?: Maybe<Scalars['String']>;
  refId_not_contains_i?: Maybe<Scalars['String']>;
  refId_starts_with_i?: Maybe<Scalars['String']>;
  refId_not_starts_with_i?: Maybe<Scalars['String']>;
  refId_ends_with_i?: Maybe<Scalars['String']>;
  refId_not_ends_with_i?: Maybe<Scalars['String']>;
  refId_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  refId_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  actor?: Maybe<UserWhereInput>;
  actor_is_null?: Maybe<Scalars['Boolean']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedAt_not?: Maybe<Scalars['DateTime']>;
  updatedAt_lt?: Maybe<Scalars['DateTime']>;
  updatedAt_lte?: Maybe<Scalars['DateTime']>;
  updatedAt_gt?: Maybe<Scalars['DateTime']>;
  updatedAt_gte?: Maybe<Scalars['DateTime']>;
  updatedAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  updatedAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdAt_not?: Maybe<Scalars['DateTime']>;
  createdAt_lt?: Maybe<Scalars['DateTime']>;
  createdAt_lte?: Maybe<Scalars['DateTime']>;
  createdAt_gt?: Maybe<Scalars['DateTime']>;
  createdAt_gte?: Maybe<Scalars['DateTime']>;
  createdAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
};

export type ActivityWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortActivitiesBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  TypeAsc = 'type_ASC',
  TypeDesc = 'type_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  ActionAsc = 'action_ASC',
  ActionDesc = 'action_DESC',
  MessageAsc = 'message_ASC',
  MessageDesc = 'message_DESC',
  RefIdAsc = 'refId_ASC',
  RefIdDesc = 'refId_DESC',
  ActorAsc = 'actor_ASC',
  ActorDesc = 'actor_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type ActivityUpdateInput = {
  type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  action?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
  refId?: Maybe<Scalars['String']>;
  actor?: Maybe<UserRelateToOneInput>;
};

export type ActivitiesUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<ActivityUpdateInput>;
};

export type ActivityCreateInput = {
  type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  action?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
  refId?: Maybe<Scalars['String']>;
  actor?: Maybe<UserRelateToOneInput>;
};

export type ActivitiesCreateInput = {
  data?: Maybe<ActivityCreateInput>;
};

/**  A keystone list  */
export type Application = {
  __typename?: 'Application';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Application List config, or
   *  2. As an alias to the field set on 'labelField' in the Application List config, or
   *  3. As an alias to a 'name' field on the Application List (if one exists), or
   *  4. As an alias to the 'id' field on the Application List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  appId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  owner?: Maybe<User>;
  updatedBy?: Maybe<User>;
  createdBy?: Maybe<User>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type ApplicationWhereInput = {
  AND?: Maybe<Array<Maybe<ApplicationWhereInput>>>;
  OR?: Maybe<Array<Maybe<ApplicationWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  appId?: Maybe<Scalars['String']>;
  appId_not?: Maybe<Scalars['String']>;
  appId_contains?: Maybe<Scalars['String']>;
  appId_not_contains?: Maybe<Scalars['String']>;
  appId_starts_with?: Maybe<Scalars['String']>;
  appId_not_starts_with?: Maybe<Scalars['String']>;
  appId_ends_with?: Maybe<Scalars['String']>;
  appId_not_ends_with?: Maybe<Scalars['String']>;
  appId_i?: Maybe<Scalars['String']>;
  appId_not_i?: Maybe<Scalars['String']>;
  appId_contains_i?: Maybe<Scalars['String']>;
  appId_not_contains_i?: Maybe<Scalars['String']>;
  appId_starts_with_i?: Maybe<Scalars['String']>;
  appId_not_starts_with_i?: Maybe<Scalars['String']>;
  appId_ends_with_i?: Maybe<Scalars['String']>;
  appId_not_ends_with_i?: Maybe<Scalars['String']>;
  appId_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  appId_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description?: Maybe<Scalars['String']>;
  description_not?: Maybe<Scalars['String']>;
  description_contains?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  description_starts_with?: Maybe<Scalars['String']>;
  description_not_starts_with?: Maybe<Scalars['String']>;
  description_ends_with?: Maybe<Scalars['String']>;
  description_not_ends_with?: Maybe<Scalars['String']>;
  description_i?: Maybe<Scalars['String']>;
  description_not_i?: Maybe<Scalars['String']>;
  description_contains_i?: Maybe<Scalars['String']>;
  description_not_contains_i?: Maybe<Scalars['String']>;
  description_starts_with_i?: Maybe<Scalars['String']>;
  description_not_starts_with_i?: Maybe<Scalars['String']>;
  description_ends_with_i?: Maybe<Scalars['String']>;
  description_not_ends_with_i?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  owner?: Maybe<UserWhereInput>;
  owner_is_null?: Maybe<Scalars['Boolean']>;
  updatedBy?: Maybe<UserWhereInput>;
  updatedBy_is_null?: Maybe<Scalars['Boolean']>;
  createdBy?: Maybe<UserWhereInput>;
  createdBy_is_null?: Maybe<Scalars['Boolean']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedAt_not?: Maybe<Scalars['DateTime']>;
  updatedAt_lt?: Maybe<Scalars['DateTime']>;
  updatedAt_lte?: Maybe<Scalars['DateTime']>;
  updatedAt_gt?: Maybe<Scalars['DateTime']>;
  updatedAt_gte?: Maybe<Scalars['DateTime']>;
  updatedAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  updatedAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdAt_not?: Maybe<Scalars['DateTime']>;
  createdAt_lt?: Maybe<Scalars['DateTime']>;
  createdAt_lte?: Maybe<Scalars['DateTime']>;
  createdAt_gt?: Maybe<Scalars['DateTime']>;
  createdAt_gte?: Maybe<Scalars['DateTime']>;
  createdAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
};

export type ApplicationWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortApplicationsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  AppIdAsc = 'appId_ASC',
  AppIdDesc = 'appId_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  OwnerAsc = 'owner_ASC',
  OwnerDesc = 'owner_DESC',
  UpdatedByAsc = 'updatedBy_ASC',
  UpdatedByDesc = 'updatedBy_DESC',
  CreatedByAsc = 'createdBy_ASC',
  CreatedByDesc = 'createdBy_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type ApplicationUpdateInput = {
  appId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  owner?: Maybe<UserRelateToOneInput>;
};

export type ApplicationsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<ApplicationUpdateInput>;
};

export type ApplicationCreateInput = {
  appId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  owner?: Maybe<UserRelateToOneInput>;
};

export type ApplicationsCreateInput = {
  data?: Maybe<ApplicationCreateInput>;
};

export type PluginRelateToManyInput = {
  create?: Maybe<Array<Maybe<PluginCreateInput>>>;
  connect?: Maybe<Array<Maybe<PluginWhereUniqueInput>>>;
  disconnect?: Maybe<Array<Maybe<PluginWhereUniqueInput>>>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

/**  A keystone list  */
export type Consumer = {
  __typename?: 'Consumer';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Consumer List config, or
   *  2. As an alias to the field set on 'labelField' in the Consumer List config, or
   *  3. As an alias to a 'name' field on the Consumer List (if one exists), or
   *  4. As an alias to the 'id' field on the Consumer List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  username?: Maybe<Scalars['String']>;
  customId?: Maybe<Scalars['String']>;
  kongConsumerId?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  plugins: Array<Plugin>;
  _pluginsMeta?: Maybe<_QueryMeta>;
  updatedBy?: Maybe<User>;
  createdBy?: Maybe<User>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};


/**  A keystone list  */
export type ConsumerPluginsArgs = {
  where?: Maybe<PluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type Consumer_PluginsMetaArgs = {
  where?: Maybe<PluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type ConsumerWhereInput = {
  AND?: Maybe<Array<Maybe<ConsumerWhereInput>>>;
  OR?: Maybe<Array<Maybe<ConsumerWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  username?: Maybe<Scalars['String']>;
  username_not?: Maybe<Scalars['String']>;
  username_contains?: Maybe<Scalars['String']>;
  username_not_contains?: Maybe<Scalars['String']>;
  username_starts_with?: Maybe<Scalars['String']>;
  username_not_starts_with?: Maybe<Scalars['String']>;
  username_ends_with?: Maybe<Scalars['String']>;
  username_not_ends_with?: Maybe<Scalars['String']>;
  username_i?: Maybe<Scalars['String']>;
  username_not_i?: Maybe<Scalars['String']>;
  username_contains_i?: Maybe<Scalars['String']>;
  username_not_contains_i?: Maybe<Scalars['String']>;
  username_starts_with_i?: Maybe<Scalars['String']>;
  username_not_starts_with_i?: Maybe<Scalars['String']>;
  username_ends_with_i?: Maybe<Scalars['String']>;
  username_not_ends_with_i?: Maybe<Scalars['String']>;
  username_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  username_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  customId?: Maybe<Scalars['String']>;
  customId_not?: Maybe<Scalars['String']>;
  customId_contains?: Maybe<Scalars['String']>;
  customId_not_contains?: Maybe<Scalars['String']>;
  customId_starts_with?: Maybe<Scalars['String']>;
  customId_not_starts_with?: Maybe<Scalars['String']>;
  customId_ends_with?: Maybe<Scalars['String']>;
  customId_not_ends_with?: Maybe<Scalars['String']>;
  customId_i?: Maybe<Scalars['String']>;
  customId_not_i?: Maybe<Scalars['String']>;
  customId_contains_i?: Maybe<Scalars['String']>;
  customId_not_contains_i?: Maybe<Scalars['String']>;
  customId_starts_with_i?: Maybe<Scalars['String']>;
  customId_not_starts_with_i?: Maybe<Scalars['String']>;
  customId_ends_with_i?: Maybe<Scalars['String']>;
  customId_not_ends_with_i?: Maybe<Scalars['String']>;
  customId_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  customId_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  kongConsumerId?: Maybe<Scalars['String']>;
  kongConsumerId_not?: Maybe<Scalars['String']>;
  kongConsumerId_contains?: Maybe<Scalars['String']>;
  kongConsumerId_not_contains?: Maybe<Scalars['String']>;
  kongConsumerId_starts_with?: Maybe<Scalars['String']>;
  kongConsumerId_not_starts_with?: Maybe<Scalars['String']>;
  kongConsumerId_ends_with?: Maybe<Scalars['String']>;
  kongConsumerId_not_ends_with?: Maybe<Scalars['String']>;
  kongConsumerId_i?: Maybe<Scalars['String']>;
  kongConsumerId_not_i?: Maybe<Scalars['String']>;
  kongConsumerId_contains_i?: Maybe<Scalars['String']>;
  kongConsumerId_not_contains_i?: Maybe<Scalars['String']>;
  kongConsumerId_starts_with_i?: Maybe<Scalars['String']>;
  kongConsumerId_not_starts_with_i?: Maybe<Scalars['String']>;
  kongConsumerId_ends_with_i?: Maybe<Scalars['String']>;
  kongConsumerId_not_ends_with_i?: Maybe<Scalars['String']>;
  kongConsumerId_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  kongConsumerId_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  namespace?: Maybe<Scalars['String']>;
  namespace_not?: Maybe<Scalars['String']>;
  namespace_contains?: Maybe<Scalars['String']>;
  namespace_not_contains?: Maybe<Scalars['String']>;
  namespace_starts_with?: Maybe<Scalars['String']>;
  namespace_not_starts_with?: Maybe<Scalars['String']>;
  namespace_ends_with?: Maybe<Scalars['String']>;
  namespace_not_ends_with?: Maybe<Scalars['String']>;
  namespace_i?: Maybe<Scalars['String']>;
  namespace_not_i?: Maybe<Scalars['String']>;
  namespace_contains_i?: Maybe<Scalars['String']>;
  namespace_not_contains_i?: Maybe<Scalars['String']>;
  namespace_starts_with_i?: Maybe<Scalars['String']>;
  namespace_not_starts_with_i?: Maybe<Scalars['String']>;
  namespace_ends_with_i?: Maybe<Scalars['String']>;
  namespace_not_ends_with_i?: Maybe<Scalars['String']>;
  namespace_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  namespace_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tags?: Maybe<Scalars['String']>;
  tags_not?: Maybe<Scalars['String']>;
  tags_contains?: Maybe<Scalars['String']>;
  tags_not_contains?: Maybe<Scalars['String']>;
  tags_starts_with?: Maybe<Scalars['String']>;
  tags_not_starts_with?: Maybe<Scalars['String']>;
  tags_ends_with?: Maybe<Scalars['String']>;
  tags_not_ends_with?: Maybe<Scalars['String']>;
  tags_i?: Maybe<Scalars['String']>;
  tags_not_i?: Maybe<Scalars['String']>;
  tags_contains_i?: Maybe<Scalars['String']>;
  tags_not_contains_i?: Maybe<Scalars['String']>;
  tags_starts_with_i?: Maybe<Scalars['String']>;
  tags_not_starts_with_i?: Maybe<Scalars['String']>;
  tags_ends_with_i?: Maybe<Scalars['String']>;
  tags_not_ends_with_i?: Maybe<Scalars['String']>;
  tags_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tags_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**  condition must be true for all nodes  */
  plugins_every?: Maybe<PluginWhereInput>;
  /**  condition must be true for at least 1 node  */
  plugins_some?: Maybe<PluginWhereInput>;
  /**  condition must be false for all nodes  */
  plugins_none?: Maybe<PluginWhereInput>;
  updatedBy?: Maybe<UserWhereInput>;
  updatedBy_is_null?: Maybe<Scalars['Boolean']>;
  createdBy?: Maybe<UserWhereInput>;
  createdBy_is_null?: Maybe<Scalars['Boolean']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedAt_not?: Maybe<Scalars['DateTime']>;
  updatedAt_lt?: Maybe<Scalars['DateTime']>;
  updatedAt_lte?: Maybe<Scalars['DateTime']>;
  updatedAt_gt?: Maybe<Scalars['DateTime']>;
  updatedAt_gte?: Maybe<Scalars['DateTime']>;
  updatedAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  updatedAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdAt_not?: Maybe<Scalars['DateTime']>;
  createdAt_lt?: Maybe<Scalars['DateTime']>;
  createdAt_lte?: Maybe<Scalars['DateTime']>;
  createdAt_gt?: Maybe<Scalars['DateTime']>;
  createdAt_gte?: Maybe<Scalars['DateTime']>;
  createdAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
};

export type ConsumerWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortConsumersBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  UsernameAsc = 'username_ASC',
  UsernameDesc = 'username_DESC',
  CustomIdAsc = 'customId_ASC',
  CustomIdDesc = 'customId_DESC',
  KongConsumerIdAsc = 'kongConsumerId_ASC',
  KongConsumerIdDesc = 'kongConsumerId_DESC',
  NamespaceAsc = 'namespace_ASC',
  NamespaceDesc = 'namespace_DESC',
  TagsAsc = 'tags_ASC',
  TagsDesc = 'tags_DESC',
  PluginsAsc = 'plugins_ASC',
  PluginsDesc = 'plugins_DESC',
  UpdatedByAsc = 'updatedBy_ASC',
  UpdatedByDesc = 'updatedBy_DESC',
  CreatedByAsc = 'createdBy_ASC',
  CreatedByDesc = 'createdBy_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type ConsumerUpdateInput = {
  username?: Maybe<Scalars['String']>;
  customId?: Maybe<Scalars['String']>;
  kongConsumerId?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  plugins?: Maybe<PluginRelateToManyInput>;
};

export type ConsumersUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<ConsumerUpdateInput>;
};

export type ConsumerCreateInput = {
  username?: Maybe<Scalars['String']>;
  customId?: Maybe<Scalars['String']>;
  kongConsumerId?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  plugins?: Maybe<PluginRelateToManyInput>;
};

export type ConsumersCreateInput = {
  data?: Maybe<ConsumerCreateInput>;
};

/**  A keystone list  */
export type Content = {
  __typename?: 'Content';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Content List config, or
   *  2. As an alias to the field set on 'labelField' in the Content List config, or
   *  3. As an alias to a 'name' field on the Content List (if one exists), or
   *  4. As an alias to the 'id' field on the Content List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  githubRepository?: Maybe<Scalars['String']>;
  readme?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isComplete?: Maybe<Scalars['Boolean']>;
};

export type ContentWhereInput = {
  AND?: Maybe<Array<Maybe<ContentWhereInput>>>;
  OR?: Maybe<Array<Maybe<ContentWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  title?: Maybe<Scalars['String']>;
  title_not?: Maybe<Scalars['String']>;
  title_contains?: Maybe<Scalars['String']>;
  title_not_contains?: Maybe<Scalars['String']>;
  title_starts_with?: Maybe<Scalars['String']>;
  title_not_starts_with?: Maybe<Scalars['String']>;
  title_ends_with?: Maybe<Scalars['String']>;
  title_not_ends_with?: Maybe<Scalars['String']>;
  title_i?: Maybe<Scalars['String']>;
  title_not_i?: Maybe<Scalars['String']>;
  title_contains_i?: Maybe<Scalars['String']>;
  title_not_contains_i?: Maybe<Scalars['String']>;
  title_starts_with_i?: Maybe<Scalars['String']>;
  title_not_starts_with_i?: Maybe<Scalars['String']>;
  title_ends_with_i?: Maybe<Scalars['String']>;
  title_not_ends_with_i?: Maybe<Scalars['String']>;
  title_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  title_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description?: Maybe<Scalars['String']>;
  description_not?: Maybe<Scalars['String']>;
  description_contains?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  description_starts_with?: Maybe<Scalars['String']>;
  description_not_starts_with?: Maybe<Scalars['String']>;
  description_ends_with?: Maybe<Scalars['String']>;
  description_not_ends_with?: Maybe<Scalars['String']>;
  description_i?: Maybe<Scalars['String']>;
  description_not_i?: Maybe<Scalars['String']>;
  description_contains_i?: Maybe<Scalars['String']>;
  description_not_contains_i?: Maybe<Scalars['String']>;
  description_starts_with_i?: Maybe<Scalars['String']>;
  description_not_starts_with_i?: Maybe<Scalars['String']>;
  description_ends_with_i?: Maybe<Scalars['String']>;
  description_not_ends_with_i?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  content?: Maybe<Scalars['String']>;
  content_not?: Maybe<Scalars['String']>;
  content_contains?: Maybe<Scalars['String']>;
  content_not_contains?: Maybe<Scalars['String']>;
  content_starts_with?: Maybe<Scalars['String']>;
  content_not_starts_with?: Maybe<Scalars['String']>;
  content_ends_with?: Maybe<Scalars['String']>;
  content_not_ends_with?: Maybe<Scalars['String']>;
  content_i?: Maybe<Scalars['String']>;
  content_not_i?: Maybe<Scalars['String']>;
  content_contains_i?: Maybe<Scalars['String']>;
  content_not_contains_i?: Maybe<Scalars['String']>;
  content_starts_with_i?: Maybe<Scalars['String']>;
  content_not_starts_with_i?: Maybe<Scalars['String']>;
  content_ends_with_i?: Maybe<Scalars['String']>;
  content_not_ends_with_i?: Maybe<Scalars['String']>;
  content_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  content_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  githubRepository?: Maybe<Scalars['String']>;
  githubRepository_not?: Maybe<Scalars['String']>;
  githubRepository_contains?: Maybe<Scalars['String']>;
  githubRepository_not_contains?: Maybe<Scalars['String']>;
  githubRepository_starts_with?: Maybe<Scalars['String']>;
  githubRepository_not_starts_with?: Maybe<Scalars['String']>;
  githubRepository_ends_with?: Maybe<Scalars['String']>;
  githubRepository_not_ends_with?: Maybe<Scalars['String']>;
  githubRepository_i?: Maybe<Scalars['String']>;
  githubRepository_not_i?: Maybe<Scalars['String']>;
  githubRepository_contains_i?: Maybe<Scalars['String']>;
  githubRepository_not_contains_i?: Maybe<Scalars['String']>;
  githubRepository_starts_with_i?: Maybe<Scalars['String']>;
  githubRepository_not_starts_with_i?: Maybe<Scalars['String']>;
  githubRepository_ends_with_i?: Maybe<Scalars['String']>;
  githubRepository_not_ends_with_i?: Maybe<Scalars['String']>;
  githubRepository_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  githubRepository_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  readme?: Maybe<Scalars['String']>;
  readme_not?: Maybe<Scalars['String']>;
  readme_contains?: Maybe<Scalars['String']>;
  readme_not_contains?: Maybe<Scalars['String']>;
  readme_starts_with?: Maybe<Scalars['String']>;
  readme_not_starts_with?: Maybe<Scalars['String']>;
  readme_ends_with?: Maybe<Scalars['String']>;
  readme_not_ends_with?: Maybe<Scalars['String']>;
  readme_i?: Maybe<Scalars['String']>;
  readme_not_i?: Maybe<Scalars['String']>;
  readme_contains_i?: Maybe<Scalars['String']>;
  readme_not_contains_i?: Maybe<Scalars['String']>;
  readme_starts_with_i?: Maybe<Scalars['String']>;
  readme_not_starts_with_i?: Maybe<Scalars['String']>;
  readme_ends_with_i?: Maybe<Scalars['String']>;
  readme_not_ends_with_i?: Maybe<Scalars['String']>;
  readme_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  readme_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  slug?: Maybe<Scalars['String']>;
  slug_not?: Maybe<Scalars['String']>;
  slug_contains?: Maybe<Scalars['String']>;
  slug_not_contains?: Maybe<Scalars['String']>;
  slug_starts_with?: Maybe<Scalars['String']>;
  slug_not_starts_with?: Maybe<Scalars['String']>;
  slug_ends_with?: Maybe<Scalars['String']>;
  slug_not_ends_with?: Maybe<Scalars['String']>;
  slug_i?: Maybe<Scalars['String']>;
  slug_not_i?: Maybe<Scalars['String']>;
  slug_contains_i?: Maybe<Scalars['String']>;
  slug_not_contains_i?: Maybe<Scalars['String']>;
  slug_starts_with_i?: Maybe<Scalars['String']>;
  slug_not_starts_with_i?: Maybe<Scalars['String']>;
  slug_ends_with_i?: Maybe<Scalars['String']>;
  slug_not_ends_with_i?: Maybe<Scalars['String']>;
  slug_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  slug_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  order?: Maybe<Scalars['Int']>;
  order_not?: Maybe<Scalars['Int']>;
  order_lt?: Maybe<Scalars['Int']>;
  order_lte?: Maybe<Scalars['Int']>;
  order_gt?: Maybe<Scalars['Int']>;
  order_gte?: Maybe<Scalars['Int']>;
  order_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  order_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isComplete?: Maybe<Scalars['Boolean']>;
  isComplete_not?: Maybe<Scalars['Boolean']>;
};

export type ContentWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortContentsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  ContentAsc = 'content_ASC',
  ContentDesc = 'content_DESC',
  GithubRepositoryAsc = 'githubRepository_ASC',
  GithubRepositoryDesc = 'githubRepository_DESC',
  ReadmeAsc = 'readme_ASC',
  ReadmeDesc = 'readme_DESC',
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  OrderAsc = 'order_ASC',
  OrderDesc = 'order_DESC',
  IsCompleteAsc = 'isComplete_ASC',
  IsCompleteDesc = 'isComplete_DESC'
}

export type ContentUpdateInput = {
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  githubRepository?: Maybe<Scalars['String']>;
  readme?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isComplete?: Maybe<Scalars['Boolean']>;
};

export type ContentsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<ContentUpdateInput>;
};

export type ContentCreateInput = {
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  githubRepository?: Maybe<Scalars['String']>;
  readme?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isComplete?: Maybe<Scalars['Boolean']>;
};

export type ContentsCreateInput = {
  data?: Maybe<ContentCreateInput>;
};

export enum CredentialIssuerAuthMethodType {
  Oidc = 'oidc',
  Keys = 'keys'
}

export enum CredentialIssuerModeType {
  Manual = 'manual',
  Auto = 'auto'
}

export type EnvironmentRelateToManyInput = {
  create?: Maybe<Array<Maybe<EnvironmentCreateInput>>>;
  connect?: Maybe<Array<Maybe<EnvironmentWhereUniqueInput>>>;
  disconnect?: Maybe<Array<Maybe<EnvironmentWhereUniqueInput>>>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

/**  A keystone list  */
export type CredentialIssuer = {
  __typename?: 'CredentialIssuer';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the CredentialIssuer List config, or
   *  2. As an alias to the field set on 'labelField' in the CredentialIssuer List config, or
   *  3. As an alias to a 'name' field on the CredentialIssuer List (if one exists), or
   *  4. As an alias to the 'id' field on the CredentialIssuer List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  authMethod?: Maybe<CredentialIssuerAuthMethodType>;
  mode?: Maybe<CredentialIssuerModeType>;
  instruction?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl?: Maybe<Scalars['String']>;
  initialAccessToken?: Maybe<Scalars['String']>;
  clientId?: Maybe<Scalars['String']>;
  clientSecret?: Maybe<Scalars['String']>;
  contact?: Maybe<User>;
  environments: Array<Environment>;
  _environmentsMeta?: Maybe<_QueryMeta>;
  updatedBy?: Maybe<User>;
  createdBy?: Maybe<User>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};


/**  A keystone list  */
export type CredentialIssuerEnvironmentsArgs = {
  where?: Maybe<EnvironmentWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortEnvironmentsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type CredentialIssuer_EnvironmentsMetaArgs = {
  where?: Maybe<EnvironmentWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortEnvironmentsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type CredentialIssuerWhereInput = {
  AND?: Maybe<Array<Maybe<CredentialIssuerWhereInput>>>;
  OR?: Maybe<Array<Maybe<CredentialIssuerWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description?: Maybe<Scalars['String']>;
  description_not?: Maybe<Scalars['String']>;
  description_contains?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  description_starts_with?: Maybe<Scalars['String']>;
  description_not_starts_with?: Maybe<Scalars['String']>;
  description_ends_with?: Maybe<Scalars['String']>;
  description_not_ends_with?: Maybe<Scalars['String']>;
  description_i?: Maybe<Scalars['String']>;
  description_not_i?: Maybe<Scalars['String']>;
  description_contains_i?: Maybe<Scalars['String']>;
  description_not_contains_i?: Maybe<Scalars['String']>;
  description_starts_with_i?: Maybe<Scalars['String']>;
  description_not_starts_with_i?: Maybe<Scalars['String']>;
  description_ends_with_i?: Maybe<Scalars['String']>;
  description_not_ends_with_i?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  authMethod?: Maybe<CredentialIssuerAuthMethodType>;
  authMethod_not?: Maybe<CredentialIssuerAuthMethodType>;
  authMethod_in?: Maybe<Array<Maybe<CredentialIssuerAuthMethodType>>>;
  authMethod_not_in?: Maybe<Array<Maybe<CredentialIssuerAuthMethodType>>>;
  mode?: Maybe<CredentialIssuerModeType>;
  mode_not?: Maybe<CredentialIssuerModeType>;
  mode_in?: Maybe<Array<Maybe<CredentialIssuerModeType>>>;
  mode_not_in?: Maybe<Array<Maybe<CredentialIssuerModeType>>>;
  oidcDiscoveryUrl?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_not?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_contains?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_not_contains?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_starts_with?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_not_starts_with?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_ends_with?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_not_ends_with?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_i?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_not_i?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_contains_i?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_not_contains_i?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_starts_with_i?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_not_starts_with_i?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_ends_with_i?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_not_ends_with_i?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  oidcDiscoveryUrl_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  initialAccessToken?: Maybe<Scalars['String']>;
  initialAccessToken_not?: Maybe<Scalars['String']>;
  initialAccessToken_contains?: Maybe<Scalars['String']>;
  initialAccessToken_not_contains?: Maybe<Scalars['String']>;
  initialAccessToken_starts_with?: Maybe<Scalars['String']>;
  initialAccessToken_not_starts_with?: Maybe<Scalars['String']>;
  initialAccessToken_ends_with?: Maybe<Scalars['String']>;
  initialAccessToken_not_ends_with?: Maybe<Scalars['String']>;
  initialAccessToken_i?: Maybe<Scalars['String']>;
  initialAccessToken_not_i?: Maybe<Scalars['String']>;
  initialAccessToken_contains_i?: Maybe<Scalars['String']>;
  initialAccessToken_not_contains_i?: Maybe<Scalars['String']>;
  initialAccessToken_starts_with_i?: Maybe<Scalars['String']>;
  initialAccessToken_not_starts_with_i?: Maybe<Scalars['String']>;
  initialAccessToken_ends_with_i?: Maybe<Scalars['String']>;
  initialAccessToken_not_ends_with_i?: Maybe<Scalars['String']>;
  initialAccessToken_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  initialAccessToken_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientId?: Maybe<Scalars['String']>;
  clientId_not?: Maybe<Scalars['String']>;
  clientId_contains?: Maybe<Scalars['String']>;
  clientId_not_contains?: Maybe<Scalars['String']>;
  clientId_starts_with?: Maybe<Scalars['String']>;
  clientId_not_starts_with?: Maybe<Scalars['String']>;
  clientId_ends_with?: Maybe<Scalars['String']>;
  clientId_not_ends_with?: Maybe<Scalars['String']>;
  clientId_i?: Maybe<Scalars['String']>;
  clientId_not_i?: Maybe<Scalars['String']>;
  clientId_contains_i?: Maybe<Scalars['String']>;
  clientId_not_contains_i?: Maybe<Scalars['String']>;
  clientId_starts_with_i?: Maybe<Scalars['String']>;
  clientId_not_starts_with_i?: Maybe<Scalars['String']>;
  clientId_ends_with_i?: Maybe<Scalars['String']>;
  clientId_not_ends_with_i?: Maybe<Scalars['String']>;
  clientId_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientId_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientSecret?: Maybe<Scalars['String']>;
  clientSecret_not?: Maybe<Scalars['String']>;
  clientSecret_contains?: Maybe<Scalars['String']>;
  clientSecret_not_contains?: Maybe<Scalars['String']>;
  clientSecret_starts_with?: Maybe<Scalars['String']>;
  clientSecret_not_starts_with?: Maybe<Scalars['String']>;
  clientSecret_ends_with?: Maybe<Scalars['String']>;
  clientSecret_not_ends_with?: Maybe<Scalars['String']>;
  clientSecret_i?: Maybe<Scalars['String']>;
  clientSecret_not_i?: Maybe<Scalars['String']>;
  clientSecret_contains_i?: Maybe<Scalars['String']>;
  clientSecret_not_contains_i?: Maybe<Scalars['String']>;
  clientSecret_starts_with_i?: Maybe<Scalars['String']>;
  clientSecret_not_starts_with_i?: Maybe<Scalars['String']>;
  clientSecret_ends_with_i?: Maybe<Scalars['String']>;
  clientSecret_not_ends_with_i?: Maybe<Scalars['String']>;
  clientSecret_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientSecret_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  contact?: Maybe<UserWhereInput>;
  contact_is_null?: Maybe<Scalars['Boolean']>;
  /**  condition must be true for all nodes  */
  environments_every?: Maybe<EnvironmentWhereInput>;
  /**  condition must be true for at least 1 node  */
  environments_some?: Maybe<EnvironmentWhereInput>;
  /**  condition must be false for all nodes  */
  environments_none?: Maybe<EnvironmentWhereInput>;
  updatedBy?: Maybe<UserWhereInput>;
  updatedBy_is_null?: Maybe<Scalars['Boolean']>;
  createdBy?: Maybe<UserWhereInput>;
  createdBy_is_null?: Maybe<Scalars['Boolean']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedAt_not?: Maybe<Scalars['DateTime']>;
  updatedAt_lt?: Maybe<Scalars['DateTime']>;
  updatedAt_lte?: Maybe<Scalars['DateTime']>;
  updatedAt_gt?: Maybe<Scalars['DateTime']>;
  updatedAt_gte?: Maybe<Scalars['DateTime']>;
  updatedAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  updatedAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdAt_not?: Maybe<Scalars['DateTime']>;
  createdAt_lt?: Maybe<Scalars['DateTime']>;
  createdAt_lte?: Maybe<Scalars['DateTime']>;
  createdAt_gt?: Maybe<Scalars['DateTime']>;
  createdAt_gte?: Maybe<Scalars['DateTime']>;
  createdAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
};

export type CredentialIssuerWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortCredentialIssuersBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  AuthMethodAsc = 'authMethod_ASC',
  AuthMethodDesc = 'authMethod_DESC',
  ModeAsc = 'mode_ASC',
  ModeDesc = 'mode_DESC',
  OidcDiscoveryUrlAsc = 'oidcDiscoveryUrl_ASC',
  OidcDiscoveryUrlDesc = 'oidcDiscoveryUrl_DESC',
  InitialAccessTokenAsc = 'initialAccessToken_ASC',
  InitialAccessTokenDesc = 'initialAccessToken_DESC',
  ClientIdAsc = 'clientId_ASC',
  ClientIdDesc = 'clientId_DESC',
  ClientSecretAsc = 'clientSecret_ASC',
  ClientSecretDesc = 'clientSecret_DESC',
  ContactAsc = 'contact_ASC',
  ContactDesc = 'contact_DESC',
  EnvironmentsAsc = 'environments_ASC',
  EnvironmentsDesc = 'environments_DESC',
  UpdatedByAsc = 'updatedBy_ASC',
  UpdatedByDesc = 'updatedBy_DESC',
  CreatedByAsc = 'createdBy_ASC',
  CreatedByDesc = 'createdBy_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type CredentialIssuerUpdateInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  authMethod?: Maybe<CredentialIssuerAuthMethodType>;
  mode?: Maybe<CredentialIssuerModeType>;
  oidcDiscoveryUrl?: Maybe<Scalars['String']>;
  initialAccessToken?: Maybe<Scalars['String']>;
  clientId?: Maybe<Scalars['String']>;
  clientSecret?: Maybe<Scalars['String']>;
  contact?: Maybe<UserRelateToOneInput>;
  environments?: Maybe<EnvironmentRelateToManyInput>;
};

export type CredentialIssuersUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<CredentialIssuerUpdateInput>;
};

export type CredentialIssuerCreateInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  authMethod?: Maybe<CredentialIssuerAuthMethodType>;
  mode?: Maybe<CredentialIssuerModeType>;
  oidcDiscoveryUrl?: Maybe<Scalars['String']>;
  initialAccessToken?: Maybe<Scalars['String']>;
  clientId?: Maybe<Scalars['String']>;
  clientSecret?: Maybe<Scalars['String']>;
  contact?: Maybe<UserRelateToOneInput>;
  environments?: Maybe<EnvironmentRelateToManyInput>;
};

export type CredentialIssuersCreateInput = {
  data?: Maybe<CredentialIssuerCreateInput>;
};

export type OrganizationRelateToOneInput = {
  create?: Maybe<OrganizationCreateInput>;
  connect?: Maybe<OrganizationWhereUniqueInput>;
  disconnect?: Maybe<OrganizationWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type OrganizationUnitRelateToOneInput = {
  create?: Maybe<OrganizationUnitCreateInput>;
  connect?: Maybe<OrganizationUnitWhereUniqueInput>;
  disconnect?: Maybe<OrganizationUnitWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

/**  A keystone list  */
export type Dataset = {
  __typename?: 'Dataset';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Dataset List config, or
   *  2. As an alias to the field set on 'labelField' in the Dataset List config, or
   *  3. As an alias to a 'name' field on the Dataset List (if one exists), or
   *  4. As an alias to the 'id' field on the Dataset List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  license_title?: Maybe<Scalars['String']>;
  view_audience?: Maybe<Scalars['String']>;
  private?: Maybe<Scalars['Boolean']>;
  tags?: Maybe<Scalars['String']>;
  contacts?: Maybe<Scalars['String']>;
  organization?: Maybe<Organization>;
  organizationUnit?: Maybe<OrganizationUnit>;
  securityClass?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  catalogContent?: Maybe<Scalars['String']>;
  isInCatalog?: Maybe<Scalars['Boolean']>;
};

export type DatasetWhereInput = {
  AND?: Maybe<Array<Maybe<DatasetWhereInput>>>;
  OR?: Maybe<Array<Maybe<DatasetWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  sector?: Maybe<Scalars['String']>;
  sector_not?: Maybe<Scalars['String']>;
  sector_contains?: Maybe<Scalars['String']>;
  sector_not_contains?: Maybe<Scalars['String']>;
  sector_starts_with?: Maybe<Scalars['String']>;
  sector_not_starts_with?: Maybe<Scalars['String']>;
  sector_ends_with?: Maybe<Scalars['String']>;
  sector_not_ends_with?: Maybe<Scalars['String']>;
  sector_i?: Maybe<Scalars['String']>;
  sector_not_i?: Maybe<Scalars['String']>;
  sector_contains_i?: Maybe<Scalars['String']>;
  sector_not_contains_i?: Maybe<Scalars['String']>;
  sector_starts_with_i?: Maybe<Scalars['String']>;
  sector_not_starts_with_i?: Maybe<Scalars['String']>;
  sector_ends_with_i?: Maybe<Scalars['String']>;
  sector_not_ends_with_i?: Maybe<Scalars['String']>;
  sector_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  sector_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  license_title?: Maybe<Scalars['String']>;
  license_title_not?: Maybe<Scalars['String']>;
  license_title_contains?: Maybe<Scalars['String']>;
  license_title_not_contains?: Maybe<Scalars['String']>;
  license_title_starts_with?: Maybe<Scalars['String']>;
  license_title_not_starts_with?: Maybe<Scalars['String']>;
  license_title_ends_with?: Maybe<Scalars['String']>;
  license_title_not_ends_with?: Maybe<Scalars['String']>;
  license_title_i?: Maybe<Scalars['String']>;
  license_title_not_i?: Maybe<Scalars['String']>;
  license_title_contains_i?: Maybe<Scalars['String']>;
  license_title_not_contains_i?: Maybe<Scalars['String']>;
  license_title_starts_with_i?: Maybe<Scalars['String']>;
  license_title_not_starts_with_i?: Maybe<Scalars['String']>;
  license_title_ends_with_i?: Maybe<Scalars['String']>;
  license_title_not_ends_with_i?: Maybe<Scalars['String']>;
  license_title_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  license_title_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  view_audience?: Maybe<Scalars['String']>;
  view_audience_not?: Maybe<Scalars['String']>;
  view_audience_contains?: Maybe<Scalars['String']>;
  view_audience_not_contains?: Maybe<Scalars['String']>;
  view_audience_starts_with?: Maybe<Scalars['String']>;
  view_audience_not_starts_with?: Maybe<Scalars['String']>;
  view_audience_ends_with?: Maybe<Scalars['String']>;
  view_audience_not_ends_with?: Maybe<Scalars['String']>;
  view_audience_i?: Maybe<Scalars['String']>;
  view_audience_not_i?: Maybe<Scalars['String']>;
  view_audience_contains_i?: Maybe<Scalars['String']>;
  view_audience_not_contains_i?: Maybe<Scalars['String']>;
  view_audience_starts_with_i?: Maybe<Scalars['String']>;
  view_audience_not_starts_with_i?: Maybe<Scalars['String']>;
  view_audience_ends_with_i?: Maybe<Scalars['String']>;
  view_audience_not_ends_with_i?: Maybe<Scalars['String']>;
  view_audience_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  view_audience_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  private?: Maybe<Scalars['Boolean']>;
  private_not?: Maybe<Scalars['Boolean']>;
  tags?: Maybe<Scalars['String']>;
  tags_not?: Maybe<Scalars['String']>;
  tags_contains?: Maybe<Scalars['String']>;
  tags_not_contains?: Maybe<Scalars['String']>;
  tags_starts_with?: Maybe<Scalars['String']>;
  tags_not_starts_with?: Maybe<Scalars['String']>;
  tags_ends_with?: Maybe<Scalars['String']>;
  tags_not_ends_with?: Maybe<Scalars['String']>;
  tags_i?: Maybe<Scalars['String']>;
  tags_not_i?: Maybe<Scalars['String']>;
  tags_contains_i?: Maybe<Scalars['String']>;
  tags_not_contains_i?: Maybe<Scalars['String']>;
  tags_starts_with_i?: Maybe<Scalars['String']>;
  tags_not_starts_with_i?: Maybe<Scalars['String']>;
  tags_ends_with_i?: Maybe<Scalars['String']>;
  tags_not_ends_with_i?: Maybe<Scalars['String']>;
  tags_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tags_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  contacts?: Maybe<Scalars['String']>;
  contacts_not?: Maybe<Scalars['String']>;
  contacts_contains?: Maybe<Scalars['String']>;
  contacts_not_contains?: Maybe<Scalars['String']>;
  contacts_starts_with?: Maybe<Scalars['String']>;
  contacts_not_starts_with?: Maybe<Scalars['String']>;
  contacts_ends_with?: Maybe<Scalars['String']>;
  contacts_not_ends_with?: Maybe<Scalars['String']>;
  contacts_i?: Maybe<Scalars['String']>;
  contacts_not_i?: Maybe<Scalars['String']>;
  contacts_contains_i?: Maybe<Scalars['String']>;
  contacts_not_contains_i?: Maybe<Scalars['String']>;
  contacts_starts_with_i?: Maybe<Scalars['String']>;
  contacts_not_starts_with_i?: Maybe<Scalars['String']>;
  contacts_ends_with_i?: Maybe<Scalars['String']>;
  contacts_not_ends_with_i?: Maybe<Scalars['String']>;
  contacts_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  contacts_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  organization?: Maybe<OrganizationWhereInput>;
  organization_is_null?: Maybe<Scalars['Boolean']>;
  organizationUnit?: Maybe<OrganizationUnitWhereInput>;
  organizationUnit_is_null?: Maybe<Scalars['Boolean']>;
  securityClass?: Maybe<Scalars['String']>;
  securityClass_not?: Maybe<Scalars['String']>;
  securityClass_contains?: Maybe<Scalars['String']>;
  securityClass_not_contains?: Maybe<Scalars['String']>;
  securityClass_starts_with?: Maybe<Scalars['String']>;
  securityClass_not_starts_with?: Maybe<Scalars['String']>;
  securityClass_ends_with?: Maybe<Scalars['String']>;
  securityClass_not_ends_with?: Maybe<Scalars['String']>;
  securityClass_i?: Maybe<Scalars['String']>;
  securityClass_not_i?: Maybe<Scalars['String']>;
  securityClass_contains_i?: Maybe<Scalars['String']>;
  securityClass_not_contains_i?: Maybe<Scalars['String']>;
  securityClass_starts_with_i?: Maybe<Scalars['String']>;
  securityClass_not_starts_with_i?: Maybe<Scalars['String']>;
  securityClass_ends_with_i?: Maybe<Scalars['String']>;
  securityClass_not_ends_with_i?: Maybe<Scalars['String']>;
  securityClass_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  securityClass_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  notes?: Maybe<Scalars['String']>;
  notes_not?: Maybe<Scalars['String']>;
  notes_contains?: Maybe<Scalars['String']>;
  notes_not_contains?: Maybe<Scalars['String']>;
  notes_starts_with?: Maybe<Scalars['String']>;
  notes_not_starts_with?: Maybe<Scalars['String']>;
  notes_ends_with?: Maybe<Scalars['String']>;
  notes_not_ends_with?: Maybe<Scalars['String']>;
  notes_i?: Maybe<Scalars['String']>;
  notes_not_i?: Maybe<Scalars['String']>;
  notes_contains_i?: Maybe<Scalars['String']>;
  notes_not_contains_i?: Maybe<Scalars['String']>;
  notes_starts_with_i?: Maybe<Scalars['String']>;
  notes_not_starts_with_i?: Maybe<Scalars['String']>;
  notes_ends_with_i?: Maybe<Scalars['String']>;
  notes_not_ends_with_i?: Maybe<Scalars['String']>;
  notes_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  notes_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  title?: Maybe<Scalars['String']>;
  title_not?: Maybe<Scalars['String']>;
  title_contains?: Maybe<Scalars['String']>;
  title_not_contains?: Maybe<Scalars['String']>;
  title_starts_with?: Maybe<Scalars['String']>;
  title_not_starts_with?: Maybe<Scalars['String']>;
  title_ends_with?: Maybe<Scalars['String']>;
  title_not_ends_with?: Maybe<Scalars['String']>;
  title_i?: Maybe<Scalars['String']>;
  title_not_i?: Maybe<Scalars['String']>;
  title_contains_i?: Maybe<Scalars['String']>;
  title_not_contains_i?: Maybe<Scalars['String']>;
  title_starts_with_i?: Maybe<Scalars['String']>;
  title_not_starts_with_i?: Maybe<Scalars['String']>;
  title_ends_with_i?: Maybe<Scalars['String']>;
  title_not_ends_with_i?: Maybe<Scalars['String']>;
  title_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  title_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  catalogContent?: Maybe<Scalars['String']>;
  catalogContent_not?: Maybe<Scalars['String']>;
  catalogContent_contains?: Maybe<Scalars['String']>;
  catalogContent_not_contains?: Maybe<Scalars['String']>;
  catalogContent_starts_with?: Maybe<Scalars['String']>;
  catalogContent_not_starts_with?: Maybe<Scalars['String']>;
  catalogContent_ends_with?: Maybe<Scalars['String']>;
  catalogContent_not_ends_with?: Maybe<Scalars['String']>;
  catalogContent_i?: Maybe<Scalars['String']>;
  catalogContent_not_i?: Maybe<Scalars['String']>;
  catalogContent_contains_i?: Maybe<Scalars['String']>;
  catalogContent_not_contains_i?: Maybe<Scalars['String']>;
  catalogContent_starts_with_i?: Maybe<Scalars['String']>;
  catalogContent_not_starts_with_i?: Maybe<Scalars['String']>;
  catalogContent_ends_with_i?: Maybe<Scalars['String']>;
  catalogContent_not_ends_with_i?: Maybe<Scalars['String']>;
  catalogContent_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  catalogContent_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  isInCatalog?: Maybe<Scalars['Boolean']>;
  isInCatalog_not?: Maybe<Scalars['Boolean']>;
};

export type DatasetWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortDatasetsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  SectorAsc = 'sector_ASC',
  SectorDesc = 'sector_DESC',
  LicenseTitleAsc = 'license_title_ASC',
  LicenseTitleDesc = 'license_title_DESC',
  ViewAudienceAsc = 'view_audience_ASC',
  ViewAudienceDesc = 'view_audience_DESC',
  PrivateAsc = 'private_ASC',
  PrivateDesc = 'private_DESC',
  TagsAsc = 'tags_ASC',
  TagsDesc = 'tags_DESC',
  ContactsAsc = 'contacts_ASC',
  ContactsDesc = 'contacts_DESC',
  OrganizationAsc = 'organization_ASC',
  OrganizationDesc = 'organization_DESC',
  OrganizationUnitAsc = 'organizationUnit_ASC',
  OrganizationUnitDesc = 'organizationUnit_DESC',
  SecurityClassAsc = 'securityClass_ASC',
  SecurityClassDesc = 'securityClass_DESC',
  NotesAsc = 'notes_ASC',
  NotesDesc = 'notes_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
  CatalogContentAsc = 'catalogContent_ASC',
  CatalogContentDesc = 'catalogContent_DESC',
  IsInCatalogAsc = 'isInCatalog_ASC',
  IsInCatalogDesc = 'isInCatalog_DESC'
}

export type DatasetUpdateInput = {
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  license_title?: Maybe<Scalars['String']>;
  view_audience?: Maybe<Scalars['String']>;
  private?: Maybe<Scalars['Boolean']>;
  tags?: Maybe<Scalars['String']>;
  contacts?: Maybe<Scalars['String']>;
  organization?: Maybe<OrganizationRelateToOneInput>;
  organizationUnit?: Maybe<OrganizationUnitRelateToOneInput>;
  securityClass?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  catalogContent?: Maybe<Scalars['String']>;
  isInCatalog?: Maybe<Scalars['Boolean']>;
};

export type DatasetsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<DatasetUpdateInput>;
};

export type DatasetCreateInput = {
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  license_title?: Maybe<Scalars['String']>;
  view_audience?: Maybe<Scalars['String']>;
  private?: Maybe<Scalars['Boolean']>;
  tags?: Maybe<Scalars['String']>;
  contacts?: Maybe<Scalars['String']>;
  organization?: Maybe<OrganizationRelateToOneInput>;
  organizationUnit?: Maybe<OrganizationUnitRelateToOneInput>;
  securityClass?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  catalogContent?: Maybe<Scalars['String']>;
  isInCatalog?: Maybe<Scalars['Boolean']>;
};

export type DatasetsCreateInput = {
  data?: Maybe<DatasetCreateInput>;
};

export enum EnvironmentAuthMethodType {
  Private = 'private',
  Public = 'public',
  Jwt = 'JWT',
  Keys = 'keys'
}

export type CredentialIssuerRelateToOneInput = {
  create?: Maybe<CredentialIssuerCreateInput>;
  connect?: Maybe<CredentialIssuerWhereUniqueInput>;
  disconnect?: Maybe<CredentialIssuerWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type ServiceRouteRelateToManyInput = {
  create?: Maybe<Array<Maybe<ServiceRouteCreateInput>>>;
  connect?: Maybe<Array<Maybe<ServiceRouteWhereUniqueInput>>>;
  disconnect?: Maybe<Array<Maybe<ServiceRouteWhereUniqueInput>>>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type PackageRelateToOneInput = {
  create?: Maybe<PackageCreateInput>;
  connect?: Maybe<PackageWhereUniqueInput>;
  disconnect?: Maybe<PackageWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

/**  A keystone list  */
export type Environment = {
  __typename?: 'Environment';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Environment List config, or
   *  2. As an alias to the field set on 'labelField' in the Environment List config, or
   *  3. As an alias to a 'name' field on the Environment List (if one exists), or
   *  4. As an alias to the 'id' field on the Environment List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  active?: Maybe<Scalars['Boolean']>;
  authMethod?: Maybe<EnvironmentAuthMethodType>;
  plugins: Array<Plugin>;
  _pluginsMeta?: Maybe<_QueryMeta>;
  description?: Maybe<Scalars['String']>;
  credentialIssuer?: Maybe<CredentialIssuer>;
  services: Array<ServiceRoute>;
  _servicesMeta?: Maybe<_QueryMeta>;
  package?: Maybe<Package>;
};


/**  A keystone list  */
export type EnvironmentPluginsArgs = {
  where?: Maybe<PluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type Environment_PluginsMetaArgs = {
  where?: Maybe<PluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type EnvironmentServicesArgs = {
  where?: Maybe<ServiceRouteWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortServiceRoutesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type Environment_ServicesMetaArgs = {
  where?: Maybe<ServiceRouteWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortServiceRoutesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type EnvironmentWhereInput = {
  AND?: Maybe<Array<Maybe<EnvironmentWhereInput>>>;
  OR?: Maybe<Array<Maybe<EnvironmentWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  active?: Maybe<Scalars['Boolean']>;
  active_not?: Maybe<Scalars['Boolean']>;
  authMethod?: Maybe<EnvironmentAuthMethodType>;
  authMethod_not?: Maybe<EnvironmentAuthMethodType>;
  authMethod_in?: Maybe<Array<Maybe<EnvironmentAuthMethodType>>>;
  authMethod_not_in?: Maybe<Array<Maybe<EnvironmentAuthMethodType>>>;
  /**  condition must be true for all nodes  */
  plugins_every?: Maybe<PluginWhereInput>;
  /**  condition must be true for at least 1 node  */
  plugins_some?: Maybe<PluginWhereInput>;
  /**  condition must be false for all nodes  */
  plugins_none?: Maybe<PluginWhereInput>;
  description?: Maybe<Scalars['String']>;
  description_not?: Maybe<Scalars['String']>;
  description_contains?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  description_starts_with?: Maybe<Scalars['String']>;
  description_not_starts_with?: Maybe<Scalars['String']>;
  description_ends_with?: Maybe<Scalars['String']>;
  description_not_ends_with?: Maybe<Scalars['String']>;
  description_i?: Maybe<Scalars['String']>;
  description_not_i?: Maybe<Scalars['String']>;
  description_contains_i?: Maybe<Scalars['String']>;
  description_not_contains_i?: Maybe<Scalars['String']>;
  description_starts_with_i?: Maybe<Scalars['String']>;
  description_not_starts_with_i?: Maybe<Scalars['String']>;
  description_ends_with_i?: Maybe<Scalars['String']>;
  description_not_ends_with_i?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  credentialIssuer?: Maybe<CredentialIssuerWhereInput>;
  credentialIssuer_is_null?: Maybe<Scalars['Boolean']>;
  /**  condition must be true for all nodes  */
  services_every?: Maybe<ServiceRouteWhereInput>;
  /**  condition must be true for at least 1 node  */
  services_some?: Maybe<ServiceRouteWhereInput>;
  /**  condition must be false for all nodes  */
  services_none?: Maybe<ServiceRouteWhereInput>;
  package?: Maybe<PackageWhereInput>;
  package_is_null?: Maybe<Scalars['Boolean']>;
};

export type EnvironmentWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortEnvironmentsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  ActiveAsc = 'active_ASC',
  ActiveDesc = 'active_DESC',
  AuthMethodAsc = 'authMethod_ASC',
  AuthMethodDesc = 'authMethod_DESC',
  PluginsAsc = 'plugins_ASC',
  PluginsDesc = 'plugins_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  CredentialIssuerAsc = 'credentialIssuer_ASC',
  CredentialIssuerDesc = 'credentialIssuer_DESC',
  ServicesAsc = 'services_ASC',
  ServicesDesc = 'services_DESC',
  PackageAsc = 'package_ASC',
  PackageDesc = 'package_DESC'
}

export type EnvironmentUpdateInput = {
  name?: Maybe<Scalars['String']>;
  active?: Maybe<Scalars['Boolean']>;
  authMethod?: Maybe<EnvironmentAuthMethodType>;
  plugins?: Maybe<PluginRelateToManyInput>;
  description?: Maybe<Scalars['String']>;
  credentialIssuer?: Maybe<CredentialIssuerRelateToOneInput>;
  services?: Maybe<ServiceRouteRelateToManyInput>;
  package?: Maybe<PackageRelateToOneInput>;
};

export type EnvironmentsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<EnvironmentUpdateInput>;
};

export type EnvironmentCreateInput = {
  name?: Maybe<Scalars['String']>;
  active?: Maybe<Scalars['Boolean']>;
  authMethod?: Maybe<EnvironmentAuthMethodType>;
  plugins?: Maybe<PluginRelateToManyInput>;
  description?: Maybe<Scalars['String']>;
  credentialIssuer?: Maybe<CredentialIssuerRelateToOneInput>;
  services?: Maybe<ServiceRouteRelateToManyInput>;
  package?: Maybe<PackageRelateToOneInput>;
};

export type EnvironmentsCreateInput = {
  data?: Maybe<EnvironmentCreateInput>;
};

/**  A keystone list  */
export type Gateway = {
  __typename?: 'Gateway';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Gateway List config, or
   *  2. As an alias to the field set on 'labelField' in the Gateway List config, or
   *  3. As an alias to a 'name' field on the Gateway List (if one exists), or
   *  4. As an alias to the 'id' field on the Gateway List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  updatedBy?: Maybe<User>;
  createdBy?: Maybe<User>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type GatewayWhereInput = {
  AND?: Maybe<Array<Maybe<GatewayWhereInput>>>;
  OR?: Maybe<Array<Maybe<GatewayWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  updatedBy?: Maybe<UserWhereInput>;
  updatedBy_is_null?: Maybe<Scalars['Boolean']>;
  createdBy?: Maybe<UserWhereInput>;
  createdBy_is_null?: Maybe<Scalars['Boolean']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedAt_not?: Maybe<Scalars['DateTime']>;
  updatedAt_lt?: Maybe<Scalars['DateTime']>;
  updatedAt_lte?: Maybe<Scalars['DateTime']>;
  updatedAt_gt?: Maybe<Scalars['DateTime']>;
  updatedAt_gte?: Maybe<Scalars['DateTime']>;
  updatedAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  updatedAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdAt_not?: Maybe<Scalars['DateTime']>;
  createdAt_lt?: Maybe<Scalars['DateTime']>;
  createdAt_lte?: Maybe<Scalars['DateTime']>;
  createdAt_gt?: Maybe<Scalars['DateTime']>;
  createdAt_gte?: Maybe<Scalars['DateTime']>;
  createdAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
};

export type GatewayWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortGatewaysBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  UpdatedByAsc = 'updatedBy_ASC',
  UpdatedByDesc = 'updatedBy_DESC',
  CreatedByAsc = 'createdBy_ASC',
  CreatedByDesc = 'createdBy_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type GatewayUpdateInput = {
  name?: Maybe<Scalars['String']>;
};

export type GatewaysUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<GatewayUpdateInput>;
};

export type GatewayCreateInput = {
  name?: Maybe<Scalars['String']>;
};

export type GatewaysCreateInput = {
  data?: Maybe<GatewayCreateInput>;
};

/**  A keystone list  */
export type Group = {
  __typename?: 'Group';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Group List config, or
   *  2. As an alias to the field set on 'labelField' in the Group List config, or
   *  3. As an alias to a 'name' field on the Group List (if one exists), or
   *  4. As an alias to the 'id' field on the Group List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  updatedBy?: Maybe<User>;
  createdBy?: Maybe<User>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type GroupWhereInput = {
  AND?: Maybe<Array<Maybe<GroupWhereInput>>>;
  OR?: Maybe<Array<Maybe<GroupWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  updatedBy?: Maybe<UserWhereInput>;
  updatedBy_is_null?: Maybe<Scalars['Boolean']>;
  createdBy?: Maybe<UserWhereInput>;
  createdBy_is_null?: Maybe<Scalars['Boolean']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedAt_not?: Maybe<Scalars['DateTime']>;
  updatedAt_lt?: Maybe<Scalars['DateTime']>;
  updatedAt_lte?: Maybe<Scalars['DateTime']>;
  updatedAt_gt?: Maybe<Scalars['DateTime']>;
  updatedAt_gte?: Maybe<Scalars['DateTime']>;
  updatedAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  updatedAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdAt_not?: Maybe<Scalars['DateTime']>;
  createdAt_lt?: Maybe<Scalars['DateTime']>;
  createdAt_lte?: Maybe<Scalars['DateTime']>;
  createdAt_gt?: Maybe<Scalars['DateTime']>;
  createdAt_gte?: Maybe<Scalars['DateTime']>;
  createdAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
};

export type GroupWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortGroupsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  UpdatedByAsc = 'updatedBy_ASC',
  UpdatedByDesc = 'updatedBy_DESC',
  CreatedByAsc = 'createdBy_ASC',
  CreatedByDesc = 'createdBy_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type GroupUpdateInput = {
  name?: Maybe<Scalars['String']>;
};

export type GroupsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<GroupUpdateInput>;
};

export type GroupCreateInput = {
  name?: Maybe<Scalars['String']>;
};

export type GroupsCreateInput = {
  data?: Maybe<GroupCreateInput>;
};

export type OrganizationUnitRelateToManyInput = {
  create?: Maybe<Array<Maybe<OrganizationUnitCreateInput>>>;
  connect?: Maybe<Array<Maybe<OrganizationUnitWhereUniqueInput>>>;
  disconnect?: Maybe<Array<Maybe<OrganizationUnitWhereUniqueInput>>>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

/**  A keystone list  */
export type Organization = {
  __typename?: 'Organization';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Organization List config, or
   *  2. As an alias to the field set on 'labelField' in the Organization List config, or
   *  3. As an alias to a 'name' field on the Organization List (if one exists), or
   *  4. As an alias to the 'id' field on the Organization List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  bcdc_id?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  orgUnits: Array<OrganizationUnit>;
  _orgUnitsMeta?: Maybe<_QueryMeta>;
};


/**  A keystone list  */
export type OrganizationOrgUnitsArgs = {
  where?: Maybe<OrganizationUnitWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortOrganizationUnitsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type Organization_OrgUnitsMetaArgs = {
  where?: Maybe<OrganizationUnitWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortOrganizationUnitsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type OrganizationWhereInput = {
  AND?: Maybe<Array<Maybe<OrganizationWhereInput>>>;
  OR?: Maybe<Array<Maybe<OrganizationWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  sector?: Maybe<Scalars['String']>;
  sector_not?: Maybe<Scalars['String']>;
  sector_contains?: Maybe<Scalars['String']>;
  sector_not_contains?: Maybe<Scalars['String']>;
  sector_starts_with?: Maybe<Scalars['String']>;
  sector_not_starts_with?: Maybe<Scalars['String']>;
  sector_ends_with?: Maybe<Scalars['String']>;
  sector_not_ends_with?: Maybe<Scalars['String']>;
  sector_i?: Maybe<Scalars['String']>;
  sector_not_i?: Maybe<Scalars['String']>;
  sector_contains_i?: Maybe<Scalars['String']>;
  sector_not_contains_i?: Maybe<Scalars['String']>;
  sector_starts_with_i?: Maybe<Scalars['String']>;
  sector_not_starts_with_i?: Maybe<Scalars['String']>;
  sector_ends_with_i?: Maybe<Scalars['String']>;
  sector_not_ends_with_i?: Maybe<Scalars['String']>;
  sector_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  sector_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  title?: Maybe<Scalars['String']>;
  title_not?: Maybe<Scalars['String']>;
  title_contains?: Maybe<Scalars['String']>;
  title_not_contains?: Maybe<Scalars['String']>;
  title_starts_with?: Maybe<Scalars['String']>;
  title_not_starts_with?: Maybe<Scalars['String']>;
  title_ends_with?: Maybe<Scalars['String']>;
  title_not_ends_with?: Maybe<Scalars['String']>;
  title_i?: Maybe<Scalars['String']>;
  title_not_i?: Maybe<Scalars['String']>;
  title_contains_i?: Maybe<Scalars['String']>;
  title_not_contains_i?: Maybe<Scalars['String']>;
  title_starts_with_i?: Maybe<Scalars['String']>;
  title_not_starts_with_i?: Maybe<Scalars['String']>;
  title_ends_with_i?: Maybe<Scalars['String']>;
  title_not_ends_with_i?: Maybe<Scalars['String']>;
  title_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  title_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  bcdc_id?: Maybe<Scalars['String']>;
  bcdc_id_not?: Maybe<Scalars['String']>;
  bcdc_id_contains?: Maybe<Scalars['String']>;
  bcdc_id_not_contains?: Maybe<Scalars['String']>;
  bcdc_id_starts_with?: Maybe<Scalars['String']>;
  bcdc_id_not_starts_with?: Maybe<Scalars['String']>;
  bcdc_id_ends_with?: Maybe<Scalars['String']>;
  bcdc_id_not_ends_with?: Maybe<Scalars['String']>;
  bcdc_id_i?: Maybe<Scalars['String']>;
  bcdc_id_not_i?: Maybe<Scalars['String']>;
  bcdc_id_contains_i?: Maybe<Scalars['String']>;
  bcdc_id_not_contains_i?: Maybe<Scalars['String']>;
  bcdc_id_starts_with_i?: Maybe<Scalars['String']>;
  bcdc_id_not_starts_with_i?: Maybe<Scalars['String']>;
  bcdc_id_ends_with_i?: Maybe<Scalars['String']>;
  bcdc_id_not_ends_with_i?: Maybe<Scalars['String']>;
  bcdc_id_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  bcdc_id_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tags?: Maybe<Scalars['String']>;
  tags_not?: Maybe<Scalars['String']>;
  tags_contains?: Maybe<Scalars['String']>;
  tags_not_contains?: Maybe<Scalars['String']>;
  tags_starts_with?: Maybe<Scalars['String']>;
  tags_not_starts_with?: Maybe<Scalars['String']>;
  tags_ends_with?: Maybe<Scalars['String']>;
  tags_not_ends_with?: Maybe<Scalars['String']>;
  tags_i?: Maybe<Scalars['String']>;
  tags_not_i?: Maybe<Scalars['String']>;
  tags_contains_i?: Maybe<Scalars['String']>;
  tags_not_contains_i?: Maybe<Scalars['String']>;
  tags_starts_with_i?: Maybe<Scalars['String']>;
  tags_not_starts_with_i?: Maybe<Scalars['String']>;
  tags_ends_with_i?: Maybe<Scalars['String']>;
  tags_not_ends_with_i?: Maybe<Scalars['String']>;
  tags_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tags_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description?: Maybe<Scalars['String']>;
  description_not?: Maybe<Scalars['String']>;
  description_contains?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  description_starts_with?: Maybe<Scalars['String']>;
  description_not_starts_with?: Maybe<Scalars['String']>;
  description_ends_with?: Maybe<Scalars['String']>;
  description_not_ends_with?: Maybe<Scalars['String']>;
  description_i?: Maybe<Scalars['String']>;
  description_not_i?: Maybe<Scalars['String']>;
  description_contains_i?: Maybe<Scalars['String']>;
  description_not_contains_i?: Maybe<Scalars['String']>;
  description_starts_with_i?: Maybe<Scalars['String']>;
  description_not_starts_with_i?: Maybe<Scalars['String']>;
  description_ends_with_i?: Maybe<Scalars['String']>;
  description_not_ends_with_i?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**  condition must be true for all nodes  */
  orgUnits_every?: Maybe<OrganizationUnitWhereInput>;
  /**  condition must be true for at least 1 node  */
  orgUnits_some?: Maybe<OrganizationUnitWhereInput>;
  /**  condition must be false for all nodes  */
  orgUnits_none?: Maybe<OrganizationUnitWhereInput>;
};

export type OrganizationWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortOrganizationsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  SectorAsc = 'sector_ASC',
  SectorDesc = 'sector_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
  BcdcIdAsc = 'bcdc_id_ASC',
  BcdcIdDesc = 'bcdc_id_DESC',
  TagsAsc = 'tags_ASC',
  TagsDesc = 'tags_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  OrgUnitsAsc = 'orgUnits_ASC',
  OrgUnitsDesc = 'orgUnits_DESC'
}

export type OrganizationUpdateInput = {
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  bcdc_id?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  orgUnits?: Maybe<OrganizationUnitRelateToManyInput>;
};

export type OrganizationsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<OrganizationUpdateInput>;
};

export type OrganizationCreateInput = {
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  bcdc_id?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  orgUnits?: Maybe<OrganizationUnitRelateToManyInput>;
};

export type OrganizationsCreateInput = {
  data?: Maybe<OrganizationCreateInput>;
};

/**  A keystone list  */
export type OrganizationUnit = {
  __typename?: 'OrganizationUnit';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the OrganizationUnit List config, or
   *  2. As an alias to the field set on 'labelField' in the OrganizationUnit List config, or
   *  3. As an alias to a 'name' field on the OrganizationUnit List (if one exists), or
   *  4. As an alias to the 'id' field on the OrganizationUnit List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  bcdc_id?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type OrganizationUnitWhereInput = {
  AND?: Maybe<Array<Maybe<OrganizationUnitWhereInput>>>;
  OR?: Maybe<Array<Maybe<OrganizationUnitWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  sector?: Maybe<Scalars['String']>;
  sector_not?: Maybe<Scalars['String']>;
  sector_contains?: Maybe<Scalars['String']>;
  sector_not_contains?: Maybe<Scalars['String']>;
  sector_starts_with?: Maybe<Scalars['String']>;
  sector_not_starts_with?: Maybe<Scalars['String']>;
  sector_ends_with?: Maybe<Scalars['String']>;
  sector_not_ends_with?: Maybe<Scalars['String']>;
  sector_i?: Maybe<Scalars['String']>;
  sector_not_i?: Maybe<Scalars['String']>;
  sector_contains_i?: Maybe<Scalars['String']>;
  sector_not_contains_i?: Maybe<Scalars['String']>;
  sector_starts_with_i?: Maybe<Scalars['String']>;
  sector_not_starts_with_i?: Maybe<Scalars['String']>;
  sector_ends_with_i?: Maybe<Scalars['String']>;
  sector_not_ends_with_i?: Maybe<Scalars['String']>;
  sector_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  sector_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  title?: Maybe<Scalars['String']>;
  title_not?: Maybe<Scalars['String']>;
  title_contains?: Maybe<Scalars['String']>;
  title_not_contains?: Maybe<Scalars['String']>;
  title_starts_with?: Maybe<Scalars['String']>;
  title_not_starts_with?: Maybe<Scalars['String']>;
  title_ends_with?: Maybe<Scalars['String']>;
  title_not_ends_with?: Maybe<Scalars['String']>;
  title_i?: Maybe<Scalars['String']>;
  title_not_i?: Maybe<Scalars['String']>;
  title_contains_i?: Maybe<Scalars['String']>;
  title_not_contains_i?: Maybe<Scalars['String']>;
  title_starts_with_i?: Maybe<Scalars['String']>;
  title_not_starts_with_i?: Maybe<Scalars['String']>;
  title_ends_with_i?: Maybe<Scalars['String']>;
  title_not_ends_with_i?: Maybe<Scalars['String']>;
  title_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  title_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  bcdc_id?: Maybe<Scalars['String']>;
  bcdc_id_not?: Maybe<Scalars['String']>;
  bcdc_id_contains?: Maybe<Scalars['String']>;
  bcdc_id_not_contains?: Maybe<Scalars['String']>;
  bcdc_id_starts_with?: Maybe<Scalars['String']>;
  bcdc_id_not_starts_with?: Maybe<Scalars['String']>;
  bcdc_id_ends_with?: Maybe<Scalars['String']>;
  bcdc_id_not_ends_with?: Maybe<Scalars['String']>;
  bcdc_id_i?: Maybe<Scalars['String']>;
  bcdc_id_not_i?: Maybe<Scalars['String']>;
  bcdc_id_contains_i?: Maybe<Scalars['String']>;
  bcdc_id_not_contains_i?: Maybe<Scalars['String']>;
  bcdc_id_starts_with_i?: Maybe<Scalars['String']>;
  bcdc_id_not_starts_with_i?: Maybe<Scalars['String']>;
  bcdc_id_ends_with_i?: Maybe<Scalars['String']>;
  bcdc_id_not_ends_with_i?: Maybe<Scalars['String']>;
  bcdc_id_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  bcdc_id_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tags?: Maybe<Scalars['String']>;
  tags_not?: Maybe<Scalars['String']>;
  tags_contains?: Maybe<Scalars['String']>;
  tags_not_contains?: Maybe<Scalars['String']>;
  tags_starts_with?: Maybe<Scalars['String']>;
  tags_not_starts_with?: Maybe<Scalars['String']>;
  tags_ends_with?: Maybe<Scalars['String']>;
  tags_not_ends_with?: Maybe<Scalars['String']>;
  tags_i?: Maybe<Scalars['String']>;
  tags_not_i?: Maybe<Scalars['String']>;
  tags_contains_i?: Maybe<Scalars['String']>;
  tags_not_contains_i?: Maybe<Scalars['String']>;
  tags_starts_with_i?: Maybe<Scalars['String']>;
  tags_not_starts_with_i?: Maybe<Scalars['String']>;
  tags_ends_with_i?: Maybe<Scalars['String']>;
  tags_not_ends_with_i?: Maybe<Scalars['String']>;
  tags_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tags_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description?: Maybe<Scalars['String']>;
  description_not?: Maybe<Scalars['String']>;
  description_contains?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  description_starts_with?: Maybe<Scalars['String']>;
  description_not_starts_with?: Maybe<Scalars['String']>;
  description_ends_with?: Maybe<Scalars['String']>;
  description_not_ends_with?: Maybe<Scalars['String']>;
  description_i?: Maybe<Scalars['String']>;
  description_not_i?: Maybe<Scalars['String']>;
  description_contains_i?: Maybe<Scalars['String']>;
  description_not_contains_i?: Maybe<Scalars['String']>;
  description_starts_with_i?: Maybe<Scalars['String']>;
  description_not_starts_with_i?: Maybe<Scalars['String']>;
  description_ends_with_i?: Maybe<Scalars['String']>;
  description_not_ends_with_i?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type OrganizationUnitWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortOrganizationUnitsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  SectorAsc = 'sector_ASC',
  SectorDesc = 'sector_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
  BcdcIdAsc = 'bcdc_id_ASC',
  BcdcIdDesc = 'bcdc_id_DESC',
  TagsAsc = 'tags_ASC',
  TagsDesc = 'tags_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC'
}

export type OrganizationUnitUpdateInput = {
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  bcdc_id?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type OrganizationUnitsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<OrganizationUnitUpdateInput>;
};

export type OrganizationUnitCreateInput = {
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  bcdc_id?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type OrganizationUnitsCreateInput = {
  data?: Maybe<OrganizationUnitCreateInput>;
};

export type DatasetRelateToOneInput = {
  create?: Maybe<DatasetCreateInput>;
  connect?: Maybe<DatasetWhereUniqueInput>;
  disconnect?: Maybe<DatasetWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

/**  A keystone list  */
export type Package = {
  __typename?: 'Package';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Package List config, or
   *  2. As an alias to the field set on 'labelField' in the Package List config, or
   *  3. As an alias to a 'name' field on the Package List (if one exists), or
   *  4. As an alias to the 'id' field on the Package List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  dataset?: Maybe<Dataset>;
  organization?: Maybe<Organization>;
  organizationUnit?: Maybe<OrganizationUnit>;
  environments: Array<Environment>;
  _environmentsMeta?: Maybe<_QueryMeta>;
};


/**  A keystone list  */
export type PackageEnvironmentsArgs = {
  where?: Maybe<EnvironmentWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortEnvironmentsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type Package_EnvironmentsMetaArgs = {
  where?: Maybe<EnvironmentWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortEnvironmentsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type PackageWhereInput = {
  AND?: Maybe<Array<Maybe<PackageWhereInput>>>;
  OR?: Maybe<Array<Maybe<PackageWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description?: Maybe<Scalars['String']>;
  description_not?: Maybe<Scalars['String']>;
  description_contains?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  description_starts_with?: Maybe<Scalars['String']>;
  description_not_starts_with?: Maybe<Scalars['String']>;
  description_ends_with?: Maybe<Scalars['String']>;
  description_not_ends_with?: Maybe<Scalars['String']>;
  description_i?: Maybe<Scalars['String']>;
  description_not_i?: Maybe<Scalars['String']>;
  description_contains_i?: Maybe<Scalars['String']>;
  description_not_contains_i?: Maybe<Scalars['String']>;
  description_starts_with_i?: Maybe<Scalars['String']>;
  description_not_starts_with_i?: Maybe<Scalars['String']>;
  description_ends_with_i?: Maybe<Scalars['String']>;
  description_not_ends_with_i?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  dataset?: Maybe<DatasetWhereInput>;
  dataset_is_null?: Maybe<Scalars['Boolean']>;
  organization?: Maybe<OrganizationWhereInput>;
  organization_is_null?: Maybe<Scalars['Boolean']>;
  organizationUnit?: Maybe<OrganizationUnitWhereInput>;
  organizationUnit_is_null?: Maybe<Scalars['Boolean']>;
  /**  condition must be true for all nodes  */
  environments_every?: Maybe<EnvironmentWhereInput>;
  /**  condition must be true for at least 1 node  */
  environments_some?: Maybe<EnvironmentWhereInput>;
  /**  condition must be false for all nodes  */
  environments_none?: Maybe<EnvironmentWhereInput>;
};

export type PackageWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortPackagesBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  DatasetAsc = 'dataset_ASC',
  DatasetDesc = 'dataset_DESC',
  OrganizationAsc = 'organization_ASC',
  OrganizationDesc = 'organization_DESC',
  OrganizationUnitAsc = 'organizationUnit_ASC',
  OrganizationUnitDesc = 'organizationUnit_DESC',
  EnvironmentsAsc = 'environments_ASC',
  EnvironmentsDesc = 'environments_DESC'
}

export type PackageUpdateInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  dataset?: Maybe<DatasetRelateToOneInput>;
  organization?: Maybe<OrganizationRelateToOneInput>;
  organizationUnit?: Maybe<OrganizationUnitRelateToOneInput>;
  environments?: Maybe<EnvironmentRelateToManyInput>;
};

export type PackagesUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<PackageUpdateInput>;
};

export type PackageCreateInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  dataset?: Maybe<DatasetRelateToOneInput>;
  organization?: Maybe<OrganizationRelateToOneInput>;
  organizationUnit?: Maybe<OrganizationUnitRelateToOneInput>;
  environments?: Maybe<EnvironmentRelateToManyInput>;
};

export type PackagesCreateInput = {
  data?: Maybe<PackageCreateInput>;
};

/**  A keystone list  */
export type Plugin = {
  __typename?: 'Plugin';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Plugin List config, or
   *  2. As an alias to the field set on 'labelField' in the Plugin List config, or
   *  3. As an alias to a 'name' field on the Plugin List (if one exists), or
   *  4. As an alias to the 'id' field on the Plugin List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  kongPluginId?: Maybe<Scalars['String']>;
  config?: Maybe<Scalars['String']>;
  updatedBy?: Maybe<User>;
  createdBy?: Maybe<User>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type PluginWhereInput = {
  AND?: Maybe<Array<Maybe<PluginWhereInput>>>;
  OR?: Maybe<Array<Maybe<PluginWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  kongPluginId?: Maybe<Scalars['String']>;
  kongPluginId_not?: Maybe<Scalars['String']>;
  kongPluginId_contains?: Maybe<Scalars['String']>;
  kongPluginId_not_contains?: Maybe<Scalars['String']>;
  kongPluginId_starts_with?: Maybe<Scalars['String']>;
  kongPluginId_not_starts_with?: Maybe<Scalars['String']>;
  kongPluginId_ends_with?: Maybe<Scalars['String']>;
  kongPluginId_not_ends_with?: Maybe<Scalars['String']>;
  kongPluginId_i?: Maybe<Scalars['String']>;
  kongPluginId_not_i?: Maybe<Scalars['String']>;
  kongPluginId_contains_i?: Maybe<Scalars['String']>;
  kongPluginId_not_contains_i?: Maybe<Scalars['String']>;
  kongPluginId_starts_with_i?: Maybe<Scalars['String']>;
  kongPluginId_not_starts_with_i?: Maybe<Scalars['String']>;
  kongPluginId_ends_with_i?: Maybe<Scalars['String']>;
  kongPluginId_not_ends_with_i?: Maybe<Scalars['String']>;
  kongPluginId_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  kongPluginId_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  config?: Maybe<Scalars['String']>;
  config_not?: Maybe<Scalars['String']>;
  config_contains?: Maybe<Scalars['String']>;
  config_not_contains?: Maybe<Scalars['String']>;
  config_starts_with?: Maybe<Scalars['String']>;
  config_not_starts_with?: Maybe<Scalars['String']>;
  config_ends_with?: Maybe<Scalars['String']>;
  config_not_ends_with?: Maybe<Scalars['String']>;
  config_i?: Maybe<Scalars['String']>;
  config_not_i?: Maybe<Scalars['String']>;
  config_contains_i?: Maybe<Scalars['String']>;
  config_not_contains_i?: Maybe<Scalars['String']>;
  config_starts_with_i?: Maybe<Scalars['String']>;
  config_not_starts_with_i?: Maybe<Scalars['String']>;
  config_ends_with_i?: Maybe<Scalars['String']>;
  config_not_ends_with_i?: Maybe<Scalars['String']>;
  config_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  config_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  updatedBy?: Maybe<UserWhereInput>;
  updatedBy_is_null?: Maybe<Scalars['Boolean']>;
  createdBy?: Maybe<UserWhereInput>;
  createdBy_is_null?: Maybe<Scalars['Boolean']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedAt_not?: Maybe<Scalars['DateTime']>;
  updatedAt_lt?: Maybe<Scalars['DateTime']>;
  updatedAt_lte?: Maybe<Scalars['DateTime']>;
  updatedAt_gt?: Maybe<Scalars['DateTime']>;
  updatedAt_gte?: Maybe<Scalars['DateTime']>;
  updatedAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  updatedAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdAt_not?: Maybe<Scalars['DateTime']>;
  createdAt_lt?: Maybe<Scalars['DateTime']>;
  createdAt_lte?: Maybe<Scalars['DateTime']>;
  createdAt_gt?: Maybe<Scalars['DateTime']>;
  createdAt_gte?: Maybe<Scalars['DateTime']>;
  createdAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
};

export type PluginWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortPluginsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  KongPluginIdAsc = 'kongPluginId_ASC',
  KongPluginIdDesc = 'kongPluginId_DESC',
  ConfigAsc = 'config_ASC',
  ConfigDesc = 'config_DESC',
  UpdatedByAsc = 'updatedBy_ASC',
  UpdatedByDesc = 'updatedBy_DESC',
  CreatedByAsc = 'createdBy_ASC',
  CreatedByDesc = 'createdBy_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type PluginUpdateInput = {
  name?: Maybe<Scalars['String']>;
  kongPluginId?: Maybe<Scalars['String']>;
  config?: Maybe<Scalars['String']>;
};

export type PluginsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<PluginUpdateInput>;
};

export type PluginCreateInput = {
  name?: Maybe<Scalars['String']>;
  kongPluginId?: Maybe<Scalars['String']>;
  config?: Maybe<Scalars['String']>;
};

export type PluginsCreateInput = {
  data?: Maybe<PluginCreateInput>;
};

/**  A keystone list  */
export type ServiceRoute = {
  __typename?: 'ServiceRoute';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the ServiceRoute List config, or
   *  2. As an alias to the field set on 'labelField' in the ServiceRoute List config, or
   *  3. As an alias to a 'name' field on the ServiceRoute List (if one exists), or
   *  4. As an alias to the 'id' field on the ServiceRoute List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  kongRouteId?: Maybe<Scalars['String']>;
  kongServiceId?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  methods?: Maybe<Scalars['String']>;
  paths?: Maybe<Scalars['String']>;
  host?: Maybe<Scalars['String']>;
  isActive?: Maybe<Scalars['Boolean']>;
  tags?: Maybe<Scalars['String']>;
  plugins: Array<Plugin>;
  _pluginsMeta?: Maybe<_QueryMeta>;
  environment?: Maybe<Environment>;
  updatedBy?: Maybe<User>;
  createdBy?: Maybe<User>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};


/**  A keystone list  */
export type ServiceRoutePluginsArgs = {
  where?: Maybe<PluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type ServiceRoute_PluginsMetaArgs = {
  where?: Maybe<PluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type ServiceRouteWhereInput = {
  AND?: Maybe<Array<Maybe<ServiceRouteWhereInput>>>;
  OR?: Maybe<Array<Maybe<ServiceRouteWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  kongRouteId?: Maybe<Scalars['String']>;
  kongRouteId_not?: Maybe<Scalars['String']>;
  kongRouteId_contains?: Maybe<Scalars['String']>;
  kongRouteId_not_contains?: Maybe<Scalars['String']>;
  kongRouteId_starts_with?: Maybe<Scalars['String']>;
  kongRouteId_not_starts_with?: Maybe<Scalars['String']>;
  kongRouteId_ends_with?: Maybe<Scalars['String']>;
  kongRouteId_not_ends_with?: Maybe<Scalars['String']>;
  kongRouteId_i?: Maybe<Scalars['String']>;
  kongRouteId_not_i?: Maybe<Scalars['String']>;
  kongRouteId_contains_i?: Maybe<Scalars['String']>;
  kongRouteId_not_contains_i?: Maybe<Scalars['String']>;
  kongRouteId_starts_with_i?: Maybe<Scalars['String']>;
  kongRouteId_not_starts_with_i?: Maybe<Scalars['String']>;
  kongRouteId_ends_with_i?: Maybe<Scalars['String']>;
  kongRouteId_not_ends_with_i?: Maybe<Scalars['String']>;
  kongRouteId_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  kongRouteId_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  kongServiceId?: Maybe<Scalars['String']>;
  kongServiceId_not?: Maybe<Scalars['String']>;
  kongServiceId_contains?: Maybe<Scalars['String']>;
  kongServiceId_not_contains?: Maybe<Scalars['String']>;
  kongServiceId_starts_with?: Maybe<Scalars['String']>;
  kongServiceId_not_starts_with?: Maybe<Scalars['String']>;
  kongServiceId_ends_with?: Maybe<Scalars['String']>;
  kongServiceId_not_ends_with?: Maybe<Scalars['String']>;
  kongServiceId_i?: Maybe<Scalars['String']>;
  kongServiceId_not_i?: Maybe<Scalars['String']>;
  kongServiceId_contains_i?: Maybe<Scalars['String']>;
  kongServiceId_not_contains_i?: Maybe<Scalars['String']>;
  kongServiceId_starts_with_i?: Maybe<Scalars['String']>;
  kongServiceId_not_starts_with_i?: Maybe<Scalars['String']>;
  kongServiceId_ends_with_i?: Maybe<Scalars['String']>;
  kongServiceId_not_ends_with_i?: Maybe<Scalars['String']>;
  kongServiceId_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  kongServiceId_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  namespace?: Maybe<Scalars['String']>;
  namespace_not?: Maybe<Scalars['String']>;
  namespace_contains?: Maybe<Scalars['String']>;
  namespace_not_contains?: Maybe<Scalars['String']>;
  namespace_starts_with?: Maybe<Scalars['String']>;
  namespace_not_starts_with?: Maybe<Scalars['String']>;
  namespace_ends_with?: Maybe<Scalars['String']>;
  namespace_not_ends_with?: Maybe<Scalars['String']>;
  namespace_i?: Maybe<Scalars['String']>;
  namespace_not_i?: Maybe<Scalars['String']>;
  namespace_contains_i?: Maybe<Scalars['String']>;
  namespace_not_contains_i?: Maybe<Scalars['String']>;
  namespace_starts_with_i?: Maybe<Scalars['String']>;
  namespace_not_starts_with_i?: Maybe<Scalars['String']>;
  namespace_ends_with_i?: Maybe<Scalars['String']>;
  namespace_not_ends_with_i?: Maybe<Scalars['String']>;
  namespace_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  namespace_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  methods?: Maybe<Scalars['String']>;
  methods_not?: Maybe<Scalars['String']>;
  methods_contains?: Maybe<Scalars['String']>;
  methods_not_contains?: Maybe<Scalars['String']>;
  methods_starts_with?: Maybe<Scalars['String']>;
  methods_not_starts_with?: Maybe<Scalars['String']>;
  methods_ends_with?: Maybe<Scalars['String']>;
  methods_not_ends_with?: Maybe<Scalars['String']>;
  methods_i?: Maybe<Scalars['String']>;
  methods_not_i?: Maybe<Scalars['String']>;
  methods_contains_i?: Maybe<Scalars['String']>;
  methods_not_contains_i?: Maybe<Scalars['String']>;
  methods_starts_with_i?: Maybe<Scalars['String']>;
  methods_not_starts_with_i?: Maybe<Scalars['String']>;
  methods_ends_with_i?: Maybe<Scalars['String']>;
  methods_not_ends_with_i?: Maybe<Scalars['String']>;
  methods_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  methods_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  paths?: Maybe<Scalars['String']>;
  paths_not?: Maybe<Scalars['String']>;
  paths_contains?: Maybe<Scalars['String']>;
  paths_not_contains?: Maybe<Scalars['String']>;
  paths_starts_with?: Maybe<Scalars['String']>;
  paths_not_starts_with?: Maybe<Scalars['String']>;
  paths_ends_with?: Maybe<Scalars['String']>;
  paths_not_ends_with?: Maybe<Scalars['String']>;
  paths_i?: Maybe<Scalars['String']>;
  paths_not_i?: Maybe<Scalars['String']>;
  paths_contains_i?: Maybe<Scalars['String']>;
  paths_not_contains_i?: Maybe<Scalars['String']>;
  paths_starts_with_i?: Maybe<Scalars['String']>;
  paths_not_starts_with_i?: Maybe<Scalars['String']>;
  paths_ends_with_i?: Maybe<Scalars['String']>;
  paths_not_ends_with_i?: Maybe<Scalars['String']>;
  paths_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  paths_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  host?: Maybe<Scalars['String']>;
  host_not?: Maybe<Scalars['String']>;
  host_contains?: Maybe<Scalars['String']>;
  host_not_contains?: Maybe<Scalars['String']>;
  host_starts_with?: Maybe<Scalars['String']>;
  host_not_starts_with?: Maybe<Scalars['String']>;
  host_ends_with?: Maybe<Scalars['String']>;
  host_not_ends_with?: Maybe<Scalars['String']>;
  host_i?: Maybe<Scalars['String']>;
  host_not_i?: Maybe<Scalars['String']>;
  host_contains_i?: Maybe<Scalars['String']>;
  host_not_contains_i?: Maybe<Scalars['String']>;
  host_starts_with_i?: Maybe<Scalars['String']>;
  host_not_starts_with_i?: Maybe<Scalars['String']>;
  host_ends_with_i?: Maybe<Scalars['String']>;
  host_not_ends_with_i?: Maybe<Scalars['String']>;
  host_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  host_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  isActive?: Maybe<Scalars['Boolean']>;
  isActive_not?: Maybe<Scalars['Boolean']>;
  tags?: Maybe<Scalars['String']>;
  tags_not?: Maybe<Scalars['String']>;
  tags_contains?: Maybe<Scalars['String']>;
  tags_not_contains?: Maybe<Scalars['String']>;
  tags_starts_with?: Maybe<Scalars['String']>;
  tags_not_starts_with?: Maybe<Scalars['String']>;
  tags_ends_with?: Maybe<Scalars['String']>;
  tags_not_ends_with?: Maybe<Scalars['String']>;
  tags_i?: Maybe<Scalars['String']>;
  tags_not_i?: Maybe<Scalars['String']>;
  tags_contains_i?: Maybe<Scalars['String']>;
  tags_not_contains_i?: Maybe<Scalars['String']>;
  tags_starts_with_i?: Maybe<Scalars['String']>;
  tags_not_starts_with_i?: Maybe<Scalars['String']>;
  tags_ends_with_i?: Maybe<Scalars['String']>;
  tags_not_ends_with_i?: Maybe<Scalars['String']>;
  tags_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  tags_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**  condition must be true for all nodes  */
  plugins_every?: Maybe<PluginWhereInput>;
  /**  condition must be true for at least 1 node  */
  plugins_some?: Maybe<PluginWhereInput>;
  /**  condition must be false for all nodes  */
  plugins_none?: Maybe<PluginWhereInput>;
  environment?: Maybe<EnvironmentWhereInput>;
  environment_is_null?: Maybe<Scalars['Boolean']>;
  updatedBy?: Maybe<UserWhereInput>;
  updatedBy_is_null?: Maybe<Scalars['Boolean']>;
  createdBy?: Maybe<UserWhereInput>;
  createdBy_is_null?: Maybe<Scalars['Boolean']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedAt_not?: Maybe<Scalars['DateTime']>;
  updatedAt_lt?: Maybe<Scalars['DateTime']>;
  updatedAt_lte?: Maybe<Scalars['DateTime']>;
  updatedAt_gt?: Maybe<Scalars['DateTime']>;
  updatedAt_gte?: Maybe<Scalars['DateTime']>;
  updatedAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  updatedAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdAt_not?: Maybe<Scalars['DateTime']>;
  createdAt_lt?: Maybe<Scalars['DateTime']>;
  createdAt_lte?: Maybe<Scalars['DateTime']>;
  createdAt_gt?: Maybe<Scalars['DateTime']>;
  createdAt_gte?: Maybe<Scalars['DateTime']>;
  createdAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
};

export type ServiceRouteWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortServiceRoutesBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  KongRouteIdAsc = 'kongRouteId_ASC',
  KongRouteIdDesc = 'kongRouteId_DESC',
  KongServiceIdAsc = 'kongServiceId_ASC',
  KongServiceIdDesc = 'kongServiceId_DESC',
  NamespaceAsc = 'namespace_ASC',
  NamespaceDesc = 'namespace_DESC',
  MethodsAsc = 'methods_ASC',
  MethodsDesc = 'methods_DESC',
  PathsAsc = 'paths_ASC',
  PathsDesc = 'paths_DESC',
  HostAsc = 'host_ASC',
  HostDesc = 'host_DESC',
  IsActiveAsc = 'isActive_ASC',
  IsActiveDesc = 'isActive_DESC',
  TagsAsc = 'tags_ASC',
  TagsDesc = 'tags_DESC',
  PluginsAsc = 'plugins_ASC',
  PluginsDesc = 'plugins_DESC',
  EnvironmentAsc = 'environment_ASC',
  EnvironmentDesc = 'environment_DESC',
  UpdatedByAsc = 'updatedBy_ASC',
  UpdatedByDesc = 'updatedBy_DESC',
  CreatedByAsc = 'createdBy_ASC',
  CreatedByDesc = 'createdBy_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type ServiceRouteUpdateInput = {
  name?: Maybe<Scalars['String']>;
  kongRouteId?: Maybe<Scalars['String']>;
  kongServiceId?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  methods?: Maybe<Scalars['String']>;
  paths?: Maybe<Scalars['String']>;
  host?: Maybe<Scalars['String']>;
  isActive?: Maybe<Scalars['Boolean']>;
  tags?: Maybe<Scalars['String']>;
  plugins?: Maybe<PluginRelateToManyInput>;
  environment?: Maybe<EnvironmentRelateToOneInput>;
};

export type ServiceRoutesUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<ServiceRouteUpdateInput>;
};

export type ServiceRouteCreateInput = {
  name?: Maybe<Scalars['String']>;
  kongRouteId?: Maybe<Scalars['String']>;
  kongServiceId?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  methods?: Maybe<Scalars['String']>;
  paths?: Maybe<Scalars['String']>;
  host?: Maybe<Scalars['String']>;
  isActive?: Maybe<Scalars['Boolean']>;
  tags?: Maybe<Scalars['String']>;
  plugins?: Maybe<PluginRelateToManyInput>;
  environment?: Maybe<EnvironmentRelateToOneInput>;
};

export type ServiceRoutesCreateInput = {
  data?: Maybe<ServiceRouteCreateInput>;
};

/**  A keystone list  */
export type TemporaryIdentity = {
  __typename?: 'TemporaryIdentity';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the TemporaryIdentity List config, or
   *  2. As an alias to the field set on 'labelField' in the TemporaryIdentity List config, or
   *  3. As an alias to a 'name' field on the TemporaryIdentity List (if one exists), or
   *  4. As an alias to the 'id' field on the TemporaryIdentity List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  jti?: Maybe<Scalars['String']>;
  sub?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  isAdmin?: Maybe<Scalars['Boolean']>;
  userId?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  groups?: Maybe<Scalars['String']>;
  roles?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type TemporaryIdentityWhereInput = {
  AND?: Maybe<Array<Maybe<TemporaryIdentityWhereInput>>>;
  OR?: Maybe<Array<Maybe<TemporaryIdentityWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  jti?: Maybe<Scalars['String']>;
  jti_not?: Maybe<Scalars['String']>;
  jti_contains?: Maybe<Scalars['String']>;
  jti_not_contains?: Maybe<Scalars['String']>;
  jti_starts_with?: Maybe<Scalars['String']>;
  jti_not_starts_with?: Maybe<Scalars['String']>;
  jti_ends_with?: Maybe<Scalars['String']>;
  jti_not_ends_with?: Maybe<Scalars['String']>;
  jti_i?: Maybe<Scalars['String']>;
  jti_not_i?: Maybe<Scalars['String']>;
  jti_contains_i?: Maybe<Scalars['String']>;
  jti_not_contains_i?: Maybe<Scalars['String']>;
  jti_starts_with_i?: Maybe<Scalars['String']>;
  jti_not_starts_with_i?: Maybe<Scalars['String']>;
  jti_ends_with_i?: Maybe<Scalars['String']>;
  jti_not_ends_with_i?: Maybe<Scalars['String']>;
  jti_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  jti_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  sub?: Maybe<Scalars['String']>;
  sub_not?: Maybe<Scalars['String']>;
  sub_contains?: Maybe<Scalars['String']>;
  sub_not_contains?: Maybe<Scalars['String']>;
  sub_starts_with?: Maybe<Scalars['String']>;
  sub_not_starts_with?: Maybe<Scalars['String']>;
  sub_ends_with?: Maybe<Scalars['String']>;
  sub_not_ends_with?: Maybe<Scalars['String']>;
  sub_i?: Maybe<Scalars['String']>;
  sub_not_i?: Maybe<Scalars['String']>;
  sub_contains_i?: Maybe<Scalars['String']>;
  sub_not_contains_i?: Maybe<Scalars['String']>;
  sub_starts_with_i?: Maybe<Scalars['String']>;
  sub_not_starts_with_i?: Maybe<Scalars['String']>;
  sub_ends_with_i?: Maybe<Scalars['String']>;
  sub_not_ends_with_i?: Maybe<Scalars['String']>;
  sub_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  sub_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  username?: Maybe<Scalars['String']>;
  username_not?: Maybe<Scalars['String']>;
  username_contains?: Maybe<Scalars['String']>;
  username_not_contains?: Maybe<Scalars['String']>;
  username_starts_with?: Maybe<Scalars['String']>;
  username_not_starts_with?: Maybe<Scalars['String']>;
  username_ends_with?: Maybe<Scalars['String']>;
  username_not_ends_with?: Maybe<Scalars['String']>;
  username_i?: Maybe<Scalars['String']>;
  username_not_i?: Maybe<Scalars['String']>;
  username_contains_i?: Maybe<Scalars['String']>;
  username_not_contains_i?: Maybe<Scalars['String']>;
  username_starts_with_i?: Maybe<Scalars['String']>;
  username_not_starts_with_i?: Maybe<Scalars['String']>;
  username_ends_with_i?: Maybe<Scalars['String']>;
  username_not_ends_with_i?: Maybe<Scalars['String']>;
  username_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  username_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  email?: Maybe<Scalars['String']>;
  email_not?: Maybe<Scalars['String']>;
  email_contains?: Maybe<Scalars['String']>;
  email_not_contains?: Maybe<Scalars['String']>;
  email_starts_with?: Maybe<Scalars['String']>;
  email_not_starts_with?: Maybe<Scalars['String']>;
  email_ends_with?: Maybe<Scalars['String']>;
  email_not_ends_with?: Maybe<Scalars['String']>;
  email_i?: Maybe<Scalars['String']>;
  email_not_i?: Maybe<Scalars['String']>;
  email_contains_i?: Maybe<Scalars['String']>;
  email_not_contains_i?: Maybe<Scalars['String']>;
  email_starts_with_i?: Maybe<Scalars['String']>;
  email_not_starts_with_i?: Maybe<Scalars['String']>;
  email_ends_with_i?: Maybe<Scalars['String']>;
  email_not_ends_with_i?: Maybe<Scalars['String']>;
  email_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  email_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  isAdmin?: Maybe<Scalars['Boolean']>;
  isAdmin_not?: Maybe<Scalars['Boolean']>;
  userId?: Maybe<Scalars['String']>;
  userId_not?: Maybe<Scalars['String']>;
  userId_contains?: Maybe<Scalars['String']>;
  userId_not_contains?: Maybe<Scalars['String']>;
  userId_starts_with?: Maybe<Scalars['String']>;
  userId_not_starts_with?: Maybe<Scalars['String']>;
  userId_ends_with?: Maybe<Scalars['String']>;
  userId_not_ends_with?: Maybe<Scalars['String']>;
  userId_i?: Maybe<Scalars['String']>;
  userId_not_i?: Maybe<Scalars['String']>;
  userId_contains_i?: Maybe<Scalars['String']>;
  userId_not_contains_i?: Maybe<Scalars['String']>;
  userId_starts_with_i?: Maybe<Scalars['String']>;
  userId_not_starts_with_i?: Maybe<Scalars['String']>;
  userId_ends_with_i?: Maybe<Scalars['String']>;
  userId_not_ends_with_i?: Maybe<Scalars['String']>;
  userId_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  userId_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  namespace?: Maybe<Scalars['String']>;
  namespace_not?: Maybe<Scalars['String']>;
  namespace_contains?: Maybe<Scalars['String']>;
  namespace_not_contains?: Maybe<Scalars['String']>;
  namespace_starts_with?: Maybe<Scalars['String']>;
  namespace_not_starts_with?: Maybe<Scalars['String']>;
  namespace_ends_with?: Maybe<Scalars['String']>;
  namespace_not_ends_with?: Maybe<Scalars['String']>;
  namespace_i?: Maybe<Scalars['String']>;
  namespace_not_i?: Maybe<Scalars['String']>;
  namespace_contains_i?: Maybe<Scalars['String']>;
  namespace_not_contains_i?: Maybe<Scalars['String']>;
  namespace_starts_with_i?: Maybe<Scalars['String']>;
  namespace_not_starts_with_i?: Maybe<Scalars['String']>;
  namespace_ends_with_i?: Maybe<Scalars['String']>;
  namespace_not_ends_with_i?: Maybe<Scalars['String']>;
  namespace_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  namespace_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  groups?: Maybe<Scalars['String']>;
  groups_not?: Maybe<Scalars['String']>;
  groups_contains?: Maybe<Scalars['String']>;
  groups_not_contains?: Maybe<Scalars['String']>;
  groups_starts_with?: Maybe<Scalars['String']>;
  groups_not_starts_with?: Maybe<Scalars['String']>;
  groups_ends_with?: Maybe<Scalars['String']>;
  groups_not_ends_with?: Maybe<Scalars['String']>;
  groups_i?: Maybe<Scalars['String']>;
  groups_not_i?: Maybe<Scalars['String']>;
  groups_contains_i?: Maybe<Scalars['String']>;
  groups_not_contains_i?: Maybe<Scalars['String']>;
  groups_starts_with_i?: Maybe<Scalars['String']>;
  groups_not_starts_with_i?: Maybe<Scalars['String']>;
  groups_ends_with_i?: Maybe<Scalars['String']>;
  groups_not_ends_with_i?: Maybe<Scalars['String']>;
  groups_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  groups_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  roles?: Maybe<Scalars['String']>;
  roles_not?: Maybe<Scalars['String']>;
  roles_contains?: Maybe<Scalars['String']>;
  roles_not_contains?: Maybe<Scalars['String']>;
  roles_starts_with?: Maybe<Scalars['String']>;
  roles_not_starts_with?: Maybe<Scalars['String']>;
  roles_ends_with?: Maybe<Scalars['String']>;
  roles_not_ends_with?: Maybe<Scalars['String']>;
  roles_i?: Maybe<Scalars['String']>;
  roles_not_i?: Maybe<Scalars['String']>;
  roles_contains_i?: Maybe<Scalars['String']>;
  roles_not_contains_i?: Maybe<Scalars['String']>;
  roles_starts_with_i?: Maybe<Scalars['String']>;
  roles_not_starts_with_i?: Maybe<Scalars['String']>;
  roles_ends_with_i?: Maybe<Scalars['String']>;
  roles_not_ends_with_i?: Maybe<Scalars['String']>;
  roles_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  roles_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  updatedAt_not?: Maybe<Scalars['DateTime']>;
  updatedAt_lt?: Maybe<Scalars['DateTime']>;
  updatedAt_lte?: Maybe<Scalars['DateTime']>;
  updatedAt_gt?: Maybe<Scalars['DateTime']>;
  updatedAt_gte?: Maybe<Scalars['DateTime']>;
  updatedAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  updatedAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt?: Maybe<Scalars['DateTime']>;
  createdAt_not?: Maybe<Scalars['DateTime']>;
  createdAt_lt?: Maybe<Scalars['DateTime']>;
  createdAt_lte?: Maybe<Scalars['DateTime']>;
  createdAt_gt?: Maybe<Scalars['DateTime']>;
  createdAt_gte?: Maybe<Scalars['DateTime']>;
  createdAt_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  createdAt_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
};

export type TemporaryIdentityWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortTemporaryIdentitiesBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  JtiAsc = 'jti_ASC',
  JtiDesc = 'jti_DESC',
  SubAsc = 'sub_ASC',
  SubDesc = 'sub_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  UsernameAsc = 'username_ASC',
  UsernameDesc = 'username_DESC',
  EmailAsc = 'email_ASC',
  EmailDesc = 'email_DESC',
  IsAdminAsc = 'isAdmin_ASC',
  IsAdminDesc = 'isAdmin_DESC',
  UserIdAsc = 'userId_ASC',
  UserIdDesc = 'userId_DESC',
  NamespaceAsc = 'namespace_ASC',
  NamespaceDesc = 'namespace_DESC',
  GroupsAsc = 'groups_ASC',
  GroupsDesc = 'groups_DESC',
  RolesAsc = 'roles_ASC',
  RolesDesc = 'roles_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type TemporaryIdentityUpdateInput = {
  jti?: Maybe<Scalars['String']>;
  sub?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  isAdmin?: Maybe<Scalars['Boolean']>;
  userId?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  groups?: Maybe<Scalars['String']>;
  roles?: Maybe<Scalars['String']>;
};

export type TemporaryIdentitiesUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<TemporaryIdentityUpdateInput>;
};

export type TemporaryIdentityCreateInput = {
  jti?: Maybe<Scalars['String']>;
  sub?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  isAdmin?: Maybe<Scalars['Boolean']>;
  userId?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  groups?: Maybe<Scalars['String']>;
  roles?: Maybe<Scalars['String']>;
};

export type TemporaryIdentitiesCreateInput = {
  data?: Maybe<TemporaryIdentityCreateInput>;
};

/**  A keystone list  */
export type Todo = {
  __typename?: 'Todo';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Todo List config, or
   *  2. As an alias to the field set on 'labelField' in the Todo List config, or
   *  3. As an alias to a 'name' field on the Todo List (if one exists), or
   *  4. As an alias to the 'id' field on the Todo List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  grape?: Maybe<Scalars['String']>;
  yaml?: Maybe<Scalars['String']>;
  isComplete?: Maybe<Scalars['Boolean']>;
};

export type TodoWhereInput = {
  AND?: Maybe<Array<Maybe<TodoWhereInput>>>;
  OR?: Maybe<Array<Maybe<TodoWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description?: Maybe<Scalars['String']>;
  description_not?: Maybe<Scalars['String']>;
  description_contains?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  description_starts_with?: Maybe<Scalars['String']>;
  description_not_starts_with?: Maybe<Scalars['String']>;
  description_ends_with?: Maybe<Scalars['String']>;
  description_not_ends_with?: Maybe<Scalars['String']>;
  description_i?: Maybe<Scalars['String']>;
  description_not_i?: Maybe<Scalars['String']>;
  description_contains_i?: Maybe<Scalars['String']>;
  description_not_contains_i?: Maybe<Scalars['String']>;
  description_starts_with_i?: Maybe<Scalars['String']>;
  description_not_starts_with_i?: Maybe<Scalars['String']>;
  description_ends_with_i?: Maybe<Scalars['String']>;
  description_not_ends_with_i?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  content?: Maybe<Scalars['String']>;
  content_not?: Maybe<Scalars['String']>;
  content_contains?: Maybe<Scalars['String']>;
  content_not_contains?: Maybe<Scalars['String']>;
  content_starts_with?: Maybe<Scalars['String']>;
  content_not_starts_with?: Maybe<Scalars['String']>;
  content_ends_with?: Maybe<Scalars['String']>;
  content_not_ends_with?: Maybe<Scalars['String']>;
  content_i?: Maybe<Scalars['String']>;
  content_not_i?: Maybe<Scalars['String']>;
  content_contains_i?: Maybe<Scalars['String']>;
  content_not_contains_i?: Maybe<Scalars['String']>;
  content_starts_with_i?: Maybe<Scalars['String']>;
  content_not_starts_with_i?: Maybe<Scalars['String']>;
  content_ends_with_i?: Maybe<Scalars['String']>;
  content_not_ends_with_i?: Maybe<Scalars['String']>;
  content_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  content_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  grape?: Maybe<Scalars['String']>;
  grape_not?: Maybe<Scalars['String']>;
  grape_contains?: Maybe<Scalars['String']>;
  grape_not_contains?: Maybe<Scalars['String']>;
  grape_starts_with?: Maybe<Scalars['String']>;
  grape_not_starts_with?: Maybe<Scalars['String']>;
  grape_ends_with?: Maybe<Scalars['String']>;
  grape_not_ends_with?: Maybe<Scalars['String']>;
  grape_i?: Maybe<Scalars['String']>;
  grape_not_i?: Maybe<Scalars['String']>;
  grape_contains_i?: Maybe<Scalars['String']>;
  grape_not_contains_i?: Maybe<Scalars['String']>;
  grape_starts_with_i?: Maybe<Scalars['String']>;
  grape_not_starts_with_i?: Maybe<Scalars['String']>;
  grape_ends_with_i?: Maybe<Scalars['String']>;
  grape_not_ends_with_i?: Maybe<Scalars['String']>;
  grape_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  grape_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  yaml?: Maybe<Scalars['String']>;
  yaml_not?: Maybe<Scalars['String']>;
  yaml_contains?: Maybe<Scalars['String']>;
  yaml_not_contains?: Maybe<Scalars['String']>;
  yaml_starts_with?: Maybe<Scalars['String']>;
  yaml_not_starts_with?: Maybe<Scalars['String']>;
  yaml_ends_with?: Maybe<Scalars['String']>;
  yaml_not_ends_with?: Maybe<Scalars['String']>;
  yaml_i?: Maybe<Scalars['String']>;
  yaml_not_i?: Maybe<Scalars['String']>;
  yaml_contains_i?: Maybe<Scalars['String']>;
  yaml_not_contains_i?: Maybe<Scalars['String']>;
  yaml_starts_with_i?: Maybe<Scalars['String']>;
  yaml_not_starts_with_i?: Maybe<Scalars['String']>;
  yaml_ends_with_i?: Maybe<Scalars['String']>;
  yaml_not_ends_with_i?: Maybe<Scalars['String']>;
  yaml_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  yaml_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  isComplete?: Maybe<Scalars['Boolean']>;
  isComplete_not?: Maybe<Scalars['Boolean']>;
};

export type TodoWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortTodosBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  ContentAsc = 'content_ASC',
  ContentDesc = 'content_DESC',
  GrapeAsc = 'grape_ASC',
  GrapeDesc = 'grape_DESC',
  YamlAsc = 'yaml_ASC',
  YamlDesc = 'yaml_DESC',
  IsCompleteAsc = 'isComplete_ASC',
  IsCompleteDesc = 'isComplete_DESC'
}

export type TodoUpdateInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  grape?: Maybe<Scalars['String']>;
  yaml?: Maybe<Scalars['String']>;
  isComplete?: Maybe<Scalars['Boolean']>;
};

export type TodosUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<TodoUpdateInput>;
};

export type TodoCreateInput = {
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  grape?: Maybe<Scalars['String']>;
  yaml?: Maybe<Scalars['String']>;
  isComplete?: Maybe<Scalars['Boolean']>;
};

export type TodosCreateInput = {
  data?: Maybe<TodoCreateInput>;
};

/**  A keystone list  */
export type User = {
  __typename?: 'User';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the User List config, or
   *  2. As an alias to the field set on 'labelField' in the User List config, or
   *  3. As an alias to a 'name' field on the User List (if one exists), or
   *  4. As an alias to the 'id' field on the User List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  isAdmin?: Maybe<Scalars['Boolean']>;
  password_is_set?: Maybe<Scalars['Boolean']>;
};

export type UserWhereInput = {
  AND?: Maybe<Array<Maybe<UserWhereInput>>>;
  OR?: Maybe<Array<Maybe<UserWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  username?: Maybe<Scalars['String']>;
  username_not?: Maybe<Scalars['String']>;
  username_contains?: Maybe<Scalars['String']>;
  username_not_contains?: Maybe<Scalars['String']>;
  username_starts_with?: Maybe<Scalars['String']>;
  username_not_starts_with?: Maybe<Scalars['String']>;
  username_ends_with?: Maybe<Scalars['String']>;
  username_not_ends_with?: Maybe<Scalars['String']>;
  username_i?: Maybe<Scalars['String']>;
  username_not_i?: Maybe<Scalars['String']>;
  username_contains_i?: Maybe<Scalars['String']>;
  username_not_contains_i?: Maybe<Scalars['String']>;
  username_starts_with_i?: Maybe<Scalars['String']>;
  username_not_starts_with_i?: Maybe<Scalars['String']>;
  username_ends_with_i?: Maybe<Scalars['String']>;
  username_not_ends_with_i?: Maybe<Scalars['String']>;
  username_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  username_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  email?: Maybe<Scalars['String']>;
  email_not?: Maybe<Scalars['String']>;
  email_contains?: Maybe<Scalars['String']>;
  email_not_contains?: Maybe<Scalars['String']>;
  email_starts_with?: Maybe<Scalars['String']>;
  email_not_starts_with?: Maybe<Scalars['String']>;
  email_ends_with?: Maybe<Scalars['String']>;
  email_not_ends_with?: Maybe<Scalars['String']>;
  email_i?: Maybe<Scalars['String']>;
  email_not_i?: Maybe<Scalars['String']>;
  email_contains_i?: Maybe<Scalars['String']>;
  email_not_contains_i?: Maybe<Scalars['String']>;
  email_starts_with_i?: Maybe<Scalars['String']>;
  email_not_starts_with_i?: Maybe<Scalars['String']>;
  email_ends_with_i?: Maybe<Scalars['String']>;
  email_not_ends_with_i?: Maybe<Scalars['String']>;
  email_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  email_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  isAdmin?: Maybe<Scalars['Boolean']>;
  isAdmin_not?: Maybe<Scalars['Boolean']>;
  password_is_set?: Maybe<Scalars['Boolean']>;
};

export type UserWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortUsersBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  UsernameAsc = 'username_ASC',
  UsernameDesc = 'username_DESC',
  EmailAsc = 'email_ASC',
  EmailDesc = 'email_DESC',
  IsAdminAsc = 'isAdmin_ASC',
  IsAdminDesc = 'isAdmin_DESC'
}

export type UserUpdateInput = {
  name?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  isAdmin?: Maybe<Scalars['Boolean']>;
  password?: Maybe<Scalars['String']>;
};

export type UsersUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<UserUpdateInput>;
};

export type UserCreateInput = {
  name?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  isAdmin?: Maybe<Scalars['Boolean']>;
  password?: Maybe<Scalars['String']>;
};

export type UsersCreateInput = {
  data?: Maybe<UserCreateInput>;
};


export type _ListAccess = {
  __typename?: '_ListAccess';
  /**
   * Access Control settings for the currently logged in (or anonymous)
   * user when performing 'create' operations.
   * NOTE: 'create' can only return a Boolean.
   * It is not possible to specify a declarative Where clause for this
   * operation
   */
  create?: Maybe<Scalars['Boolean']>;
  /**
   * Access Control settings for the currently logged in (or anonymous)
   * user when performing 'read' operations.
   */
  read?: Maybe<Scalars['JSON']>;
  /**
   * Access Control settings for the currently logged in (or anonymous)
   * user when performing 'update' operations.
   */
  update?: Maybe<Scalars['JSON']>;
  /**
   * Access Control settings for the currently logged in (or anonymous)
   * user when performing 'delete' operations.
   */
  delete?: Maybe<Scalars['JSON']>;
  /**
   * Access Control settings for the currently logged in (or anonymous)
   * user when performing 'auth' operations.
   */
  auth?: Maybe<Scalars['JSON']>;
};

export type _ListQueries = {
  __typename?: '_ListQueries';
  /** Single-item query name */
  item?: Maybe<Scalars['String']>;
  /** All-items query name */
  list?: Maybe<Scalars['String']>;
  /** List metadata query name */
  meta?: Maybe<Scalars['String']>;
};

export type _ListMutations = {
  __typename?: '_ListMutations';
  /** Create mutation name */
  create?: Maybe<Scalars['String']>;
  /** Create many mutation name */
  createMany?: Maybe<Scalars['String']>;
  /** Update mutation name */
  update?: Maybe<Scalars['String']>;
  /** Update many mutation name */
  updateMany?: Maybe<Scalars['String']>;
  /** Delete mutation name */
  delete?: Maybe<Scalars['String']>;
  /** Delete many mutation name */
  deleteMany?: Maybe<Scalars['String']>;
};

export type _ListInputTypes = {
  __typename?: '_ListInputTypes';
  /** Input type for matching multiple items */
  whereInput?: Maybe<Scalars['String']>;
  /** Input type for matching a unique item */
  whereUniqueInput?: Maybe<Scalars['String']>;
  /** Create mutation input type name */
  createInput?: Maybe<Scalars['String']>;
  /** Create many mutation input type name */
  createManyInput?: Maybe<Scalars['String']>;
  /** Update mutation name input */
  updateInput?: Maybe<Scalars['String']>;
  /** Update many mutation name input */
  updateManyInput?: Maybe<Scalars['String']>;
};

export type _ListSchemaFields = {
  __typename?: '_ListSchemaFields';
  /** The path of the field in its list */
  path?: Maybe<Scalars['String']>;
  /**
   * The name of the field in its list
   * @deprecated Use `path` instead
   */
  name?: Maybe<Scalars['String']>;
  /** The field type (ie, Checkbox, Text, etc) */
  type?: Maybe<Scalars['String']>;
};

export type _ListSchemaRelatedFields = {
  __typename?: '_ListSchemaRelatedFields';
  /** The typename as used in GraphQL queries */
  type?: Maybe<Scalars['String']>;
  /** A list of GraphQL field names */
  fields?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type _ListSchema = {
  __typename?: '_ListSchema';
  /** The typename as used in GraphQL queries */
  type?: Maybe<Scalars['String']>;
  /**
   * Top level GraphQL query names which either return this type, or
   * provide aggregate information about this type
   */
  queries?: Maybe<_ListQueries>;
  /** Top-level GraphQL mutation names */
  mutations?: Maybe<_ListMutations>;
  /** Top-level GraphQL input types */
  inputTypes?: Maybe<_ListInputTypes>;
  /** Information about fields defined on this list */
  fields?: Maybe<Array<Maybe<_ListSchemaFields>>>;
  /**
   * Information about fields on other types which return this type, or
   * provide aggregate information about this type
   */
  relatedFields?: Maybe<Array<Maybe<_ListSchemaRelatedFields>>>;
};


export type _ListSchemaFieldsArgs = {
  where?: Maybe<_ListSchemaFieldsInput>;
};

export type _ListMeta = {
  __typename?: '_ListMeta';
  /** The Keystone list key */
  key?: Maybe<Scalars['String']>;
  /**
   * The Keystone List name
   * @deprecated Use `key` instead
   */
  name?: Maybe<Scalars['String']>;
  /** The list's user-facing description */
  description?: Maybe<Scalars['String']>;
  /** The list's display name in the Admin UI */
  label?: Maybe<Scalars['String']>;
  /** The list's singular display name */
  singular?: Maybe<Scalars['String']>;
  /** The list's plural display name */
  plural?: Maybe<Scalars['String']>;
  /** The list's data path */
  path?: Maybe<Scalars['String']>;
  /** Access control configuration for the currently authenticated request */
  access?: Maybe<_ListAccess>;
  /** Information on the generated GraphQL schema */
  schema?: Maybe<_ListSchema>;
};

export type _QueryMeta = {
  __typename?: '_QueryMeta';
  count?: Maybe<Scalars['Int']>;
};

export type _KsListsMetaInput = {
  key?: Maybe<Scalars['String']>;
  /** Whether this is an auxiliary helper list */
  auxiliary?: Maybe<Scalars['Boolean']>;
};

export type _ListSchemaFieldsInput = {
  type?: Maybe<Scalars['String']>;
};

export type UnauthenticateUserOutput = {
  __typename?: 'unauthenticateUserOutput';
  /**
   * `true` when unauthentication succeeds.
   * NOTE: unauthentication always succeeds when the request has an invalid or missing authentication token.
   */
  success?: Maybe<Scalars['Boolean']>;
};

export type AuthenticateUserOutput = {
  __typename?: 'authenticateUserOutput';
  /**  Used to make subsequent authenticated requests by setting this token in a header: 'Authorization: Bearer <token>'.  */
  token?: Maybe<Scalars['String']>;
  /**  Retrieve information on the newly authenticated User here.  */
  item?: Maybe<User>;
};

export type Query = {
  __typename?: 'Query';
  /**  Search for all AccessRequest items which match the where clause.  */
  allAccessRequests?: Maybe<Array<Maybe<AccessRequest>>>;
  /**  Search for the AccessRequest item with the matching ID.  */
  AccessRequest?: Maybe<AccessRequest>;
  /**  Perform a meta-query on all AccessRequest items which match the where clause.  */
  _allAccessRequestsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the AccessRequest list.  */
  _AccessRequestsMeta?: Maybe<_ListMeta>;
  /**  Search for all Activity items which match the where clause.  */
  allActivities?: Maybe<Array<Maybe<Activity>>>;
  /**  Search for the Activity item with the matching ID.  */
  Activity?: Maybe<Activity>;
  /**  Perform a meta-query on all Activity items which match the where clause.  */
  _allActivitiesMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Activity list.  */
  _ActivitiesMeta?: Maybe<_ListMeta>;
  /**  Search for all Application items which match the where clause.  */
  allApplications?: Maybe<Array<Maybe<Application>>>;
  /**  Search for the Application item with the matching ID.  */
  Application?: Maybe<Application>;
  /**  Perform a meta-query on all Application items which match the where clause.  */
  _allApplicationsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Application list.  */
  _ApplicationsMeta?: Maybe<_ListMeta>;
  /**  Search for all Consumer items which match the where clause.  */
  allConsumers?: Maybe<Array<Maybe<Consumer>>>;
  /**  Search for the Consumer item with the matching ID.  */
  Consumer?: Maybe<Consumer>;
  /**  Perform a meta-query on all Consumer items which match the where clause.  */
  _allConsumersMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Consumer list.  */
  _ConsumersMeta?: Maybe<_ListMeta>;
  /**  Search for all Content items which match the where clause.  */
  allContents?: Maybe<Array<Maybe<Content>>>;
  /**  Search for the Content item with the matching ID.  */
  Content?: Maybe<Content>;
  /**  Perform a meta-query on all Content items which match the where clause.  */
  _allContentsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Content list.  */
  _ContentsMeta?: Maybe<_ListMeta>;
  /**  Search for all CredentialIssuer items which match the where clause.  */
  allCredentialIssuers?: Maybe<Array<Maybe<CredentialIssuer>>>;
  /**  Search for the CredentialIssuer item with the matching ID.  */
  CredentialIssuer?: Maybe<CredentialIssuer>;
  /**  Perform a meta-query on all CredentialIssuer items which match the where clause.  */
  _allCredentialIssuersMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the CredentialIssuer list.  */
  _CredentialIssuersMeta?: Maybe<_ListMeta>;
  /**  Search for all Dataset items which match the where clause.  */
  allDatasets?: Maybe<Array<Maybe<Dataset>>>;
  /**  Search for the Dataset item with the matching ID.  */
  Dataset?: Maybe<Dataset>;
  /**  Perform a meta-query on all Dataset items which match the where clause.  */
  _allDatasetsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Dataset list.  */
  _DatasetsMeta?: Maybe<_ListMeta>;
  /**  Search for all Environment items which match the where clause.  */
  allEnvironments?: Maybe<Array<Maybe<Environment>>>;
  /**  Search for the Environment item with the matching ID.  */
  Environment?: Maybe<Environment>;
  /**  Perform a meta-query on all Environment items which match the where clause.  */
  _allEnvironmentsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Environment list.  */
  _EnvironmentsMeta?: Maybe<_ListMeta>;
  /**  Search for all Gateway items which match the where clause.  */
  allGateways?: Maybe<Array<Maybe<Gateway>>>;
  /**  Search for the Gateway item with the matching ID.  */
  Gateway?: Maybe<Gateway>;
  /**  Perform a meta-query on all Gateway items which match the where clause.  */
  _allGatewaysMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Gateway list.  */
  _GatewaysMeta?: Maybe<_ListMeta>;
  /**  Search for all Group items which match the where clause.  */
  allGroups?: Maybe<Array<Maybe<Group>>>;
  /**  Search for the Group item with the matching ID.  */
  Group?: Maybe<Group>;
  /**  Perform a meta-query on all Group items which match the where clause.  */
  _allGroupsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Group list.  */
  _GroupsMeta?: Maybe<_ListMeta>;
  /**  Search for all Organization items which match the where clause.  */
  allOrganizations?: Maybe<Array<Maybe<Organization>>>;
  /**  Search for the Organization item with the matching ID.  */
  Organization?: Maybe<Organization>;
  /**  Perform a meta-query on all Organization items which match the where clause.  */
  _allOrganizationsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Organization list.  */
  _OrganizationsMeta?: Maybe<_ListMeta>;
  /**  Search for all OrganizationUnit items which match the where clause.  */
  allOrganizationUnits?: Maybe<Array<Maybe<OrganizationUnit>>>;
  /**  Search for the OrganizationUnit item with the matching ID.  */
  OrganizationUnit?: Maybe<OrganizationUnit>;
  /**  Perform a meta-query on all OrganizationUnit items which match the where clause.  */
  _allOrganizationUnitsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the OrganizationUnit list.  */
  _OrganizationUnitsMeta?: Maybe<_ListMeta>;
  /**  Search for all Package items which match the where clause.  */
  allPackages?: Maybe<Array<Maybe<Package>>>;
  /**  Search for the Package item with the matching ID.  */
  Package?: Maybe<Package>;
  /**  Perform a meta-query on all Package items which match the where clause.  */
  _allPackagesMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Package list.  */
  _PackagesMeta?: Maybe<_ListMeta>;
  /**  Search for all Plugin items which match the where clause.  */
  allPlugins?: Maybe<Array<Maybe<Plugin>>>;
  /**  Search for the Plugin item with the matching ID.  */
  Plugin?: Maybe<Plugin>;
  /**  Perform a meta-query on all Plugin items which match the where clause.  */
  _allPluginsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Plugin list.  */
  _PluginsMeta?: Maybe<_ListMeta>;
  /**  Search for all ServiceRoute items which match the where clause.  */
  allServiceRoutes?: Maybe<Array<Maybe<ServiceRoute>>>;
  /**  Search for the ServiceRoute item with the matching ID.  */
  ServiceRoute?: Maybe<ServiceRoute>;
  /**  Perform a meta-query on all ServiceRoute items which match the where clause.  */
  _allServiceRoutesMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the ServiceRoute list.  */
  _ServiceRoutesMeta?: Maybe<_ListMeta>;
  /**  Search for all TemporaryIdentity items which match the where clause.  */
  allTemporaryIdentities?: Maybe<Array<Maybe<TemporaryIdentity>>>;
  /**  Search for the TemporaryIdentity item with the matching ID.  */
  TemporaryIdentity?: Maybe<TemporaryIdentity>;
  /**  Perform a meta-query on all TemporaryIdentity items which match the where clause.  */
  _allTemporaryIdentitiesMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the TemporaryIdentity list.  */
  _TemporaryIdentitiesMeta?: Maybe<_ListMeta>;
  /**  Search for all Todo items which match the where clause.  */
  allTodos?: Maybe<Array<Maybe<Todo>>>;
  /**  Search for the Todo item with the matching ID.  */
  Todo?: Maybe<Todo>;
  /**  Perform a meta-query on all Todo items which match the where clause.  */
  _allTodosMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Todo list.  */
  _TodosMeta?: Maybe<_ListMeta>;
  /**  Search for all User items which match the where clause.  */
  allUsers?: Maybe<Array<Maybe<User>>>;
  /**  Search for the User item with the matching ID.  */
  User?: Maybe<User>;
  /**  Perform a meta-query on all User items which match the where clause.  */
  _allUsersMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the User list.  */
  _UsersMeta?: Maybe<_ListMeta>;
  /**  Retrieve the meta-data for all lists.  */
  _ksListsMeta?: Maybe<Array<Maybe<_ListMeta>>>;
  /** The version of the Keystone application serving this API. */
  appVersion?: Maybe<Scalars['String']>;
  authenticatedUser?: Maybe<User>;
};


export type QueryAllAccessRequestsArgs = {
  where?: Maybe<AccessRequestWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortAccessRequestsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAccessRequestArgs = {
  where: AccessRequestWhereUniqueInput;
};


export type Query_AllAccessRequestsMetaArgs = {
  where?: Maybe<AccessRequestWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortAccessRequestsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllActivitiesArgs = {
  where?: Maybe<ActivityWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortActivitiesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryActivityArgs = {
  where: ActivityWhereUniqueInput;
};


export type Query_AllActivitiesMetaArgs = {
  where?: Maybe<ActivityWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortActivitiesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllApplicationsArgs = {
  where?: Maybe<ApplicationWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortApplicationsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryApplicationArgs = {
  where: ApplicationWhereUniqueInput;
};


export type Query_AllApplicationsMetaArgs = {
  where?: Maybe<ApplicationWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortApplicationsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllConsumersArgs = {
  where?: Maybe<ConsumerWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortConsumersBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryConsumerArgs = {
  where: ConsumerWhereUniqueInput;
};


export type Query_AllConsumersMetaArgs = {
  where?: Maybe<ConsumerWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortConsumersBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllContentsArgs = {
  where?: Maybe<ContentWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortContentsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryContentArgs = {
  where: ContentWhereUniqueInput;
};


export type Query_AllContentsMetaArgs = {
  where?: Maybe<ContentWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortContentsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllCredentialIssuersArgs = {
  where?: Maybe<CredentialIssuerWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortCredentialIssuersBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryCredentialIssuerArgs = {
  where: CredentialIssuerWhereUniqueInput;
};


export type Query_AllCredentialIssuersMetaArgs = {
  where?: Maybe<CredentialIssuerWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortCredentialIssuersBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllDatasetsArgs = {
  where?: Maybe<DatasetWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortDatasetsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryDatasetArgs = {
  where: DatasetWhereUniqueInput;
};


export type Query_AllDatasetsMetaArgs = {
  where?: Maybe<DatasetWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortDatasetsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllEnvironmentsArgs = {
  where?: Maybe<EnvironmentWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortEnvironmentsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryEnvironmentArgs = {
  where: EnvironmentWhereUniqueInput;
};


export type Query_AllEnvironmentsMetaArgs = {
  where?: Maybe<EnvironmentWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortEnvironmentsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllGatewaysArgs = {
  where?: Maybe<GatewayWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewaysBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryGatewayArgs = {
  where: GatewayWhereUniqueInput;
};


export type Query_AllGatewaysMetaArgs = {
  where?: Maybe<GatewayWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewaysBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllGroupsArgs = {
  where?: Maybe<GroupWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGroupsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryGroupArgs = {
  where: GroupWhereUniqueInput;
};


export type Query_AllGroupsMetaArgs = {
  where?: Maybe<GroupWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGroupsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllOrganizationsArgs = {
  where?: Maybe<OrganizationWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortOrganizationsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryOrganizationArgs = {
  where: OrganizationWhereUniqueInput;
};


export type Query_AllOrganizationsMetaArgs = {
  where?: Maybe<OrganizationWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortOrganizationsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllOrganizationUnitsArgs = {
  where?: Maybe<OrganizationUnitWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortOrganizationUnitsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryOrganizationUnitArgs = {
  where: OrganizationUnitWhereUniqueInput;
};


export type Query_AllOrganizationUnitsMetaArgs = {
  where?: Maybe<OrganizationUnitWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortOrganizationUnitsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllPackagesArgs = {
  where?: Maybe<PackageWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortPackagesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryPackageArgs = {
  where: PackageWhereUniqueInput;
};


export type Query_AllPackagesMetaArgs = {
  where?: Maybe<PackageWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortPackagesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllPluginsArgs = {
  where?: Maybe<PluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryPluginArgs = {
  where: PluginWhereUniqueInput;
};


export type Query_AllPluginsMetaArgs = {
  where?: Maybe<PluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllServiceRoutesArgs = {
  where?: Maybe<ServiceRouteWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortServiceRoutesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryServiceRouteArgs = {
  where: ServiceRouteWhereUniqueInput;
};


export type Query_AllServiceRoutesMetaArgs = {
  where?: Maybe<ServiceRouteWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortServiceRoutesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllTemporaryIdentitiesArgs = {
  where?: Maybe<TemporaryIdentityWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortTemporaryIdentitiesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryTemporaryIdentityArgs = {
  where: TemporaryIdentityWhereUniqueInput;
};


export type Query_AllTemporaryIdentitiesMetaArgs = {
  where?: Maybe<TemporaryIdentityWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortTemporaryIdentitiesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllTodosArgs = {
  where?: Maybe<TodoWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortTodosBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryTodoArgs = {
  where: TodoWhereUniqueInput;
};


export type Query_AllTodosMetaArgs = {
  where?: Maybe<TodoWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortTodosBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllUsersArgs = {
  where?: Maybe<UserWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortUsersBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryUserArgs = {
  where: UserWhereUniqueInput;
};


export type Query_AllUsersMetaArgs = {
  where?: Maybe<UserWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortUsersBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type Query_KsListsMetaArgs = {
  where?: Maybe<_KsListsMetaInput>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /**  Create a single AccessRequest item.  */
  createAccessRequest?: Maybe<AccessRequest>;
  /**  Create multiple AccessRequest items.  */
  createAccessRequests?: Maybe<Array<Maybe<AccessRequest>>>;
  /**  Update a single AccessRequest item by ID.  */
  updateAccessRequest?: Maybe<AccessRequest>;
  /**  Update multiple AccessRequest items by ID.  */
  updateAccessRequests?: Maybe<Array<Maybe<AccessRequest>>>;
  /**  Delete a single AccessRequest item by ID.  */
  deleteAccessRequest?: Maybe<AccessRequest>;
  /**  Delete multiple AccessRequest items by ID.  */
  deleteAccessRequests?: Maybe<Array<Maybe<AccessRequest>>>;
  /**  Create a single Activity item.  */
  createActivity?: Maybe<Activity>;
  /**  Create multiple Activity items.  */
  createActivities?: Maybe<Array<Maybe<Activity>>>;
  /**  Update a single Activity item by ID.  */
  updateActivity?: Maybe<Activity>;
  /**  Update multiple Activity items by ID.  */
  updateActivities?: Maybe<Array<Maybe<Activity>>>;
  /**  Delete a single Activity item by ID.  */
  deleteActivity?: Maybe<Activity>;
  /**  Delete multiple Activity items by ID.  */
  deleteActivities?: Maybe<Array<Maybe<Activity>>>;
  /**  Create a single Application item.  */
  createApplication?: Maybe<Application>;
  /**  Create multiple Application items.  */
  createApplications?: Maybe<Array<Maybe<Application>>>;
  /**  Update a single Application item by ID.  */
  updateApplication?: Maybe<Application>;
  /**  Update multiple Application items by ID.  */
  updateApplications?: Maybe<Array<Maybe<Application>>>;
  /**  Delete a single Application item by ID.  */
  deleteApplication?: Maybe<Application>;
  /**  Delete multiple Application items by ID.  */
  deleteApplications?: Maybe<Array<Maybe<Application>>>;
  /**  Create a single Consumer item.  */
  createConsumer?: Maybe<Consumer>;
  /**  Create multiple Consumer items.  */
  createConsumers?: Maybe<Array<Maybe<Consumer>>>;
  /**  Update a single Consumer item by ID.  */
  updateConsumer?: Maybe<Consumer>;
  /**  Update multiple Consumer items by ID.  */
  updateConsumers?: Maybe<Array<Maybe<Consumer>>>;
  /**  Delete a single Consumer item by ID.  */
  deleteConsumer?: Maybe<Consumer>;
  /**  Delete multiple Consumer items by ID.  */
  deleteConsumers?: Maybe<Array<Maybe<Consumer>>>;
  /**  Create a single Content item.  */
  createContent?: Maybe<Content>;
  /**  Create multiple Content items.  */
  createContents?: Maybe<Array<Maybe<Content>>>;
  /**  Update a single Content item by ID.  */
  updateContent?: Maybe<Content>;
  /**  Update multiple Content items by ID.  */
  updateContents?: Maybe<Array<Maybe<Content>>>;
  /**  Delete a single Content item by ID.  */
  deleteContent?: Maybe<Content>;
  /**  Delete multiple Content items by ID.  */
  deleteContents?: Maybe<Array<Maybe<Content>>>;
  /**  Create a single CredentialIssuer item.  */
  createCredentialIssuer?: Maybe<CredentialIssuer>;
  /**  Create multiple CredentialIssuer items.  */
  createCredentialIssuers?: Maybe<Array<Maybe<CredentialIssuer>>>;
  /**  Update a single CredentialIssuer item by ID.  */
  updateCredentialIssuer?: Maybe<CredentialIssuer>;
  /**  Update multiple CredentialIssuer items by ID.  */
  updateCredentialIssuers?: Maybe<Array<Maybe<CredentialIssuer>>>;
  /**  Delete a single CredentialIssuer item by ID.  */
  deleteCredentialIssuer?: Maybe<CredentialIssuer>;
  /**  Delete multiple CredentialIssuer items by ID.  */
  deleteCredentialIssuers?: Maybe<Array<Maybe<CredentialIssuer>>>;
  /**  Create a single Dataset item.  */
  createDataset?: Maybe<Dataset>;
  /**  Create multiple Dataset items.  */
  createDatasets?: Maybe<Array<Maybe<Dataset>>>;
  /**  Update a single Dataset item by ID.  */
  updateDataset?: Maybe<Dataset>;
  /**  Update multiple Dataset items by ID.  */
  updateDatasets?: Maybe<Array<Maybe<Dataset>>>;
  /**  Delete a single Dataset item by ID.  */
  deleteDataset?: Maybe<Dataset>;
  /**  Delete multiple Dataset items by ID.  */
  deleteDatasets?: Maybe<Array<Maybe<Dataset>>>;
  /**  Create a single Environment item.  */
  createEnvironment?: Maybe<Environment>;
  /**  Create multiple Environment items.  */
  createEnvironments?: Maybe<Array<Maybe<Environment>>>;
  /**  Update a single Environment item by ID.  */
  updateEnvironment?: Maybe<Environment>;
  /**  Update multiple Environment items by ID.  */
  updateEnvironments?: Maybe<Array<Maybe<Environment>>>;
  /**  Delete a single Environment item by ID.  */
  deleteEnvironment?: Maybe<Environment>;
  /**  Delete multiple Environment items by ID.  */
  deleteEnvironments?: Maybe<Array<Maybe<Environment>>>;
  /**  Create a single Gateway item.  */
  createGateway?: Maybe<Gateway>;
  /**  Create multiple Gateway items.  */
  createGateways?: Maybe<Array<Maybe<Gateway>>>;
  /**  Update a single Gateway item by ID.  */
  updateGateway?: Maybe<Gateway>;
  /**  Update multiple Gateway items by ID.  */
  updateGateways?: Maybe<Array<Maybe<Gateway>>>;
  /**  Delete a single Gateway item by ID.  */
  deleteGateway?: Maybe<Gateway>;
  /**  Delete multiple Gateway items by ID.  */
  deleteGateways?: Maybe<Array<Maybe<Gateway>>>;
  /**  Create a single Group item.  */
  createGroup?: Maybe<Group>;
  /**  Create multiple Group items.  */
  createGroups?: Maybe<Array<Maybe<Group>>>;
  /**  Update a single Group item by ID.  */
  updateGroup?: Maybe<Group>;
  /**  Update multiple Group items by ID.  */
  updateGroups?: Maybe<Array<Maybe<Group>>>;
  /**  Delete a single Group item by ID.  */
  deleteGroup?: Maybe<Group>;
  /**  Delete multiple Group items by ID.  */
  deleteGroups?: Maybe<Array<Maybe<Group>>>;
  /**  Create a single Organization item.  */
  createOrganization?: Maybe<Organization>;
  /**  Create multiple Organization items.  */
  createOrganizations?: Maybe<Array<Maybe<Organization>>>;
  /**  Update a single Organization item by ID.  */
  updateOrganization?: Maybe<Organization>;
  /**  Update multiple Organization items by ID.  */
  updateOrganizations?: Maybe<Array<Maybe<Organization>>>;
  /**  Delete a single Organization item by ID.  */
  deleteOrganization?: Maybe<Organization>;
  /**  Delete multiple Organization items by ID.  */
  deleteOrganizations?: Maybe<Array<Maybe<Organization>>>;
  /**  Create a single OrganizationUnit item.  */
  createOrganizationUnit?: Maybe<OrganizationUnit>;
  /**  Create multiple OrganizationUnit items.  */
  createOrganizationUnits?: Maybe<Array<Maybe<OrganizationUnit>>>;
  /**  Update a single OrganizationUnit item by ID.  */
  updateOrganizationUnit?: Maybe<OrganizationUnit>;
  /**  Update multiple OrganizationUnit items by ID.  */
  updateOrganizationUnits?: Maybe<Array<Maybe<OrganizationUnit>>>;
  /**  Delete a single OrganizationUnit item by ID.  */
  deleteOrganizationUnit?: Maybe<OrganizationUnit>;
  /**  Delete multiple OrganizationUnit items by ID.  */
  deleteOrganizationUnits?: Maybe<Array<Maybe<OrganizationUnit>>>;
  /**  Create a single Package item.  */
  createPackage?: Maybe<Package>;
  /**  Create multiple Package items.  */
  createPackages?: Maybe<Array<Maybe<Package>>>;
  /**  Update a single Package item by ID.  */
  updatePackage?: Maybe<Package>;
  /**  Update multiple Package items by ID.  */
  updatePackages?: Maybe<Array<Maybe<Package>>>;
  /**  Delete a single Package item by ID.  */
  deletePackage?: Maybe<Package>;
  /**  Delete multiple Package items by ID.  */
  deletePackages?: Maybe<Array<Maybe<Package>>>;
  /**  Create a single Plugin item.  */
  createPlugin?: Maybe<Plugin>;
  /**  Create multiple Plugin items.  */
  createPlugins?: Maybe<Array<Maybe<Plugin>>>;
  /**  Update a single Plugin item by ID.  */
  updatePlugin?: Maybe<Plugin>;
  /**  Update multiple Plugin items by ID.  */
  updatePlugins?: Maybe<Array<Maybe<Plugin>>>;
  /**  Delete a single Plugin item by ID.  */
  deletePlugin?: Maybe<Plugin>;
  /**  Delete multiple Plugin items by ID.  */
  deletePlugins?: Maybe<Array<Maybe<Plugin>>>;
  /**  Create a single ServiceRoute item.  */
  createServiceRoute?: Maybe<ServiceRoute>;
  /**  Create multiple ServiceRoute items.  */
  createServiceRoutes?: Maybe<Array<Maybe<ServiceRoute>>>;
  /**  Update a single ServiceRoute item by ID.  */
  updateServiceRoute?: Maybe<ServiceRoute>;
  /**  Update multiple ServiceRoute items by ID.  */
  updateServiceRoutes?: Maybe<Array<Maybe<ServiceRoute>>>;
  /**  Delete a single ServiceRoute item by ID.  */
  deleteServiceRoute?: Maybe<ServiceRoute>;
  /**  Delete multiple ServiceRoute items by ID.  */
  deleteServiceRoutes?: Maybe<Array<Maybe<ServiceRoute>>>;
  /**  Create a single TemporaryIdentity item.  */
  createTemporaryIdentity?: Maybe<TemporaryIdentity>;
  /**  Create multiple TemporaryIdentity items.  */
  createTemporaryIdentities?: Maybe<Array<Maybe<TemporaryIdentity>>>;
  /**  Update a single TemporaryIdentity item by ID.  */
  updateTemporaryIdentity?: Maybe<TemporaryIdentity>;
  /**  Update multiple TemporaryIdentity items by ID.  */
  updateTemporaryIdentities?: Maybe<Array<Maybe<TemporaryIdentity>>>;
  /**  Delete a single TemporaryIdentity item by ID.  */
  deleteTemporaryIdentity?: Maybe<TemporaryIdentity>;
  /**  Delete multiple TemporaryIdentity items by ID.  */
  deleteTemporaryIdentities?: Maybe<Array<Maybe<TemporaryIdentity>>>;
  /**  Create a single Todo item.  */
  createTodo?: Maybe<Todo>;
  /**  Create multiple Todo items.  */
  createTodos?: Maybe<Array<Maybe<Todo>>>;
  /**  Update a single Todo item by ID.  */
  updateTodo?: Maybe<Todo>;
  /**  Update multiple Todo items by ID.  */
  updateTodos?: Maybe<Array<Maybe<Todo>>>;
  /**  Delete a single Todo item by ID.  */
  deleteTodo?: Maybe<Todo>;
  /**  Delete multiple Todo items by ID.  */
  deleteTodos?: Maybe<Array<Maybe<Todo>>>;
  /**  Create a single User item.  */
  createUser?: Maybe<User>;
  /**  Create multiple User items.  */
  createUsers?: Maybe<Array<Maybe<User>>>;
  /**  Update a single User item by ID.  */
  updateUser?: Maybe<User>;
  /**  Update multiple User items by ID.  */
  updateUsers?: Maybe<Array<Maybe<User>>>;
  /**  Delete a single User item by ID.  */
  deleteUser?: Maybe<User>;
  /**  Delete multiple User items by ID.  */
  deleteUsers?: Maybe<Array<Maybe<User>>>;
  /**  Authenticate and generate a token for a User with the Password Authentication Strategy.  */
  authenticateUserWithPassword?: Maybe<AuthenticateUserOutput>;
  unauthenticateUser?: Maybe<UnauthenticateUserOutput>;
  updateAuthenticatedUser?: Maybe<User>;
};


export type MutationCreateAccessRequestArgs = {
  data?: Maybe<AccessRequestCreateInput>;
};


export type MutationCreateAccessRequestsArgs = {
  data?: Maybe<Array<Maybe<AccessRequestsCreateInput>>>;
};


export type MutationUpdateAccessRequestArgs = {
  id: Scalars['ID'];
  data?: Maybe<AccessRequestUpdateInput>;
};


export type MutationUpdateAccessRequestsArgs = {
  data?: Maybe<Array<Maybe<AccessRequestsUpdateInput>>>;
};


export type MutationDeleteAccessRequestArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteAccessRequestsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateActivityArgs = {
  data?: Maybe<ActivityCreateInput>;
};


export type MutationCreateActivitiesArgs = {
  data?: Maybe<Array<Maybe<ActivitiesCreateInput>>>;
};


export type MutationUpdateActivityArgs = {
  id: Scalars['ID'];
  data?: Maybe<ActivityUpdateInput>;
};


export type MutationUpdateActivitiesArgs = {
  data?: Maybe<Array<Maybe<ActivitiesUpdateInput>>>;
};


export type MutationDeleteActivityArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteActivitiesArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateApplicationArgs = {
  data?: Maybe<ApplicationCreateInput>;
};


export type MutationCreateApplicationsArgs = {
  data?: Maybe<Array<Maybe<ApplicationsCreateInput>>>;
};


export type MutationUpdateApplicationArgs = {
  id: Scalars['ID'];
  data?: Maybe<ApplicationUpdateInput>;
};


export type MutationUpdateApplicationsArgs = {
  data?: Maybe<Array<Maybe<ApplicationsUpdateInput>>>;
};


export type MutationDeleteApplicationArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteApplicationsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateConsumerArgs = {
  data?: Maybe<ConsumerCreateInput>;
};


export type MutationCreateConsumersArgs = {
  data?: Maybe<Array<Maybe<ConsumersCreateInput>>>;
};


export type MutationUpdateConsumerArgs = {
  id: Scalars['ID'];
  data?: Maybe<ConsumerUpdateInput>;
};


export type MutationUpdateConsumersArgs = {
  data?: Maybe<Array<Maybe<ConsumersUpdateInput>>>;
};


export type MutationDeleteConsumerArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteConsumersArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateContentArgs = {
  data?: Maybe<ContentCreateInput>;
};


export type MutationCreateContentsArgs = {
  data?: Maybe<Array<Maybe<ContentsCreateInput>>>;
};


export type MutationUpdateContentArgs = {
  id: Scalars['ID'];
  data?: Maybe<ContentUpdateInput>;
};


export type MutationUpdateContentsArgs = {
  data?: Maybe<Array<Maybe<ContentsUpdateInput>>>;
};


export type MutationDeleteContentArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteContentsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateCredentialIssuerArgs = {
  data?: Maybe<CredentialIssuerCreateInput>;
};


export type MutationCreateCredentialIssuersArgs = {
  data?: Maybe<Array<Maybe<CredentialIssuersCreateInput>>>;
};


export type MutationUpdateCredentialIssuerArgs = {
  id: Scalars['ID'];
  data?: Maybe<CredentialIssuerUpdateInput>;
};


export type MutationUpdateCredentialIssuersArgs = {
  data?: Maybe<Array<Maybe<CredentialIssuersUpdateInput>>>;
};


export type MutationDeleteCredentialIssuerArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteCredentialIssuersArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateDatasetArgs = {
  data?: Maybe<DatasetCreateInput>;
};


export type MutationCreateDatasetsArgs = {
  data?: Maybe<Array<Maybe<DatasetsCreateInput>>>;
};


export type MutationUpdateDatasetArgs = {
  id: Scalars['ID'];
  data?: Maybe<DatasetUpdateInput>;
};


export type MutationUpdateDatasetsArgs = {
  data?: Maybe<Array<Maybe<DatasetsUpdateInput>>>;
};


export type MutationDeleteDatasetArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteDatasetsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateEnvironmentArgs = {
  data?: Maybe<EnvironmentCreateInput>;
};


export type MutationCreateEnvironmentsArgs = {
  data?: Maybe<Array<Maybe<EnvironmentsCreateInput>>>;
};


export type MutationUpdateEnvironmentArgs = {
  id: Scalars['ID'];
  data?: Maybe<EnvironmentUpdateInput>;
};


export type MutationUpdateEnvironmentsArgs = {
  data?: Maybe<Array<Maybe<EnvironmentsUpdateInput>>>;
};


export type MutationDeleteEnvironmentArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteEnvironmentsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateGatewayArgs = {
  data?: Maybe<GatewayCreateInput>;
};


export type MutationCreateGatewaysArgs = {
  data?: Maybe<Array<Maybe<GatewaysCreateInput>>>;
};


export type MutationUpdateGatewayArgs = {
  id: Scalars['ID'];
  data?: Maybe<GatewayUpdateInput>;
};


export type MutationUpdateGatewaysArgs = {
  data?: Maybe<Array<Maybe<GatewaysUpdateInput>>>;
};


export type MutationDeleteGatewayArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteGatewaysArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateGroupArgs = {
  data?: Maybe<GroupCreateInput>;
};


export type MutationCreateGroupsArgs = {
  data?: Maybe<Array<Maybe<GroupsCreateInput>>>;
};


export type MutationUpdateGroupArgs = {
  id: Scalars['ID'];
  data?: Maybe<GroupUpdateInput>;
};


export type MutationUpdateGroupsArgs = {
  data?: Maybe<Array<Maybe<GroupsUpdateInput>>>;
};


export type MutationDeleteGroupArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteGroupsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateOrganizationArgs = {
  data?: Maybe<OrganizationCreateInput>;
};


export type MutationCreateOrganizationsArgs = {
  data?: Maybe<Array<Maybe<OrganizationsCreateInput>>>;
};


export type MutationUpdateOrganizationArgs = {
  id: Scalars['ID'];
  data?: Maybe<OrganizationUpdateInput>;
};


export type MutationUpdateOrganizationsArgs = {
  data?: Maybe<Array<Maybe<OrganizationsUpdateInput>>>;
};


export type MutationDeleteOrganizationArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteOrganizationsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateOrganizationUnitArgs = {
  data?: Maybe<OrganizationUnitCreateInput>;
};


export type MutationCreateOrganizationUnitsArgs = {
  data?: Maybe<Array<Maybe<OrganizationUnitsCreateInput>>>;
};


export type MutationUpdateOrganizationUnitArgs = {
  id: Scalars['ID'];
  data?: Maybe<OrganizationUnitUpdateInput>;
};


export type MutationUpdateOrganizationUnitsArgs = {
  data?: Maybe<Array<Maybe<OrganizationUnitsUpdateInput>>>;
};


export type MutationDeleteOrganizationUnitArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteOrganizationUnitsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreatePackageArgs = {
  data?: Maybe<PackageCreateInput>;
};


export type MutationCreatePackagesArgs = {
  data?: Maybe<Array<Maybe<PackagesCreateInput>>>;
};


export type MutationUpdatePackageArgs = {
  id: Scalars['ID'];
  data?: Maybe<PackageUpdateInput>;
};


export type MutationUpdatePackagesArgs = {
  data?: Maybe<Array<Maybe<PackagesUpdateInput>>>;
};


export type MutationDeletePackageArgs = {
  id: Scalars['ID'];
};


export type MutationDeletePackagesArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreatePluginArgs = {
  data?: Maybe<PluginCreateInput>;
};


export type MutationCreatePluginsArgs = {
  data?: Maybe<Array<Maybe<PluginsCreateInput>>>;
};


export type MutationUpdatePluginArgs = {
  id: Scalars['ID'];
  data?: Maybe<PluginUpdateInput>;
};


export type MutationUpdatePluginsArgs = {
  data?: Maybe<Array<Maybe<PluginsUpdateInput>>>;
};


export type MutationDeletePluginArgs = {
  id: Scalars['ID'];
};


export type MutationDeletePluginsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateServiceRouteArgs = {
  data?: Maybe<ServiceRouteCreateInput>;
};


export type MutationCreateServiceRoutesArgs = {
  data?: Maybe<Array<Maybe<ServiceRoutesCreateInput>>>;
};


export type MutationUpdateServiceRouteArgs = {
  id: Scalars['ID'];
  data?: Maybe<ServiceRouteUpdateInput>;
};


export type MutationUpdateServiceRoutesArgs = {
  data?: Maybe<Array<Maybe<ServiceRoutesUpdateInput>>>;
};


export type MutationDeleteServiceRouteArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteServiceRoutesArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateTemporaryIdentityArgs = {
  data?: Maybe<TemporaryIdentityCreateInput>;
};


export type MutationCreateTemporaryIdentitiesArgs = {
  data?: Maybe<Array<Maybe<TemporaryIdentitiesCreateInput>>>;
};


export type MutationUpdateTemporaryIdentityArgs = {
  id: Scalars['ID'];
  data?: Maybe<TemporaryIdentityUpdateInput>;
};


export type MutationUpdateTemporaryIdentitiesArgs = {
  data?: Maybe<Array<Maybe<TemporaryIdentitiesUpdateInput>>>;
};


export type MutationDeleteTemporaryIdentityArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteTemporaryIdentitiesArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateTodoArgs = {
  data?: Maybe<TodoCreateInput>;
};


export type MutationCreateTodosArgs = {
  data?: Maybe<Array<Maybe<TodosCreateInput>>>;
};


export type MutationUpdateTodoArgs = {
  id: Scalars['ID'];
  data?: Maybe<TodoUpdateInput>;
};


export type MutationUpdateTodosArgs = {
  data?: Maybe<Array<Maybe<TodosUpdateInput>>>;
};


export type MutationDeleteTodoArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteTodosArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateUserArgs = {
  data?: Maybe<UserCreateInput>;
};


export type MutationCreateUsersArgs = {
  data?: Maybe<Array<Maybe<UsersCreateInput>>>;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID'];
  data?: Maybe<UserUpdateInput>;
};


export type MutationUpdateUsersArgs = {
  data?: Maybe<Array<Maybe<UsersUpdateInput>>>;
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteUsersArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationAuthenticateUserWithPasswordArgs = {
  email?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
};


export type MutationUpdateAuthenticatedUserArgs = {
  data?: Maybe<UserUpdateInput>;
};


export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}
