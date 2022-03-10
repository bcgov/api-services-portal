import { format } from '../../../services/keystone/activity';
import { lookupUsersByUsernames } from '../../../services/keystone';

describe('Activity Message Formatting', function () {
  it('it should format a successfull message', async function () {
    const tests = [
      {
        message: '{actor} {action} to {resource1} for {resource2}',
        params: {
          actor: 'Harley',
          action: 'requested access',
          resource1: 'Demo API (dev)',
          resource2: 'application ABC',
        },
        result: 'Harley requested access to Demo API (dev) for application ABC',
      },
      {
        message: '{actor} {action} {entity} to {resource1} for {resource2}',
        params: {
          actor: 'Mark',
          action: 'approved',
          entity: 'access',
          resource1: 'Demo API (dev)',
          resource2: 'consumer 11111111',
        },
        result: 'Mark approved access to Demo API (dev) for consumer 11111111',
      },
      {
        message: '{actor} {action} {entity} to {resource1} for {resource2}',
        params: {
          actor: 'Mark',
          action: 'rejected',
          entity: 'access',
          resource1: 'Demo API (dev)',
          resource2: 'consumer 11111111',
        },
        result: 'Mark rejected access to Demo API (dev) for consumer 11111111',
      },
      {
        message: '{actor} {action} for {resource} ({note})',
        params: {
          actor: 'Harley',
          action: 'received credentials',
          entity: 'access',
          resource: 'Demo API (dev)',
          note: 'access approved',
        },
        result:
          'Harley received credentials for Demo API (dev) (access approved)',
      },
      {
        message: '{actor} {action} {resource}',
        params: {
          actor: 'Janis',
          action: 'edited',
          resource: "My Demo Product's environment (prod)",
        },
        result: "Janis edited My Demo Product's environment (prod)",
      },
      {
        message: '{actor} {action} {resource} {entity}',
        params: {
          actor: 'Wendy',
          action: 'edited',
          entity: 'Authorization Profile',
          resource: 'Ministry of X IdP Realm',
        },
        result: 'Wendy edited Ministry of X IdP Realm Authorization Profile',
      },
      {
        message: '{actor} {action} {resource} {entity}',
        params: {
          actor: 'Wendy',
          action: 'created',
          entity: 'Authorization Profile',
          resource: 'Ministry of X IdP Realm',
        },
        result: 'Wendy created Ministry of X IdP Realm Authorization Profile',
      },
      {
        message: '{actor} {action} {entity}',
        params: {
          actor: 'sa-moh-proto-ca8523432-9d238d1238d',
          action: 'updated',
          entity: 'Gateway Configuration',
        },
        result:
          'sa-moh-proto-ca8523432-9d238d1238d updated Gateway Configuration',
      },
      {
        message:
          'Failed to {action} {entity} to {resource1} for {resource2} (actor: {actor}, reason: {reason})',
        params: {
          actor: 'Mark',
          action: 'reject',
          entity: 'access',
          resource1: 'Demo API (dev)',
          resource2: 'consumer 11111111',
          reason: 'missing one of these realm defaults',
        },
        result:
          'Failed to reject access to Demo API (dev) for consumer 11111111 (actor: Mark, reason: missing one of these realm defaults)',
      },
    ];
    tests.forEach((test) => {
      const output = format(test.message, test.params);
      expect(output).toBe(test.result);
    });
  });
});
