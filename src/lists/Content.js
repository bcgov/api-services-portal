const {
  Text,
  Checkbox,
  Slug,
  Url,
  Float,
  Integer,
  DateTime,
} = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');
const slugify = require('slugify');
const { logger } = require('../logger');

module.exports = {
  labelField: 'title',
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
        isReadOnly: false,
      },
    },
    tags: {
      type: Text,
      isRequired: true,
      adminConfig: {
        isReadOnly: false,
      },
    },
    slug: {
      type: Slug,
      adminConfig: {
        isReadOnly: true, //slug can be created automatically and you may want to show this as read only
      },
      generate: ({ resolvedData, existingItem }) => {
        const ns =
          'namespace' in resolvedData
            ? resolvedData['namespace']
            : existingItem['namespace'];
        const title =
          'title' in resolvedData
            ? resolvedData['title']
            : existingItem['title'];
        return slugify(ns + ' ' + title).toLowerCase();
      },
      makeUnique: (val) => val,
      isUnique: true,
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
    publishDate: {
      type: DateTime,
      inRequired: false,
    },
  },
};
