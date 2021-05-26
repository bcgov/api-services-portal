
const { AuthedRelationship } = require('@keystonejs/fields-authed-relationship');
const { composeHook } = require('@keystonejs/list-plugins/lib/utils');
const { Text } = require('@keystonejs/fields')

const _externallySourced = () => ({
  externalSourceField = 'extSource',
  externalUniqueIdField = 'extForeignKey',
  externalRecordHash = 'extRecordHash',
  ...byFieldOptions
} = {}) => ({ fields = {}, hooks = {}, ...rest }) => {
  const fieldOptions = {
    type: Text,
    isRequired: true,
    ...byFieldOptions,
  };
    
  [externalSourceField, externalUniqueIdField, externalRecordHash].forEach(fieldName => {
    fields[fieldName] = {
        ...fieldOptions,
      };
  })

  if (fields[externalUniqueIdField].isRequired) {
      fields[externalUniqueIdField].isUnique = true
  }
  
  return { fields, hooks, ...rest }
}

const externallySourced = options => _externallySourced()(options)

module.exports = { externallySourced }
