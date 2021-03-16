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

const { FieldEnforcementPoint, EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  labelField: "title",
  fields: {
    title: {
      type: Text,
      isRequired: true,
      access: FieldEnforcementPoint
    },
    description: {
      type: Text,
      isRequired: true,
      access: FieldEnforcementPoint
    },
    link: {
      type: Text,
      isRequired: true,
    },
    document: { type: Select, emptyOption: false, isRequired: true, default: 'general', options: [
        { value: 'general', label: 'General'},
        { value: 'terms-conditions', label: 'Terms and Conditions'},
        { value: 'privacy', label: 'Privacy Agreement'},
      ]
    },
    reference: {
      type: Slug,
      isRequired: true,
      isUnique: true,
      generate: ({ resolvedData }) => resolvedData.document + "-" + resolvedData.version,
    },
    version: {
      type: Integer,
      isRequired: true
    },
    isActive: {
      type: Checkbox,
      defaultValue: false,
    },
  },
  access: EnforcementPoint,
};
