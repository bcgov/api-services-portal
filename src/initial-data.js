const crypto = require('crypto');
const randomString = () => crypto.randomBytes(6).hexSlice();

module.exports = async (keystone) => {
  // Count existing users
  const {
    data: {
      _allUsersMeta: { count = 0 },
    },
  } = await keystone.executeGraphQL({
    context: keystone.createContext({ skipAccessControl: true }),
    query: `query {
      _allUsersMeta {
        count
      }
    }`,
  });

  if (count === 0) {
    const password = randomString();
    const email = 'admin@local';
    const roles = ['developer'];

    const { errors } = await keystone.executeGraphQL({
      context: keystone.createContext({ skipAccessControl: true }),
      query: `mutation initialUser($password: String, $email: String) {
            createUser(data: {name: "Admin", email: $email, username: "admin", isAdmin: true, password: $password}) {
              id
            }
          }`,
      variables: { password, email },
    });

    if (errors) {
      console.log('failed to create initial user:');
      console.log(errors);
    } else {
      console.log(`

      User created:
        email: ${email}
        password: ${password}
      Please change these details after initial login.
      `);
    }
  }

  for (role of [
    'developer',
    'api-owner',
    'api-manager',
    'credential-admin',
    'aps-admin',
  ]) {
    const password = 'password';
    const name = 'user_' + role;
    const email = role + '@local';
    const roles = JSON.stringify([role]);
    const provider = 'idir';

    const { errors } = await keystone.executeGraphQL({
      context: keystone.createContext({ skipAccessControl: true }),
      query: `mutation roleUser($name: String, $password: String, $email: String, $roles: String, $provider: String) {
                createUser(data: {name: $name, username: $name, email: $email, isAdmin: false, password: $password, provider: $provider, roles: $roles}) {
                id
                }
            }`,
      variables: { name, password, email, roles, provider },
    });
  }
};
