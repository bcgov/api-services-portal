/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/keycloak/users.js

*/

import { o } from '../util';

import { KeycloakUserService } from '../../../services/keycloak';

(async () => {
  const kc = new KeycloakUserService(process.env.ISSUER);

  await kc.login(process.env.CID, process.env.CSC);
  // const group = await kc.getGroup('ns', 'platform');
  // console.log(JSON.stringify(group, null, 4));

  //const groups = await kc.search('orgcontrol');
  //o(groups);

  const user = await kc.lookupUserById('xf875dffa-6bcb-4a4d-a8da-4c0429bbb960');
  o(user);

  if (false) {
    const users = await kc.lookupUsersByEmail('aidan.cope@gmail.com', false);
    o(users);
    const userId = users.pop().id;
    o(userId);
  }

  const permissions: any[] = [
    {
      requester: 'f875dffa-6bcb-4a4d-a8da-4c0429bbb960',
    },
  ];
  const userIds = ['f875dffa-6bcb-4a4d-a8da-4c0429bbb960'];
  const users = await Promise.all(userIds.map((id) => kc.lookupUserById(id)));

  permissions.forEach((perm) => {
    const user = users.filter((u) => u.id == perm.requester).pop();
    perm.requesterName = user.attributes.display_name || user.email;
  });
  o(permissions);
  // console.log(await kc.listMembers('660cadef-9233-4532-ba45-5393beaddea4'));
})();
