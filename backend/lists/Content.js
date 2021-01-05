const { Text, Checkbox, Slug, Url } = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');

module.exports = {
  fields: {
    description: {
      type: Text,
      isRequired: true,
    },
    content: {
      type: Markdown,
      isRequired: false,
    },
    readme: {
      type: Url,
      isRequired: false,
    },
    slug: {
      type: Slug,
      unique: false,
      isRequired: true,
    },
    isComplete: {
      type: Checkbox,
      defaultValue: false,
    },
  },
};
