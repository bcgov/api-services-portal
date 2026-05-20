const { Text, Checkbox, Relationship } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')
const { Content } = require('@keystonejs/fields-content');
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce')

const { externallySourced } = require('../components/ExternalSource')

const { EnforcementPoint } = require('../authz/enforcement')

module.exports = {
  fields: {
    name: {
        type: Text,
        isRequired: true,
    },
    sector: {
        type: Text,
        isRequired: false,
    },
    title: {
        type: Text,
        isRequired: true,
    },
    // bcdc_id: {
    //     type: Text,
    //     isRequired: true,
    // },
    tags: {
        type: Text,
        isRequired: true,
    },
    description: {
        type: Text,
        isRequired: false,
    },
    // Optional reference to a Public Body from the authoritative
    // data registry (FOIPPA).  When set it MUST be unique across all
    // Organizations, but multiple Organizations may have a NULL value
    // (i.e. not all Organizations are Public Bodies).
    publicBodyId: {
        type: Text,
        isRequired: false,
        isUnique: true,
    },
    orgUnits: { type: Relationship, ref: "OrganizationUnit", many: true }
  },
  access: EnforcementPoint,
  plugins: [
    externallySourced(),
  ]
}