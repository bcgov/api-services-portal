
const { AuthedRelationship } = require('@keystonejs/fields-authed-relationship');
const { composeHook } = require('@keystonejs/list-plugins/lib/utils');
const { Text } = require('@keystonejs/fields')

const _externallySourced = ({ isRequired }) => ({
  externalSourceField = 'extSource',
  externalUniqueIdField = 'extForeignKey',
  externalRecordHash = 'extRecordHash',
  ...byFieldOptions
} = {}) => ({ fields = {}, hooks = {}, ...rest }) => {
  const fieldOptions = {
    type: Text,
    isRequired: isRequired,
    ...byFieldOptions,
  };
    
  [externalSourceField, externalUniqueIdField, externalRecordHash].forEach(fieldName => {
    fields[fieldName] = {
        ...fieldOptions,
      };
  })

  if (isRequired) {
      fields[externalUniqueIdField].isUnique = true
  }
  
  return { fields, hooks, ...rest };
};

const externallySourced = options => _externallySourced({ isRequired: true })(options);

module.exports = { externallySourced };