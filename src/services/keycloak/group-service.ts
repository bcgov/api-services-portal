import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import { default as KcAdminClient } from 'keycloak-admin';
import { RoleMappingPayload } from 'keycloak-admin/lib/defs/roleRepresentation';
import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';

const logger = Logger('kc.group');

export class KeycloakGroupService {
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
  ): Promise<KeycloakGroupService> {
    logger.debug('[login] %s:%s', clientId, clientSecret);

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

  public async createIfMissing(parentGroupName: string, groupName: string) {
    const groups = (await this.kcAdminClient.groups.find()).filter(
      (group: GroupRepresentation) => group.name == parentGroupName
    );
    if (
      groups[0].subGroups.filter(
        (group: GroupRepresentation) => group.name == groupName
      ).length == 0
    ) {
      logger.debug('[createIfMissing] CREATE %s...', groupName);
      await this.kcAdminClient.groups.setOrCreateChild(
        { id: groups[0].id },
        {
          name: groupName,
        }
      );
      logger.debug('[createIfMissing] CREATED %s', groupName);
    } else {
      logger.debug('[createIfMissing] EXISTS %s', groupName);
    }
  }

  public async getGroup(parentGroupName: string, groupName: string) {
    const groups = (await this.kcAdminClient.groups.find()).filter(
      (group: GroupRepresentation) => group.name == parentGroupName
    );
    if (
      groups[0].subGroups.filter(
        (group: GroupRepresentation) => group.name == groupName
      ).length == 0
    ) {
      logger.debug('[getGroup] MISSING %s', groupName);
      return null;
    } else {
      logger.debug('[getGroup] FOUND   %s', groupName);
      const grp = groups[0].subGroups.filter(
        (group: GroupRepresentation) => group.name == groupName
      )[0];
      return await this.kcAdminClient.groups.findOne({ id: grp.id });
    }
  }
}
