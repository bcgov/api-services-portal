import * as activityModule from '../../../services/keystone/activity';
import {
  KeycloakPermissionTicketService,
  KeycloakUserService,
} from '../../../services/keycloak';
import { UMAPolicyService } from '../../../services/uma2';
import * as Common from '../../../lists/extensions/Common';
import {
  revokePermissions,
  updatePermissions,
} from '../../../services/workflow/ns-uma-perm-access';
import {
  createUmaPolicy,
  revokeUmaPolicy,
  updateUmaPolicy,
} from '../../../services/workflow/ns-uma-policy-access';

jest.mock('../../../services/keystone/activity', () => {
  const actual = jest.requireActual('../../../services/keystone/activity');
  return {
    ...actual,
    recordActivity: jest.fn().mockResolvedValue({}),
  };
});

jest.mock('../../../services/keycloak', () => ({
  KeycloakPermissionTicketService: jest.fn(),
  KeycloakUserService: jest.fn(),
}));

jest.mock('../../../services/uma2', () => ({
  UMAPolicyService: jest.fn(),
}));

jest.mock('../../../lists/extensions/Common', () => ({
  getResourceSets: jest.fn(),
}));

const recordActivityMock = activityModule.recordActivity as jest.Mock;
const PermissionTicketServiceMock = KeycloakPermissionTicketService as jest.Mock;
const UserServiceMock = KeycloakUserService as jest.Mock;
const PolicyServiceMock = UMAPolicyService as jest.Mock;
const getResourceSetsMock = Common.getResourceSets as jest.Mock;

const RESOURCE_ID = 'res-1';

function buildContext(actorName = 'Janis Smith', namespace = 'gw-123'): any {
  const sudoContext = { authedItem: { name: actorName } };
  return {
    authedItem: { name: actorName, namespace },
    sudo: () => sudoContext,
  };
}

const permEnvCtx: any = {
  openid: { issuer: 'http://keycloak' },
  accessToken: 'access-token',
  issuerEnvConfig: { clientId: 'client', clientSecret: 'secret' },
};

const policyEnvCtx: any = {
  uma2: { policy_endpoint: 'http://keycloak/policy' },
  accessToken: 'access-token',
};

// recordActivity(context, action, type, refId, message, result, context, ns, ids)
function lastActivity() {
  const call = recordActivityMock.mock.calls[0];
  return { action: call[1], entity: call[2], message: call[4] };
}

beforeEach(() => {
  jest.clearAllMocks();
  getResourceSetsMock.mockResolvedValue([RESOURCE_ID]);
});

