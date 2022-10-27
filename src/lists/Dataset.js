const { Text, Checkbox, Relationship } = require('@keystonejs/fields');
const { Markdown } = require('@keystonejs/fields-markdown');
const { Wysiwyg } = require('@keystonejs/fields-wysiwyg-tinymce');

const { externallySourced } = require('../components/ExternalSource');

const { EnforcementPoint } = require('../authz/enforcement');

/*

Application Owner:
- Org/Unit
- Principal Contact: Name, Email, Phone

Org / Org Unit

Who can access this API? Government, Public, Named..
Security Classification: LOW-PUBLIC
License: Open Government License

Principal Contact (Name, Email Phone)
Requestor (if not Principal Contact) (Name, Email, Phone, Role (businessExport, custodian, distributor, pointOfContact, Organization/Unit))

*/

module.exports = {
  fields: {
    name: {
      type: Text,
      isRequired: true,
      isUnique: true,
    },
    // bcdc_id: {
    //     type: Text,
    //     isRequired: false,
    // },
    sector: {
      type: Text,
      isRequired: false,
    },
    license_title: {
      type: Text,
      isRequired: false,
    },
    view_audience: {
      type: Text,
      isRequired: false,
    },
    download_audience: {
      type: Text,
      isRequired: false,
    },
    record_publish_date: {
      type: Text,
      isRequired: false,
    },
    security_class: {
      type: Text,
      isRequired: false,
    },
    private: {
      type: Checkbox,
      isRequired: false,
      defaultValue: false,
    },
    tags: {
      type: Text,
      isRequired: false,
    },
    contacts: {
      type: Text,
      isRequired: false,
    },
    resources: {
      type: Text,
      isRequired: false,
    },
    organization: { type: Relationship, ref: 'Organization' },
    organizationUnit: { type: Relationship, ref: 'OrganizationUnit' },
    notes: {
      type: Text,
      isRequired: false,
    },
    title: {
      type: Text,
      isRequired: true,
    },
    catalogContent: {
      type: Markdown,
      isRequired: false,
    },
    isInCatalog: {
      type: Checkbox,
      isRequired: true,
      defaultValue: false,
    },
    isDraft: {
      type: Checkbox,
      isRequired: true,
      defaultValue: true,
    },
  },
  access: EnforcementPoint,
  plugins: [externallySourced({ isRequired: false })],
};
