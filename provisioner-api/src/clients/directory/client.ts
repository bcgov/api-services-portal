import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../oauth.js';
import { BadGatewayError, withDetails } from '../../errors/api-errors.js';
import type {
  ActivityDetail,
  AssignResult,
  BatchResult,
  CredentialIssuer,
  Dataset,
  DraftDataset,
  Gateway,
  GatewayLink,
  GatewayPatternConfigRequest,
  GatewayRoute,
  GroupAccess,
  GroupMembership,
  IdentifierType,
  Organization,
  OrgNamespace,
  Product,
  PublishGatewayConfigInput,
  PublishResult,
} from './types.js';

type QueryValue = string | number | boolean | undefined;

interface RequestOptions {
  query?: Record<string, QueryValue>;
  body?: unknown;
  form?: FormData;
}

/**
 * Typed client for the APS Directory API v3 (`/ds/api/v3`). Wraps the
 * authenticated `aps` OAuth client; the base URL (including the API path
 * prefix) and bearer token are supplied by that client.
 */
export class DirectoryApiClient {
  constructor(
    private readonly client: OAuthClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  // --- API Directory ------------------------------------------------------

  /** `directory-list` — GET /directory */
  listDirectory(): Promise<unknown> {
    return this.request('GET', 'directory');
  }

  /** `directory-item` — GET /directory/{id} */
  getDirectoryItem(id: string): Promise<unknown> {
    return this.request('GET', `directory/${enc(id)}`);
  }

  // --- API Directory (Administration) — Datasets --------------------------

  /** `organization-datasets` — GET /organizations/{org}/datasets */
  listOrganizationDatasets(org: string): Promise<Dataset[]> {
    return this.request('GET', `organizations/${enc(org)}/datasets`);
  }

  /** `put-organization-dataset` — PUT /organizations/{org}/datasets */
  putOrganizationDataset(
    org: string,
    body: DraftDataset
  ): Promise<BatchResult> {
    return this.request('PUT', `organizations/${enc(org)}/datasets`, { body });
  }

  /** `get-organization-dataset` — GET /organizations/{org}/datasets/{name} */
  getOrganizationDataset(org: string, name: string): Promise<Dataset> {
    return this.request(
      'GET',
      `organizations/${enc(org)}/datasets/${enc(name)}`
    );
  }

  /** `delete-dataset` — DELETE /organizations/{org}/datasets/{name} */
  deleteDataset(org: string, name: string): Promise<BatchResult> {
    return this.request(
      'DELETE',
      `organizations/${enc(org)}/datasets/${enc(name)}`
    );
  }

  /** `put-dataset` — PUT /gateways/{gatewayId}/datasets */
  putGatewayDataset(
    gatewayId: string,
    body: DraftDataset
  ): Promise<BatchResult> {
    return this.request('PUT', `gateways/${enc(gatewayId)}/datasets`, { body });
  }

  /** `get-dataset` — GET /gateways/{gatewayId}/datasets/{name} */
  getGatewayDataset(gatewayId: string, name: string): Promise<Dataset> {
    return this.request(
      'GET',
      `gateways/${enc(gatewayId)}/datasets/${enc(name)}`
    );
  }

  /** `get-ns-directory` — GET /gateways/{gatewayId}/directory */
  getGatewayDirectory(gatewayId: string): Promise<unknown> {
    return this.request('GET', `gateways/${enc(gatewayId)}/directory`);
  }

  /** `get-ns-directory-dataset` — GET /gateways/{gatewayId}/directory/{id} */
  getGatewayDirectoryItem(gatewayId: string, id: string): Promise<unknown> {
    return this.request(
      'GET',
      `gateways/${enc(gatewayId)}/directory/${enc(id)}`
    );
  }

  // --- Service Routes -----------------------------------------------------

  /** `check-availability` — GET /routes/availability */
  checkRouteAvailability(query: {
    serviceName: string;
    gatewayId: string;
  }): Promise<unknown> {
    return this.request('GET', 'routes/availability', { query });
  }

  // --- Gateways -----------------------------------------------------------

  /** `gateway-list` — GET /gateways */
  listGateways(): Promise<Gateway[]> {
    return this.request('GET', 'gateways');
  }

  /** `create-gateway` — POST /gateways */
  createGateway(body: Gateway): Promise<Gateway> {
    return this.request('POST', 'gateways', { body });
  }

  /** `gateway-profile` — GET /gateways/{gatewayId} */
  getGateway(gatewayId: string): Promise<Gateway> {
    return this.request('GET', `gateways/${enc(gatewayId)}`);
  }

  /** `delete-gateway` — DELETE /gateways/{gatewayId} */
  deleteGateway(
    gatewayId: string,
    query: { force?: boolean } = {}
  ): Promise<Gateway> {
    return this.request('DELETE', `gateways/${enc(gatewayId)}`, { query });
  }

  /** `generate-config-from-pattern` — PUT /gateways/{gatewayId}/pattern */
  generateConfigFromPattern(
    gatewayId: string,
    body: GatewayPatternConfigRequest
  ): Promise<unknown> {
    return this.request('PUT', `gateways/${enc(gatewayId)}/pattern`, { body });
  }

  /** `report` — GET /gateways/report */
  getGatewayReport(query: { ids?: string } = {}): Promise<unknown> {
    return this.request('GET', 'gateways/report', { query });
  }

  /** `gateway-admin-activity` — GET /gateways/{gatewayId}/activity */
  getGatewayActivity(
    gatewayId: string,
    query: { first?: number; skip?: number } = {}
  ): Promise<ActivityDetail[]> {
    return this.request('GET', `gateways/${enc(gatewayId)}/activity`, {
      query,
    });
  }

  /** `get-gateway-links` — GET /gateways/{gatewayId}/links */
  getGatewayLinks(gatewayId: string): Promise<GatewayLink[]> {
    return this.request('GET', `gateways/${enc(gatewayId)}/links`);
  }

  // --- Gateway Services ---------------------------------------------------

  /**
   * `publish-gateway-config` — PUT /gateways/{gatewayId}/services
   *
   * Validates a Kong declarative config and applies it to the gateway. Sent as
   * `multipart/form-data`.
   */
  publishGatewayConfig(
    gatewayId: string,
    input: PublishGatewayConfigInput
  ): Promise<PublishResult> {
    const form = new FormData();
    form.set(
      'configFile',
      toBlob(input.configFile),
      input.filename ?? 'config.yaml'
    );
    form.set('dryRun', String(input.dryRun ?? false));

    // Leave Content-Type unset so fetch adds the multipart boundary itself.
    return this.request('PUT', `gateways/${enc(gatewayId)}/services`, {
      form,
    });
  }

  /** `get-gateway-routes` — GET /gateways/{gatewayId}/services */
  getGatewayRoutes(gatewayId: string): Promise<GatewayRoute[]> {
    return this.request('GET', `gateways/${enc(gatewayId)}/services`);
  }

  // --- New Identifiers ----------------------------------------------------

  /** `GetNewID` — GET /identifiers/{type} */
  getNewId(type: IdentifierType): Promise<string> {
    return this.request('GET', `identifiers/${enc(type)}`);
  }

  // --- Authorization Profiles ---------------------------------------------

  /** `put-issuer` — PUT /gateways/{gatewayId}/issuers */
  putIssuer(gatewayId: string, body: CredentialIssuer): Promise<BatchResult> {
    return this.request('PUT', `gateways/${enc(gatewayId)}/issuers`, { body });
  }

  /** `get-issuers` — GET /gateways/{gatewayId}/issuers */
  getIssuers(gatewayId: string): Promise<CredentialIssuer[]> {
    return this.request('GET', `gateways/${enc(gatewayId)}/issuers`);
  }

  /** `delete-issuer` — DELETE /gateways/{gatewayId}/issuers/{name} */
  deleteIssuer(gatewayId: string, name: string): Promise<BatchResult> {
    return this.request(
      'DELETE',
      `gateways/${enc(gatewayId)}/issuers/${enc(name)}`
    );
  }

  // --- Organizations ------------------------------------------------------

  /** `organization-list` — GET /organizations */
  listOrganizations(): Promise<unknown[]> {
    return this.request('GET', 'organizations');
  }

  /** `put-organization` — PUT /organizations/{org} */
  putOrganization(org: string, body: Organization): Promise<BatchResult> {
    return this.request('PUT', `organizations/${enc(org)}`, { body });
  }

  /** `organization-units` — GET /organizations/{org} */
  getOrganizationUnits(org: string): Promise<unknown> {
    return this.request('GET', `organizations/${enc(org)}`);
  }

  /** `get-organization-roles` — GET /organizations/{org}/roles */
  getOrganizationRoles(org: string): Promise<GroupAccess> {
    return this.request('GET', `organizations/${enc(org)}/roles`);
  }

  /** `get-organization-access` — GET /organizations/{org}/access */
  getOrganizationAccess(org: string): Promise<GroupMembership> {
    return this.request('GET', `organizations/${enc(org)}/access`);
  }

  /** `put-organization-access` — PUT /organizations/{org}/access */
  putOrganizationAccess(org: string, body: GroupMembership): Promise<void> {
    return this.request('PUT', `organizations/${enc(org)}/access`, { body });
  }

  /** `organization-gateways` — GET /organizations/{org}/gateways */
  listOrganizationGateways(org: string): Promise<OrgNamespace[]> {
    return this.request('GET', `organizations/${enc(org)}/gateways`);
  }

  /**
   * `assign-namespace-to-organization` —
   * PUT /organizations/{org}/{orgUnit}/gateways/{gatewayId}
   */
  assignGatewayToOrganization(
    org: string,
    orgUnit: string,
    gatewayId: string,
    query: { enable?: boolean } = {}
  ): Promise<AssignResult> {
    return this.request(
      'PUT',
      `organizations/${enc(org)}/${enc(orgUnit)}/gateways/${enc(gatewayId)}`,
      { query }
    );
  }

  /**
   * `unassign-namespace-from-organization` —
   * DELETE /organizations/{org}/{orgUnit}/gateways/{gatewayId}
   */
  unassignGatewayFromOrganization(
    org: string,
    orgUnit: string,
    gatewayId: string
  ): Promise<AssignResult> {
    return this.request(
      'DELETE',
      `organizations/${enc(org)}/${enc(orgUnit)}/gateways/${enc(gatewayId)}`
    );
  }

  /** `org-gateway-activity` — GET /organizations/{org}/activity */
  getOrganizationActivity(
    org: string,
    query: { first?: number; skip?: number } = {}
  ): Promise<ActivityDetail[]> {
    return this.request('GET', `organizations/${enc(org)}/activity`, { query });
  }

  /** `GetRoles` — GET /roles */
  getRoles(): Promise<unknown> {
    return this.request('GET', 'roles');
  }

  // --- Products -----------------------------------------------------------

  /** `put-product` — PUT /gateways/{gatewayId}/products */
  putProduct(gatewayId: string, body: Product): Promise<BatchResult> {
    return this.request('PUT', `gateways/${enc(gatewayId)}/products`, { body });
  }

  /** `get-products` — GET /gateways/{gatewayId}/products */
  getProducts(gatewayId: string): Promise<Product[]> {
    return this.request('GET', `gateways/${enc(gatewayId)}/products`);
  }

  /** `delete-product` — DELETE /gateways/{gatewayId}/products/{appId} */
  deleteProduct(gatewayId: string, appId: string): Promise<BatchResult> {
    return this.request(
      'DELETE',
      `gateways/${enc(gatewayId)}/products/${enc(appId)}`
    );
  }

  /**
   * `delete-product-environment` —
   * DELETE /gateways/{gatewayId}/environments/{appId}
   */
  deleteProductEnvironment(
    gatewayId: string,
    appId: string,
    query: { force?: boolean } = {}
  ): Promise<void> {
    return this.request(
      'DELETE',
      `gateways/${enc(gatewayId)}/environments/${enc(appId)}`,
      { query }
    );
  }

  // --- transport ----------------------------------------------------------

  private async request<T>(
    method: string,
    path: string,
    opts: RequestOptions = {}
  ): Promise<T> {
    // Keep paths relative (no leading slash) so the client's base-path prefix
    // (`/ds/api/v3`) is preserved during URL resolution.
    const relative = path.replace(/^\/+/, '') + buildQuery(opts.query);

    const init: RequestInit = { method };
    if (opts.form !== undefined) {
      // Multipart: let fetch set the Content-Type (with boundary).
      init.body = opts.form;
    } else if (opts.body !== undefined) {
      init.body = JSON.stringify(opts.body);
      init.headers = { 'content-type': 'application/json' };
    }

    const res = await this.client.fetch(relative, init).catch((err) => {
      this.logger?.error({ err, method, path }, 'directory API request failed');
      throw withDetails(new BadGatewayError('directory API request failed'), {
        method,
        path,
      });
    });

    if (!res.ok) {
      const detail = await safeText(res);
      this.logger?.error(
        { method, path, status: res.status, detail },
        'directory API returned an error'
      );
      throw withDetails(
        new BadGatewayError(`directory API responded ${res.status}`),
        { method, path, status: res.status, details: JSON.parse(detail) }
      );
    }

    return parseJson<T>(res);
  }
}

function enc(segment: string): string {
  return encodeURIComponent(segment);
}

function buildQuery(query?: Record<string, QueryValue>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function toBlob(config: string | Blob | Uint8Array): Blob {
  if (config instanceof Blob) return config;
  return new Blob([config]);
}

async function safeText(res: Response): Promise<string> {
  return res.text().catch(() => '');
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await safeText(res);
  if (text === '') return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}
