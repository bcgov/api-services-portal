const {
  Text,
  Checkbox,
  Slug,
  Select,
  Url,
  Float,
  Integer,
} = require('@keystonejs/fields');

const slugify = require('slugify');

const { byTracking } = require('../components/ByTracking')

const { atTracking } = require('@keystonejs/list-plugins')

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
    document: { type: Select, emptyOption: false, dataType: 'string', isRequired: true, default: 'general', options: [
        { value: 'general', label: 'General'},
        { value: 'terms-of-use', label: 'Terms of Use'},
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
  plugins: [
    byTracking(),
    atTracking()
  ]

};
