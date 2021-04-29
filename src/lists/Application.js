const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { byTracking, atTracking } = require('@keystonejs/list-plugins')

const { EnforcementPoint } = require('../authz/enforcement')

const { v4: uuidv4 } = require('uuid');

const { DeleteAccess } = require('../servicests/workflow')

const { DefaultOwnerValue } = require('../components/DefaultOwnerValue');
const e = require('express');

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
            // If an AppId is provided then don't bother creating one
            if ('appId' in resolvedData && resolvedData['appId'].length == 16) {
            } else {
                resolvedData['appId'] = uuidv4().replace(/-/g,'').toUpperCase().substr(0, 16)
            }

            resolvedData['owner'] = context.authedItem.userId
            return resolvedData
        }
    },
    beforeDelete: (async function ({
        operation,
        existingItem,
        context,
        listKey,
        fieldPath, // exists only for field hooks
      }) {
        console.log("BEFORE DELETE APP " + operation + " " + JSON.stringify(existingItem, null, 3));

        await DeleteAccess(context, operation, {application: existingItem.id})
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
                  console.log(JSON.stringify(item, null, 5))
                  console.log(JSON.stringify(args, null, 5))
                  console.log(JSON.stringify(info, null, 5))
                  console.log(JSON.stringify(other, null, 5))
                  //context.executeGraphQL()
                  return []
              },
              access: EnforcementPoint,
            },
          ]
      })
    }
  ],
}
