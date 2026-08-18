import fetch from 'node-fetch';
import { ConnectionRequest } from '../keystone/types';
import { Logger } from '../../logger';
import {
  IssuerMisconfigDetail,
  IssuerMisconfigError,
} from '../issuerMisconfigError';

const logger = Logger('services.provisioner');

type CSRRequest = {
  requester_name: string;
  requester_email: string;
};

type CertTokenResponse = {
  token: string;
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
  changes?: {
    operation: string;
    added: Array<{ kid: string; name: string }>;
    removed: Array<{ kid: string; name: string }>;
    retained: Array<{ kid: string; name: string }>;
  };
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

  public async postCertToken(
    org: string,
    runtimeGroup: string,
    environment: string
  ): Promise<CertTokenResponse> {
    logger.debug(
      'Calling %s',
      `${this.provisionerUrl}/organizations/${org}/runtime-groups/${runtimeGroup}/environments/${environment}/cert-token`
    );

    const res = await fetch(
      `${this.provisionerUrl}/organizations/${org}/runtime-groups/${runtimeGroup}/environments/${environment}/cert-token`,
      {
        method: 'POST',
      }
    )
      .then(checkStatus)
      .then((r) => r.json());

    return res;
  }

  public async postConnectionRequestChangeEvent(
    connection: ConnectionRequest,
    action: 'apply' | 'delete'
  ): Promise<void> {
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

    const body = JSON.stringify(payload);

    fetch(
      `${this.provisionerUrl}/connections/${connection.id}?action=${action}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      }
    )
      .then(checkStatus)
      .then((r) => r.json())
      .then((r) => r as ConnectionRequestChangeEventResponse)
      .then((r) => {
        logger.debug(
          'Provisioner response: applied=%d, failed=%d : %j',
          r.applied,
          r.failed,
          r
        );
      })
      .catch((err) => {
        logger.error('Provisioner Sent: %s', body);
        logger.error('Provisioner Error: %s', err);
      });
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

async function checkStatus(res: any) {
  if (res.ok) {
    return res;
  } else {
    const error: IssuerMisconfigDetail = {
      reason: 'provisioner_error',
      description: '',
      status: `${res.status} ${res.statusText}`,
      statusCode: res.status,
    };
    logger.error('Error - %d %s', res.status, res.statusText);
    const body = await res.text();

    logger.error('ERROR ' + body);
    try {
      const payload = JSON.parse(body);
      error.reason = JSON.stringify(payload.details);
      error.description = payload.title;
    } catch (e) {
      logger.error('Not able to parse error response (%s)', e);
    }
    throw new IssuerMisconfigError(error);
  }
}