describe('gateway namespace access activity always uses "updated" and is signed with [+]/[-]', function () {
  describe('user permissions (UMA permission tickets)', function () {
    it('grant for a new user records "updated" with [+] markers', async function () {
      UserServiceMock.mockImplementation(() => ({
        login: jest.fn().mockResolvedValue({}),
        lookupUserByEmail: jest
          .fn()
          .mockResolvedValue({ id: 'user-1', email: 'wendy@idir' }),
        getOneAttributeValue: jest.fn().mockReturnValue('Wendy'),
      }));
      PermissionTicketServiceMock.mockImplementation(() => ({
        listPermissions: jest.fn().mockResolvedValue([]),
        createOrUpdatePermission: jest
          .fn()
          .mockResolvedValue({ id: 'perm-1' }),
        deletePermission: jest.fn().mockResolvedValue({}),
      }));

      await updatePermissions(
        buildContext(),
        permEnvCtx,
        'wendy@idir',
        ['Namespace.Manage'],
        RESOURCE_ID,
        'grant'
      );

      const { action, message } = lastActivity();
      expect(action).toBe('updated');
      expect(message).toBe(
        'Janis Smith updated Wendy permissions: [+] Namespace.Manage'
      );
    });

    it('rejects empty email', async function () {
      await expect(
        updatePermissions(
          buildContext(),
          permEnvCtx,
          '  ',
          ['Namespace.Manage'],
          RESOURCE_ID,
          'update'
        )
      ).rejects.toThrow('Email is required to grant or update user access');
    });

    it('edit access records "updated" with mixed [+]/[-] markers', async function () {
      UserServiceMock.mockImplementation(() => ({
        login: jest.fn().mockResolvedValue({}),
        lookupUserByEmail: jest
          .fn()
          .mockResolvedValue({ id: 'user-1', email: 'wendy@idir' }),
        getOneAttributeValue: jest.fn().mockReturnValue('Wendy'),
      }));
      PermissionTicketServiceMock.mockImplementation(() => ({
        listPermissions: jest.fn().mockResolvedValue([
          { id: 'perm-old', scopeName: 'Namespace.View', requester: 'user-1' },
        ]),
        createOrUpdatePermission: jest
          .fn()
          .mockResolvedValue({ id: 'perm-1' }),
        deletePermission: jest.fn().mockResolvedValue({}),
      }));

      await updatePermissions(
        buildContext(),
        permEnvCtx,
        'wendy@idir',
        ['Namespace.Manage'],
        RESOURCE_ID,
        'update'
      );

      const { action, message } = lastActivity();
      expect(action).toBe('updated');
      expect(message).toBe(
        'Janis Smith updated Wendy permissions: [+] Namespace.Manage, [-] Namespace.View'
      );
    });

    it('revoke records "updated" with [-] markers', async function () {
      PermissionTicketServiceMock.mockImplementation(() => ({
        listPermissions: jest.fn().mockResolvedValue([
          { id: 'perm-1', scopeName: 'Namespace.Manage', requester: 'user-1' },
        ]),
        deletePermission: jest.fn().mockResolvedValue({}),
      }));
      UserServiceMock.mockImplementation(() => ({
        login: jest.fn().mockResolvedValue({}),
        lookupUserById: jest.fn().mockResolvedValue({
          attributes: { display_name: 'Wendy' },
          email: 'wendy@idir',
        }),
      }));

      await revokePermissions(buildContext(), permEnvCtx, RESOURCE_ID, [
        'perm-1',
      ]);

      const { action, message } = lastActivity();
      expect(action).toBe('updated');
      expect(message).toBe(
        'Janis Smith updated Wendy permissions: [-] Namespace.Manage'
      );
    });
  });

  describe('client policies (UMA policies)', function () {
    it('create records "updated" with [+] markers', async function () {
      PolicyServiceMock.mockImplementation(() => ({
        createUmaPolicy: jest.fn().mockResolvedValue({ id: 'pol-1' }),
      }));

      await createUmaPolicy(buildContext(), policyEnvCtx, RESOURCE_ID, {
        name: 'service-account-1',
        scopes: ['Content.Publish', 'Namespace.Manage'],
      } as any);

      const { action, message } = lastActivity();
      expect(action).toBe('updated');
      expect(message).toBe(
        'Janis Smith updated service-account-1 permissions: [+] Content.Publish, [+] Namespace.Manage'
      );
    });

    it('update records "updated" with mixed [+]/[-] markers', async function () {
      PolicyServiceMock.mockImplementation(() => ({
        listPolicies: jest.fn().mockResolvedValue([
          {
            id: 'pol-1',
            name: 'service-account-1',
            clients: ['client-1'],
            scopes: ['Content.Publish'],
          },
        ]),
        updateUmaPolicy: jest.fn().mockResolvedValue({}),
      }));

      await updateUmaPolicy(buildContext(), policyEnvCtx, RESOURCE_ID, 'client-1', [
        'Namespace.Manage',
      ]);

      const { action, message } = lastActivity();
      expect(action).toBe('updated');
      expect(message).toBe(
        'Janis Smith updated service-account-1 permissions: [+] Namespace.Manage, [-] Content.Publish'
      );
    });

    it('revoke records "updated" with [-] markers', async function () {
      PolicyServiceMock.mockImplementation(() => ({
        findPolicyByResource: jest.fn().mockResolvedValue({
          name: 'service-account-1',
          scopes: ['Content.Publish'],
        }),
        deleteUmaPolicy: jest.fn().mockResolvedValue({}),
      }));

      await revokeUmaPolicy(buildContext(), policyEnvCtx, RESOURCE_ID, 'pol-1');

      const { action, message } = lastActivity();
      expect(action).toBe('updated');
      expect(message).toBe(
        'Janis Smith updated service-account-1 permissions: [-] Content.Publish'
      );
    });
  });
});
