import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../clients/oauth.js';
import { BadGatewayError, withDetails } from '../errors/api-errors.js';
import type { TIntegrationAccessRequest } from '../schemas/sdx.js';
import type { TResource } from '../schemas/resources.js';
import { Action } from './resource-dispatcher.js';

/**
 * Passing over the IntegrationAllowedAccess
 */
export class CommonSsoService {
  constructor(
    private readonly client: OAuthClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  /** Applies a batch of CSS resources (IntegrationAllowedServices). */
  async applyResources(
    gatewayId: string,
    environment: string,
    resources: TResource[],
    action: Action
  ): Promise<any> {
    this.logger?.debug(
      { count: resources.length },
      'CommonSsoService.applyResources'
    );

    if (!this.client.configured) {
      this.logger?.warn(
        { gatewayId, count: resources.length },
        'common-sso client is not configured (CSS_CLIENT_ID missing) — skipping CSS dispatch'
      );
      return { message: 'common-sso client is not configured; skipped' };
    }

    for (const resource of resources) {
      await this.provisionAllowedServices(
        resource as unknown as TIntegrationAccessRequest
      );
    }
    return { message: 'resources applied to Common SSO' };
  }

  /**
   * Delivers the approved allowed-services grant to Common SSO. The PUT
   * replaces the partner-side view of the integration access request,
   * mirroring the `provisionAllowedServices` callback contract.
   */
  async provisionAllowedServices(
    request: TIntegrationAccessRequest
  ): Promise<void> {
    const path = `requests/${encodeURIComponent(
      request.integrationId
    )}/sdx-allowed-access`;

    this.logger?.debug(
      {
        integrationId: request.integrationId,
        clientId: request.clientId,
        path,
      },
      'common-sso provisionAllowedServices request initiated'
    );

    const res = await this.client
      .fetch(path, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
      })
      .catch((err) => {
        this.logger?.error(
          {
            err,
            integrationId: request.integrationId,
            clientId: request.clientId,
          },
          'common-sso provisionAllowedServices request failed'
        );
        throw withDetails(
          new BadGatewayError('common-sso provisionAllowedServices failed'),
          { integrationId: request.integrationId, clientId: request.clientId }
        );
      });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      this.logger?.error(
        {
          status: res.status,
          integrationId: request.integrationId,
          clientId: request.clientId,
          detail,
        },
        'common-sso provisionAllowedServices returned non-2xx'
      );
      throw withDetails(
        new BadGatewayError('common-sso provisionAllowedServices failed'),
        {
          integrationId: request.integrationId,
          clientId: request.clientId,
          status: res.status,
        }
      );
    }

    this.logger?.info(
      {
        integrationId: request.integrationId,
        clientId: request.clientId,
        submissionId: request.submissionId,
      },
      'common-sso provisionAllowedServices delivered'
    );
  }
}
