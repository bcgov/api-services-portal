/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/org-groups/index.js

*/

import { OrgGroupService } from '../../../services/org-groups';
import { KeycloakGroupService } from '../../../services/keycloak';

(async () => {
  const kc = new OrgGroupService(process.env.ISSUER);

  await (await kc.login(process.env.CID, process.env.CSC)).backfillGroups();

  const org = {
    name: 'databc',
    parent: '/data-custodians/ministry-citizens-services',
  };

  console.log(JSON.stringify(await kc.listMembers(org), null, 4));

  if (true) {
    await kc.createGroupIfMissing(org);

    await kc.createOrUpdateGroupPolicy(org);

    await kc.createOrUpdateGroupPermission(org, 'orgcontrol', [
      'Namespace.View',
      'Namepsace.Manage',
    ]);

    await kc.createGroupIfMissing({
      name: 'data-innovation',
      parent: '/data-custodians/ministry-citizens-services',
    });

    await kc.createGroupIfMissing({
      name: 'test1',
      parent: '/data-custodians/ministry-citizens-services',
    });

    await kc.backfillGroups();
    await kc.deleteGroup({
      name: 'test1',
      parent: '/data-custodians/ministry-citizens-services',
    });
  }

  console.log(
    JSON.stringify(
      kc.listGroups({
        name: 'ministry-citizens-services',
        parent: '/data-custodians',
      }),
      null,
      3
    )
  );

  console.log(
    JSON.stringify(
      kc.listGroups({
        name: 'databc',
        parent: '/data-custodians/ministry-citizens-services',
      }),
      null,
      3
    )
  );

  console.log(
    JSON.stringify(await kc.getGroupPermissions(org, ['orgcontrol']), null, 3)
  );

  // await kc.createOrUpdateGroupPermission(
  //   {
  //     name: 'databc',
  //     parent: '/data-custodians/ministry-citizens-services',
  //   },
  //   'orgcontrol',
  //   ['read-private'],
  //   false
  // );
})();
