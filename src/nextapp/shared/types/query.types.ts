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

export type EnvironmentRelateToOneInput = {
  create?: Maybe<EnvironmentCreateInput>;
  connect?: Maybe<EnvironmentWhereUniqueInput>;
  disconnect?: Maybe<EnvironmentWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type ServiceAccessRelateToOneInput = {
  create?: Maybe<ServiceAccessCreateInput>;
  connect?: Maybe<ServiceAccessWhereUniqueInput>;
  disconnect?: Maybe<ServiceAccessWhereUniqueInput>;
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
  credential?: Maybe<Scalars['String']>;
  controls?: Maybe<Scalars['String']>;
  additionalDetails?: Maybe<Scalars['String']>;
  requestor?: Maybe<User>;
  application?: Maybe<Application>;
  productEnvironment?: Maybe<Environment>;
  serviceAccess?: Maybe<ServiceAccess>;
  updatedBy?: Maybe<User>;
  createdBy?: Maybe<User>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
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
  controls?: Maybe<Scalars['String']>;
  controls_not?: Maybe<Scalars['String']>;
  controls_contains?: Maybe<Scalars['String']>;
  controls_not_contains?: Maybe<Scalars['String']>;
  controls_starts_with?: Maybe<Scalars['String']>;
  controls_not_starts_with?: Maybe<Scalars['String']>;
  controls_ends_with?: Maybe<Scalars['String']>;
  controls_not_ends_with?: Maybe<Scalars['String']>;
  controls_i?: Maybe<Scalars['String']>;
  controls_not_i?: Maybe<Scalars['String']>;
  controls_contains_i?: Maybe<Scalars['String']>;
  controls_not_contains_i?: Maybe<Scalars['String']>;
  controls_starts_with_i?: Maybe<Scalars['String']>;
  controls_not_starts_with_i?: Maybe<Scalars['String']>;
  controls_ends_with_i?: Maybe<Scalars['String']>;
  controls_not_ends_with_i?: Maybe<Scalars['String']>;
  controls_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  controls_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  additionalDetails?: Maybe<Scalars['String']>;
  additionalDetails_not?: Maybe<Scalars['String']>;
  additionalDetails_contains?: Maybe<Scalars['String']>;
  additionalDetails_not_contains?: Maybe<Scalars['String']>;
  additionalDetails_starts_with?: Maybe<Scalars['String']>;
  additionalDetails_not_starts_with?: Maybe<Scalars['String']>;
  additionalDetails_ends_with?: Maybe<Scalars['String']>;
  additionalDetails_not_ends_with?: Maybe<Scalars['String']>;
  additionalDetails_i?: Maybe<Scalars['String']>;
  additionalDetails_not_i?: Maybe<Scalars['String']>;
  additionalDetails_contains_i?: Maybe<Scalars['String']>;
  additionalDetails_not_contains_i?: Maybe<Scalars['String']>;
  additionalDetails_starts_with_i?: Maybe<Scalars['String']>;
  additionalDetails_not_starts_with_i?: Maybe<Scalars['String']>;
  additionalDetails_ends_with_i?: Maybe<Scalars['String']>;
  additionalDetails_not_ends_with_i?: Maybe<Scalars['String']>;
  additionalDetails_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  additionalDetails_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  requestor?: Maybe<UserWhereInput>;
  requestor_is_null?: Maybe<Scalars['Boolean']>;
  application?: Maybe<ApplicationWhereInput>;
  application_is_null?: Maybe<Scalars['Boolean']>;
  productEnvironment?: Maybe<EnvironmentWhereInput>;
  productEnvironment_is_null?: Maybe<Scalars['Boolean']>;
  serviceAccess?: Maybe<ServiceAccessWhereInput>;
  serviceAccess_is_null?: Maybe<Scalars['Boolean']>;
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
  CredentialAsc = 'credential_ASC',
  CredentialDesc = 'credential_DESC',
  ControlsAsc = 'controls_ASC',
  ControlsDesc = 'controls_DESC',
  AdditionalDetailsAsc = 'additionalDetails_ASC',
  AdditionalDetailsDesc = 'additionalDetails_DESC',
  RequestorAsc = 'requestor_ASC',
  RequestorDesc = 'requestor_DESC',
  ApplicationAsc = 'application_ASC',
  ApplicationDesc = 'application_DESC',
  ProductEnvironmentAsc = 'productEnvironment_ASC',
  ProductEnvironmentDesc = 'productEnvironment_DESC',
  ServiceAccessAsc = 'serviceAccess_ASC',
  ServiceAccessDesc = 'serviceAccess_DESC',
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
  credential?: Maybe<Scalars['String']>;
  controls?: Maybe<Scalars['String']>;
  additionalDetails?: Maybe<Scalars['String']>;
  requestor?: Maybe<UserRelateToOneInput>;
  application?: Maybe<ApplicationRelateToOneInput>;
  productEnvironment?: Maybe<EnvironmentRelateToOneInput>;
  serviceAccess?: Maybe<ServiceAccessRelateToOneInput>;
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
  credential?: Maybe<Scalars['String']>;
  controls?: Maybe<Scalars['String']>;
  additionalDetails?: Maybe<Scalars['String']>;
  requestor?: Maybe<UserRelateToOneInput>;
  application?: Maybe<ApplicationRelateToOneInput>;
  productEnvironment?: Maybe<EnvironmentRelateToOneInput>;
  serviceAccess?: Maybe<ServiceAccessRelateToOneInput>;
};

export type AccessRequestsCreateInput = {
  data?: Maybe<AccessRequestCreateInput>;
};

export type BlobRelateToOneInput = {
  create?: Maybe<BlobCreateInput>;
  connect?: Maybe<BlobWhereUniqueInput>;
  disconnect?: Maybe<BlobWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
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
  extRefId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  action?: Maybe<Scalars['String']>;
  result?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
  context?: Maybe<Scalars['String']>;
  refId?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  actor?: Maybe<User>;
  blob?: Maybe<Blob>;
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
  extRefId?: Maybe<Scalars['String']>;
  extRefId_not?: Maybe<Scalars['String']>;
  extRefId_contains?: Maybe<Scalars['String']>;
  extRefId_not_contains?: Maybe<Scalars['String']>;
  extRefId_starts_with?: Maybe<Scalars['String']>;
  extRefId_not_starts_with?: Maybe<Scalars['String']>;
  extRefId_ends_with?: Maybe<Scalars['String']>;
  extRefId_not_ends_with?: Maybe<Scalars['String']>;
  extRefId_i?: Maybe<Scalars['String']>;
  extRefId_not_i?: Maybe<Scalars['String']>;
  extRefId_contains_i?: Maybe<Scalars['String']>;
  extRefId_not_contains_i?: Maybe<Scalars['String']>;
  extRefId_starts_with_i?: Maybe<Scalars['String']>;
  extRefId_not_starts_with_i?: Maybe<Scalars['String']>;
  extRefId_ends_with_i?: Maybe<Scalars['String']>;
  extRefId_not_ends_with_i?: Maybe<Scalars['String']>;
  extRefId_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRefId_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  result?: Maybe<Scalars['String']>;
  result_not?: Maybe<Scalars['String']>;
  result_contains?: Maybe<Scalars['String']>;
  result_not_contains?: Maybe<Scalars['String']>;
  result_starts_with?: Maybe<Scalars['String']>;
  result_not_starts_with?: Maybe<Scalars['String']>;
  result_ends_with?: Maybe<Scalars['String']>;
  result_not_ends_with?: Maybe<Scalars['String']>;
  result_i?: Maybe<Scalars['String']>;
  result_not_i?: Maybe<Scalars['String']>;
  result_contains_i?: Maybe<Scalars['String']>;
  result_not_contains_i?: Maybe<Scalars['String']>;
  result_starts_with_i?: Maybe<Scalars['String']>;
  result_not_starts_with_i?: Maybe<Scalars['String']>;
  result_ends_with_i?: Maybe<Scalars['String']>;
  result_not_ends_with_i?: Maybe<Scalars['String']>;
  result_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  result_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  context?: Maybe<Scalars['String']>;
  context_not?: Maybe<Scalars['String']>;
  context_contains?: Maybe<Scalars['String']>;
  context_not_contains?: Maybe<Scalars['String']>;
  context_starts_with?: Maybe<Scalars['String']>;
  context_not_starts_with?: Maybe<Scalars['String']>;
  context_ends_with?: Maybe<Scalars['String']>;
  context_not_ends_with?: Maybe<Scalars['String']>;
  context_i?: Maybe<Scalars['String']>;
  context_not_i?: Maybe<Scalars['String']>;
  context_contains_i?: Maybe<Scalars['String']>;
  context_not_contains_i?: Maybe<Scalars['String']>;
  context_starts_with_i?: Maybe<Scalars['String']>;
  context_not_starts_with_i?: Maybe<Scalars['String']>;
  context_ends_with_i?: Maybe<Scalars['String']>;
  context_not_ends_with_i?: Maybe<Scalars['String']>;
  context_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  context_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  actor?: Maybe<UserWhereInput>;
  actor_is_null?: Maybe<Scalars['Boolean']>;
  blob?: Maybe<BlobWhereInput>;
  blob_is_null?: Maybe<Scalars['Boolean']>;
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
  ExtRefIdAsc = 'extRefId_ASC',
  ExtRefIdDesc = 'extRefId_DESC',
  TypeAsc = 'type_ASC',
  TypeDesc = 'type_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  ActionAsc = 'action_ASC',
  ActionDesc = 'action_DESC',
  ResultAsc = 'result_ASC',
  ResultDesc = 'result_DESC',
  MessageAsc = 'message_ASC',
  MessageDesc = 'message_DESC',
  ContextAsc = 'context_ASC',
  ContextDesc = 'context_DESC',
  RefIdAsc = 'refId_ASC',
  RefIdDesc = 'refId_DESC',
  NamespaceAsc = 'namespace_ASC',
  NamespaceDesc = 'namespace_DESC',
  ActorAsc = 'actor_ASC',
  ActorDesc = 'actor_DESC',
  BlobAsc = 'blob_ASC',
  BlobDesc = 'blob_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type ActivityUpdateInput = {
  extRefId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  action?: Maybe<Scalars['String']>;
  result?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
  context?: Maybe<Scalars['String']>;
  refId?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  actor?: Maybe<UserRelateToOneInput>;
  blob?: Maybe<BlobRelateToOneInput>;
};

export type ActivitiesUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<ActivityUpdateInput>;
};

export type ActivityCreateInput = {
  extRefId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  action?: Maybe<Scalars['String']>;
  result?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
  context?: Maybe<Scalars['String']>;
  refId?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  actor?: Maybe<UserRelateToOneInput>;
  blob?: Maybe<BlobRelateToOneInput>;
};

export type ActivitiesCreateInput = {
  data?: Maybe<ActivityCreateInput>;
};

export type GatewayServiceRelateToOneInput = {
  create?: Maybe<GatewayServiceCreateInput>;
  connect?: Maybe<GatewayServiceWhereUniqueInput>;
  disconnect?: Maybe<GatewayServiceWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

/**  A keystone list  */
export type Alert = {
  __typename?: 'Alert';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Alert List config, or
   *  2. As an alias to the field set on 'labelField' in the Alert List config, or
   *  3. As an alias to a 'name' field on the Alert List (if one exists), or
   *  4. As an alias to the 'id' field on the Alert List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  service?: Maybe<GatewayService>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type AlertWhereInput = {
  AND?: Maybe<Array<Maybe<AlertWhereInput>>>;
  OR?: Maybe<Array<Maybe<AlertWhereInput>>>;
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
  state?: Maybe<Scalars['String']>;
  state_not?: Maybe<Scalars['String']>;
  state_contains?: Maybe<Scalars['String']>;
  state_not_contains?: Maybe<Scalars['String']>;
  state_starts_with?: Maybe<Scalars['String']>;
  state_not_starts_with?: Maybe<Scalars['String']>;
  state_ends_with?: Maybe<Scalars['String']>;
  state_not_ends_with?: Maybe<Scalars['String']>;
  state_i?: Maybe<Scalars['String']>;
  state_not_i?: Maybe<Scalars['String']>;
  state_contains_i?: Maybe<Scalars['String']>;
  state_not_contains_i?: Maybe<Scalars['String']>;
  state_starts_with_i?: Maybe<Scalars['String']>;
  state_not_starts_with_i?: Maybe<Scalars['String']>;
  state_ends_with_i?: Maybe<Scalars['String']>;
  state_not_ends_with_i?: Maybe<Scalars['String']>;
  state_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  state_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  service?: Maybe<GatewayServiceWhereInput>;
  service_is_null?: Maybe<Scalars['Boolean']>;
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

export type AlertWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortAlertsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  StateAsc = 'state_ASC',
  StateDesc = 'state_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  ServiceAsc = 'service_ASC',
  ServiceDesc = 'service_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type AlertUpdateInput = {
  name?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  service?: Maybe<GatewayServiceRelateToOneInput>;
};

export type AlertsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<AlertUpdateInput>;
};

export type AlertCreateInput = {
  name?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  service?: Maybe<GatewayServiceRelateToOneInput>;
};

export type AlertsCreateInput = {
  data?: Maybe<AlertCreateInput>;
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
  certificate?: Maybe<Scalars['String']>;
  organization?: Maybe<Organization>;
  organizationUnit?: Maybe<OrganizationUnit>;
  owner?: Maybe<User>;
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
  certificate?: Maybe<Scalars['String']>;
  certificate_not?: Maybe<Scalars['String']>;
  certificate_contains?: Maybe<Scalars['String']>;
  certificate_not_contains?: Maybe<Scalars['String']>;
  certificate_starts_with?: Maybe<Scalars['String']>;
  certificate_not_starts_with?: Maybe<Scalars['String']>;
  certificate_ends_with?: Maybe<Scalars['String']>;
  certificate_not_ends_with?: Maybe<Scalars['String']>;
  certificate_i?: Maybe<Scalars['String']>;
  certificate_not_i?: Maybe<Scalars['String']>;
  certificate_contains_i?: Maybe<Scalars['String']>;
  certificate_not_contains_i?: Maybe<Scalars['String']>;
  certificate_starts_with_i?: Maybe<Scalars['String']>;
  certificate_not_starts_with_i?: Maybe<Scalars['String']>;
  certificate_ends_with_i?: Maybe<Scalars['String']>;
  certificate_not_ends_with_i?: Maybe<Scalars['String']>;
  certificate_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  certificate_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  organization?: Maybe<OrganizationWhereInput>;
  organization_is_null?: Maybe<Scalars['Boolean']>;
  organizationUnit?: Maybe<OrganizationUnitWhereInput>;
  organizationUnit_is_null?: Maybe<Scalars['Boolean']>;
  owner?: Maybe<UserWhereInput>;
  owner_is_null?: Maybe<Scalars['Boolean']>;
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
  CertificateAsc = 'certificate_ASC',
  CertificateDesc = 'certificate_DESC',
  OrganizationAsc = 'organization_ASC',
  OrganizationDesc = 'organization_DESC',
  OrganizationUnitAsc = 'organizationUnit_ASC',
  OrganizationUnitDesc = 'organizationUnit_DESC',
  OwnerAsc = 'owner_ASC',
  OwnerDesc = 'owner_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type ApplicationUpdateInput = {
  appId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  certificate?: Maybe<Scalars['String']>;
  organization?: Maybe<OrganizationRelateToOneInput>;
  organizationUnit?: Maybe<OrganizationUnitRelateToOneInput>;
};

export type ApplicationsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<ApplicationUpdateInput>;
};

export type ApplicationCreateInput = {
  appId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  certificate?: Maybe<Scalars['String']>;
  organization?: Maybe<OrganizationRelateToOneInput>;
  organizationUnit?: Maybe<OrganizationUnitRelateToOneInput>;
  owner?: Maybe<UserRelateToOneInput>;
};

export type ApplicationsCreateInput = {
  data?: Maybe<ApplicationCreateInput>;
};

/**  A keystone list  */
export type Blob = {
  __typename?: 'Blob';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Blob List config, or
   *  2. As an alias to the field set on 'labelField' in the Blob List config, or
   *  3. As an alias to a 'name' field on the Blob List (if one exists), or
   *  4. As an alias to the 'id' field on the Blob List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  ref?: Maybe<Scalars['String']>;
  blob?: Maybe<Scalars['String']>;
};

export type BlobWhereInput = {
  AND?: Maybe<Array<Maybe<BlobWhereInput>>>;
  OR?: Maybe<Array<Maybe<BlobWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  ref?: Maybe<Scalars['String']>;
  ref_not?: Maybe<Scalars['String']>;
  ref_contains?: Maybe<Scalars['String']>;
  ref_not_contains?: Maybe<Scalars['String']>;
  ref_starts_with?: Maybe<Scalars['String']>;
  ref_not_starts_with?: Maybe<Scalars['String']>;
  ref_ends_with?: Maybe<Scalars['String']>;
  ref_not_ends_with?: Maybe<Scalars['String']>;
  ref_i?: Maybe<Scalars['String']>;
  ref_not_i?: Maybe<Scalars['String']>;
  ref_contains_i?: Maybe<Scalars['String']>;
  ref_not_contains_i?: Maybe<Scalars['String']>;
  ref_starts_with_i?: Maybe<Scalars['String']>;
  ref_not_starts_with_i?: Maybe<Scalars['String']>;
  ref_ends_with_i?: Maybe<Scalars['String']>;
  ref_not_ends_with_i?: Maybe<Scalars['String']>;
  ref_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  ref_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  blob?: Maybe<Scalars['String']>;
  blob_not?: Maybe<Scalars['String']>;
  blob_contains?: Maybe<Scalars['String']>;
  blob_not_contains?: Maybe<Scalars['String']>;
  blob_starts_with?: Maybe<Scalars['String']>;
  blob_not_starts_with?: Maybe<Scalars['String']>;
  blob_ends_with?: Maybe<Scalars['String']>;
  blob_not_ends_with?: Maybe<Scalars['String']>;
  blob_i?: Maybe<Scalars['String']>;
  blob_not_i?: Maybe<Scalars['String']>;
  blob_contains_i?: Maybe<Scalars['String']>;
  blob_not_contains_i?: Maybe<Scalars['String']>;
  blob_starts_with_i?: Maybe<Scalars['String']>;
  blob_not_starts_with_i?: Maybe<Scalars['String']>;
  blob_ends_with_i?: Maybe<Scalars['String']>;
  blob_not_ends_with_i?: Maybe<Scalars['String']>;
  blob_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  blob_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type BlobWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortBlobsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  RefAsc = 'ref_ASC',
  RefDesc = 'ref_DESC',
  BlobAsc = 'blob_ASC',
  BlobDesc = 'blob_DESC'
}

