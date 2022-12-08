import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import { KeycloakGroupService } from '../keycloak';
import { OrgNamespace } from './types';

const logger = Logger('org-group.ns');

export class NamespaceService {
  private groupService;

  constructor(issuerUrl: string) {
    this.groupService = new KeycloakGroupService(issuerUrl);
  }

  async login(clientId: string, clientSecret: string) {
    await this.groupService.login(clientId, clientSecret);
  }

  /*
    Update the Group attributes for org and org-unit
  */
  async assignNamespaceToOrganization(
    ns: string,
    org: string,
    orgUnit: string,
    orgEnabled: boolean
  ): Promise<boolean> {
    const group = await this.groupService.getGroup('ns', ns);

    logger.debug('[assignNamespaceToOrganization] %s - Group = %j', ns, group);

    assert.strictEqual(group === null, false, 'Namespace not found');

    assert.strictEqual(
      'org' in group.attributes && org != group.attributes['org'],
      false,
      `[${ns}] Org Already assigned`
    );
    assert.strictEqual(
      'org-unit' in group.attributes && orgUnit != group.attributes['org-unit'],
      false,
      `[${ns}] Org Unit Already assigned`
    );

    if (
      'org' in group.attributes &&
      group.attributes['org'][0] === org &&
      'org-unit' in group.attributes &&
      group.attributes['org-unit'][0] === orgUnit &&
      'org-enabled' in group.attributes &&
      group.attributes['org-enabled'][0] === `${orgEnabled}`
    ) {
      logger.debug(
        '[assignNamespaceToOrganization] %s - Already assigned and %s',
        ns,
        orgEnabled ? 'enabled' : 'disabled'
      );
      return false;
    }

    group.attributes['org'] = [org];
    group.attributes['org-unit'] = [orgUnit];
    group.attributes['org-enabled'] = [orgEnabled];
    if (!('org-updated-at' in group.attributes)) {
      // only update the first time that org and org unit are set
      group.attributes['org-updated-at'] = [new Date().getTime()];
    }
    await this.groupService.updateGroup(group);
    return true;
  }

  async unassignNamespaceFromOrganization(
    ns: string,
    org: string,
    orgUnit: string
  ): Promise<boolean> {
    const group = await this.groupService.getGroup('ns', ns);

    logger.debug(
      '[unassignNamespaceFromOrganization] %s - Group = %j',
      ns,
      group
    );

    if (
      'org' in group.attributes &&
      group.attributes['org'][0] === org &&
      'org-unit' in group.attributes &&
      group.attributes['org-unit'][0] === orgUnit
    ) {
      logger.debug(
        '[unassignNamespaceFromOrganization] %s - Matched assignment - removing',
        ns
      );
      delete group.attributes['org'];
      delete group.attributes['org-unit'];
      delete group.attributes['org-enabled'];
      delete group.attributes['org-updated-at'];
      await this.groupService.updateGroup(group);
      return true;
    }
    return false;
  }

  async markNamespaceAsDecommissioned(ns: string): Promise<boolean> {
    const group = await this.groupService.getGroup('ns', ns);

    logger.debug('[markNamespaceAsDecommissioned] %s - Group = %j', ns, group);

    assert.strictEqual(group === null, false, 'Namespace not found');

    assert.strictEqual(
      'decommissioned' in group.attributes,
      false,
      `[${ns}] Namespace already decommissioned`
    );

    group.attributes['decommissioned'] = ['true'];
    await this.groupService.updateGroup(group);
    return true;
  }

  async checkNamespaceAvailable(ns: string): Promise<void> {
    const group = await this.groupService.getGroup('ns', ns);
    assert.strictEqual(group === null, true, 'Namespace already exists');
  }

  async listAssignedNamespacesByOrg(org: string): Promise<OrgNamespace[]> {
    const groups = await this.groupService.getGroups('ns', false);
    assert.strictEqual(
      groups.length == 1 && groups[0].name == 'ns',
      true,
      'Unexpected data returned'
    );

    const namespaceGroups = groups[0].subGroups;

    const matches = namespaceGroups
      .filter(
        (group) =>
          'org' in group.attributes && group.attributes['org'][0] === org
      )
      .map((group) => ({
        name: group.name,
        orgUnit: group.attributes['org-unit'][0],
        enabled:
          'org-enabled' in group.attributes
            ? group.attributes['org-enabled'][0] === 'true'
            : false,
        updatedAt:
          'org-updated-at' in group.attributes
            ? Number(group.attributes['org-updated-at'].pop())
            : 0,
      }));
    logger.debug('[listAssignedNamespaces] [%s] Result %j', org, matches);
    return matches;
  }

  async getNamespaceOrganizationDetails(ns: string): Promise<OrgNamespace> {
    const nsGroup = await this.groupService.findByName('ns', ns, false);

    if ('org' in nsGroup.attributes && 'org-unit' in nsGroup.attributes) {
      return {
        name: nsGroup.attributes['org'].pop(),
        orgUnit: nsGroup.attributes['org-unit'].pop(),
        enabled:
          'org-enabled' in nsGroup.attributes
            ? nsGroup.attributes['org-enabled'][0] === 'true'
            : false,
        updatedAt:
          'org-updated-at' in nsGroup.attributes
            ? Number(nsGroup.attributes['org-updated-at'].pop())
            : 0,
      };
    } else {
      return undefined;
    }
  }
}
