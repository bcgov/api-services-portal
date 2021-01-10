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
    readme: {
      type: Text,
      isRequired: false,
    },
    slug: {
      type: Slug,
      generate: ({ resolvedData }) => slugify(resolvedData.title).toLowerCase(),
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
  },
};