export type BlobUpdateInput = {
  ref?: Maybe<Scalars['String']>;
  blob?: Maybe<Scalars['String']>;
};

export type BlobsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<BlobUpdateInput>;
};

export type BlobCreateInput = {
  ref?: Maybe<Scalars['String']>;
  blob?: Maybe<Scalars['String']>;
};

export type BlobsCreateInput = {
  data?: Maybe<BlobCreateInput>;
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
  externalLink?: Maybe<Scalars['String']>;
  githubRepository?: Maybe<Scalars['String']>;
  readme?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isComplete?: Maybe<Scalars['Boolean']>;
  isPublic?: Maybe<Scalars['Boolean']>;
  publishDate?: Maybe<Scalars['DateTime']>;
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
  externalLink?: Maybe<Scalars['String']>;
  externalLink_not?: Maybe<Scalars['String']>;
  externalLink_contains?: Maybe<Scalars['String']>;
  externalLink_not_contains?: Maybe<Scalars['String']>;
  externalLink_starts_with?: Maybe<Scalars['String']>;
  externalLink_not_starts_with?: Maybe<Scalars['String']>;
  externalLink_ends_with?: Maybe<Scalars['String']>;
  externalLink_not_ends_with?: Maybe<Scalars['String']>;
  externalLink_i?: Maybe<Scalars['String']>;
  externalLink_not_i?: Maybe<Scalars['String']>;
  externalLink_contains_i?: Maybe<Scalars['String']>;
  externalLink_not_contains_i?: Maybe<Scalars['String']>;
  externalLink_starts_with_i?: Maybe<Scalars['String']>;
  externalLink_not_starts_with_i?: Maybe<Scalars['String']>;
  externalLink_ends_with_i?: Maybe<Scalars['String']>;
  externalLink_not_ends_with_i?: Maybe<Scalars['String']>;
  externalLink_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  externalLink_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  isPublic?: Maybe<Scalars['Boolean']>;
  isPublic_not?: Maybe<Scalars['Boolean']>;
  publishDate?: Maybe<Scalars['DateTime']>;
  publishDate_not?: Maybe<Scalars['DateTime']>;
  publishDate_lt?: Maybe<Scalars['DateTime']>;
  publishDate_lte?: Maybe<Scalars['DateTime']>;
  publishDate_gt?: Maybe<Scalars['DateTime']>;
  publishDate_gte?: Maybe<Scalars['DateTime']>;
  publishDate_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
  publishDate_not_in?: Maybe<Array<Maybe<Scalars['DateTime']>>>;
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
  ExternalLinkAsc = 'externalLink_ASC',
  ExternalLinkDesc = 'externalLink_DESC',
  GithubRepositoryAsc = 'githubRepository_ASC',
  GithubRepositoryDesc = 'githubRepository_DESC',
  ReadmeAsc = 'readme_ASC',
  ReadmeDesc = 'readme_DESC',
  NamespaceAsc = 'namespace_ASC',
  NamespaceDesc = 'namespace_DESC',
  TagsAsc = 'tags_ASC',
  TagsDesc = 'tags_DESC',
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  OrderAsc = 'order_ASC',
  OrderDesc = 'order_DESC',
  IsCompleteAsc = 'isComplete_ASC',
  IsCompleteDesc = 'isComplete_DESC',
  IsPublicAsc = 'isPublic_ASC',
  IsPublicDesc = 'isPublic_DESC',
  PublishDateAsc = 'publishDate_ASC',
  PublishDateDesc = 'publishDate_DESC'
}

export type ContentUpdateInput = {
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  externalLink?: Maybe<Scalars['String']>;
  githubRepository?: Maybe<Scalars['String']>;
  readme?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isComplete?: Maybe<Scalars['Boolean']>;
  isPublic?: Maybe<Scalars['Boolean']>;
  publishDate?: Maybe<Scalars['DateTime']>;
};

export type ContentsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<ContentUpdateInput>;
};

export type ContentCreateInput = {
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  externalLink?: Maybe<Scalars['String']>;
  githubRepository?: Maybe<Scalars['String']>;
  readme?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isComplete?: Maybe<Scalars['Boolean']>;
  isPublic?: Maybe<Scalars['Boolean']>;
  publishDate?: Maybe<Scalars['DateTime']>;
};

export type ContentsCreateInput = {
  data?: Maybe<ContentCreateInput>;
};

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
  namespace?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  flow?: Maybe<Scalars['String']>;
  clientRegistration?: Maybe<Scalars['String']>;
  mode?: Maybe<Scalars['String']>;
  clientAuthenticator?: Maybe<Scalars['String']>;
  authPlugin?: Maybe<Scalars['String']>;
  instruction?: Maybe<Scalars['String']>;
  environmentDetails?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl?: Maybe<Scalars['String']>;
  initialAccessToken?: Maybe<Scalars['String']>;
  clientId?: Maybe<Scalars['String']>;
  clientSecret?: Maybe<Scalars['String']>;
  availableScopes?: Maybe<Scalars['String']>;
  clientRoles?: Maybe<Scalars['String']>;
  resourceScopes?: Maybe<Scalars['String']>;
  resourceType?: Maybe<Scalars['String']>;
  resourceAccessScope?: Maybe<Scalars['String']>;
  apiKeyName?: Maybe<Scalars['String']>;
  owner?: Maybe<User>;
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
  flow?: Maybe<Scalars['String']>;
  flow_not?: Maybe<Scalars['String']>;
  flow_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  flow_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientRegistration?: Maybe<Scalars['String']>;
  clientRegistration_not?: Maybe<Scalars['String']>;
  clientRegistration_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientRegistration_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  mode?: Maybe<Scalars['String']>;
  mode_not?: Maybe<Scalars['String']>;
  mode_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  mode_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientAuthenticator?: Maybe<Scalars['String']>;
  clientAuthenticator_not?: Maybe<Scalars['String']>;
  clientAuthenticator_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientAuthenticator_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  authPlugin?: Maybe<Scalars['String']>;
  authPlugin_not?: Maybe<Scalars['String']>;
  authPlugin_contains?: Maybe<Scalars['String']>;
  authPlugin_not_contains?: Maybe<Scalars['String']>;
  authPlugin_starts_with?: Maybe<Scalars['String']>;
  authPlugin_not_starts_with?: Maybe<Scalars['String']>;
  authPlugin_ends_with?: Maybe<Scalars['String']>;
  authPlugin_not_ends_with?: Maybe<Scalars['String']>;
  authPlugin_i?: Maybe<Scalars['String']>;
  authPlugin_not_i?: Maybe<Scalars['String']>;
  authPlugin_contains_i?: Maybe<Scalars['String']>;
  authPlugin_not_contains_i?: Maybe<Scalars['String']>;
  authPlugin_starts_with_i?: Maybe<Scalars['String']>;
  authPlugin_not_starts_with_i?: Maybe<Scalars['String']>;
  authPlugin_ends_with_i?: Maybe<Scalars['String']>;
  authPlugin_not_ends_with_i?: Maybe<Scalars['String']>;
  authPlugin_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  authPlugin_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  instruction?: Maybe<Scalars['String']>;
  instruction_not?: Maybe<Scalars['String']>;
  instruction_contains?: Maybe<Scalars['String']>;
  instruction_not_contains?: Maybe<Scalars['String']>;
  instruction_starts_with?: Maybe<Scalars['String']>;
  instruction_not_starts_with?: Maybe<Scalars['String']>;
  instruction_ends_with?: Maybe<Scalars['String']>;
  instruction_not_ends_with?: Maybe<Scalars['String']>;
  instruction_i?: Maybe<Scalars['String']>;
  instruction_not_i?: Maybe<Scalars['String']>;
  instruction_contains_i?: Maybe<Scalars['String']>;
  instruction_not_contains_i?: Maybe<Scalars['String']>;
  instruction_starts_with_i?: Maybe<Scalars['String']>;
  instruction_not_starts_with_i?: Maybe<Scalars['String']>;
  instruction_ends_with_i?: Maybe<Scalars['String']>;
  instruction_not_ends_with_i?: Maybe<Scalars['String']>;
  instruction_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  instruction_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  environmentDetails?: Maybe<Scalars['String']>;
  environmentDetails_not?: Maybe<Scalars['String']>;
  environmentDetails_contains?: Maybe<Scalars['String']>;
  environmentDetails_not_contains?: Maybe<Scalars['String']>;
  environmentDetails_starts_with?: Maybe<Scalars['String']>;
  environmentDetails_not_starts_with?: Maybe<Scalars['String']>;
  environmentDetails_ends_with?: Maybe<Scalars['String']>;
  environmentDetails_not_ends_with?: Maybe<Scalars['String']>;
  environmentDetails_i?: Maybe<Scalars['String']>;
  environmentDetails_not_i?: Maybe<Scalars['String']>;
  environmentDetails_contains_i?: Maybe<Scalars['String']>;
  environmentDetails_not_contains_i?: Maybe<Scalars['String']>;
  environmentDetails_starts_with_i?: Maybe<Scalars['String']>;
  environmentDetails_not_starts_with_i?: Maybe<Scalars['String']>;
  environmentDetails_ends_with_i?: Maybe<Scalars['String']>;
  environmentDetails_not_ends_with_i?: Maybe<Scalars['String']>;
  environmentDetails_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  environmentDetails_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  availableScopes?: Maybe<Scalars['String']>;
  availableScopes_not?: Maybe<Scalars['String']>;
  availableScopes_contains?: Maybe<Scalars['String']>;
  availableScopes_not_contains?: Maybe<Scalars['String']>;
  availableScopes_starts_with?: Maybe<Scalars['String']>;
  availableScopes_not_starts_with?: Maybe<Scalars['String']>;
  availableScopes_ends_with?: Maybe<Scalars['String']>;
  availableScopes_not_ends_with?: Maybe<Scalars['String']>;
  availableScopes_i?: Maybe<Scalars['String']>;
  availableScopes_not_i?: Maybe<Scalars['String']>;
  availableScopes_contains_i?: Maybe<Scalars['String']>;
  availableScopes_not_contains_i?: Maybe<Scalars['String']>;
  availableScopes_starts_with_i?: Maybe<Scalars['String']>;
  availableScopes_not_starts_with_i?: Maybe<Scalars['String']>;
  availableScopes_ends_with_i?: Maybe<Scalars['String']>;
  availableScopes_not_ends_with_i?: Maybe<Scalars['String']>;
  availableScopes_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  availableScopes_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientRoles?: Maybe<Scalars['String']>;
  clientRoles_not?: Maybe<Scalars['String']>;
  clientRoles_contains?: Maybe<Scalars['String']>;
  clientRoles_not_contains?: Maybe<Scalars['String']>;
  clientRoles_starts_with?: Maybe<Scalars['String']>;
  clientRoles_not_starts_with?: Maybe<Scalars['String']>;
  clientRoles_ends_with?: Maybe<Scalars['String']>;
  clientRoles_not_ends_with?: Maybe<Scalars['String']>;
  clientRoles_i?: Maybe<Scalars['String']>;
  clientRoles_not_i?: Maybe<Scalars['String']>;
  clientRoles_contains_i?: Maybe<Scalars['String']>;
  clientRoles_not_contains_i?: Maybe<Scalars['String']>;
  clientRoles_starts_with_i?: Maybe<Scalars['String']>;
  clientRoles_not_starts_with_i?: Maybe<Scalars['String']>;
  clientRoles_ends_with_i?: Maybe<Scalars['String']>;
  clientRoles_not_ends_with_i?: Maybe<Scalars['String']>;
  clientRoles_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientRoles_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  resourceScopes?: Maybe<Scalars['String']>;
  resourceScopes_not?: Maybe<Scalars['String']>;
  resourceScopes_contains?: Maybe<Scalars['String']>;
  resourceScopes_not_contains?: Maybe<Scalars['String']>;
  resourceScopes_starts_with?: Maybe<Scalars['String']>;
  resourceScopes_not_starts_with?: Maybe<Scalars['String']>;
  resourceScopes_ends_with?: Maybe<Scalars['String']>;
  resourceScopes_not_ends_with?: Maybe<Scalars['String']>;
  resourceScopes_i?: Maybe<Scalars['String']>;
  resourceScopes_not_i?: Maybe<Scalars['String']>;
  resourceScopes_contains_i?: Maybe<Scalars['String']>;
  resourceScopes_not_contains_i?: Maybe<Scalars['String']>;
  resourceScopes_starts_with_i?: Maybe<Scalars['String']>;
  resourceScopes_not_starts_with_i?: Maybe<Scalars['String']>;
  resourceScopes_ends_with_i?: Maybe<Scalars['String']>;
  resourceScopes_not_ends_with_i?: Maybe<Scalars['String']>;
  resourceScopes_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  resourceScopes_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  resourceType?: Maybe<Scalars['String']>;
  resourceType_not?: Maybe<Scalars['String']>;
  resourceType_contains?: Maybe<Scalars['String']>;
  resourceType_not_contains?: Maybe<Scalars['String']>;
  resourceType_starts_with?: Maybe<Scalars['String']>;
  resourceType_not_starts_with?: Maybe<Scalars['String']>;
  resourceType_ends_with?: Maybe<Scalars['String']>;
  resourceType_not_ends_with?: Maybe<Scalars['String']>;
  resourceType_i?: Maybe<Scalars['String']>;
  resourceType_not_i?: Maybe<Scalars['String']>;
  resourceType_contains_i?: Maybe<Scalars['String']>;
  resourceType_not_contains_i?: Maybe<Scalars['String']>;
  resourceType_starts_with_i?: Maybe<Scalars['String']>;
  resourceType_not_starts_with_i?: Maybe<Scalars['String']>;
  resourceType_ends_with_i?: Maybe<Scalars['String']>;
  resourceType_not_ends_with_i?: Maybe<Scalars['String']>;
  resourceType_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  resourceType_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  resourceAccessScope?: Maybe<Scalars['String']>;
  resourceAccessScope_not?: Maybe<Scalars['String']>;
  resourceAccessScope_contains?: Maybe<Scalars['String']>;
  resourceAccessScope_not_contains?: Maybe<Scalars['String']>;
  resourceAccessScope_starts_with?: Maybe<Scalars['String']>;
  resourceAccessScope_not_starts_with?: Maybe<Scalars['String']>;
  resourceAccessScope_ends_with?: Maybe<Scalars['String']>;
  resourceAccessScope_not_ends_with?: Maybe<Scalars['String']>;
  resourceAccessScope_i?: Maybe<Scalars['String']>;
  resourceAccessScope_not_i?: Maybe<Scalars['String']>;
  resourceAccessScope_contains_i?: Maybe<Scalars['String']>;
  resourceAccessScope_not_contains_i?: Maybe<Scalars['String']>;
  resourceAccessScope_starts_with_i?: Maybe<Scalars['String']>;
  resourceAccessScope_not_starts_with_i?: Maybe<Scalars['String']>;
  resourceAccessScope_ends_with_i?: Maybe<Scalars['String']>;
  resourceAccessScope_not_ends_with_i?: Maybe<Scalars['String']>;
  resourceAccessScope_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  resourceAccessScope_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  apiKeyName?: Maybe<Scalars['String']>;
  apiKeyName_not?: Maybe<Scalars['String']>;
  apiKeyName_contains?: Maybe<Scalars['String']>;
  apiKeyName_not_contains?: Maybe<Scalars['String']>;
  apiKeyName_starts_with?: Maybe<Scalars['String']>;
  apiKeyName_not_starts_with?: Maybe<Scalars['String']>;
  apiKeyName_ends_with?: Maybe<Scalars['String']>;
  apiKeyName_not_ends_with?: Maybe<Scalars['String']>;
  apiKeyName_i?: Maybe<Scalars['String']>;
  apiKeyName_not_i?: Maybe<Scalars['String']>;
  apiKeyName_contains_i?: Maybe<Scalars['String']>;
  apiKeyName_not_contains_i?: Maybe<Scalars['String']>;
  apiKeyName_starts_with_i?: Maybe<Scalars['String']>;
  apiKeyName_not_starts_with_i?: Maybe<Scalars['String']>;
  apiKeyName_ends_with_i?: Maybe<Scalars['String']>;
  apiKeyName_not_ends_with_i?: Maybe<Scalars['String']>;
  apiKeyName_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  apiKeyName_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  owner?: Maybe<UserWhereInput>;
  owner_is_null?: Maybe<Scalars['Boolean']>;
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
  NamespaceAsc = 'namespace_ASC',
  NamespaceDesc = 'namespace_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  FlowAsc = 'flow_ASC',
  FlowDesc = 'flow_DESC',
  ClientRegistrationAsc = 'clientRegistration_ASC',
  ClientRegistrationDesc = 'clientRegistration_DESC',
  ModeAsc = 'mode_ASC',
  ModeDesc = 'mode_DESC',
  ClientAuthenticatorAsc = 'clientAuthenticator_ASC',
  ClientAuthenticatorDesc = 'clientAuthenticator_DESC',
  AuthPluginAsc = 'authPlugin_ASC',
  AuthPluginDesc = 'authPlugin_DESC',
  InstructionAsc = 'instruction_ASC',
  InstructionDesc = 'instruction_DESC',
  EnvironmentDetailsAsc = 'environmentDetails_ASC',
  EnvironmentDetailsDesc = 'environmentDetails_DESC',
  OidcDiscoveryUrlAsc = 'oidcDiscoveryUrl_ASC',
  OidcDiscoveryUrlDesc = 'oidcDiscoveryUrl_DESC',
  InitialAccessTokenAsc = 'initialAccessToken_ASC',
  InitialAccessTokenDesc = 'initialAccessToken_DESC',
  ClientIdAsc = 'clientId_ASC',
  ClientIdDesc = 'clientId_DESC',
  ClientSecretAsc = 'clientSecret_ASC',
  ClientSecretDesc = 'clientSecret_DESC',
  AvailableScopesAsc = 'availableScopes_ASC',
  AvailableScopesDesc = 'availableScopes_DESC',
  ClientRolesAsc = 'clientRoles_ASC',
  ClientRolesDesc = 'clientRoles_DESC',
  ResourceScopesAsc = 'resourceScopes_ASC',
  ResourceScopesDesc = 'resourceScopes_DESC',
  ResourceTypeAsc = 'resourceType_ASC',
  ResourceTypeDesc = 'resourceType_DESC',
  ResourceAccessScopeAsc = 'resourceAccessScope_ASC',
  ResourceAccessScopeDesc = 'resourceAccessScope_DESC',
  ApiKeyNameAsc = 'apiKeyName_ASC',
  ApiKeyNameDesc = 'apiKeyName_DESC',
  OwnerAsc = 'owner_ASC',
  OwnerDesc = 'owner_DESC',
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
  namespace?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  flow?: Maybe<Scalars['String']>;
  clientRegistration?: Maybe<Scalars['String']>;
  mode?: Maybe<Scalars['String']>;
  clientAuthenticator?: Maybe<Scalars['String']>;
  authPlugin?: Maybe<Scalars['String']>;
  instruction?: Maybe<Scalars['String']>;
  environmentDetails?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl?: Maybe<Scalars['String']>;
  initialAccessToken?: Maybe<Scalars['String']>;
  clientId?: Maybe<Scalars['String']>;
  clientSecret?: Maybe<Scalars['String']>;
  availableScopes?: Maybe<Scalars['String']>;
  clientRoles?: Maybe<Scalars['String']>;
  resourceScopes?: Maybe<Scalars['String']>;
  resourceType?: Maybe<Scalars['String']>;
  resourceAccessScope?: Maybe<Scalars['String']>;
  apiKeyName?: Maybe<Scalars['String']>;
  environments?: Maybe<EnvironmentRelateToManyInput>;
};

