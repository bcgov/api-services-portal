const {
  Text
} = require('@keystonejs/fields');

module.exports = {
  fields: {
    ref: {
        type: Text,
        isRequired: true,
        isUnique: true
    },
    blob: {
      type: Text,
      isRequired: true
    }
  }
};
