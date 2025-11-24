import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import RealmRepresentation from '@keycloak/keycloak-admin-client/lib/defs/realmRepresentation';
import AccessTokenAccess from '@keycloak/keycloak-admin-client/lib/defs/AccessTokenAccess';
import AccessTokenCertConf from '@keycloak/keycloak-admin-client/lib/defs/accessTokenCertConf';
import AccessTokenRepresentation from '@keycloak/keycloak-admin-client/lib/defs/accessTokenRepresentation';
import AccessClaimSet from '@keycloak/keycloak-admin-client/lib/defs/addressClaimSet';
import AdminEventRepresentation from '@keycloak/keycloak-admin-client/lib/defs/adminEventRepresentation';
import AuthDetailsRepresentation from '@keycloak/keycloak-admin-client/lib/defs/authDetailsRepresentation';
import AuthenticationExecutionExportRepresentation from '@keycloak/keycloak-admin-client/lib/defs/authenticationExecutionExportRepresentation';
import AuthenticationExecutionInfoRepresentation from '@keycloak/keycloak-admin-client/lib/defs/authenticationExecutionInfoRepresentation';
import AuthenticationFlowRepresentation from '@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation';
import AuthenticatorConfigInfoRepresentation from '@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigInfoRepresentation';
import AuthenticatorConfigRepresentation from '@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation';
import CertificateRepresentation from '@keycloak/keycloak-admin-client/lib/defs/certificateRepresentation';
import ClientInitialAccessPresentation from '@keycloak/keycloak-admin-client/lib/defs/clientInitialAccessPresentation';
import ClientPoliciesRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientPoliciesRepresentation';
import ClientPolicyConditionRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientPolicyConditionRepresentation';
import ClientPolicyExecutorRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientPolicyExecutorRepresentation';
import ClientPolicyRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientPolicyRepresentation';
import ClientProfileRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientProfileRepresentation';
import ClientProfilesRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientProfilesRepresentation';
import ClientRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientRepresentation';
import ClientScopeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation';
import { ClientSessionStat } from '@keycloak/keycloak-admin-client/lib/defs/clientSessionStat';
import ComponentExportRepresentation from '@keycloak/keycloak-admin-client/lib/defs/componentExportRepresentation';
import ComponentRepresentation from '@keycloak/keycloak-admin-client/lib/defs/componentRepresentation';
import ComponentTypeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation';
import { ConfigPropertyRepresentation } from '@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigInfoRepresentation';
import CredentialRepresentation from '@keycloak/keycloak-admin-client/lib/defs/credentialRepresentation';
import EvaluationResultRepresentation from '@keycloak/keycloak-admin-client/lib/defs/evaluationResultRepresentation';
import EventRepresentation from '@keycloak/keycloak-admin-client/lib/defs/eventRepresentation';
import EventType from '@keycloak/keycloak-admin-client/lib/defs/eventTypes';
import FederatedIdentityRepresentation from '@keycloak/keycloak-admin-client/lib/defs/federatedIdentityRepresentation';
import GlobalRequestResult from '@keycloak/keycloak-admin-client/lib/defs/globalRequestResult';
import IdentityProviderMapperRepresentation from '@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperRepresentation';
import { IdentityProviderMapperTypeRepresentation } from '@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperTypeRepresentation';
import IdentityProviderRepresentation from '@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation';
import KeysMetadataRepresentation from '@keycloak/keycloak-admin-client/lib/defs/keyMetadataRepresentation';
import KeyStoreConfig from '@keycloak/keycloak-admin-client/lib/defs/keystoreConfig';
import { ManagementPermissionReference } from '@keycloak/keycloak-admin-client/lib/defs/managementPermissionReference';
import MappingsRepresentation from '@keycloak/keycloak-admin-client/lib/defs/mappingsRepresentation';
import PasswordPolicyTypeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/passwordPolicyTypeRepresentation';
import PermissionRepresentation from '@keycloak/keycloak-admin-client/lib/defs/PermissonRepresentation';
import PolicyEvaluationResponse from '@keycloak/keycloak-admin-client/lib/defs/policyEvaluationResponse';
import PolicyProviderRepresentation from '@keycloak/keycloak-admin-client/lib/defs/policyProviderRepresentation';
import PolicyResultRepresentation from '@keycloak/keycloak-admin-client/lib/defs/policyResultRepresentation';
import PolicyRepresentation, {
  DecisionStrategy,
  Logic,
} from '@keycloak/keycloak-admin-client/lib/defs/policyRepresentation';
import ProfileInfoRepresentation from '@keycloak/keycloak-admin-client/lib/defs/profileInfoRepresentation';
import ProtocolMapperRepresentation from '@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation';
import { RealmEventsConfigRepresentation } from '@keycloak/keycloak-admin-client/lib/defs/realmEventsConfigRepresentation';
import RequiredActionProviderRepresentation from '@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation';
import RequiredActionProviderSimpleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderSimpleRepresentation';
import ResourceEvaluation from '@keycloak/keycloak-admin-client/lib/defs/resourceEvaluation';
import ResourceRepresentation from '@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation';
import ResourceServerRepresentation from '@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import RolesRepresentation from '@keycloak/keycloak-admin-client/lib/defs/rolesRepresentation';
import ScopeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation';
import { ServerInfoRepresentation } from '@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation';
import SynchronizationResultRepresentation from '@keycloak/keycloak-admin-client/lib/defs/synchronizationResultRepresentation';
import SystemInfoRepresentation from '@keycloak/keycloak-admin-client/lib/defs/systemInfoRepersantation';
import TestLdapConnectionRepresentation from '@keycloak/keycloak-admin-client/lib/defs/testLdapConnection';
import UserConsentRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userConsentRepresentation';
import { UserProfileConfig } from '@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata';
import UserSessionRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation';
import WhoAmIRepresentation from '@keycloak/keycloak-admin-client/lib/defs/whoAmIRepresentation';
import {
  Credentials,
  Settings,
  TokenResponse,
  TokenResponseRaw,
} from '@keycloak/keycloak-admin-client/lib/utils/auth';
import {
  NetworkError,
  NetworkErrorOptions,
} from '@keycloak/keycloak-admin-client/lib/utils/fetchWithError';

