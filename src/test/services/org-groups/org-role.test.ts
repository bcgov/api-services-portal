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
