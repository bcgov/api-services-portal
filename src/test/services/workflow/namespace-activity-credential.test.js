import { StructuredActivityService } from '../../../services/workflow/namespace-activity';
import * as activityModule from '../../../services/keystone/activity';

jest.mock('../../../services/keystone/activity', () => {
  const actual = jest.requireActual('../../../services/keystone/activity');
  return {
    ...actual,
    recordActivity: jest.fn().mockResolvedValue({}),
  };
});

const recordActivityMock = activityModule.recordActivity;

const ISSUE_TEMPLATE =
  '{actor} {action} {entity} for {application} ({consumer}) to access {product} {environment}';
const REGENERATE_WITH_APPLICATION =
  '{actor} {action} {entity} for {application} ({consumer}) ({product} {environment})';
const REGENERATE_WITHOUT_APPLICATION =
  '{actor} {action} {entity} for {consumer} ({product} {environment})';

function activityCall(callIndex = 0) {
  const [
    context,
    action,
    entity,
    refId,
    message,
    result,
    activityContext,
    namespace,
    ids,
  ] = recordActivityMock.mock.calls[callIndex];
  return {
    context,
    action,
    entity,
    refId,
    message,
    result,
    activityContext: JSON.parse(activityContext),
    namespace,
    ids,
  };
}

function credentialInput(applicationName) {
  const input = {
    consumerUsername: 'client-1',
    product: { name: 'Notify' },
    environment: { name: 'dev' },
  };
  if (applicationName) {
    input.application = { name: applicationName };
  }
  return input;
}

beforeEach(() => {
  recordActivityMock.mockClear();
});

describe('credential activity', function () {
  it('records an issued credential in the gateway namespace', async function () {
    const context = {
      authedItem: { username: 'service-account-issuer' },
    };
    const service = new StructuredActivityService(context, 'notify');

    await service.logIssueCredential(true, credentialInput('Tenant'));

    expect(recordActivityMock).toHaveBeenCalledTimes(1);
    const call = activityCall();
    expect(call.context).toBe(context);
    expect(call.action).toBe('issued');
    expect(call.entity).toBe('credential');
    expect(call.result).toBe('success');
    expect(call.namespace).toBe('notify');
    expect(call.refId).toBe('consumer:client-1');
    expect(call.ids).toEqual([
      'consumer:client-1',
      'actor:service-account-issuer',
    ]);
    expect(call.activityContext.message).toBe(ISSUE_TEMPLATE);
    expect(call.activityContext.params).toEqual({
      actor: 'service-account-issuer',
      action: 'issued',
      entity: 'credential',
      application: 'Tenant',
      consumer: 'client-1',
      product: 'Notify',
      environment: 'dev',
    });
    expect(JSON.stringify(call.activityContext)).not.toMatch(
      /apiKey|clientSecret|privateKey/
    );
  });

  it('uses the token client id when the service account has no username', async function () {
    const context = {
      authedItem: {},
      req: { user: { azp: 'sa-issuer' } },
    };
    const service = new StructuredActivityService(context, 'notify');

    await service.logIssueCredential(true, credentialInput('Tenant'));

    const call = activityCall();
    expect(call.activityContext.params.actor).toBe('sa-issuer');
    expect(call.ids).toContain('actor:sa-issuer');
  });

  it('uses authedItem.name as the actor when it is set', async function () {
    const context = {
      authedItem: { name: 'Janis Smith', username: 'janis' },
    };
    const service = new StructuredActivityService(context, 'notify');

    await service.logIssueCredential(true, credentialInput('Tenant'));

    const call = activityCall();
    expect(call.activityContext.params.actor).toBe('Janis Smith');
    expect(call.ids).toContain('actor:Janis Smith');
  });

  it('records a regenerated credential with the application name', async function () {
    const context = {
      authedItem: { name: 'Janis Smith', username: 'janis' },
    };
    const service = new StructuredActivityService(context, 'notify');

    await service.logRegenerateCredential(true, credentialInput('Tenant'));

    const call = activityCall();
    expect(call.action).toBe('regenerated');
    expect(call.entity).toBe('credential');
    expect(call.result).toBe('success');
    expect(call.namespace).toBe('notify');
    expect(call.ids).toEqual(['consumer:client-1', 'actor:Janis Smith']);
    expect(call.activityContext.message).toBe(REGENERATE_WITH_APPLICATION);
    expect(call.activityContext.params).toEqual({
      actor: 'Janis Smith',
      action: 'regenerated',
      entity: 'credential',
      application: 'Tenant',
      consumer: 'client-1',
      product: 'Notify',
      environment: 'dev',
    });
    expect(JSON.stringify(call.activityContext)).not.toMatch(
      /apiKey|clientSecret|privateKey/
    );
  });

  it('omits a blank application name from a regenerated credential', async function () {
    const context = {
      authedItem: { username: 'service-account-issuer' },
    };
    const service = new StructuredActivityService(context, 'notify');

    await service.logRegenerateCredential(true, credentialInput());

    const call = activityCall();
    expect(call.activityContext.message).toBe(REGENERATE_WITHOUT_APPLICATION);
    expect(call.activityContext.params.application).toBeUndefined();
    expect(call.activityContext.params.consumer).toBe('client-1');
    expect(call.ids).toContain('consumer:client-1');
  });
});
