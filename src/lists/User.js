const {
  Text,
  Checkbox,
  Relationship,
  Select,
  Password,
} = require('@keystonejs/fields');

const { EnforcementPoint } = require('../authz/enforcement');

const {
  lookupEnvironmentAndIssuerById,
  updateUserLegalAccept,
  updateUserEmail,
} = require('../services/keystone');

// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) => {
  console.log('IsAdmin?' + user.isAdmin);
  return Boolean(user && user.isAdmin);
};

const userOwnsItem = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }

  // Instead of a boolean, you can return a GraphQL query:
  // https://www.keystonejs.com/api/access-control#graphqlwhere
  return { id: user.id };
};

const userIsAdminOrOwner = (auth) => {
  const isAdmin = access.userIsAdmin(auth);
  const isOwner = access.userOwnsItem(auth);
  return isAdmin ? isAdmin : isOwner;
};

const access = { userIsAdmin, userOwnsItem, userIsAdminOrOwner };

module.exports = {
  fields: {
    name: { type: Text },
    username: { type: Text, required: false, isUnique: true },
    provider: { type: Text, required: false, isUnique: false },
    providerUserGuid: { type: Text, required: false, isUnique: false },
    providerUsername: { type: Text, required: false, isUnique: false },
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
    password: {
      type: Password,
      required: false,
    },
    // JSON: { reference: "LegalReference", agreedTimestamp: "2020-01-01-1:1:1+0000"}
    legalsAgreed: {
      type: Text,
    },
  },
  // List-level access controls
  access: {
    read: true,
    update: access.userIsAdminOrOwner,
    create: true,
    delete: access.userIsAdmin,
    auth: true,
  },
  extensions: [
    (keystone) => {
      keystone.extendGraphQLSchema({
        mutations: [
          {
            schema:
              'acceptLegal(productEnvironmentId: ID!, acceptLegal: Boolean!): User',
            resolver: async (item, args, context, info, { query, access }) => {
              const noauthContext = keystone.createContext({
                skipAccessControl: true,
              });

              const env = await lookupEnvironmentAndIssuerById(
                noauthContext,
                args.productEnvironmentId
              );

              if (args.acceptLegal) {
                const legalsAgreed = await updateUserLegalAccept(
                  noauthContext,
                  context.authedItem.userId,
                  env.legal.reference
                );
                return {
                  id: context.authedItem.userId,
                  legalsAgreed: JSON.stringify(legalsAgreed),
                };
              } else {
                return null;
              }
            },
            access: EnforcementPoint,
          },
          {
            schema: 'updateEmail(email: String!): User',
            resolver: async (item, args, context, info, { query, access }) => {
              return await updateUserEmail(
                context,
                context.authedItem.userId,
                args.email
              );
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};
