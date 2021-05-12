const {
  Text,
  Checkbox,
  Slug,
  Url,
  Float,
  Integer,
} = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');
const slugify = require('slugify');

module.exports = {
  labelField: "title",
  fields: {
    title: {
      type: Text,
      isRequired: true,
    },
    description: {
      type: Text,
      isRequired: true,
    },
    content: {
      type: Markdown,
      isRequired: false,
    },
    externalLink: {
        type: Text,
        isRequired: false,
    },
    githubRepository: {
        type: Text,
        isRequired: false,
    },
    readme: {
      type: Text,
      isRequired: false,
    },
    namespace: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: false
        }
    },
    tags: {
        type: Text,
        isRequired: true,
        adminConfig: {
            isReadOnly: false
        }
    },    
    slug: {
      type: Slug,
      adminConfig: {
        isReadOnly: true, //slug can be created automatically and you may want to show this as read only
      },
      isUnique: true
    },
    order: {
      type: Integer,
    },
    isComplete: {
      type: Checkbox,
      defaultValue: false,
    },
    isPublic: {
      type: Checkbox,
      isRequired: true,
      defaultValue: false,
    },
  },
  hooks: {
    resolveInput: ({
        operation,
        resolvedData,
        existingItem,
        context,
    }) => {
        if ('title' in resolvedData) {
            const ns = 'namespace' in resolvedData ? resolvedData['namespace'] : existingItem['namespace']
            resolvedData['slug'] = slugify(ns + " " + resolvedData['title']).toLowerCase()
        }
        return resolvedData
    }
  }
}