export type CredentialIssuersUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<CredentialIssuerUpdateInput>;
};

export type CredentialIssuerCreateInput = {
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  flow?: Maybe<Scalars['String']>;
  clientRegistration?: Maybe<Scalars['String']>;
  mode?: Maybe<Scalars['String']>;
  clientAuthenticator?: Maybe<Scalars['String']>;
  authPlugin?: Maybe<Scalars['String']>;
  instruction?: Maybe<Scalars['String']>;
  environmentDetails?: Maybe<Scalars['String']>;
  oidcDiscoveryUrl?: Maybe<Scalars['String']>;
  initialAccessToken?: Maybe<Scalars['String']>;
  clientId?: Maybe<Scalars['String']>;
  clientSecret?: Maybe<Scalars['String']>;
  availableScopes?: Maybe<Scalars['String']>;
  clientRoles?: Maybe<Scalars['String']>;
  resourceScopes?: Maybe<Scalars['String']>;
  resourceType?: Maybe<Scalars['String']>;
  resourceAccessScope?: Maybe<Scalars['String']>;
  apiKeyName?: Maybe<Scalars['String']>;
  owner?: Maybe<UserRelateToOneInput>;
  environments?: Maybe<EnvironmentRelateToManyInput>;
};

export type CredentialIssuersCreateInput = {
  data?: Maybe<CredentialIssuerCreateInput>;
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
  download_audience?: Maybe<Scalars['String']>;
  record_publish_date?: Maybe<Scalars['String']>;
  security_class?: Maybe<Scalars['String']>;
  private?: Maybe<Scalars['Boolean']>;
  tags?: Maybe<Scalars['String']>;
  contacts?: Maybe<Scalars['String']>;
  organization?: Maybe<Organization>;
  organizationUnit?: Maybe<OrganizationUnit>;
  notes?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  catalogContent?: Maybe<Scalars['String']>;
  isInCatalog?: Maybe<Scalars['Boolean']>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
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
  download_audience?: Maybe<Scalars['String']>;
  download_audience_not?: Maybe<Scalars['String']>;
  download_audience_contains?: Maybe<Scalars['String']>;
  download_audience_not_contains?: Maybe<Scalars['String']>;
  download_audience_starts_with?: Maybe<Scalars['String']>;
  download_audience_not_starts_with?: Maybe<Scalars['String']>;
  download_audience_ends_with?: Maybe<Scalars['String']>;
  download_audience_not_ends_with?: Maybe<Scalars['String']>;
  download_audience_i?: Maybe<Scalars['String']>;
  download_audience_not_i?: Maybe<Scalars['String']>;
  download_audience_contains_i?: Maybe<Scalars['String']>;
  download_audience_not_contains_i?: Maybe<Scalars['String']>;
  download_audience_starts_with_i?: Maybe<Scalars['String']>;
  download_audience_not_starts_with_i?: Maybe<Scalars['String']>;
  download_audience_ends_with_i?: Maybe<Scalars['String']>;
  download_audience_not_ends_with_i?: Maybe<Scalars['String']>;
  download_audience_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  download_audience_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  record_publish_date?: Maybe<Scalars['String']>;
  record_publish_date_not?: Maybe<Scalars['String']>;
  record_publish_date_contains?: Maybe<Scalars['String']>;
  record_publish_date_not_contains?: Maybe<Scalars['String']>;
  record_publish_date_starts_with?: Maybe<Scalars['String']>;
  record_publish_date_not_starts_with?: Maybe<Scalars['String']>;
  record_publish_date_ends_with?: Maybe<Scalars['String']>;
  record_publish_date_not_ends_with?: Maybe<Scalars['String']>;
  record_publish_date_i?: Maybe<Scalars['String']>;
  record_publish_date_not_i?: Maybe<Scalars['String']>;
  record_publish_date_contains_i?: Maybe<Scalars['String']>;
  record_publish_date_not_contains_i?: Maybe<Scalars['String']>;
  record_publish_date_starts_with_i?: Maybe<Scalars['String']>;
  record_publish_date_not_starts_with_i?: Maybe<Scalars['String']>;
  record_publish_date_ends_with_i?: Maybe<Scalars['String']>;
  record_publish_date_not_ends_with_i?: Maybe<Scalars['String']>;
  record_publish_date_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  record_publish_date_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  security_class?: Maybe<Scalars['String']>;
  security_class_not?: Maybe<Scalars['String']>;
  security_class_contains?: Maybe<Scalars['String']>;
  security_class_not_contains?: Maybe<Scalars['String']>;
  security_class_starts_with?: Maybe<Scalars['String']>;
  security_class_not_starts_with?: Maybe<Scalars['String']>;
  security_class_ends_with?: Maybe<Scalars['String']>;
  security_class_not_ends_with?: Maybe<Scalars['String']>;
  security_class_i?: Maybe<Scalars['String']>;
  security_class_not_i?: Maybe<Scalars['String']>;
  security_class_contains_i?: Maybe<Scalars['String']>;
  security_class_not_contains_i?: Maybe<Scalars['String']>;
  security_class_starts_with_i?: Maybe<Scalars['String']>;
  security_class_not_starts_with_i?: Maybe<Scalars['String']>;
  security_class_ends_with_i?: Maybe<Scalars['String']>;
  security_class_not_ends_with_i?: Maybe<Scalars['String']>;
  security_class_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  security_class_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  extSource?: Maybe<Scalars['String']>;
  extSource_not?: Maybe<Scalars['String']>;
  extSource_contains?: Maybe<Scalars['String']>;
  extSource_not_contains?: Maybe<Scalars['String']>;
  extSource_starts_with?: Maybe<Scalars['String']>;
  extSource_not_starts_with?: Maybe<Scalars['String']>;
  extSource_ends_with?: Maybe<Scalars['String']>;
  extSource_not_ends_with?: Maybe<Scalars['String']>;
  extSource_i?: Maybe<Scalars['String']>;
  extSource_not_i?: Maybe<Scalars['String']>;
  extSource_contains_i?: Maybe<Scalars['String']>;
  extSource_not_contains_i?: Maybe<Scalars['String']>;
  extSource_starts_with_i?: Maybe<Scalars['String']>;
  extSource_not_starts_with_i?: Maybe<Scalars['String']>;
  extSource_ends_with_i?: Maybe<Scalars['String']>;
  extSource_not_ends_with_i?: Maybe<Scalars['String']>;
  extSource_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extSource_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey?: Maybe<Scalars['String']>;
  extForeignKey_not?: Maybe<Scalars['String']>;
  extForeignKey_contains?: Maybe<Scalars['String']>;
  extForeignKey_not_contains?: Maybe<Scalars['String']>;
  extForeignKey_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_i?: Maybe<Scalars['String']>;
  extForeignKey_not_i?: Maybe<Scalars['String']>;
  extForeignKey_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_not_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash?: Maybe<Scalars['String']>;
  extRecordHash_not?: Maybe<Scalars['String']>;
  extRecordHash_contains?: Maybe<Scalars['String']>;
  extRecordHash_not_contains?: Maybe<Scalars['String']>;
  extRecordHash_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_i?: Maybe<Scalars['String']>;
  extRecordHash_not_i?: Maybe<Scalars['String']>;
  extRecordHash_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_not_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  DownloadAudienceAsc = 'download_audience_ASC',
  DownloadAudienceDesc = 'download_audience_DESC',
  RecordPublishDateAsc = 'record_publish_date_ASC',
  RecordPublishDateDesc = 'record_publish_date_DESC',
  SecurityClassAsc = 'security_class_ASC',
  SecurityClassDesc = 'security_class_DESC',
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
  NotesAsc = 'notes_ASC',
  NotesDesc = 'notes_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
  CatalogContentAsc = 'catalogContent_ASC',
  CatalogContentDesc = 'catalogContent_DESC',
  IsInCatalogAsc = 'isInCatalog_ASC',
  IsInCatalogDesc = 'isInCatalog_DESC',
  ExtSourceAsc = 'extSource_ASC',
  ExtSourceDesc = 'extSource_DESC',
  ExtForeignKeyAsc = 'extForeignKey_ASC',
  ExtForeignKeyDesc = 'extForeignKey_DESC',
  ExtRecordHashAsc = 'extRecordHash_ASC',
  ExtRecordHashDesc = 'extRecordHash_DESC'
}

export type DatasetUpdateInput = {
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  license_title?: Maybe<Scalars['String']>;
  view_audience?: Maybe<Scalars['String']>;
  download_audience?: Maybe<Scalars['String']>;
  record_publish_date?: Maybe<Scalars['String']>;
  security_class?: Maybe<Scalars['String']>;
  private?: Maybe<Scalars['Boolean']>;
  tags?: Maybe<Scalars['String']>;
  contacts?: Maybe<Scalars['String']>;
  organization?: Maybe<OrganizationRelateToOneInput>;
  organizationUnit?: Maybe<OrganizationUnitRelateToOneInput>;
  notes?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  catalogContent?: Maybe<Scalars['String']>;
  isInCatalog?: Maybe<Scalars['Boolean']>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
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
  download_audience?: Maybe<Scalars['String']>;
  record_publish_date?: Maybe<Scalars['String']>;
  security_class?: Maybe<Scalars['String']>;
  private?: Maybe<Scalars['Boolean']>;
  tags?: Maybe<Scalars['String']>;
  contacts?: Maybe<Scalars['String']>;
  organization?: Maybe<OrganizationRelateToOneInput>;
  organizationUnit?: Maybe<OrganizationUnitRelateToOneInput>;
  notes?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  catalogContent?: Maybe<Scalars['String']>;
  isInCatalog?: Maybe<Scalars['Boolean']>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
};

export type DatasetsCreateInput = {
  data?: Maybe<DatasetCreateInput>;
};

