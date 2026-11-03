const { Text, Select } = require('@keystonejs/fields');
const { EnforcementPoint } = require('../authz/enforcement');
const { atTracking } = require('@keystonejs/list-plugins');
const { logger } = require('../logger');
const {
  CssOnboardingNotificationService,
} = require('../services/notification/css-onboarding-notification.service');

/**
 * Task manages a general task for approval with the following requests:
 * 1. IntegrationAccessRequest with incomplete subsystem setup
 *   - Subsystem / Integration linking for consumers
 *   - providers are linked via the Subsystem by the RS, so they don't need to be captured here
 *
 */
module.exports = {
  fields: {
    ref: {
      type: Text,
      isRequired: true,
      isUnique: true,
    },
    title: {
      type: Text,
      isRequired: true,
    },
    type: {
      type: Select,
      isRequired: true,
      emptyOption: false,
      dataType: 'string',
      options: [
        {
          value: 'integrationAccessRequest-subsystemLinking',
          label: 'Complete Subsystem Linking',
        },
        {
          value: 'subsystemLinking',
          label: 'Complete Subsystem Linking',
        },
      ],
    },
    status: {
      type: Select,
      isRequired: true,
      emptyOption: false,
      dataType: 'string',
      defaultValue: 'pending',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'processed', label: 'Processed' },
        { value: 'rejected', label: 'Rejected' },
      ],
    },
    jsonBlob: {
      type: Text,
      isRequired: true,
    },
  },
  access: EnforcementPoint,
  plugins: [atTracking()],
  hooks: {
    afterChange: async function ({ operation, existingItem, updatedItem }) {
      try {
        await new CssOnboardingNotificationService().notifyChange({
          operation,
          existingItem,
          updatedItem,
        });
      } catch (err) {
        logger.error('CSS onboarding notification failed: %s', err);
      }
    },
  },
};
