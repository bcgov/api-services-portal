const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint } = require('../authz/enforcement')

const { newApplicationID, isApplicationID } = require('../services/identifiers')

const { DeleteAccess } = require('../services/workflow')

const { DefaultOwnerValue } = require('../components/DefaultOwnerValue');
const e = require('express');

var { GraphQLSchema, GraphQLResolveInfo } = require('graphql');

module.exports = {
  fields: {
    appId: {
        type: Text,
        isRequired: true,
        isUnique: true
    },
    name: {
        type: Text,
        isRequired: true,
    },
    description: {
        type: Text,
        isRequired: true,
        multiLine: true
    },
    certificate: {
        type: Text,
        isRequired: false,
        multiLine: true
    },
    organization: { type: Relationship, ref: 'Organization' },
    organizationUnit: { type: Relationship, ref: 'OrganizationUnit' },
    owner: { type: Relationship, isRequired: true, ref: 'User', access: { update: false } },
  },
  access: EnforcementPoint,
  hooks: {
    resolveInput: ({
        operation,
        existingItem,
        originalInput,
        resolvedData,
        context,
        listKey,
        fieldPath, // Field hooks only
    }) => {
        if (operation == "create") {
            if ('appId' in resolvedData && isApplicationID(resolvedData['appId'])) {
            } else {
                resolvedData['appId'] = newApplicationID()
            }
            resolvedData['owner'] = context.authedItem.userId
        }
        return resolvedData
    },
    beforeDelete: (async function ({
        operation,
        existingItem,
        context,
        listKey,
        fieldPath, // exists only for field hooks
      }) {
        console.log("BEFORE DELETE APP " + operation + " " + JSON.stringify(existingItem, null, 3));

        await DeleteAccess(context.sudo(), {application: existingItem.id})
    })

  },
  plugins: [
    atTracking()
  ],
  extensions: [
    (keystone) => {
      keystone.extendGraphQLSchema({
        types: [{ type: 'type ApplicationSummary { appId: String, name: String }' }],
        queries: [
            {
              schema: 'allApplicationNames: [ApplicationSummary]',
              resolver: async (item, args, context, info, other) => {
                  const noauthContext =  keystone.createContext({ skipAccessControl: true })
                  console.log(JSON.stringify(context.schemaName))
                  console.log(JSON.stringify(context.gqlNames))
                  console.log(JSON.stringify(Object.keys(keystone)))
                  const a = keystone.getListByKey('Application')
                  const theResult = await a.listQuery(args, context, a.gqlNames.listQueryName, info)

                  return theResult
              },
              access: EnforcementPoint,
            },
          ]
      })
    }
  ],
}