export type LegalRelateToOneInput = {
  create?: Maybe<LegalCreateInput>;
  connect?: Maybe<LegalWhereUniqueInput>;
  disconnect?: Maybe<LegalWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type CredentialIssuerRelateToOneInput = {
  create?: Maybe<CredentialIssuerCreateInput>;
  connect?: Maybe<CredentialIssuerWhereUniqueInput>;
  disconnect?: Maybe<CredentialIssuerWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type GatewayServiceRelateToManyInput = {
  create?: Maybe<Array<Maybe<GatewayServiceCreateInput>>>;
  connect?: Maybe<Array<Maybe<GatewayServiceWhereUniqueInput>>>;
  disconnect?: Maybe<Array<Maybe<GatewayServiceWhereUniqueInput>>>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type ProductRelateToOneInput = {
  create?: Maybe<ProductCreateInput>;
  connect?: Maybe<ProductWhereUniqueInput>;
  disconnect?: Maybe<ProductWhereUniqueInput>;
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
  appId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  active?: Maybe<Scalars['Boolean']>;
  approval?: Maybe<Scalars['Boolean']>;
  flow?: Maybe<Scalars['String']>;
  legal?: Maybe<Legal>;
  credentialIssuer?: Maybe<CredentialIssuer>;
  additionalDetailsToRequest?: Maybe<Scalars['String']>;
  services: Array<GatewayService>;
  _servicesMeta?: Maybe<_QueryMeta>;
  product?: Maybe<Product>;
};


/**  A keystone list  */
export type EnvironmentServicesArgs = {
  where?: Maybe<GatewayServiceWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayServicesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type Environment_ServicesMetaArgs = {
  where?: Maybe<GatewayServiceWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayServicesBy>>;
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
  active?: Maybe<Scalars['Boolean']>;
  active_not?: Maybe<Scalars['Boolean']>;
  approval?: Maybe<Scalars['Boolean']>;
  approval_not?: Maybe<Scalars['Boolean']>;
  flow?: Maybe<Scalars['String']>;
  flow_not?: Maybe<Scalars['String']>;
  flow_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  flow_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  legal?: Maybe<LegalWhereInput>;
  legal_is_null?: Maybe<Scalars['Boolean']>;
  credentialIssuer?: Maybe<CredentialIssuerWhereInput>;
  credentialIssuer_is_null?: Maybe<Scalars['Boolean']>;
  additionalDetailsToRequest?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_not?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_contains?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_not_contains?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_starts_with?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_not_starts_with?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_ends_with?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_not_ends_with?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_i?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_not_i?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_contains_i?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_not_contains_i?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_starts_with_i?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_not_starts_with_i?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_ends_with_i?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_not_ends_with_i?: Maybe<Scalars['String']>;
  additionalDetailsToRequest_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  additionalDetailsToRequest_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**  condition must be true for all nodes  */
  services_every?: Maybe<GatewayServiceWhereInput>;
  /**  condition must be true for at least 1 node  */
  services_some?: Maybe<GatewayServiceWhereInput>;
  /**  condition must be false for all nodes  */
  services_none?: Maybe<GatewayServiceWhereInput>;
  product?: Maybe<ProductWhereInput>;
  product_is_null?: Maybe<Scalars['Boolean']>;
};

export type EnvironmentWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortEnvironmentsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  AppIdAsc = 'appId_ASC',
  AppIdDesc = 'appId_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  ActiveAsc = 'active_ASC',
  ActiveDesc = 'active_DESC',
  ApprovalAsc = 'approval_ASC',
  ApprovalDesc = 'approval_DESC',
  FlowAsc = 'flow_ASC',
  FlowDesc = 'flow_DESC',
  LegalAsc = 'legal_ASC',
  LegalDesc = 'legal_DESC',
  CredentialIssuerAsc = 'credentialIssuer_ASC',
  CredentialIssuerDesc = 'credentialIssuer_DESC',
  AdditionalDetailsToRequestAsc = 'additionalDetailsToRequest_ASC',
  AdditionalDetailsToRequestDesc = 'additionalDetailsToRequest_DESC',
  ServicesAsc = 'services_ASC',
  ServicesDesc = 'services_DESC',
  ProductAsc = 'product_ASC',
  ProductDesc = 'product_DESC'
}

export type EnvironmentUpdateInput = {
  name?: Maybe<Scalars['String']>;
  active?: Maybe<Scalars['Boolean']>;
  approval?: Maybe<Scalars['Boolean']>;
  flow?: Maybe<Scalars['String']>;
  legal?: Maybe<LegalRelateToOneInput>;
  credentialIssuer?: Maybe<CredentialIssuerRelateToOneInput>;
  additionalDetailsToRequest?: Maybe<Scalars['String']>;
  services?: Maybe<GatewayServiceRelateToManyInput>;
  product?: Maybe<ProductRelateToOneInput>;
};

export type EnvironmentsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<EnvironmentUpdateInput>;
};

export type EnvironmentCreateInput = {
  appId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  active?: Maybe<Scalars['Boolean']>;
  approval?: Maybe<Scalars['Boolean']>;
  flow?: Maybe<Scalars['String']>;
  legal?: Maybe<LegalRelateToOneInput>;
  credentialIssuer?: Maybe<CredentialIssuerRelateToOneInput>;
  additionalDetailsToRequest?: Maybe<Scalars['String']>;
  services?: Maybe<GatewayServiceRelateToManyInput>;
  product?: Maybe<ProductRelateToOneInput>;
};

export type EnvironmentsCreateInput = {
  data?: Maybe<EnvironmentCreateInput>;
};

export type GatewayPluginRelateToManyInput = {
  create?: Maybe<Array<Maybe<GatewayPluginCreateInput>>>;
  connect?: Maybe<Array<Maybe<GatewayPluginWhereUniqueInput>>>;
  disconnect?: Maybe<Array<Maybe<GatewayPluginWhereUniqueInput>>>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

/**  A keystone list  */
export type GatewayConsumer = {
  __typename?: 'GatewayConsumer';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the GatewayConsumer List config, or
   *  2. As an alias to the field set on 'labelField' in the GatewayConsumer List config, or
   *  3. As an alias to a 'name' field on the GatewayConsumer List (if one exists), or
   *  4. As an alias to the 'id' field on the GatewayConsumer List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  username?: Maybe<Scalars['String']>;
  customId?: Maybe<Scalars['String']>;
  aclGroups?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  plugins: Array<GatewayPlugin>;
  _pluginsMeta?: Maybe<_QueryMeta>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};


/**  A keystone list  */
export type GatewayConsumerPluginsArgs = {
  where?: Maybe<GatewayPluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type GatewayConsumer_PluginsMetaArgs = {
  where?: Maybe<GatewayPluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type GatewayConsumerWhereInput = {
  AND?: Maybe<Array<Maybe<GatewayConsumerWhereInput>>>;
  OR?: Maybe<Array<Maybe<GatewayConsumerWhereInput>>>;
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
  aclGroups?: Maybe<Scalars['String']>;
  aclGroups_not?: Maybe<Scalars['String']>;
  aclGroups_contains?: Maybe<Scalars['String']>;
  aclGroups_not_contains?: Maybe<Scalars['String']>;
  aclGroups_starts_with?: Maybe<Scalars['String']>;
  aclGroups_not_starts_with?: Maybe<Scalars['String']>;
  aclGroups_ends_with?: Maybe<Scalars['String']>;
  aclGroups_not_ends_with?: Maybe<Scalars['String']>;
  aclGroups_i?: Maybe<Scalars['String']>;
  aclGroups_not_i?: Maybe<Scalars['String']>;
  aclGroups_contains_i?: Maybe<Scalars['String']>;
  aclGroups_not_contains_i?: Maybe<Scalars['String']>;
  aclGroups_starts_with_i?: Maybe<Scalars['String']>;
  aclGroups_not_starts_with_i?: Maybe<Scalars['String']>;
  aclGroups_ends_with_i?: Maybe<Scalars['String']>;
  aclGroups_not_ends_with_i?: Maybe<Scalars['String']>;
  aclGroups_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  aclGroups_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  plugins_every?: Maybe<GatewayPluginWhereInput>;
  /**  condition must be true for at least 1 node  */
  plugins_some?: Maybe<GatewayPluginWhereInput>;
  /**  condition must be false for all nodes  */
  plugins_none?: Maybe<GatewayPluginWhereInput>;
  extSource?: Maybe<Scalars['String']>;
  extSource_not?: Maybe<Scalars['String']>;
  extSource_contains?: Maybe<Scalars['String']>;
  extSource_not_contains?: Maybe<Scalars['String']>;
  extSource_starts_with?: Maybe<Scalars['String']>;
  extSource_not_starts_with?: Maybe<Scalars['String']>;
  extSource_ends_with?: Maybe<Scalars['String']>;
  extSource_not_ends_with?: Maybe<Scalars['String']>;
  extSource_i?: Maybe<Scalars['String']>;
  extSource_not_i?: Maybe<Scalars['String']>;
  extSource_contains_i?: Maybe<Scalars['String']>;
  extSource_not_contains_i?: Maybe<Scalars['String']>;
  extSource_starts_with_i?: Maybe<Scalars['String']>;
  extSource_not_starts_with_i?: Maybe<Scalars['String']>;
  extSource_ends_with_i?: Maybe<Scalars['String']>;
  extSource_not_ends_with_i?: Maybe<Scalars['String']>;
  extSource_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extSource_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey?: Maybe<Scalars['String']>;
  extForeignKey_not?: Maybe<Scalars['String']>;
  extForeignKey_contains?: Maybe<Scalars['String']>;
  extForeignKey_not_contains?: Maybe<Scalars['String']>;
  extForeignKey_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_i?: Maybe<Scalars['String']>;
  extForeignKey_not_i?: Maybe<Scalars['String']>;
  extForeignKey_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_not_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash?: Maybe<Scalars['String']>;
  extRecordHash_not?: Maybe<Scalars['String']>;
  extRecordHash_contains?: Maybe<Scalars['String']>;
  extRecordHash_not_contains?: Maybe<Scalars['String']>;
  extRecordHash_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_i?: Maybe<Scalars['String']>;
  extRecordHash_not_i?: Maybe<Scalars['String']>;
  extRecordHash_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_not_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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

export type GatewayConsumerWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortGatewayConsumersBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  UsernameAsc = 'username_ASC',
  UsernameDesc = 'username_DESC',
  CustomIdAsc = 'customId_ASC',
  CustomIdDesc = 'customId_DESC',
  AclGroupsAsc = 'aclGroups_ASC',
  AclGroupsDesc = 'aclGroups_DESC',
  NamespaceAsc = 'namespace_ASC',
  NamespaceDesc = 'namespace_DESC',
  TagsAsc = 'tags_ASC',
  TagsDesc = 'tags_DESC',
  PluginsAsc = 'plugins_ASC',
  PluginsDesc = 'plugins_DESC',
  ExtSourceAsc = 'extSource_ASC',
  ExtSourceDesc = 'extSource_DESC',
  ExtForeignKeyAsc = 'extForeignKey_ASC',
  ExtForeignKeyDesc = 'extForeignKey_DESC',
  ExtRecordHashAsc = 'extRecordHash_ASC',
  ExtRecordHashDesc = 'extRecordHash_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type GatewayConsumerUpdateInput = {
  username?: Maybe<Scalars['String']>;
  customId?: Maybe<Scalars['String']>;
  aclGroups?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  plugins?: Maybe<GatewayPluginRelateToManyInput>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
};

export type GatewayConsumersUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<GatewayConsumerUpdateInput>;
};

export type GatewayConsumerCreateInput = {
  username?: Maybe<Scalars['String']>;
  customId?: Maybe<Scalars['String']>;
  aclGroups?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  plugins?: Maybe<GatewayPluginRelateToManyInput>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
};

export type GatewayConsumersCreateInput = {
  data?: Maybe<GatewayConsumerCreateInput>;
};

/**  A keystone list  */
export type GatewayGroup = {
  __typename?: 'GatewayGroup';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the GatewayGroup List config, or
   *  2. As an alias to the field set on 'labelField' in the GatewayGroup List config, or
   *  3. As an alias to a 'name' field on the GatewayGroup List (if one exists), or
   *  4. As an alias to the 'id' field on the GatewayGroup List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type GatewayGroupWhereInput = {
  AND?: Maybe<Array<Maybe<GatewayGroupWhereInput>>>;
  OR?: Maybe<Array<Maybe<GatewayGroupWhereInput>>>;
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
  extSource?: Maybe<Scalars['String']>;
  extSource_not?: Maybe<Scalars['String']>;
  extSource_contains?: Maybe<Scalars['String']>;
  extSource_not_contains?: Maybe<Scalars['String']>;
  extSource_starts_with?: Maybe<Scalars['String']>;
  extSource_not_starts_with?: Maybe<Scalars['String']>;
  extSource_ends_with?: Maybe<Scalars['String']>;
  extSource_not_ends_with?: Maybe<Scalars['String']>;
  extSource_i?: Maybe<Scalars['String']>;
  extSource_not_i?: Maybe<Scalars['String']>;
  extSource_contains_i?: Maybe<Scalars['String']>;
  extSource_not_contains_i?: Maybe<Scalars['String']>;
  extSource_starts_with_i?: Maybe<Scalars['String']>;
  extSource_not_starts_with_i?: Maybe<Scalars['String']>;
  extSource_ends_with_i?: Maybe<Scalars['String']>;
  extSource_not_ends_with_i?: Maybe<Scalars['String']>;
  extSource_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extSource_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey?: Maybe<Scalars['String']>;
  extForeignKey_not?: Maybe<Scalars['String']>;
  extForeignKey_contains?: Maybe<Scalars['String']>;
  extForeignKey_not_contains?: Maybe<Scalars['String']>;
  extForeignKey_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_i?: Maybe<Scalars['String']>;
  extForeignKey_not_i?: Maybe<Scalars['String']>;
  extForeignKey_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_not_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash?: Maybe<Scalars['String']>;
  extRecordHash_not?: Maybe<Scalars['String']>;
  extRecordHash_contains?: Maybe<Scalars['String']>;
  extRecordHash_not_contains?: Maybe<Scalars['String']>;
  extRecordHash_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_i?: Maybe<Scalars['String']>;
  extRecordHash_not_i?: Maybe<Scalars['String']>;
  extRecordHash_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_not_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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

export type GatewayGroupWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortGatewayGroupsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  NamespaceAsc = 'namespace_ASC',
  NamespaceDesc = 'namespace_DESC',
  ExtSourceAsc = 'extSource_ASC',
  ExtSourceDesc = 'extSource_DESC',
  ExtForeignKeyAsc = 'extForeignKey_ASC',
  ExtForeignKeyDesc = 'extForeignKey_DESC',
  ExtRecordHashAsc = 'extRecordHash_ASC',
  ExtRecordHashDesc = 'extRecordHash_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type GatewayGroupUpdateInput = {
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
};

export type GatewayGroupsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<GatewayGroupUpdateInput>;
};

export type GatewayGroupCreateInput = {
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
};

export type GatewayGroupsCreateInput = {
  data?: Maybe<GatewayGroupCreateInput>;
};

export type GatewayRouteRelateToOneInput = {
  create?: Maybe<GatewayRouteCreateInput>;
  connect?: Maybe<GatewayRouteWhereUniqueInput>;
  disconnect?: Maybe<GatewayRouteWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

/**  A keystone list  */
export type GatewayPlugin = {
  __typename?: 'GatewayPlugin';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the GatewayPlugin List config, or
   *  2. As an alias to the field set on 'labelField' in the GatewayPlugin List config, or
   *  3. As an alias to a 'name' field on the GatewayPlugin List (if one exists), or
   *  4. As an alias to the 'id' field on the GatewayPlugin List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  config?: Maybe<Scalars['String']>;
  service?: Maybe<GatewayService>;
  route?: Maybe<GatewayRoute>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type GatewayPluginWhereInput = {
  AND?: Maybe<Array<Maybe<GatewayPluginWhereInput>>>;
  OR?: Maybe<Array<Maybe<GatewayPluginWhereInput>>>;
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
  service?: Maybe<GatewayServiceWhereInput>;
  service_is_null?: Maybe<Scalars['Boolean']>;
  route?: Maybe<GatewayRouteWhereInput>;
  route_is_null?: Maybe<Scalars['Boolean']>;
  extSource?: Maybe<Scalars['String']>;
  extSource_not?: Maybe<Scalars['String']>;
  extSource_contains?: Maybe<Scalars['String']>;
  extSource_not_contains?: Maybe<Scalars['String']>;
  extSource_starts_with?: Maybe<Scalars['String']>;
  extSource_not_starts_with?: Maybe<Scalars['String']>;
  extSource_ends_with?: Maybe<Scalars['String']>;
  extSource_not_ends_with?: Maybe<Scalars['String']>;
  extSource_i?: Maybe<Scalars['String']>;
  extSource_not_i?: Maybe<Scalars['String']>;
  extSource_contains_i?: Maybe<Scalars['String']>;
  extSource_not_contains_i?: Maybe<Scalars['String']>;
  extSource_starts_with_i?: Maybe<Scalars['String']>;
  extSource_not_starts_with_i?: Maybe<Scalars['String']>;
  extSource_ends_with_i?: Maybe<Scalars['String']>;
  extSource_not_ends_with_i?: Maybe<Scalars['String']>;
  extSource_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extSource_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey?: Maybe<Scalars['String']>;
  extForeignKey_not?: Maybe<Scalars['String']>;
  extForeignKey_contains?: Maybe<Scalars['String']>;
  extForeignKey_not_contains?: Maybe<Scalars['String']>;
  extForeignKey_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_i?: Maybe<Scalars['String']>;
  extForeignKey_not_i?: Maybe<Scalars['String']>;
  extForeignKey_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_not_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash?: Maybe<Scalars['String']>;
  extRecordHash_not?: Maybe<Scalars['String']>;
  extRecordHash_contains?: Maybe<Scalars['String']>;
  extRecordHash_not_contains?: Maybe<Scalars['String']>;
  extRecordHash_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_i?: Maybe<Scalars['String']>;
  extRecordHash_not_i?: Maybe<Scalars['String']>;
  extRecordHash_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_not_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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

export type GatewayPluginWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortGatewayPluginsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  NamespaceAsc = 'namespace_ASC',
  NamespaceDesc = 'namespace_DESC',
  TagsAsc = 'tags_ASC',
  TagsDesc = 'tags_DESC',
  ConfigAsc = 'config_ASC',
  ConfigDesc = 'config_DESC',
  ServiceAsc = 'service_ASC',
  ServiceDesc = 'service_DESC',
  RouteAsc = 'route_ASC',
  RouteDesc = 'route_DESC',
  ExtSourceAsc = 'extSource_ASC',
  ExtSourceDesc = 'extSource_DESC',
  ExtForeignKeyAsc = 'extForeignKey_ASC',
  ExtForeignKeyDesc = 'extForeignKey_DESC',
  ExtRecordHashAsc = 'extRecordHash_ASC',
  ExtRecordHashDesc = 'extRecordHash_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type GatewayPluginUpdateInput = {
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  config?: Maybe<Scalars['String']>;
  service?: Maybe<GatewayServiceRelateToOneInput>;
  route?: Maybe<GatewayRouteRelateToOneInput>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
};

export type GatewayPluginsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<GatewayPluginUpdateInput>;
};

export type GatewayPluginCreateInput = {
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  config?: Maybe<Scalars['String']>;
  service?: Maybe<GatewayServiceRelateToOneInput>;
  route?: Maybe<GatewayRouteRelateToOneInput>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
};

export type GatewayPluginsCreateInput = {
  data?: Maybe<GatewayPluginCreateInput>;
};

/**  A keystone list  */
export type GatewayRoute = {
  __typename?: 'GatewayRoute';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the GatewayRoute List config, or
   *  2. As an alias to the field set on 'labelField' in the GatewayRoute List config, or
   *  3. As an alias to a 'name' field on the GatewayRoute List (if one exists), or
   *  4. As an alias to the 'id' field on the GatewayRoute List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  methods?: Maybe<Scalars['String']>;
  paths?: Maybe<Scalars['String']>;
  hosts?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  service?: Maybe<GatewayService>;
  plugins: Array<GatewayPlugin>;
  _pluginsMeta?: Maybe<_QueryMeta>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};


/**  A keystone list  */
export type GatewayRoutePluginsArgs = {
  where?: Maybe<GatewayPluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type GatewayRoute_PluginsMetaArgs = {
  where?: Maybe<GatewayPluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type GatewayRouteWhereInput = {
  AND?: Maybe<Array<Maybe<GatewayRouteWhereInput>>>;
  OR?: Maybe<Array<Maybe<GatewayRouteWhereInput>>>;
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
  hosts?: Maybe<Scalars['String']>;
  hosts_not?: Maybe<Scalars['String']>;
  hosts_contains?: Maybe<Scalars['String']>;
  hosts_not_contains?: Maybe<Scalars['String']>;
  hosts_starts_with?: Maybe<Scalars['String']>;
  hosts_not_starts_with?: Maybe<Scalars['String']>;
  hosts_ends_with?: Maybe<Scalars['String']>;
  hosts_not_ends_with?: Maybe<Scalars['String']>;
  hosts_i?: Maybe<Scalars['String']>;
  hosts_not_i?: Maybe<Scalars['String']>;
  hosts_contains_i?: Maybe<Scalars['String']>;
  hosts_not_contains_i?: Maybe<Scalars['String']>;
  hosts_starts_with_i?: Maybe<Scalars['String']>;
  hosts_not_starts_with_i?: Maybe<Scalars['String']>;
  hosts_ends_with_i?: Maybe<Scalars['String']>;
  hosts_not_ends_with_i?: Maybe<Scalars['String']>;
  hosts_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  hosts_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  service?: Maybe<GatewayServiceWhereInput>;
  service_is_null?: Maybe<Scalars['Boolean']>;
  /**  condition must be true for all nodes  */
  plugins_every?: Maybe<GatewayPluginWhereInput>;
  /**  condition must be true for at least 1 node  */
  plugins_some?: Maybe<GatewayPluginWhereInput>;
  /**  condition must be false for all nodes  */
  plugins_none?: Maybe<GatewayPluginWhereInput>;
  extSource?: Maybe<Scalars['String']>;
  extSource_not?: Maybe<Scalars['String']>;
  extSource_contains?: Maybe<Scalars['String']>;
  extSource_not_contains?: Maybe<Scalars['String']>;
  extSource_starts_with?: Maybe<Scalars['String']>;
  extSource_not_starts_with?: Maybe<Scalars['String']>;
  extSource_ends_with?: Maybe<Scalars['String']>;
  extSource_not_ends_with?: Maybe<Scalars['String']>;
  extSource_i?: Maybe<Scalars['String']>;
  extSource_not_i?: Maybe<Scalars['String']>;
  extSource_contains_i?: Maybe<Scalars['String']>;
  extSource_not_contains_i?: Maybe<Scalars['String']>;
  extSource_starts_with_i?: Maybe<Scalars['String']>;
  extSource_not_starts_with_i?: Maybe<Scalars['String']>;
  extSource_ends_with_i?: Maybe<Scalars['String']>;
  extSource_not_ends_with_i?: Maybe<Scalars['String']>;
  extSource_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extSource_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey?: Maybe<Scalars['String']>;
  extForeignKey_not?: Maybe<Scalars['String']>;
  extForeignKey_contains?: Maybe<Scalars['String']>;
  extForeignKey_not_contains?: Maybe<Scalars['String']>;
  extForeignKey_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_i?: Maybe<Scalars['String']>;
  extForeignKey_not_i?: Maybe<Scalars['String']>;
  extForeignKey_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_not_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash?: Maybe<Scalars['String']>;
  extRecordHash_not?: Maybe<Scalars['String']>;
  extRecordHash_contains?: Maybe<Scalars['String']>;
  extRecordHash_not_contains?: Maybe<Scalars['String']>;
  extRecordHash_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_i?: Maybe<Scalars['String']>;
  extRecordHash_not_i?: Maybe<Scalars['String']>;
  extRecordHash_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_not_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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

export type GatewayRouteWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortGatewayRoutesBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  NamespaceAsc = 'namespace_ASC',
  NamespaceDesc = 'namespace_DESC',
  MethodsAsc = 'methods_ASC',
  MethodsDesc = 'methods_DESC',
  PathsAsc = 'paths_ASC',
  PathsDesc = 'paths_DESC',
  HostsAsc = 'hosts_ASC',
  HostsDesc = 'hosts_DESC',
  TagsAsc = 'tags_ASC',
  TagsDesc = 'tags_DESC',
  ServiceAsc = 'service_ASC',
  ServiceDesc = 'service_DESC',
  PluginsAsc = 'plugins_ASC',
  PluginsDesc = 'plugins_DESC',
  ExtSourceAsc = 'extSource_ASC',
  ExtSourceDesc = 'extSource_DESC',
  ExtForeignKeyAsc = 'extForeignKey_ASC',
  ExtForeignKeyDesc = 'extForeignKey_DESC',
  ExtRecordHashAsc = 'extRecordHash_ASC',
  ExtRecordHashDesc = 'extRecordHash_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type GatewayRouteUpdateInput = {
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  methods?: Maybe<Scalars['String']>;
  paths?: Maybe<Scalars['String']>;
  hosts?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  service?: Maybe<GatewayServiceRelateToOneInput>;
  plugins?: Maybe<GatewayPluginRelateToManyInput>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
};

export type GatewayRoutesUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<GatewayRouteUpdateInput>;
};

export type GatewayRouteCreateInput = {
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  methods?: Maybe<Scalars['String']>;
  paths?: Maybe<Scalars['String']>;
  hosts?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  service?: Maybe<GatewayServiceRelateToOneInput>;
  plugins?: Maybe<GatewayPluginRelateToManyInput>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
};

export type GatewayRoutesCreateInput = {
  data?: Maybe<GatewayRouteCreateInput>;
};

export type GatewayRouteRelateToManyInput = {
  create?: Maybe<Array<Maybe<GatewayRouteCreateInput>>>;
  connect?: Maybe<Array<Maybe<GatewayRouteWhereUniqueInput>>>;
  disconnect?: Maybe<Array<Maybe<GatewayRouteWhereUniqueInput>>>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

/**  A keystone list  */
export type GatewayService = {
  __typename?: 'GatewayService';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the GatewayService List config, or
   *  2. As an alias to the field set on 'labelField' in the GatewayService List config, or
   *  3. As an alias to a 'name' field on the GatewayService List (if one exists), or
   *  4. As an alias to the 'id' field on the GatewayService List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  host?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  routes: Array<GatewayRoute>;
  _routesMeta?: Maybe<_QueryMeta>;
  plugins: Array<GatewayPlugin>;
  _pluginsMeta?: Maybe<_QueryMeta>;
  environment?: Maybe<Environment>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};


/**  A keystone list  */
export type GatewayServiceRoutesArgs = {
  where?: Maybe<GatewayRouteWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayRoutesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type GatewayService_RoutesMetaArgs = {
  where?: Maybe<GatewayRouteWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayRoutesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type GatewayServicePluginsArgs = {
  where?: Maybe<GatewayPluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type GatewayService_PluginsMetaArgs = {
  where?: Maybe<GatewayPluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type GatewayServiceWhereInput = {
  AND?: Maybe<Array<Maybe<GatewayServiceWhereInput>>>;
  OR?: Maybe<Array<Maybe<GatewayServiceWhereInput>>>;
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
  routes_every?: Maybe<GatewayRouteWhereInput>;
  /**  condition must be true for at least 1 node  */
  routes_some?: Maybe<GatewayRouteWhereInput>;
  /**  condition must be false for all nodes  */
  routes_none?: Maybe<GatewayRouteWhereInput>;
  /**  condition must be true for all nodes  */
  plugins_every?: Maybe<GatewayPluginWhereInput>;
  /**  condition must be true for at least 1 node  */
  plugins_some?: Maybe<GatewayPluginWhereInput>;
  /**  condition must be false for all nodes  */
  plugins_none?: Maybe<GatewayPluginWhereInput>;
  environment?: Maybe<EnvironmentWhereInput>;
  environment_is_null?: Maybe<Scalars['Boolean']>;
  extSource?: Maybe<Scalars['String']>;
  extSource_not?: Maybe<Scalars['String']>;
  extSource_contains?: Maybe<Scalars['String']>;
  extSource_not_contains?: Maybe<Scalars['String']>;
  extSource_starts_with?: Maybe<Scalars['String']>;
  extSource_not_starts_with?: Maybe<Scalars['String']>;
  extSource_ends_with?: Maybe<Scalars['String']>;
  extSource_not_ends_with?: Maybe<Scalars['String']>;
  extSource_i?: Maybe<Scalars['String']>;
  extSource_not_i?: Maybe<Scalars['String']>;
  extSource_contains_i?: Maybe<Scalars['String']>;
  extSource_not_contains_i?: Maybe<Scalars['String']>;
  extSource_starts_with_i?: Maybe<Scalars['String']>;
  extSource_not_starts_with_i?: Maybe<Scalars['String']>;
  extSource_ends_with_i?: Maybe<Scalars['String']>;
  extSource_not_ends_with_i?: Maybe<Scalars['String']>;
  extSource_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extSource_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey?: Maybe<Scalars['String']>;
  extForeignKey_not?: Maybe<Scalars['String']>;
  extForeignKey_contains?: Maybe<Scalars['String']>;
  extForeignKey_not_contains?: Maybe<Scalars['String']>;
  extForeignKey_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_i?: Maybe<Scalars['String']>;
  extForeignKey_not_i?: Maybe<Scalars['String']>;
  extForeignKey_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_not_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash?: Maybe<Scalars['String']>;
  extRecordHash_not?: Maybe<Scalars['String']>;
  extRecordHash_contains?: Maybe<Scalars['String']>;
  extRecordHash_not_contains?: Maybe<Scalars['String']>;
  extRecordHash_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_i?: Maybe<Scalars['String']>;
  extRecordHash_not_i?: Maybe<Scalars['String']>;
  extRecordHash_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_not_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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

export type GatewayServiceWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortGatewayServicesBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  NamespaceAsc = 'namespace_ASC',
  NamespaceDesc = 'namespace_DESC',
  HostAsc = 'host_ASC',
  HostDesc = 'host_DESC',
  TagsAsc = 'tags_ASC',
  TagsDesc = 'tags_DESC',
  RoutesAsc = 'routes_ASC',
  RoutesDesc = 'routes_DESC',
  PluginsAsc = 'plugins_ASC',
  PluginsDesc = 'plugins_DESC',
  EnvironmentAsc = 'environment_ASC',
  EnvironmentDesc = 'environment_DESC',
  ExtSourceAsc = 'extSource_ASC',
  ExtSourceDesc = 'extSource_DESC',
  ExtForeignKeyAsc = 'extForeignKey_ASC',
  ExtForeignKeyDesc = 'extForeignKey_DESC',
  ExtRecordHashAsc = 'extRecordHash_ASC',
  ExtRecordHashDesc = 'extRecordHash_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type GatewayServiceUpdateInput = {
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  host?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  routes?: Maybe<GatewayRouteRelateToManyInput>;
  plugins?: Maybe<GatewayPluginRelateToManyInput>;
  environment?: Maybe<EnvironmentRelateToOneInput>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
};

export type GatewayServicesUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<GatewayServiceUpdateInput>;
};

export type GatewayServiceCreateInput = {
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  host?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  routes?: Maybe<GatewayRouteRelateToManyInput>;
  plugins?: Maybe<GatewayPluginRelateToManyInput>;
  environment?: Maybe<EnvironmentRelateToOneInput>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
};

export type GatewayServicesCreateInput = {
  data?: Maybe<GatewayServiceCreateInput>;
};

/**  A keystone list  */
export type Legal = {
  __typename?: 'Legal';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Legal List config, or
   *  2. As an alias to the field set on 'labelField' in the Legal List config, or
   *  3. As an alias to a 'name' field on the Legal List (if one exists), or
   *  4. As an alias to the 'id' field on the Legal List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  link?: Maybe<Scalars['String']>;
  document?: Maybe<Scalars['String']>;
  reference?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['Int']>;
  isActive?: Maybe<Scalars['Boolean']>;
  updatedBy?: Maybe<User>;
  createdBy?: Maybe<User>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type LegalWhereInput = {
  AND?: Maybe<Array<Maybe<LegalWhereInput>>>;
  OR?: Maybe<Array<Maybe<LegalWhereInput>>>;
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
  link?: Maybe<Scalars['String']>;
  link_not?: Maybe<Scalars['String']>;
  link_contains?: Maybe<Scalars['String']>;
  link_not_contains?: Maybe<Scalars['String']>;
  link_starts_with?: Maybe<Scalars['String']>;
  link_not_starts_with?: Maybe<Scalars['String']>;
  link_ends_with?: Maybe<Scalars['String']>;
  link_not_ends_with?: Maybe<Scalars['String']>;
  link_i?: Maybe<Scalars['String']>;
  link_not_i?: Maybe<Scalars['String']>;
  link_contains_i?: Maybe<Scalars['String']>;
  link_not_contains_i?: Maybe<Scalars['String']>;
  link_starts_with_i?: Maybe<Scalars['String']>;
  link_not_starts_with_i?: Maybe<Scalars['String']>;
  link_ends_with_i?: Maybe<Scalars['String']>;
  link_not_ends_with_i?: Maybe<Scalars['String']>;
  link_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  link_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  document?: Maybe<Scalars['String']>;
  document_not?: Maybe<Scalars['String']>;
  document_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  document_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  reference?: Maybe<Scalars['String']>;
  reference_not?: Maybe<Scalars['String']>;
  reference_contains?: Maybe<Scalars['String']>;
  reference_not_contains?: Maybe<Scalars['String']>;
  reference_starts_with?: Maybe<Scalars['String']>;
  reference_not_starts_with?: Maybe<Scalars['String']>;
  reference_ends_with?: Maybe<Scalars['String']>;
  reference_not_ends_with?: Maybe<Scalars['String']>;
  reference_i?: Maybe<Scalars['String']>;
  reference_not_i?: Maybe<Scalars['String']>;
  reference_contains_i?: Maybe<Scalars['String']>;
  reference_not_contains_i?: Maybe<Scalars['String']>;
  reference_starts_with_i?: Maybe<Scalars['String']>;
  reference_not_starts_with_i?: Maybe<Scalars['String']>;
  reference_ends_with_i?: Maybe<Scalars['String']>;
  reference_not_ends_with_i?: Maybe<Scalars['String']>;
  reference_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  reference_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  version?: Maybe<Scalars['Int']>;
  version_not?: Maybe<Scalars['Int']>;
  version_lt?: Maybe<Scalars['Int']>;
  version_lte?: Maybe<Scalars['Int']>;
  version_gt?: Maybe<Scalars['Int']>;
  version_gte?: Maybe<Scalars['Int']>;
  version_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  version_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  isActive?: Maybe<Scalars['Boolean']>;
  isActive_not?: Maybe<Scalars['Boolean']>;
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

export type LegalWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortLegalsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  LinkAsc = 'link_ASC',
  LinkDesc = 'link_DESC',
  DocumentAsc = 'document_ASC',
  DocumentDesc = 'document_DESC',
  ReferenceAsc = 'reference_ASC',
  ReferenceDesc = 'reference_DESC',
  VersionAsc = 'version_ASC',
  VersionDesc = 'version_DESC',
  IsActiveAsc = 'isActive_ASC',
  IsActiveDesc = 'isActive_DESC',
  UpdatedByAsc = 'updatedBy_ASC',
  UpdatedByDesc = 'updatedBy_DESC',
  CreatedByAsc = 'createdBy_ASC',
  CreatedByDesc = 'createdBy_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type LegalUpdateInput = {
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  link?: Maybe<Scalars['String']>;
  document?: Maybe<Scalars['String']>;
  reference?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['Int']>;
  isActive?: Maybe<Scalars['Boolean']>;
};

export type LegalsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<LegalUpdateInput>;
};

export type LegalCreateInput = {
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  link?: Maybe<Scalars['String']>;
  document?: Maybe<Scalars['String']>;
  reference?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['Int']>;
  isActive?: Maybe<Scalars['Boolean']>;
};

export type LegalsCreateInput = {
  data?: Maybe<LegalCreateInput>;
};

/**  A keystone list  */
export type Metric = {
  __typename?: 'Metric';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Metric List config, or
   *  2. As an alias to the field set on 'labelField' in the Metric List config, or
   *  3. As an alias to a 'name' field on the Metric List (if one exists), or
   *  4. As an alias to the 'id' field on the Metric List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  day?: Maybe<Scalars['String']>;
  metric?: Maybe<Scalars['String']>;
  values?: Maybe<Scalars['String']>;
  service?: Maybe<GatewayService>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type MetricWhereInput = {
  AND?: Maybe<Array<Maybe<MetricWhereInput>>>;
  OR?: Maybe<Array<Maybe<MetricWhereInput>>>;
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
  query?: Maybe<Scalars['String']>;
  query_not?: Maybe<Scalars['String']>;
  query_contains?: Maybe<Scalars['String']>;
  query_not_contains?: Maybe<Scalars['String']>;
  query_starts_with?: Maybe<Scalars['String']>;
  query_not_starts_with?: Maybe<Scalars['String']>;
  query_ends_with?: Maybe<Scalars['String']>;
  query_not_ends_with?: Maybe<Scalars['String']>;
  query_i?: Maybe<Scalars['String']>;
  query_not_i?: Maybe<Scalars['String']>;
  query_contains_i?: Maybe<Scalars['String']>;
  query_not_contains_i?: Maybe<Scalars['String']>;
  query_starts_with_i?: Maybe<Scalars['String']>;
  query_not_starts_with_i?: Maybe<Scalars['String']>;
  query_ends_with_i?: Maybe<Scalars['String']>;
  query_not_ends_with_i?: Maybe<Scalars['String']>;
  query_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  query_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  day?: Maybe<Scalars['String']>;
  day_not?: Maybe<Scalars['String']>;
  day_contains?: Maybe<Scalars['String']>;
  day_not_contains?: Maybe<Scalars['String']>;
  day_starts_with?: Maybe<Scalars['String']>;
  day_not_starts_with?: Maybe<Scalars['String']>;
  day_ends_with?: Maybe<Scalars['String']>;
  day_not_ends_with?: Maybe<Scalars['String']>;
  day_i?: Maybe<Scalars['String']>;
  day_not_i?: Maybe<Scalars['String']>;
  day_contains_i?: Maybe<Scalars['String']>;
  day_not_contains_i?: Maybe<Scalars['String']>;
  day_starts_with_i?: Maybe<Scalars['String']>;
  day_not_starts_with_i?: Maybe<Scalars['String']>;
  day_ends_with_i?: Maybe<Scalars['String']>;
  day_not_ends_with_i?: Maybe<Scalars['String']>;
  day_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  day_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  metric?: Maybe<Scalars['String']>;
  metric_not?: Maybe<Scalars['String']>;
  metric_contains?: Maybe<Scalars['String']>;
  metric_not_contains?: Maybe<Scalars['String']>;
  metric_starts_with?: Maybe<Scalars['String']>;
  metric_not_starts_with?: Maybe<Scalars['String']>;
  metric_ends_with?: Maybe<Scalars['String']>;
  metric_not_ends_with?: Maybe<Scalars['String']>;
  metric_i?: Maybe<Scalars['String']>;
  metric_not_i?: Maybe<Scalars['String']>;
  metric_contains_i?: Maybe<Scalars['String']>;
  metric_not_contains_i?: Maybe<Scalars['String']>;
  metric_starts_with_i?: Maybe<Scalars['String']>;
  metric_not_starts_with_i?: Maybe<Scalars['String']>;
  metric_ends_with_i?: Maybe<Scalars['String']>;
  metric_not_ends_with_i?: Maybe<Scalars['String']>;
  metric_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  metric_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  values?: Maybe<Scalars['String']>;
  values_not?: Maybe<Scalars['String']>;
  values_contains?: Maybe<Scalars['String']>;
  values_not_contains?: Maybe<Scalars['String']>;
  values_starts_with?: Maybe<Scalars['String']>;
  values_not_starts_with?: Maybe<Scalars['String']>;
  values_ends_with?: Maybe<Scalars['String']>;
  values_not_ends_with?: Maybe<Scalars['String']>;
  values_i?: Maybe<Scalars['String']>;
  values_not_i?: Maybe<Scalars['String']>;
  values_contains_i?: Maybe<Scalars['String']>;
  values_not_contains_i?: Maybe<Scalars['String']>;
  values_starts_with_i?: Maybe<Scalars['String']>;
  values_not_starts_with_i?: Maybe<Scalars['String']>;
  values_ends_with_i?: Maybe<Scalars['String']>;
  values_not_ends_with_i?: Maybe<Scalars['String']>;
  values_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  values_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  service?: Maybe<GatewayServiceWhereInput>;
  service_is_null?: Maybe<Scalars['Boolean']>;
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

export type MetricWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortMetricsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  QueryAsc = 'query_ASC',
  QueryDesc = 'query_DESC',
  DayAsc = 'day_ASC',
  DayDesc = 'day_DESC',
  MetricAsc = 'metric_ASC',
  MetricDesc = 'metric_DESC',
  ValuesAsc = 'values_ASC',
  ValuesDesc = 'values_DESC',
  ServiceAsc = 'service_ASC',
  ServiceDesc = 'service_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type MetricUpdateInput = {
  name?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  day?: Maybe<Scalars['String']>;
  metric?: Maybe<Scalars['String']>;
  values?: Maybe<Scalars['String']>;
  service?: Maybe<GatewayServiceRelateToOneInput>;
};

export type MetricsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<MetricUpdateInput>;
};

export type MetricCreateInput = {
  name?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  day?: Maybe<Scalars['String']>;
  metric?: Maybe<Scalars['String']>;
  values?: Maybe<Scalars['String']>;
  service?: Maybe<GatewayServiceRelateToOneInput>;
};

export type MetricsCreateInput = {
  data?: Maybe<MetricCreateInput>;
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
  tags?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  orgUnits: Array<OrganizationUnit>;
  _orgUnitsMeta?: Maybe<_QueryMeta>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
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
  extSource?: Maybe<Scalars['String']>;
  extSource_not?: Maybe<Scalars['String']>;
  extSource_contains?: Maybe<Scalars['String']>;
  extSource_not_contains?: Maybe<Scalars['String']>;
  extSource_starts_with?: Maybe<Scalars['String']>;
  extSource_not_starts_with?: Maybe<Scalars['String']>;
  extSource_ends_with?: Maybe<Scalars['String']>;
  extSource_not_ends_with?: Maybe<Scalars['String']>;
  extSource_i?: Maybe<Scalars['String']>;
  extSource_not_i?: Maybe<Scalars['String']>;
  extSource_contains_i?: Maybe<Scalars['String']>;
  extSource_not_contains_i?: Maybe<Scalars['String']>;
  extSource_starts_with_i?: Maybe<Scalars['String']>;
  extSource_not_starts_with_i?: Maybe<Scalars['String']>;
  extSource_ends_with_i?: Maybe<Scalars['String']>;
  extSource_not_ends_with_i?: Maybe<Scalars['String']>;
  extSource_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extSource_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey?: Maybe<Scalars['String']>;
  extForeignKey_not?: Maybe<Scalars['String']>;
  extForeignKey_contains?: Maybe<Scalars['String']>;
  extForeignKey_not_contains?: Maybe<Scalars['String']>;
  extForeignKey_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_i?: Maybe<Scalars['String']>;
  extForeignKey_not_i?: Maybe<Scalars['String']>;
  extForeignKey_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_not_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash?: Maybe<Scalars['String']>;
  extRecordHash_not?: Maybe<Scalars['String']>;
  extRecordHash_contains?: Maybe<Scalars['String']>;
  extRecordHash_not_contains?: Maybe<Scalars['String']>;
  extRecordHash_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_i?: Maybe<Scalars['String']>;
  extRecordHash_not_i?: Maybe<Scalars['String']>;
  extRecordHash_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_not_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  TagsAsc = 'tags_ASC',
  TagsDesc = 'tags_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  OrgUnitsAsc = 'orgUnits_ASC',
  OrgUnitsDesc = 'orgUnits_DESC',
  ExtSourceAsc = 'extSource_ASC',
  ExtSourceDesc = 'extSource_DESC',
  ExtForeignKeyAsc = 'extForeignKey_ASC',
  ExtForeignKeyDesc = 'extForeignKey_DESC',
  ExtRecordHashAsc = 'extRecordHash_ASC',
  ExtRecordHashDesc = 'extRecordHash_DESC'
}

export type OrganizationUpdateInput = {
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  orgUnits?: Maybe<OrganizationUnitRelateToManyInput>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
};

export type OrganizationsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<OrganizationUpdateInput>;
};

export type OrganizationCreateInput = {
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  orgUnits?: Maybe<OrganizationUnitRelateToManyInput>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
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
  tags?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
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
  extSource?: Maybe<Scalars['String']>;
  extSource_not?: Maybe<Scalars['String']>;
  extSource_contains?: Maybe<Scalars['String']>;
  extSource_not_contains?: Maybe<Scalars['String']>;
  extSource_starts_with?: Maybe<Scalars['String']>;
  extSource_not_starts_with?: Maybe<Scalars['String']>;
  extSource_ends_with?: Maybe<Scalars['String']>;
  extSource_not_ends_with?: Maybe<Scalars['String']>;
  extSource_i?: Maybe<Scalars['String']>;
  extSource_not_i?: Maybe<Scalars['String']>;
  extSource_contains_i?: Maybe<Scalars['String']>;
  extSource_not_contains_i?: Maybe<Scalars['String']>;
  extSource_starts_with_i?: Maybe<Scalars['String']>;
  extSource_not_starts_with_i?: Maybe<Scalars['String']>;
  extSource_ends_with_i?: Maybe<Scalars['String']>;
  extSource_not_ends_with_i?: Maybe<Scalars['String']>;
  extSource_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extSource_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey?: Maybe<Scalars['String']>;
  extForeignKey_not?: Maybe<Scalars['String']>;
  extForeignKey_contains?: Maybe<Scalars['String']>;
  extForeignKey_not_contains?: Maybe<Scalars['String']>;
  extForeignKey_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with?: Maybe<Scalars['String']>;
  extForeignKey_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with?: Maybe<Scalars['String']>;
  extForeignKey_i?: Maybe<Scalars['String']>;
  extForeignKey_not_i?: Maybe<Scalars['String']>;
  extForeignKey_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_not_contains_i?: Maybe<Scalars['String']>;
  extForeignKey_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_starts_with_i?: Maybe<Scalars['String']>;
  extForeignKey_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_not_ends_with_i?: Maybe<Scalars['String']>;
  extForeignKey_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extForeignKey_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash?: Maybe<Scalars['String']>;
  extRecordHash_not?: Maybe<Scalars['String']>;
  extRecordHash_contains?: Maybe<Scalars['String']>;
  extRecordHash_not_contains?: Maybe<Scalars['String']>;
  extRecordHash_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with?: Maybe<Scalars['String']>;
  extRecordHash_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with?: Maybe<Scalars['String']>;
  extRecordHash_i?: Maybe<Scalars['String']>;
  extRecordHash_not_i?: Maybe<Scalars['String']>;
  extRecordHash_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_not_contains_i?: Maybe<Scalars['String']>;
  extRecordHash_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_starts_with_i?: Maybe<Scalars['String']>;
  extRecordHash_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_not_ends_with_i?: Maybe<Scalars['String']>;
  extRecordHash_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  extRecordHash_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  TagsAsc = 'tags_ASC',
  TagsDesc = 'tags_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  ExtSourceAsc = 'extSource_ASC',
  ExtSourceDesc = 'extSource_DESC',
  ExtForeignKeyAsc = 'extForeignKey_ASC',
  ExtForeignKeyDesc = 'extForeignKey_DESC',
  ExtRecordHashAsc = 'extRecordHash_ASC',
  ExtRecordHashDesc = 'extRecordHash_DESC'
}

export type OrganizationUnitUpdateInput = {
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
};

export type OrganizationUnitsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<OrganizationUnitUpdateInput>;
};

export type OrganizationUnitCreateInput = {
  name?: Maybe<Scalars['String']>;
  sector?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  tags?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  extSource?: Maybe<Scalars['String']>;
  extForeignKey?: Maybe<Scalars['String']>;
  extRecordHash?: Maybe<Scalars['String']>;
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
export type Product = {
  __typename?: 'Product';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the Product List config, or
   *  2. As an alias to the field set on 'labelField' in the Product List config, or
   *  3. As an alias to a 'name' field on the Product List (if one exists), or
   *  4. As an alias to the 'id' field on the Product List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  appId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  dataset?: Maybe<Dataset>;
  organization?: Maybe<Organization>;
  organizationUnit?: Maybe<OrganizationUnit>;
  environments: Array<Environment>;
  _environmentsMeta?: Maybe<_QueryMeta>;
};


/**  A keystone list  */
export type ProductEnvironmentsArgs = {
  where?: Maybe<EnvironmentWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortEnvironmentsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


/**  A keystone list  */
export type Product_EnvironmentsMetaArgs = {
  where?: Maybe<EnvironmentWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortEnvironmentsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type ProductWhereInput = {
  AND?: Maybe<Array<Maybe<ProductWhereInput>>>;
  OR?: Maybe<Array<Maybe<ProductWhereInput>>>;
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

export type ProductWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortProductsBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  AppIdAsc = 'appId_ASC',
  AppIdDesc = 'appId_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  NamespaceAsc = 'namespace_ASC',
  NamespaceDesc = 'namespace_DESC',
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

export type ProductUpdateInput = {
  appId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  dataset?: Maybe<DatasetRelateToOneInput>;
  organization?: Maybe<OrganizationRelateToOneInput>;
  organizationUnit?: Maybe<OrganizationUnitRelateToOneInput>;
  environments?: Maybe<EnvironmentRelateToManyInput>;
};

export type ProductsUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<ProductUpdateInput>;
};

export type ProductCreateInput = {
  appId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  dataset?: Maybe<DatasetRelateToOneInput>;
  organization?: Maybe<OrganizationRelateToOneInput>;
  organizationUnit?: Maybe<OrganizationUnitRelateToOneInput>;
  environments?: Maybe<EnvironmentRelateToManyInput>;
};

export type ProductsCreateInput = {
  data?: Maybe<ProductCreateInput>;
};

export enum ServiceAccessConsumerTypeType {
  Client = 'client',
  User = 'user'
}

export type GatewayConsumerRelateToOneInput = {
  create?: Maybe<GatewayConsumerCreateInput>;
  connect?: Maybe<GatewayConsumerWhereUniqueInput>;
  disconnect?: Maybe<GatewayConsumerWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

/**  A keystone list  */
export type ServiceAccess = {
  __typename?: 'ServiceAccess';
  /**
   * This virtual field will be resolved in one of the following ways (in this order):
   *  1. Execution of 'labelResolver' set on the ServiceAccess List config, or
   *  2. As an alias to the field set on 'labelField' in the ServiceAccess List config, or
   *  3. As an alias to a 'name' field on the ServiceAccess List (if one exists), or
   *  4. As an alias to the 'id' field on the ServiceAccess List.
   */
  _label_?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  active?: Maybe<Scalars['Boolean']>;
  aclEnabled?: Maybe<Scalars['Boolean']>;
  consumerType?: Maybe<ServiceAccessConsumerTypeType>;
  credentialReference?: Maybe<Scalars['String']>;
  credential?: Maybe<Scalars['String']>;
  clientRoles?: Maybe<Scalars['String']>;
  consumer?: Maybe<GatewayConsumer>;
  application?: Maybe<Application>;
  productEnvironment?: Maybe<Environment>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  createdAt?: Maybe<Scalars['DateTime']>;
};

export type ServiceAccessWhereInput = {
  AND?: Maybe<Array<Maybe<ServiceAccessWhereInput>>>;
  OR?: Maybe<Array<Maybe<ServiceAccessWhereInput>>>;
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
  active?: Maybe<Scalars['Boolean']>;
  active_not?: Maybe<Scalars['Boolean']>;
  aclEnabled?: Maybe<Scalars['Boolean']>;
  aclEnabled_not?: Maybe<Scalars['Boolean']>;
  consumerType?: Maybe<ServiceAccessConsumerTypeType>;
  consumerType_not?: Maybe<ServiceAccessConsumerTypeType>;
  consumerType_in?: Maybe<Array<Maybe<ServiceAccessConsumerTypeType>>>;
  consumerType_not_in?: Maybe<Array<Maybe<ServiceAccessConsumerTypeType>>>;
  credentialReference?: Maybe<Scalars['String']>;
  credentialReference_not?: Maybe<Scalars['String']>;
  credentialReference_contains?: Maybe<Scalars['String']>;
  credentialReference_not_contains?: Maybe<Scalars['String']>;
  credentialReference_starts_with?: Maybe<Scalars['String']>;
  credentialReference_not_starts_with?: Maybe<Scalars['String']>;
  credentialReference_ends_with?: Maybe<Scalars['String']>;
  credentialReference_not_ends_with?: Maybe<Scalars['String']>;
  credentialReference_i?: Maybe<Scalars['String']>;
  credentialReference_not_i?: Maybe<Scalars['String']>;
  credentialReference_contains_i?: Maybe<Scalars['String']>;
  credentialReference_not_contains_i?: Maybe<Scalars['String']>;
  credentialReference_starts_with_i?: Maybe<Scalars['String']>;
  credentialReference_not_starts_with_i?: Maybe<Scalars['String']>;
  credentialReference_ends_with_i?: Maybe<Scalars['String']>;
  credentialReference_not_ends_with_i?: Maybe<Scalars['String']>;
  credentialReference_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  credentialReference_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  clientRoles?: Maybe<Scalars['String']>;
  clientRoles_not?: Maybe<Scalars['String']>;
  clientRoles_contains?: Maybe<Scalars['String']>;
  clientRoles_not_contains?: Maybe<Scalars['String']>;
  clientRoles_starts_with?: Maybe<Scalars['String']>;
  clientRoles_not_starts_with?: Maybe<Scalars['String']>;
  clientRoles_ends_with?: Maybe<Scalars['String']>;
  clientRoles_not_ends_with?: Maybe<Scalars['String']>;
  clientRoles_i?: Maybe<Scalars['String']>;
  clientRoles_not_i?: Maybe<Scalars['String']>;
  clientRoles_contains_i?: Maybe<Scalars['String']>;
  clientRoles_not_contains_i?: Maybe<Scalars['String']>;
  clientRoles_starts_with_i?: Maybe<Scalars['String']>;
  clientRoles_not_starts_with_i?: Maybe<Scalars['String']>;
  clientRoles_ends_with_i?: Maybe<Scalars['String']>;
  clientRoles_not_ends_with_i?: Maybe<Scalars['String']>;
  clientRoles_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  clientRoles_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  consumer?: Maybe<GatewayConsumerWhereInput>;
  consumer_is_null?: Maybe<Scalars['Boolean']>;
  application?: Maybe<ApplicationWhereInput>;
  application_is_null?: Maybe<Scalars['Boolean']>;
  productEnvironment?: Maybe<EnvironmentWhereInput>;
  productEnvironment_is_null?: Maybe<Scalars['Boolean']>;
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

export type ServiceAccessWhereUniqueInput = {
  id: Scalars['ID'];
};

export enum SortServiceAccessesBy {
  IdAsc = 'id_ASC',
  IdDesc = 'id_DESC',
  NameAsc = 'name_ASC',
  NameDesc = 'name_DESC',
  NamespaceAsc = 'namespace_ASC',
  NamespaceDesc = 'namespace_DESC',
  ActiveAsc = 'active_ASC',
  ActiveDesc = 'active_DESC',
  AclEnabledAsc = 'aclEnabled_ASC',
  AclEnabledDesc = 'aclEnabled_DESC',
  ConsumerTypeAsc = 'consumerType_ASC',
  ConsumerTypeDesc = 'consumerType_DESC',
  CredentialReferenceAsc = 'credentialReference_ASC',
  CredentialReferenceDesc = 'credentialReference_DESC',
  CredentialAsc = 'credential_ASC',
  CredentialDesc = 'credential_DESC',
  ClientRolesAsc = 'clientRoles_ASC',
  ClientRolesDesc = 'clientRoles_DESC',
  ConsumerAsc = 'consumer_ASC',
  ConsumerDesc = 'consumer_DESC',
  ApplicationAsc = 'application_ASC',
  ApplicationDesc = 'application_DESC',
  ProductEnvironmentAsc = 'productEnvironment_ASC',
  ProductEnvironmentDesc = 'productEnvironment_DESC',
  UpdatedAtAsc = 'updatedAt_ASC',
  UpdatedAtDesc = 'updatedAt_DESC',
  CreatedAtAsc = 'createdAt_ASC',
  CreatedAtDesc = 'createdAt_DESC'
}

export type ServiceAccessUpdateInput = {
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  active?: Maybe<Scalars['Boolean']>;
  aclEnabled?: Maybe<Scalars['Boolean']>;
  consumerType?: Maybe<ServiceAccessConsumerTypeType>;
  credentialReference?: Maybe<Scalars['String']>;
  credential?: Maybe<Scalars['String']>;
  clientRoles?: Maybe<Scalars['String']>;
  consumer?: Maybe<GatewayConsumerRelateToOneInput>;
  application?: Maybe<ApplicationRelateToOneInput>;
  productEnvironment?: Maybe<EnvironmentRelateToOneInput>;
};

export type ServiceAccessesUpdateInput = {
  id: Scalars['ID'];
  data?: Maybe<ServiceAccessUpdateInput>;
};

export type ServiceAccessCreateInput = {
  name?: Maybe<Scalars['String']>;
  namespace?: Maybe<Scalars['String']>;
  active?: Maybe<Scalars['Boolean']>;
  aclEnabled?: Maybe<Scalars['Boolean']>;
  consumerType?: Maybe<ServiceAccessConsumerTypeType>;
  credentialReference?: Maybe<Scalars['String']>;
  credential?: Maybe<Scalars['String']>;
  clientRoles?: Maybe<Scalars['String']>;
  consumer?: Maybe<GatewayConsumerRelateToOneInput>;
  application?: Maybe<ApplicationRelateToOneInput>;
  productEnvironment?: Maybe<EnvironmentRelateToOneInput>;
};

export type ServiceAccessesCreateInput = {
  data?: Maybe<ServiceAccessCreateInput>;
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
  scopes?: Maybe<Scalars['String']>;
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
  scopes?: Maybe<Scalars['String']>;
  scopes_not?: Maybe<Scalars['String']>;
  scopes_contains?: Maybe<Scalars['String']>;
  scopes_not_contains?: Maybe<Scalars['String']>;
  scopes_starts_with?: Maybe<Scalars['String']>;
  scopes_not_starts_with?: Maybe<Scalars['String']>;
  scopes_ends_with?: Maybe<Scalars['String']>;
  scopes_not_ends_with?: Maybe<Scalars['String']>;
  scopes_i?: Maybe<Scalars['String']>;
  scopes_not_i?: Maybe<Scalars['String']>;
  scopes_contains_i?: Maybe<Scalars['String']>;
  scopes_not_contains_i?: Maybe<Scalars['String']>;
  scopes_starts_with_i?: Maybe<Scalars['String']>;
  scopes_not_starts_with_i?: Maybe<Scalars['String']>;
  scopes_ends_with_i?: Maybe<Scalars['String']>;
  scopes_not_ends_with_i?: Maybe<Scalars['String']>;
  scopes_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  scopes_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  ScopesAsc = 'scopes_ASC',
  ScopesDesc = 'scopes_DESC',
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
  scopes?: Maybe<Scalars['String']>;
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
  scopes?: Maybe<Scalars['String']>;
};

export type TemporaryIdentitiesCreateInput = {
  data?: Maybe<TemporaryIdentityCreateInput>;
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
  legalsAgreed?: Maybe<Scalars['String']>;
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
  legalsAgreed?: Maybe<Scalars['String']>;
  legalsAgreed_not?: Maybe<Scalars['String']>;
  legalsAgreed_contains?: Maybe<Scalars['String']>;
  legalsAgreed_not_contains?: Maybe<Scalars['String']>;
  legalsAgreed_starts_with?: Maybe<Scalars['String']>;
  legalsAgreed_not_starts_with?: Maybe<Scalars['String']>;
  legalsAgreed_ends_with?: Maybe<Scalars['String']>;
  legalsAgreed_not_ends_with?: Maybe<Scalars['String']>;
  legalsAgreed_i?: Maybe<Scalars['String']>;
  legalsAgreed_not_i?: Maybe<Scalars['String']>;
  legalsAgreed_contains_i?: Maybe<Scalars['String']>;
  legalsAgreed_not_contains_i?: Maybe<Scalars['String']>;
  legalsAgreed_starts_with_i?: Maybe<Scalars['String']>;
  legalsAgreed_not_starts_with_i?: Maybe<Scalars['String']>;
  legalsAgreed_ends_with_i?: Maybe<Scalars['String']>;
  legalsAgreed_not_ends_with_i?: Maybe<Scalars['String']>;
  legalsAgreed_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  legalsAgreed_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
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
  IsAdminDesc = 'isAdmin_DESC',
  LegalsAgreedAsc = 'legalsAgreed_ASC',
  LegalsAgreedDesc = 'legalsAgreed_DESC'
}

export type UserUpdateInput = {
  name?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  isAdmin?: Maybe<Scalars['Boolean']>;
  password?: Maybe<Scalars['String']>;
  legalsAgreed?: Maybe<Scalars['String']>;
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
  legalsAgreed?: Maybe<Scalars['String']>;
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

export type ApplicationSummary = {
  __typename?: 'ApplicationSummary';
  appId?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type BusinessProfile = {
  __typename?: 'BusinessProfile';
  user?: Maybe<UserDetails>;
  institution?: Maybe<InstitutionDetails>;
};

export type UserDetails = {
  __typename?: 'UserDetails';
  guid?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  firstname?: Maybe<Scalars['String']>;
  surname?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  isSuspended?: Maybe<Scalars['Boolean']>;
  isManagerDisabled?: Maybe<Scalars['Boolean']>;
};

export type InstitutionDetails = {
  __typename?: 'InstitutionDetails';
  guid?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  legalName?: Maybe<Scalars['String']>;
  address?: Maybe<AddressDetails>;
  isSuspended?: Maybe<Scalars['Boolean']>;
  businessTypeOther?: Maybe<Scalars['String']>;
};

export type AddressDetails = {
  __typename?: 'AddressDetails';
  addressLine1?: Maybe<Scalars['String']>;
  addressLine2?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  postal?: Maybe<Scalars['String']>;
  province?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
};

export type ConsumerScopesAndRoles = {
  __typename?: 'ConsumerScopesAndRoles';
  id: Scalars['String'];
  consumerType: Scalars['String'];
  defaultScopes: Array<Maybe<Scalars['String']>>;
  optionalScopes: Array<Maybe<Scalars['String']>>;
  clientRoles: Array<Maybe<Scalars['String']>>;
};

export type ConsumerScopesAndRolesInput = {
  id: Scalars['String'];
  defaultScopes: Array<Maybe<Scalars['String']>>;
  optionalScopes: Array<Maybe<Scalars['String']>>;
  clientRoles: Array<Maybe<Scalars['String']>>;
};

export type Namespace = {
  __typename?: 'Namespace';
  id: Scalars['String'];
  name: Scalars['String'];
  scopes: Array<Maybe<UmaScope>>;
  prodEnvId?: Maybe<Scalars['String']>;
};

export type NamespaceInput = {
  name: Scalars['String'];
};

export type ServiceAccount = {
  __typename?: 'ServiceAccount';
  id: Scalars['String'];
  name: Scalars['String'];
  credentials?: Maybe<Scalars['String']>;
};

export type ServiceAccountInput = {
  __typename?: 'ServiceAccountInput';
  id: Scalars['String'];
  name: Scalars['String'];
  scopes?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type UmaPolicy = {
  __typename?: 'UMAPolicy';
  id: Scalars['String'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  type: Scalars['String'];
  logic: Scalars['String'];
  decisionStrategy: Scalars['String'];
  owner: Scalars['String'];
  users?: Maybe<Array<Maybe<Scalars['String']>>>;
  clients?: Maybe<Array<Maybe<Scalars['String']>>>;
  scopes: Array<Maybe<Scalars['String']>>;
};

export type UmaPolicyInput = {
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  users?: Maybe<Array<Maybe<Scalars['String']>>>;
  clients?: Maybe<Array<Maybe<Scalars['String']>>>;
  scopes: Array<Maybe<Scalars['String']>>;
};

export type UmaScope = {
  __typename?: 'UMAScope';
  name: Scalars['String'];
};

export type UmaResourceSet = {
  __typename?: 'UMAResourceSet';
  id: Scalars['String'];
  name: Scalars['String'];
  type: Scalars['String'];
  owner: Scalars['String'];
  ownerManagedAccess?: Maybe<Scalars['Boolean']>;
  uris?: Maybe<Array<Maybe<Scalars['String']>>>;
  resource_scopes?: Maybe<Array<Maybe<UmaScope>>>;
};

export type UmaPermissionTicket = {
  __typename?: 'UMAPermissionTicket';
  id: Scalars['String'];
  scope: Scalars['String'];
  scopeName: Scalars['String'];
  resource: Scalars['String'];
  resourceName: Scalars['String'];
  requester: Scalars['String'];
  requesterName: Scalars['String'];
  owner: Scalars['String'];
  ownerName: Scalars['String'];
  granted: Scalars['Boolean'];
};

export type UmaPermissionTicketInput = {
  resourceId: Scalars['String'];
  username: Scalars['String'];
  granted?: Maybe<Scalars['Boolean']>;
  scopes: Array<Maybe<Scalars['String']>>;
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
  /**  Search for all Alert items which match the where clause.  */
  allAlerts?: Maybe<Array<Maybe<Alert>>>;
  /**  Search for the Alert item with the matching ID.  */
  Alert?: Maybe<Alert>;
  /**  Perform a meta-query on all Alert items which match the where clause.  */
  _allAlertsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Alert list.  */
  _AlertsMeta?: Maybe<_ListMeta>;
  /**  Search for all Application items which match the where clause.  */
  allApplications?: Maybe<Array<Maybe<Application>>>;
  /**  Search for the Application item with the matching ID.  */
  Application?: Maybe<Application>;
  /**  Perform a meta-query on all Application items which match the where clause.  */
  _allApplicationsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Application list.  */
  _ApplicationsMeta?: Maybe<_ListMeta>;
  /**  Search for all Blob items which match the where clause.  */
  allBlobs?: Maybe<Array<Maybe<Blob>>>;
  /**  Search for the Blob item with the matching ID.  */
  Blob?: Maybe<Blob>;
  /**  Perform a meta-query on all Blob items which match the where clause.  */
  _allBlobsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Blob list.  */
  _BlobsMeta?: Maybe<_ListMeta>;
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
  /**  Search for all GatewayConsumer items which match the where clause.  */
  allGatewayConsumers?: Maybe<Array<Maybe<GatewayConsumer>>>;
  /**  Search for the GatewayConsumer item with the matching ID.  */
  GatewayConsumer?: Maybe<GatewayConsumer>;
  /**  Perform a meta-query on all GatewayConsumer items which match the where clause.  */
  _allGatewayConsumersMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the GatewayConsumer list.  */
  _GatewayConsumersMeta?: Maybe<_ListMeta>;
  /**  Search for all GatewayGroup items which match the where clause.  */
  allGatewayGroups?: Maybe<Array<Maybe<GatewayGroup>>>;
  /**  Search for the GatewayGroup item with the matching ID.  */
  GatewayGroup?: Maybe<GatewayGroup>;
  /**  Perform a meta-query on all GatewayGroup items which match the where clause.  */
  _allGatewayGroupsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the GatewayGroup list.  */
  _GatewayGroupsMeta?: Maybe<_ListMeta>;
  /**  Search for all GatewayPlugin items which match the where clause.  */
  allGatewayPlugins?: Maybe<Array<Maybe<GatewayPlugin>>>;
  /**  Search for the GatewayPlugin item with the matching ID.  */
  GatewayPlugin?: Maybe<GatewayPlugin>;
  /**  Perform a meta-query on all GatewayPlugin items which match the where clause.  */
  _allGatewayPluginsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the GatewayPlugin list.  */
  _GatewayPluginsMeta?: Maybe<_ListMeta>;
  /**  Search for all GatewayRoute items which match the where clause.  */
  allGatewayRoutes?: Maybe<Array<Maybe<GatewayRoute>>>;
  /**  Search for the GatewayRoute item with the matching ID.  */
  GatewayRoute?: Maybe<GatewayRoute>;
  /**  Perform a meta-query on all GatewayRoute items which match the where clause.  */
  _allGatewayRoutesMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the GatewayRoute list.  */
  _GatewayRoutesMeta?: Maybe<_ListMeta>;
  /**  Search for all GatewayService items which match the where clause.  */
  allGatewayServices?: Maybe<Array<Maybe<GatewayService>>>;
  /**  Search for the GatewayService item with the matching ID.  */
  GatewayService?: Maybe<GatewayService>;
  /**  Perform a meta-query on all GatewayService items which match the where clause.  */
  _allGatewayServicesMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the GatewayService list.  */
  _GatewayServicesMeta?: Maybe<_ListMeta>;
  /**  Search for all Legal items which match the where clause.  */
  allLegals?: Maybe<Array<Maybe<Legal>>>;
  /**  Search for the Legal item with the matching ID.  */
  Legal?: Maybe<Legal>;
  /**  Perform a meta-query on all Legal items which match the where clause.  */
  _allLegalsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Legal list.  */
  _LegalsMeta?: Maybe<_ListMeta>;
  /**  Search for all Metric items which match the where clause.  */
  allMetrics?: Maybe<Array<Maybe<Metric>>>;
  /**  Search for the Metric item with the matching ID.  */
  Metric?: Maybe<Metric>;
  /**  Perform a meta-query on all Metric items which match the where clause.  */
  _allMetricsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Metric list.  */
  _MetricsMeta?: Maybe<_ListMeta>;
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
  /**  Search for all Product items which match the where clause.  */
  allProducts?: Maybe<Array<Maybe<Product>>>;
  /**  Search for the Product item with the matching ID.  */
  Product?: Maybe<Product>;
  /**  Perform a meta-query on all Product items which match the where clause.  */
  _allProductsMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the Product list.  */
  _ProductsMeta?: Maybe<_ListMeta>;
  /**  Search for all ServiceAccess items which match the where clause.  */
  allServiceAccesses?: Maybe<Array<Maybe<ServiceAccess>>>;
  /**  Search for the ServiceAccess item with the matching ID.  */
  ServiceAccess?: Maybe<ServiceAccess>;
  /**  Perform a meta-query on all ServiceAccess items which match the where clause.  */
  _allServiceAccessesMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the ServiceAccess list.  */
  _ServiceAccessesMeta?: Maybe<_ListMeta>;
  /**  Search for all TemporaryIdentity items which match the where clause.  */
  allTemporaryIdentities?: Maybe<Array<Maybe<TemporaryIdentity>>>;
  /**  Search for the TemporaryIdentity item with the matching ID.  */
  TemporaryIdentity?: Maybe<TemporaryIdentity>;
  /**  Perform a meta-query on all TemporaryIdentity items which match the where clause.  */
  _allTemporaryIdentitiesMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for the TemporaryIdentity list.  */
  _TemporaryIdentitiesMeta?: Maybe<_ListMeta>;
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
  allApplicationNames?: Maybe<Array<Maybe<ApplicationSummary>>>;
  getGatewayConsumerPlugins?: Maybe<GatewayConsumer>;
  allDiscoverableProducts?: Maybe<Array<Maybe<Product>>>;
  allGatewayServicesByNamespace?: Maybe<Array<Maybe<GatewayService>>>;
  allProductsByNamespace?: Maybe<Array<Maybe<Product>>>;
  allAccessRequestsByNamespace?: Maybe<Array<Maybe<AccessRequest>>>;
  allServiceAccessesByNamespace?: Maybe<Array<Maybe<ServiceAccess>>>;
  allCredentialIssuersByNamespace?: Maybe<Array<Maybe<CredentialIssuer>>>;
  allNamespaceServiceAccounts?: Maybe<Array<Maybe<ServiceAccess>>>;
  DiscoverableProduct?: Maybe<Product>;
  myServiceAccesses?: Maybe<Array<Maybe<ServiceAccess>>>;
  myApplications?: Maybe<Array<Maybe<Application>>>;
  mySelf?: Maybe<User>;
  CredentialIssuerSummary?: Maybe<CredentialIssuer>;
  allDiscoverableContents?: Maybe<Array<Maybe<Content>>>;
  BusinessProfile?: Maybe<BusinessProfile>;
  consumerScopesAndRoles?: Maybe<ConsumerScopesAndRoles>;
  currentNamespace?: Maybe<Namespace>;
  allNamespaces?: Maybe<Array<Maybe<Namespace>>>;
  getUmaPoliciesForResource?: Maybe<Array<Maybe<UmaPolicy>>>;
  allResourceSets?: Maybe<Array<Maybe<UmaResourceSet>>>;
  getResourceSet?: Maybe<UmaResourceSet>;
  allPermissionTickets?: Maybe<Array<Maybe<UmaPermissionTicket>>>;
  getPermissionTicketsForResource?: Maybe<Array<Maybe<UmaPermissionTicket>>>;
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


export type QueryAllAlertsArgs = {
  where?: Maybe<AlertWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortAlertsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAlertArgs = {
  where: AlertWhereUniqueInput;
};


export type Query_AllAlertsMetaArgs = {
  where?: Maybe<AlertWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortAlertsBy>>;
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


export type QueryAllBlobsArgs = {
  where?: Maybe<BlobWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortBlobsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryBlobArgs = {
  where: BlobWhereUniqueInput;
};


export type Query_AllBlobsMetaArgs = {
  where?: Maybe<BlobWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortBlobsBy>>;
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


export type QueryAllGatewayConsumersArgs = {
  where?: Maybe<GatewayConsumerWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayConsumersBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryGatewayConsumerArgs = {
  where: GatewayConsumerWhereUniqueInput;
};


export type Query_AllGatewayConsumersMetaArgs = {
  where?: Maybe<GatewayConsumerWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayConsumersBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllGatewayGroupsArgs = {
  where?: Maybe<GatewayGroupWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayGroupsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryGatewayGroupArgs = {
  where: GatewayGroupWhereUniqueInput;
};


export type Query_AllGatewayGroupsMetaArgs = {
  where?: Maybe<GatewayGroupWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayGroupsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllGatewayPluginsArgs = {
  where?: Maybe<GatewayPluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryGatewayPluginArgs = {
  where: GatewayPluginWhereUniqueInput;
};


export type Query_AllGatewayPluginsMetaArgs = {
  where?: Maybe<GatewayPluginWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayPluginsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllGatewayRoutesArgs = {
  where?: Maybe<GatewayRouteWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayRoutesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryGatewayRouteArgs = {
  where: GatewayRouteWhereUniqueInput;
};


export type Query_AllGatewayRoutesMetaArgs = {
  where?: Maybe<GatewayRouteWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayRoutesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllGatewayServicesArgs = {
  where?: Maybe<GatewayServiceWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayServicesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryGatewayServiceArgs = {
  where: GatewayServiceWhereUniqueInput;
};


export type Query_AllGatewayServicesMetaArgs = {
  where?: Maybe<GatewayServiceWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortGatewayServicesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllLegalsArgs = {
  where?: Maybe<LegalWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortLegalsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryLegalArgs = {
  where: LegalWhereUniqueInput;
};


export type Query_AllLegalsMetaArgs = {
  where?: Maybe<LegalWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortLegalsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllMetricsArgs = {
  where?: Maybe<MetricWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortMetricsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryMetricArgs = {
  where: MetricWhereUniqueInput;
};


export type Query_AllMetricsMetaArgs = {
  where?: Maybe<MetricWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortMetricsBy>>;
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


export type QueryAllProductsArgs = {
  where?: Maybe<ProductWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortProductsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryProductArgs = {
  where: ProductWhereUniqueInput;
};


export type Query_AllProductsMetaArgs = {
  where?: Maybe<ProductWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortProductsBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryAllServiceAccessesArgs = {
  where?: Maybe<ServiceAccessWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortServiceAccessesBy>>;
  orderBy?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};


export type QueryServiceAccessArgs = {
  where: ServiceAccessWhereUniqueInput;
};


export type Query_AllServiceAccessesMetaArgs = {
  where?: Maybe<ServiceAccessWhereInput>;
  search?: Maybe<Scalars['String']>;
  sortBy?: Maybe<Array<SortServiceAccessesBy>>;
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


export type QueryGetGatewayConsumerPluginsArgs = {
  id: Scalars['ID'];
};


export type QueryAllDiscoverableProductsArgs = {
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  where?: Maybe<ProductWhereInput>;
};


export type QueryAllGatewayServicesByNamespaceArgs = {
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  where?: Maybe<GatewayServiceWhereInput>;
};


export type QueryAllProductsByNamespaceArgs = {
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  where?: Maybe<ProductWhereInput>;
};


export type QueryAllAccessRequestsByNamespaceArgs = {
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  where?: Maybe<AccessRequestWhereInput>;
};


export type QueryAllServiceAccessesByNamespaceArgs = {
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  where?: Maybe<ServiceAccessWhereInput>;
};


export type QueryAllCredentialIssuersByNamespaceArgs = {
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  where?: Maybe<CredentialIssuerWhereInput>;
};


export type QueryAllNamespaceServiceAccountsArgs = {
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  where?: Maybe<ServiceAccessWhereInput>;
};


export type QueryDiscoverableProductArgs = {
  where?: Maybe<ProductWhereInput>;
};


export type QueryMyServiceAccessesArgs = {
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  where?: Maybe<ServiceAccessWhereInput>;
};


export type QueryMyApplicationsArgs = {
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  where?: Maybe<ApplicationWhereInput>;
};


export type QueryMySelfArgs = {
  where?: Maybe<UserWhereInput>;
};


export type QueryCredentialIssuerSummaryArgs = {
  where?: Maybe<CredentialIssuerWhereInput>;
};


export type QueryAllDiscoverableContentsArgs = {
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  where?: Maybe<ContentWhereInput>;
};


export type QueryBusinessProfileArgs = {
  serviceAccessId: Scalars['ID'];
};


export type QueryConsumerScopesAndRolesArgs = {
  prodEnvId: Scalars['ID'];
  consumerUsername: Scalars['ID'];
};


export type QueryGetUmaPoliciesForResourceArgs = {
  prodEnvId: Scalars['ID'];
  resourceId: Scalars['String'];
};


export type QueryAllResourceSetsArgs = {
  prodEnvId: Scalars['ID'];
  type?: Maybe<Scalars['String']>;
};


export type QueryGetResourceSetArgs = {
  prodEnvId: Scalars['ID'];
  resourceId: Scalars['String'];
};


export type QueryAllPermissionTicketsArgs = {
  prodEnvId: Scalars['ID'];
};


export type QueryGetPermissionTicketsForResourceArgs = {
  prodEnvId: Scalars['ID'];
  resourceId: Scalars['String'];
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
  /**  Create a single Alert item.  */
  createAlert?: Maybe<Alert>;
  /**  Create multiple Alert items.  */
  createAlerts?: Maybe<Array<Maybe<Alert>>>;
  /**  Update a single Alert item by ID.  */
  updateAlert?: Maybe<Alert>;
  /**  Update multiple Alert items by ID.  */
  updateAlerts?: Maybe<Array<Maybe<Alert>>>;
  /**  Delete a single Alert item by ID.  */
  deleteAlert?: Maybe<Alert>;
  /**  Delete multiple Alert items by ID.  */
  deleteAlerts?: Maybe<Array<Maybe<Alert>>>;
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
  /**  Create a single Blob item.  */
  createBlob?: Maybe<Blob>;
  /**  Create multiple Blob items.  */
  createBlobs?: Maybe<Array<Maybe<Blob>>>;
  /**  Update a single Blob item by ID.  */
  updateBlob?: Maybe<Blob>;
  /**  Update multiple Blob items by ID.  */
  updateBlobs?: Maybe<Array<Maybe<Blob>>>;
  /**  Delete a single Blob item by ID.  */
  deleteBlob?: Maybe<Blob>;
  /**  Delete multiple Blob items by ID.  */
  deleteBlobs?: Maybe<Array<Maybe<Blob>>>;
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
  /**  Create a single GatewayConsumer item.  */
  createGatewayConsumer?: Maybe<GatewayConsumer>;
  /**  Create multiple GatewayConsumer items.  */
  createGatewayConsumers?: Maybe<Array<Maybe<GatewayConsumer>>>;
  /**  Update a single GatewayConsumer item by ID.  */
  updateGatewayConsumer?: Maybe<GatewayConsumer>;
  /**  Update multiple GatewayConsumer items by ID.  */
  updateGatewayConsumers?: Maybe<Array<Maybe<GatewayConsumer>>>;
  /**  Delete a single GatewayConsumer item by ID.  */
  deleteGatewayConsumer?: Maybe<GatewayConsumer>;
  /**  Delete multiple GatewayConsumer items by ID.  */
  deleteGatewayConsumers?: Maybe<Array<Maybe<GatewayConsumer>>>;
  /**  Create a single GatewayGroup item.  */
  createGatewayGroup?: Maybe<GatewayGroup>;
  /**  Create multiple GatewayGroup items.  */
  createGatewayGroups?: Maybe<Array<Maybe<GatewayGroup>>>;
  /**  Update a single GatewayGroup item by ID.  */
  updateGatewayGroup?: Maybe<GatewayGroup>;
  /**  Update multiple GatewayGroup items by ID.  */
  updateGatewayGroups?: Maybe<Array<Maybe<GatewayGroup>>>;
  /**  Delete a single GatewayGroup item by ID.  */
  deleteGatewayGroup?: Maybe<GatewayGroup>;
  /**  Delete multiple GatewayGroup items by ID.  */
  deleteGatewayGroups?: Maybe<Array<Maybe<GatewayGroup>>>;
  /**  Create a single GatewayPlugin item.  */
  createGatewayPlugin?: Maybe<GatewayPlugin>;
  /**  Create multiple GatewayPlugin items.  */
  createGatewayPlugins?: Maybe<Array<Maybe<GatewayPlugin>>>;
  /**  Update a single GatewayPlugin item by ID.  */
  updateGatewayPlugin?: Maybe<GatewayPlugin>;
  /**  Update multiple GatewayPlugin items by ID.  */
  updateGatewayPlugins?: Maybe<Array<Maybe<GatewayPlugin>>>;
  /**  Delete a single GatewayPlugin item by ID.  */
  deleteGatewayPlugin?: Maybe<GatewayPlugin>;
  /**  Delete multiple GatewayPlugin items by ID.  */
  deleteGatewayPlugins?: Maybe<Array<Maybe<GatewayPlugin>>>;
  /**  Create a single GatewayRoute item.  */
  createGatewayRoute?: Maybe<GatewayRoute>;
  /**  Create multiple GatewayRoute items.  */
  createGatewayRoutes?: Maybe<Array<Maybe<GatewayRoute>>>;
  /**  Update a single GatewayRoute item by ID.  */
  updateGatewayRoute?: Maybe<GatewayRoute>;
  /**  Update multiple GatewayRoute items by ID.  */
  updateGatewayRoutes?: Maybe<Array<Maybe<GatewayRoute>>>;
  /**  Delete a single GatewayRoute item by ID.  */
  deleteGatewayRoute?: Maybe<GatewayRoute>;
  /**  Delete multiple GatewayRoute items by ID.  */
  deleteGatewayRoutes?: Maybe<Array<Maybe<GatewayRoute>>>;
  /**  Create a single GatewayService item.  */
  createGatewayService?: Maybe<GatewayService>;
  /**  Create multiple GatewayService items.  */
  createGatewayServices?: Maybe<Array<Maybe<GatewayService>>>;
  /**  Update a single GatewayService item by ID.  */
  updateGatewayService?: Maybe<GatewayService>;
  /**  Update multiple GatewayService items by ID.  */
  updateGatewayServices?: Maybe<Array<Maybe<GatewayService>>>;
  /**  Delete a single GatewayService item by ID.  */
  deleteGatewayService?: Maybe<GatewayService>;
  /**  Delete multiple GatewayService items by ID.  */
  deleteGatewayServices?: Maybe<Array<Maybe<GatewayService>>>;
  /**  Create a single Legal item.  */
  createLegal?: Maybe<Legal>;
  /**  Create multiple Legal items.  */
  createLegals?: Maybe<Array<Maybe<Legal>>>;
  /**  Update a single Legal item by ID.  */
  updateLegal?: Maybe<Legal>;
  /**  Update multiple Legal items by ID.  */
  updateLegals?: Maybe<Array<Maybe<Legal>>>;
  /**  Delete a single Legal item by ID.  */
  deleteLegal?: Maybe<Legal>;
  /**  Delete multiple Legal items by ID.  */
  deleteLegals?: Maybe<Array<Maybe<Legal>>>;
  /**  Create a single Metric item.  */
  createMetric?: Maybe<Metric>;
  /**  Create multiple Metric items.  */
  createMetrics?: Maybe<Array<Maybe<Metric>>>;
  /**  Update a single Metric item by ID.  */
  updateMetric?: Maybe<Metric>;
  /**  Update multiple Metric items by ID.  */
  updateMetrics?: Maybe<Array<Maybe<Metric>>>;
  /**  Delete a single Metric item by ID.  */
  deleteMetric?: Maybe<Metric>;
  /**  Delete multiple Metric items by ID.  */
  deleteMetrics?: Maybe<Array<Maybe<Metric>>>;
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
  /**  Create a single Product item.  */
  createProduct?: Maybe<Product>;
  /**  Create multiple Product items.  */
  createProducts?: Maybe<Array<Maybe<Product>>>;
  /**  Update a single Product item by ID.  */
  updateProduct?: Maybe<Product>;
  /**  Update multiple Product items by ID.  */
  updateProducts?: Maybe<Array<Maybe<Product>>>;
  /**  Delete a single Product item by ID.  */
  deleteProduct?: Maybe<Product>;
  /**  Delete multiple Product items by ID.  */
  deleteProducts?: Maybe<Array<Maybe<Product>>>;
  /**  Create a single ServiceAccess item.  */
  createServiceAccess?: Maybe<ServiceAccess>;
  /**  Create multiple ServiceAccess items.  */
  createServiceAccesses?: Maybe<Array<Maybe<ServiceAccess>>>;
  /**  Update a single ServiceAccess item by ID.  */
  updateServiceAccess?: Maybe<ServiceAccess>;
  /**  Update multiple ServiceAccess items by ID.  */
  updateServiceAccesses?: Maybe<Array<Maybe<ServiceAccess>>>;
  /**  Delete a single ServiceAccess item by ID.  */
  deleteServiceAccess?: Maybe<ServiceAccess>;
  /**  Delete multiple ServiceAccess items by ID.  */
  deleteServiceAccesses?: Maybe<Array<Maybe<ServiceAccess>>>;
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
  createGatewayConsumerPlugin?: Maybe<GatewayConsumer>;
  updateGatewayConsumerPlugin?: Maybe<GatewayConsumer>;
  deleteGatewayConsumerPlugin?: Maybe<GatewayConsumer>;
  acceptLegal?: Maybe<User>;
  updateConsumerGroupMembership?: Maybe<Scalars['Boolean']>;
  linkConsumerToNamespace?: Maybe<Scalars['Boolean']>;
  updateConsumerRoleAssignment?: Maybe<Scalars['Boolean']>;
  createNamespace?: Maybe<Namespace>;
  deleteNamespace?: Maybe<Scalars['Boolean']>;
  createServiceAccount?: Maybe<ServiceAccount>;
  createUmaPolicy?: Maybe<UmaPolicy>;
  deleteUmaPolicy?: Maybe<Scalars['Boolean']>;
  grantPermissions?: Maybe<Array<Maybe<UmaPermissionTicket>>>;
  revokePermissions?: Maybe<Scalars['Boolean']>;
  approvePermissions?: Maybe<Scalars['Boolean']>;
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


export type MutationCreateAlertArgs = {
  data?: Maybe<AlertCreateInput>;
};


export type MutationCreateAlertsArgs = {
  data?: Maybe<Array<Maybe<AlertsCreateInput>>>;
};


export type MutationUpdateAlertArgs = {
  id: Scalars['ID'];
  data?: Maybe<AlertUpdateInput>;
};


export type MutationUpdateAlertsArgs = {
  data?: Maybe<Array<Maybe<AlertsUpdateInput>>>;
};


export type MutationDeleteAlertArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteAlertsArgs = {
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


export type MutationCreateBlobArgs = {
  data?: Maybe<BlobCreateInput>;
};


export type MutationCreateBlobsArgs = {
  data?: Maybe<Array<Maybe<BlobsCreateInput>>>;
};


export type MutationUpdateBlobArgs = {
  id: Scalars['ID'];
  data?: Maybe<BlobUpdateInput>;
};


export type MutationUpdateBlobsArgs = {
  data?: Maybe<Array<Maybe<BlobsUpdateInput>>>;
};


export type MutationDeleteBlobArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteBlobsArgs = {
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


export type MutationCreateGatewayConsumerArgs = {
  data?: Maybe<GatewayConsumerCreateInput>;
};


export type MutationCreateGatewayConsumersArgs = {
  data?: Maybe<Array<Maybe<GatewayConsumersCreateInput>>>;
};


export type MutationUpdateGatewayConsumerArgs = {
  id: Scalars['ID'];
  data?: Maybe<GatewayConsumerUpdateInput>;
};


export type MutationUpdateGatewayConsumersArgs = {
  data?: Maybe<Array<Maybe<GatewayConsumersUpdateInput>>>;
};


export type MutationDeleteGatewayConsumerArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteGatewayConsumersArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateGatewayGroupArgs = {
  data?: Maybe<GatewayGroupCreateInput>;
};


export type MutationCreateGatewayGroupsArgs = {
  data?: Maybe<Array<Maybe<GatewayGroupsCreateInput>>>;
};


export type MutationUpdateGatewayGroupArgs = {
  id: Scalars['ID'];
  data?: Maybe<GatewayGroupUpdateInput>;
};


export type MutationUpdateGatewayGroupsArgs = {
  data?: Maybe<Array<Maybe<GatewayGroupsUpdateInput>>>;
};


export type MutationDeleteGatewayGroupArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteGatewayGroupsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateGatewayPluginArgs = {
  data?: Maybe<GatewayPluginCreateInput>;
};


export type MutationCreateGatewayPluginsArgs = {
  data?: Maybe<Array<Maybe<GatewayPluginsCreateInput>>>;
};


export type MutationUpdateGatewayPluginArgs = {
  id: Scalars['ID'];
  data?: Maybe<GatewayPluginUpdateInput>;
};


export type MutationUpdateGatewayPluginsArgs = {
  data?: Maybe<Array<Maybe<GatewayPluginsUpdateInput>>>;
};


export type MutationDeleteGatewayPluginArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteGatewayPluginsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateGatewayRouteArgs = {
  data?: Maybe<GatewayRouteCreateInput>;
};


export type MutationCreateGatewayRoutesArgs = {
  data?: Maybe<Array<Maybe<GatewayRoutesCreateInput>>>;
};


export type MutationUpdateGatewayRouteArgs = {
  id: Scalars['ID'];
  data?: Maybe<GatewayRouteUpdateInput>;
};


export type MutationUpdateGatewayRoutesArgs = {
  data?: Maybe<Array<Maybe<GatewayRoutesUpdateInput>>>;
};


export type MutationDeleteGatewayRouteArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteGatewayRoutesArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateGatewayServiceArgs = {
  data?: Maybe<GatewayServiceCreateInput>;
};


export type MutationCreateGatewayServicesArgs = {
  data?: Maybe<Array<Maybe<GatewayServicesCreateInput>>>;
};


export type MutationUpdateGatewayServiceArgs = {
  id: Scalars['ID'];
  data?: Maybe<GatewayServiceUpdateInput>;
};


export type MutationUpdateGatewayServicesArgs = {
  data?: Maybe<Array<Maybe<GatewayServicesUpdateInput>>>;
};


export type MutationDeleteGatewayServiceArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteGatewayServicesArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateLegalArgs = {
  data?: Maybe<LegalCreateInput>;
};


export type MutationCreateLegalsArgs = {
  data?: Maybe<Array<Maybe<LegalsCreateInput>>>;
};


export type MutationUpdateLegalArgs = {
  id: Scalars['ID'];
  data?: Maybe<LegalUpdateInput>;
};


export type MutationUpdateLegalsArgs = {
  data?: Maybe<Array<Maybe<LegalsUpdateInput>>>;
};


export type MutationDeleteLegalArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteLegalsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateMetricArgs = {
  data?: Maybe<MetricCreateInput>;
};


export type MutationCreateMetricsArgs = {
  data?: Maybe<Array<Maybe<MetricsCreateInput>>>;
};


export type MutationUpdateMetricArgs = {
  id: Scalars['ID'];
  data?: Maybe<MetricUpdateInput>;
};


export type MutationUpdateMetricsArgs = {
  data?: Maybe<Array<Maybe<MetricsUpdateInput>>>;
};


export type MutationDeleteMetricArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteMetricsArgs = {
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


export type MutationCreateProductArgs = {
  data?: Maybe<ProductCreateInput>;
};


export type MutationCreateProductsArgs = {
  data?: Maybe<Array<Maybe<ProductsCreateInput>>>;
};


export type MutationUpdateProductArgs = {
  id: Scalars['ID'];
  data?: Maybe<ProductUpdateInput>;
};


export type MutationUpdateProductsArgs = {
  data?: Maybe<Array<Maybe<ProductsUpdateInput>>>;
};


export type MutationDeleteProductArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteProductsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationCreateServiceAccessArgs = {
  data?: Maybe<ServiceAccessCreateInput>;
};


export type MutationCreateServiceAccessesArgs = {
  data?: Maybe<Array<Maybe<ServiceAccessesCreateInput>>>;
};


export type MutationUpdateServiceAccessArgs = {
  id: Scalars['ID'];
  data?: Maybe<ServiceAccessUpdateInput>;
};


export type MutationUpdateServiceAccessesArgs = {
  data?: Maybe<Array<Maybe<ServiceAccessesUpdateInput>>>;
};


export type MutationDeleteServiceAccessArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteServiceAccessesArgs = {
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


export type MutationCreateGatewayConsumerPluginArgs = {
  id: Scalars['ID'];
  plugin: Scalars['String'];
};


export type MutationUpdateGatewayConsumerPluginArgs = {
  id: Scalars['ID'];
  pluginExtForeignKey: Scalars['String'];
  plugin: Scalars['String'];
};


export type MutationDeleteGatewayConsumerPluginArgs = {
  id: Scalars['ID'];
  pluginExtForeignKey: Scalars['String'];
};


export type MutationAcceptLegalArgs = {
  productEnvironmentId: Scalars['ID'];
  acceptLegal: Scalars['Boolean'];
};


export type MutationUpdateConsumerGroupMembershipArgs = {
  prodEnvId: Scalars['ID'];
  consumerId: Scalars['ID'];
  group: Scalars['String'];
  grant: Scalars['Boolean'];
};


export type MutationLinkConsumerToNamespaceArgs = {
  username: Scalars['String'];
};


export type MutationUpdateConsumerRoleAssignmentArgs = {
  prodEnvId: Scalars['ID'];
  consumerUsername: Scalars['String'];
  roleName: Scalars['String'];
  grant: Scalars['Boolean'];
};


export type MutationCreateNamespaceArgs = {
  namespace: Scalars['String'];
};


export type MutationDeleteNamespaceArgs = {
  namespace: Scalars['String'];
};


export type MutationCreateServiceAccountArgs = {
  resourceId: Scalars['String'];
  scopes: Array<Maybe<Scalars['String']>>;
};


export type MutationCreateUmaPolicyArgs = {
  prodEnvId: Scalars['ID'];
  resourceId: Scalars['String'];
  data: UmaPolicyInput;
};


export type MutationDeleteUmaPolicyArgs = {
  prodEnvId: Scalars['ID'];
  resourceId: Scalars['String'];
  policyId: Scalars['String'];
};


export type MutationGrantPermissionsArgs = {
  prodEnvId: Scalars['ID'];
  data: UmaPermissionTicketInput;
};


export type MutationRevokePermissionsArgs = {
  prodEnvId: Scalars['ID'];
  resourceId: Scalars['String'];
  ids: Array<Maybe<Scalars['String']>>;
};


export type MutationApprovePermissionsArgs = {
  prodEnvId: Scalars['ID'];
  resourceId: Scalars['String'];
  requesterId: Scalars['String'];
  scopes: Array<Maybe<Scalars['String']>>;
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
