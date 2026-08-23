import { ConnectionRequest } from '../keystone/types';

const PROVISIONING_FIELDS: (keyof ConnectionRequest)[] = [
  'clientId',
  'serviceId',
  'policyVersion',
  'environment',
  'isApproved',
  'isActive',
  'requesterDetails',
  'clientResources',
  'serviceResources',
];

export function shouldNotifyProvisioner(
  operation: 'create' | 'update',
  existingItem: ConnectionRequest | undefined,
  updatedItem: ConnectionRequest
): boolean {
  if (operation === 'create' || !existingItem) {
    return true;
  }

  return PROVISIONING_FIELDS.some(
    (field) => existingItem[field] !== updatedItem[field]
  );
}
