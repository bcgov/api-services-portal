const { Text, Checkbox, Relationship, Select } = require('@keystonejs/fields')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) => {
    console.log("IsAdmin?" + user.isAdmin)
    return Boolean(user && user.isAdmin);
}

const userOwnsItem = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }

  // Instead of a boolean, you can return a GraphQL query:
  // https://www.keystonejs.com/api/access-control#graphqlwhere
  return { id: user.id };
};

const userIsAdminOrOwner = auth => {
  const isAdmin = access.userIsAdmin(auth);
  const isOwner = access.userOwnsItem(auth);
  return isAdmin ? isAdmin : isOwner;
};

const access = { userIsAdmin, userOwnsItem, userIsAdminOrOwner };

module.exports = {
  fields: {
    jti: { type: Text, required: true, isUnique: true },
    sub: { type: Text, required: true },
    name: { type: Text },
    username: { type: Text, required: false },
    email: {
      type: Text,
      isUnique: false,
    },
    isAdmin: {
      type: Checkbox,
      // Field-level access controls
      // Here, we set more restrictive field access so a non-admin cannot make themselves admin.
      access: {
        update: access.userIsAdmin,
      },
    },
    groups: { type: Text, required: true },
    roles: { type: Text, required: true }
  },
  // List-level access controls
  access: {
    read: access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  },
  plugins: [
    atTracking()
  ]
}