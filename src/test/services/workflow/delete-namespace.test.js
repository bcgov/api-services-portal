jest.mock('../../../services/keystone', () => ({
  deleteRecords: jest.fn(),
  lookupServiceAccessesByEnvironment: jest.fn(async () => []),
  lookupServiceAccessesForNamespace: jest.fn(async () => []),
  lookupServicesByNamespace: jest.fn(async () => []),
  recordActivityWithBlob: jest.fn(async () => ({ id: 'activity-1' })),
}));
jest.mock('../../../services/keystone/activity', () => ({
  updateActivity: jest.fn(),
}));
jest.mock('../../../services/keystone/product-environment', () => ({
  lookupEnvironmentsByNS: jest.fn(async () => []),
}));
jest.mock('../../../services/workflow/get-namespaces', () => ({
  getNamespaceAttributes: jest.fn(),
}));

const mockDeleteAllGatewayConfiguration = jest.fn();
jest.mock('../../../services/gwaapi', () => ({
  GWAService: jest.fn().mockImplementation(() => ({
    deleteAllGatewayConfiguration: mockDeleteAllGatewayConfiguration,
  })),
}));

import { DeleteNamespace } from '../../../services/workflow/delete-namespace';
import { getNamespaceAttributes } from '../../../services/workflow/get-namespaces';
import { deleteRecords } from '../../../services/keystone';
import { updateActivity } from '../../../services/keystone/activity';

describe('Delete Namespace gateway configuration', () => {
  const context = {
    authedItem: { name: 'sdx-provisioner' },
    sudo() {
      return this;
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('leaves SDX gateway configuration to the provisioner', async () => {
    getNamespaceAttributes.mockResolvedValue({
      'perm-data-plane': ['sdx-edge'],
    });

    await DeleteNamespace(context, 'subject-token', 'sdx-gw-abc12');

    expect(mockDeleteAllGatewayConfiguration).not.toHaveBeenCalled();
    expect(deleteRecords).toHaveBeenCalledWith(
      context,
      'Product',
      { namespace: 'sdx-gw-abc12' },
      true,
      ['id']
    );
    expect(updateActivity).toHaveBeenCalledWith(
      context,
      'activity-1',
      'success',
      undefined
    );
  });

  it('deletes other gateway configuration through the GWA API', async () => {
    getNamespaceAttributes.mockResolvedValue({
      'perm-data-plane': ['dp-silver-kong-proxy'],
    });

    await DeleteNamespace(context, 'subject-token', 'platform');

    expect(mockDeleteAllGatewayConfiguration).toHaveBeenCalledWith(
      'subject-token',
      'platform'
    );
  });

  it('uses the GWA API when the namespace has no data plane', async () => {
    getNamespaceAttributes.mockResolvedValue({});

    await DeleteNamespace(context, 'subject-token', 'platform');

    expect(mockDeleteAllGatewayConfiguration).toHaveBeenCalled();
  });
});
