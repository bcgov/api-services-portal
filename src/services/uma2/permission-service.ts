import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { Logger } from '../../logger';
import querystring from 'querystring';
import { headers } from '../keycloak/keycloak-api';

const logger = Logger('uma2-permission');

/*

## Get a ticket for the Namespace.Manage scope

curl -v -X POST \
  https://authz-apps-gov-bc-ca.dev.api.gov.bc.ca/auth/realms/aps-v2/authz/protection/permission \
  -H 'Authorization: Bearer '$RTOK \
  -H 'Content-Type: application/json' \
  -d '[
  {
    "resource_scopes": [
        "Namespace.Manage"
    ]
  }
]'

## Then use the Ticket and the user's token to get a new Token

curl -v -X POST \
  https://authz-apps-gov-bc-ca.dev.api.gov.bc.ca/auth/realms/aps-v2/protocol/openid-connect/token \
  -H "Authorization: Bearer ${UTOK}" \
  --data "grant_type=urn:ietf:params:oauth:grant-type:uma-ticket" \
  --data "ticket=$TK" \
   \
  --data "submit_request=false" \
  --data "response_mode=permissions"

Returns: [{"rsid":"d30f6967-254b-4a19-abb7-abd02f14f23e","rsname":"platform"}]

*/

export interface TicketRequest {
  resource_id?: string;
  resource_scopes?: string[];
  claims?: any;
}

export class UMAPermissionService {
  private permissionEndpoint: string;
  private accessToken: string;

  constructor(permissionEndpoint: string, accessToken: string) {
    this.permissionEndpoint = permissionEndpoint;
    this.accessToken = accessToken;
    logger.debug('Endpoint %s', permissionEndpoint);
  }

  public async requestTicket(request: TicketRequest[]): Promise<string> {
    logger.debug('[requestTicket] %j', request);
    const result = await fetch(this.permissionEndpoint, {
      method: 'post',
      body: JSON.stringify(request),
      headers: headers(this.accessToken) as any,
    })
      .then(checkStatus)
      .then((res) => res.json());
    logger.debug('[requestTicket] RESULT %j', result);
    return result.ticket;
  }
}
