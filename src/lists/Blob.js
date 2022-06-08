const { Select, Text } = require('@keystonejs/fields');

module.exports = {
  fields: {
    ref: {
      type: Text,
      isRequired: true,
      isUnique: true,
    },
    type: {
      type: Select,
      isRequired: true,
      emptyOption: false,
      dataType: 'string',
      defaultValue: 'yaml',
      options: [
        { value: 'yaml', label: 'YAML' },
        { value: 'json', label: 'JSON' },
      ],
    },
    blob: {
      type: Text,
      isRequired: true,
    },
  },
};
