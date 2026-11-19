import type { SdxMemberApiClient } from '../../clients/sdx-member/index.js';
import type { PatternProcessor } from '../patterns-evaluator.js';
import { BadRequestError } from '../../errors/api-errors.js';
import {
  buildAsyncRoute,
  catalogService,
  connectionParams,
  gatewayFor,
  publishedEventScope,
  requireTopic,
  routeConnection,
  runtimeFor,
  type AsyncConnectionInputs,
  type AsyncRouteData,
} from './sdx-async-publisher.js';

export class SDXAsyncSubscriberPattern implements PatternProcessor {
  constructor(private readonly api: SdxMemberApiClient) {}

  static ID = 'sdx-async-subscriber.r1';
  id = () => SDXAsyncSubscriberPattern.ID;
  requiredParams = () => connectionParams;
  deleteHandling = () => 'delete' as const;

  async inject(
    inputs: AsyncConnectionInputs,
    context?: { action?: string }
  ): Promise<AsyncRouteData> {
    const service = await catalogService(this.api, inputs);
    const owner = await this.api.getCatalogSubsystem(inputs.clientId);
    const gatewayId = gatewayFor(owner);
    if (context?.action === 'delete') return { gatewayId };

    const topic =
      inputs.topic === undefined ? undefined : requireTopic(inputs.topic);
    const scope = publishedEventScope(
      await this.api.getOASServiceSpec(inputs.serviceId),
      topic
    );
    const runtime = await runtimeFor(this.api, owner, service.environment);
    const url = subscriberUpstream(inputs.upstreamUrl);
    const peer = inputs.upgrades?.mtlsAcl
      ? await runtimeFor(this.api, service.subsystem, service.environment)
      : runtime;
    return {
      gatewayId,
      route: routeConnection(inputs, service, owner, runtime, peer, url, scope),
    };
  }

  eval(inputs: AsyncConnectionInputs, data: AsyncRouteData) {
    return buildAsyncRoute(inputs, data, 'subscriber', {}, true);
  }
}

function subscriberUpstream(value: unknown): string {
  const url = typeof value === 'string' ? URL.parse(value) : null;
  if (
    !url ||
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new BadRequestError('Subscriber upstreamUrl must be an HTTPS URL');
  }
  return url.href;
}
