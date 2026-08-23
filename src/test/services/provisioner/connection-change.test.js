const {
  shouldNotifyProvisioner,
} = require('../../../services/provisioner/connection-change');

const existing = {
  id: 'connection-1',
  clientId: 'client-1',
  serviceId: 'service-1',
  policyVersion: 'SDX.R1.00',
  environment: 'dev',
  isApproved: true,
  isActive: true,
  requesterDetails: '{}',
  clientResources: '{}',
  serviceResources: '{}',
  provisionerStatus: '{}',
};

describe('shouldNotifyProvisioner', () => {
  it('notifies for newly created connection requests', () => {
    expect(shouldNotifyProvisioner('create', undefined, existing)).toBe(true);
  });

  it('does not notify for a provisioner-status-only update', () => {
    expect(
      shouldNotifyProvisioner('update', existing, {
        ...existing,
        provisionerStatus: JSON.stringify({ status: 'pending', message: '' }),
      })
    ).toBe(false);
  });

  it('does not notify when an upsert repeats identifiers with the status', () => {
    expect(
      shouldNotifyProvisioner('update', existing, {
        ...existing,
        clientId: 'client-1',
        serviceId: 'service-1',
        provisionerStatus: JSON.stringify({ status: 'provisioned', message: '' }),
      })
    ).toBe(false);
  });

  it('notifies when a provisioning field changes', () => {
    expect(
      shouldNotifyProvisioner('update', existing, {
        ...existing,
        isApproved: false,
        provisionerStatus: JSON.stringify({ status: 'pending', message: '' }),
      })
    ).toBe(true);
  });
});
