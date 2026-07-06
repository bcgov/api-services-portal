import fetch from 'node-fetch';
import { checkStatus } from '../checkStatus';
import { ConnectionRequest } from '../keystone/types';
import { Logger } from '../../logger';

const logger = Logger('services.provisioner');

type CSRRequest = {
  requester_name: string;
  requester_email: string;
};

type ConnectionRequestChangeEventResponse = {
  applied: number;
  failed: number;
  results: any[];
  preview?: any[];
};

export type PostPatternsResponse = {
  applied: number;
  failed: number;
  results: any[];
  preview?: any[];
};

export class ProvisionerService {
  private provisionerUrl: string;

  constructor(provisionerUrl: string) {
    this.provisionerUrl = provisionerUrl;
  }

  public async postPatterns(
    pattern: string,
    parameters: { [key: string]: any },
    action: 'preview' | 'apply' | 'diff' | 'delete'
  ): Promise<PostPatternsResponse> {
    const payload = {
      parameters,
    };

    logger.debug('Calling %s', `${this.provisionerUrl}/patterns/${pattern}`);

    const res = await fetch(
      `${this.provisionerUrl}/patterns/${pattern}?action=${action}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )
      .then(checkStatus)
      .then((r) => r.json())
      .then((r) => r as PostPatternsResponse);

    return res;
  }

  public async postCSR(
    org: string,
    runtimeGroup: string,
    environment: string,
    csrRequest: CSRRequest
  ): Promise<any> {
    logger.debug(
      'Calling %s',
      `${this.provisionerUrl}/organizations/${org}/runtime-groups/${runtimeGroup}/environments/${environment}/csr`
    );

    const res = await fetch(
      `${this.provisionerUrl}/organizations/${org}/runtime-groups/${runtimeGroup}/environments/${environment}/csr`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(csrRequest),
      }
    )
      .then(checkStatus)
      .then((r) => r.json());

    return res;
  }

  public async postConnectionRequestChangeEvent(
    connection: ConnectionRequest,
    action: 'apply' | 'delete'
  ): Promise<ConnectionRequestChangeEventResponse> {
    // credentials will be using the gwa admin

    const payload = {
      clientId: connection.clientId,
      serviceId: connection.serviceId,
      policyVersion: connection.policyVersion,
      environment: connection.environment,
      isApproved: connection.isApproved,
      requesterDetails: JSON.parse(connection.requesterDetails),
      clientResources: JSON.parse(connection.clientResources),
      serviceResources: JSON.parse(connection.serviceResources),
    };

    logger.debug(
      'Calling %s',
      `${this.provisionerUrl}/connections/${connection.id}?action=${action}`
    );

    const res = await fetch(
      `${this.provisionerUrl}/connections/${connection.id}?action=${action}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )
      .then(checkStatus)
      .then((r) => r.json())
      .then((r) => r as ConnectionRequestChangeEventResponse);

    return res;
  }

  public async getGatewayResources(
    gatewayId: string,
    environment?: string,
    tag?: string
  ): Promise<any> {
    const params = {
      ...(environment ? { environment } : {}),
      ...(tag ? { tag } : {}),
    };

    logger.debug(
      'Calling %s',
      `${
        this.provisionerUrl
      }/gateways/${gatewayId}/resources?${new URLSearchParams(params)}`
    );

    const res = await fetch(
      `${
        this.provisionerUrl
      }/gateways/${gatewayId}/resources?${new URLSearchParams(params)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(checkStatus)
      .then((r) => r.json());

    return res;
  }
}
