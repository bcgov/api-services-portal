import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import { default as KcAdminClient } from 'keycloak-admin';
import { RoleMappingPayload } from 'keycloak-admin/lib/defs/roleRepresentation';
import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';
import FederatedIdentityRepresentation from 'keycloak-admin/lib/defs/federatedIdentityRepresentation';

import { IdPAuthzProfileTemplate } from './templates/identity-providers/idp-authz-profile';
import { OpenidWellKnown } from '.';
import { v4 as uuid } from 'uuid';
import querystring from 'querystring';
import crypto from 'crypto';
import { Token } from 'keycloak-connect';
import { DecodedToken } from 'jwks-rsa';

const logger = Logger('kc.idp');

export interface IdPDetail {
  brokerAlias: string;
  brokerDisplayName: string;
  providerOpenidConfig: OpenidWellKnown;
  providerClientId: string;
}

export class KeycloakIdPService {
  private kcAdminClient: any;

  constructor(issuerUrl: string) {
    const baseUrl = issuerUrl.substr(0, issuerUrl.indexOf('/realms'));
    const realmName = issuerUrl.substr(issuerUrl.lastIndexOf('/') + 1);
    logger.debug('%s %s', baseUrl, realmName);
    this.kcAdminClient = new KcAdminClient({ baseUrl, realmName });
  }

  public async login(
    clientId: string,
    clientSecret: string
  ): Promise<KeycloakIdPService> {
    logger.debug('[login] %s', clientId);

    await this.kcAdminClient
      .auth({
        grantType: 'client_credentials',
        clientId: clientId,
        clientSecret: clientSecret,
      })
      .catch((err: any) => {
        logger.error('[login] Login failed %s', err);
        throw err;
      });
    return this;
  }

  public async createProvider(template: string, detail: IdPDetail) {
    logger.debug('[createProvider] [%s]', detail.brokerAlias);
    const provider = IdPAuthzProfileTemplate(detail);
    return await this.kcAdminClient.identityProviders.create(provider);
  }

  public async findMappers(alias: string) {
    return await this.kcAdminClient.identityProviders.findMappers({ alias });
  }

  public async listRealmProviders() {
    return await this.kcAdminClient.identityProviders.find();
  }

  public async findOne(alias: string) {
    return await this.kcAdminClient.identityProviders.findOne({ alias });
  }

  public async listFederatedIdentitiesForUser(
    id: string
  ): Promise<FederatedIdentityRepresentation[]> {
    logger.debug('[listFederatedIdentities] (%s)', id);
    const ids = await this.kcAdminClient.users.listFederatedIdentities({
      id,
    });
    logger.debug('[listFederatedIdentities] (%s) RESULT %j', id, ids);
    return ids;
  }

  public buildAccountLinkUrl(
    authzIssuer: string,
    authzProvider: string,
    subjectJwtDetails: any,
    redirect: string
  ): string {
    var hasha = crypto.createHash('sha256');

    const client = subjectJwtDetails.azp;
    const nonce = uuid();

    var code: any =
      nonce + subjectJwtDetails.session_state + client + authzProvider;

    code = hasha.update(code);
    code = hasha.digest(code);

    const hash = code.toString('base64');

    // logger.debug(
    //   'Build %s %s %s %s',
    //   nonce,
    //   subjectJwtDetails.session_state,
    //   client,
    //   authzProvider
    // );
    const query = querystring.stringify({
      client_id: client,
      redirect_uri: redirect,
      nonce,
      hash,
    });

    const url = `${authzIssuer}/broker/${authzProvider}/link?${query}`;

    return url;
  }
}
