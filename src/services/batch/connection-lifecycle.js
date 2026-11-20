const ACTIONS = ['activate', 'deactivate', 'retry', 'revoke'];
const RUNNING_STATUSES = new Set(['pending', 'deprovisioning']);

const parseJsonObject = (value) => {
  if (value && typeof value === 'object') return value;
  if (typeof value !== 'string' || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const hasValues = (value) => Object.keys(parseJsonObject(value)).length > 0;

const lifecycleActionAvailability = (connection) => {
  const status = parseJsonObject(connection && connection.provisionerStatus);
  const intent = parseJsonObject(connection && connection.lifecycleIntent);
  const result = Object.fromEntries(
    ACTIONS.map((action) => [action, { allowed: false }])
  );

  if (!connection || !connection.isApproved) {
    return result;
  }

  if (RUNNING_STATUSES.has(status.status)) {
    const message = 'Wait for the current connection lifecycle operation to finish.';
    return Object.fromEntries(
      ACTIONS.map((action) => [action, { allowed: false, message }])
    );
  }

  if (intent.action === 'revoke') {
    if (!connection.isActive) {
      result.activate = {
        allowed: true,
        requiresConfirmation: true,
        message:
          'Activating this connection abandons the failed revoke and restores access.',
      };
    }
    if (status.status === 'failed' || status.status === 'deprovisioned') {
      result.retry = { allowed: true };
    }
    return result;
  }

  if (connection.isActive) {
    result.deactivate = { allowed: true };
    result.revoke = { allowed: true };
  } else {
    result.activate = { allowed: true };
    result.revoke = { allowed: true };
  }

  if (status.status === 'failed') {
    result.retry = { allowed: true };
  }

  return result;
};

const lifecycleActionError = (connection, action, options = {}) => {
  if (!ACTIONS.includes(action)) return `Unknown lifecycle action '${action}'.`;
  const availability = lifecycleActionAvailability(connection)[action];
  if (!availability.allowed) {
    if (!connection || !connection.isApproved) {
      return 'Connection lifecycle actions require an approved connection.';
    }
    return (
      availability.message ||
      `Cannot ${action} the connection from its current lifecycle state.`
    );
  }
  if (
    action === 'activate' &&
    availability.requiresConfirmation &&
    options.confirmAbandonRevoke !== true
  ) {
    return 'Confirm that activation should abandon the failed revoke and restore access.';
  }
  return undefined;
};

module.exports = {
  ACTIONS,
  RUNNING_STATUSES,
  hasValues,
  lifecycleActionAvailability,
  lifecycleActionError,
  parseJsonObject,
};