export { KeycloakAdminClient, DecisionStrategy, Logic };
export type {
  UserRepresentation,
  GroupRepresentation,
  RealmRepresentation,
  AccessTokenAccess,
  AccessTokenRepresentation,
  AccessTokenCertConf,
  AccessClaimSet,
  AdminEventRepresentation,
  AuthenticationExecutionExportRepresentation,
  AuthDetailsRepresentation,
  AuthenticationExecutionInfoRepresentation,
  AuthenticationFlowRepresentation,
  AuthenticatorConfigInfoRepresentation,
  AuthenticatorConfigRepresentation,
  CertificateRepresentation,
  ClientInitialAccessPresentation,
  ClientPoliciesRepresentation,
  ClientPolicyConditionRepresentation,
  ClientPolicyExecutorRepresentation,
  ClientPolicyRepresentation,
  ClientProfileRepresentation,
  ClientProfilesRepresentation,
  ClientRepresentation,
  ClientScopeRepresentation,
  ClientSessionStat,
  ComponentExportRepresentation,
  ComponentRepresentation,
  ComponentTypeRepresentation,
  ConfigPropertyRepresentation,
  CredentialRepresentation,
  EvaluationResultRepresentation,
  EventRepresentation,
  EventType,
  FederatedIdentityRepresentation,
  GlobalRequestResult,
  IdentityProviderMapperRepresentation,
  IdentityProviderMapperTypeRepresentation,
  IdentityProviderRepresentation,
  KeysMetadataRepresentation,
  KeyStoreConfig,
  ManagementPermissionReference,
  MappingsRepresentation,
  NetworkError,
  NetworkErrorOptions,
  PasswordPolicyTypeRepresentation,
  PermissionRepresentation,
  PolicyEvaluationResponse,
  PolicyProviderRepresentation,
  PolicyResultRepresentation,
  PolicyRepresentation,
  ProfileInfoRepresentation,
  ProtocolMapperRepresentation,
  RealmEventsConfigRepresentation,
  RequiredActionProviderRepresentation,
  RequiredActionProviderSimpleRepresentation,
  ResourceEvaluation,
  ResourceRepresentation,
  ResourceServerRepresentation,
  RoleRepresentation,
  RolesRepresentation,
  ScopeRepresentation,
  ServerInfoRepresentation,
  SynchronizationResultRepresentation,
  SystemInfoRepresentation,
  TestLdapConnectionRepresentation,
  UserConsentRepresentation,
  UserProfileConfig,
  UserSessionRepresentation,
  WhoAmIRepresentation,
  Credentials,
  Settings,
  TokenResponse,
  TokenResponseRaw,
};
