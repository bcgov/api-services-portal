const mockWarn = jest.fn();

jest.mock('../../../logger', () => ({
  Logger: jest.fn(() => ({ warn: mockWarn })),
}));

jest.mock('../../../services/keystone/organization', () => ({
  parseOrganizationMemberDetails: jest.fn(() => ({
    memberClass: 'MIN',
    memberId: 'CITZ',
  })),
}));

const {
  GetSubsystemEntryForSubsystem,
} = require('../../../services/gateway-patterns/catalog');

function subsystem(overrides = {}) {
  return {
    id: 'subsystem-a',
    name: 'CONSUMER',
    description: 'Consumer subsystem',
    namespace: 'consumer-gateway',
    privacyZone: 'zone-a',
    organization: {
      name: 'consumer-org',
      title: 'Consumer Org',
      description: 'Consumer organization',
      tags: 'member_class:MIN member_id:CITZ',
    },
    integrations: [],
    ...overrides,
  };
}

describe('catalog subsystem integration selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns no integration for absent or unusable records', () => {
    expect(
      GetSubsystemEntryForSubsystem(subsystem({ integrations: undefined }))
        .integrationClientIds
    ).toEqual([]);
    expect(
      GetSubsystemEntryForSubsystem(
        subsystem({
          integrations: [
            { id: 'association-a' },
            { id: 'association-b', integrationClientId: '' },
            { id: 'association-c', integrationClientId: 123 },
          ],
        })
      ).integrationClientIds
    ).toEqual([]);
    expect(mockWarn).not.toHaveBeenCalled();
  });

  it('returns the only usable integration without warning', () => {
    const result = GetSubsystemEntryForSubsystem(
      subsystem({
        integrations: [
          { id: 'association-a', integrationClientId: 'CLIENT-A' },
        ],
      })
    );

    expect(result.integrationClientIds).toEqual(['CLIENT-A']);
    expect(mockWarn).not.toHaveBeenCalled();
  });

  it('warns and selects the greatest deterministic record ID', () => {
    const result = GetSubsystemEntryForSubsystem(
      subsystem({
        integrations: [
          { id: 'association-a', integrationClientId: 'CLIENT-A' },
          { id: 'association-m', integrationClientId: 'CLIENT-M' },
          { id: 'association-z', integrationClientId: 'CLIENT-Z' },
        ],
      })
    );

    expect(result.integrationClientIds).toEqual(['CLIENT-Z']);
    expect(mockWarn).toHaveBeenCalledWith(
      expect.stringContaining('multiple untimestamped CSS integration records'),
      'subsystem-a',
      'association-z',
      'CLIENT-Z',
      ['association-a', 'association-m']
    );
  });

  it('falls back to the integration client ID when record IDs are unavailable', () => {
    const result = GetSubsystemEntryForSubsystem(
      subsystem({
        integrations: [
          { integrationClientId: 'CLIENT-A' },
          { integrationClientId: 'CLIENT-Z' },
        ],
      })
    );

    expect(result.integrationClientIds).toEqual(['CLIENT-Z']);
    expect(mockWarn.mock.calls[0][2]).toBeUndefined();
  });

  it.each([
    [{ id: undefined, name: 'named-subsystem' }, 'named-subsystem'],
    [{ id: undefined, name: undefined }, 'unknown'],
  ])(
    'uses a stable warning identity when the subsystem ID is absent',
    (ids, expected) => {
      GetSubsystemEntryForSubsystem(
        subsystem({
          ...ids,
          integrations: [
            { id: 'association-a', integrationClientId: 'CLIENT-A' },
            { id: 'association-b', integrationClientId: 'CLIENT-B' },
          ],
        })
      );

      expect(mockWarn.mock.calls[0][1]).toBe(expected);
    }
  );
});
