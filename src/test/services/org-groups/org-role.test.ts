import { buildGroupAccess } from '../../../services/org-groups';
import { o } from '../../integrated/util';
import YAML from 'js-yaml';

describe('Org Role to Group Access', function () {
  it('it should create Group Access for namespace', async function () {
    const match = `
name: databc
parent: /ministry-of-citizens-services
roles:
  - name: organization-admin
    permissions:
      - resource: platform
        scopes:
          - Namespace.View
  - name: system-admin
    permissions: []
  - name: subsystem-owner
    permissions:
      - resource: platform
        scopes:
          - Namespace.Manage
          - Namespace.View
          - Subsystem.Manage
          - GatewayPattern.Publish
  - name: tech-lead
    permissions:
      - resource: platform
        scopes:
          - Namespace.View
          - Subsystem.Manage
          - GatewayPattern.Publish
  - name: access-manager
    permissions:
      - resource: platform
        scopes:
          - Namespace.View
          - Connection.Manage
`;

    const answer = buildGroupAccess(
      'databc',
      '/ministry-of-citizens-services',
      'namespace',
      'platform'
    );
    expect(YAML.dump(answer).trim()).toBe(match.trim());
  });

  it('it should create Group Access for organization', async function () {
    const match = `
name: databc
roles:
  - name: organization-admin
    permissions:
      - resource: org/databc
        scopes:
          - GroupAccess.Manage
          - Namespace.Assign
          - Dataset.Manage
  - name: system-admin
    permissions:
      - resource: org/databc
        scopes:
          - System.Manage
  - name: subsystem-owner
    permissions: []
  - name: tech-lead
    permissions: []
  - name: access-manager
    permissions: []

`;

    const answer = buildGroupAccess(
      'databc',
      undefined,
      'organization',
      'org/databc'
    );
    expect(YAML.dump(answer).trim()).toBe(match.trim());
  });
});
