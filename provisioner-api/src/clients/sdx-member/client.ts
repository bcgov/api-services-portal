import type { FastifyBaseLogger } from 'fastify';
import type { OAuthClient } from '../oauth.js';
import { BadGatewayError, withDetails } from '../../errors/api-errors.js';
import type {
  BatchResult,
  ConnectionRequest,
  ConnectionRequestInput,
  CreateNewKeyInput,
  GatewayIdResponse,
  GatewayPatternConfigRequest,
  OneTimeTokenResponse,
  PatternAction,
  RuntimeGroup,
  RuntimeGroupFilter,
  RuntimeGroupInput,
  ServiceCatalogEntry,
  Subsystem,
  SubsystemEntry,
  SubsystemInput,
} from './types.js';

type QueryValue = string | number | boolean | undefined;

interface RequestOptions {
  query?: Record<string, QueryValue>;
  body?: unknown;
}

/**
 * Typed client for the SDX Member API (`/ds/api/sdx/v1`). Wraps the
 * authenticated `sdx` OAuth client; the base URL (including the API path
 * prefix) and bearer token are supplied by that client.
 */
export class SdxMemberApiClient {
  constructor(
    private readonly client: OAuthClient,
    private readonly logger?: FastifyBaseLogger
  ) {}

  // --- Catalog ------------------------------------------------------------

  /** `organization-list` — GET /catalog/organizations */
  listOrganizations(): Promise<unknown[]> {
    return this.request('GET', 'catalog/organizations');
  }

  /** `subsystems-list` — GET /catalog/subsystems */
  listCatalogSubsystems(query: {
    integrationClientId: string;
  }): Promise<SubsystemEntry[]> {
    return this.request('GET', 'catalog/subsystems', { query });
  }

  /** `subsystems-list` — GET /catalog/subsystem/{name} */
  getCatalogSubsystem(name: string): Promise<SubsystemEntry> {
    return this.request('GET', `catalog/subsystems/${enc(name)}`);
  }

  /** `listServiceCatalog` — GET /catalog/services */
  listServiceCatalog(): Promise<ServiceCatalogEntry[]> {
    return this.request('GET', 'catalog/services');
  }

  /** `getOASService` — GET /catalog/services/{name} */
  getOASService(name: string): Promise<ServiceCatalogEntry> {
    return this.request('GET', `catalog/services/${enc(name)}`);
  }

  /** `getOASServiceSpec` — GET /catalog/services/{name}/oas-spec */
  getOASServiceSpec(name: string): Promise<unknown> {
    return this.request('GET', `catalog/services/${enc(name)}/oas-spec`);
  }

  // --- Connections --------------------------------------------------------

  /** `upsertConnection` — PATCH /organizations/{org}/connections */
  upsertConnection(
    org: string,
    body: ConnectionRequestInput
  ): Promise<BatchResult> {
    return this.request('PUT', `organizations/${enc(org)}/connections`, {
      body,
    });
  }

  /** `listConnections` — GET /organizations/{org}/connections */
  listConnections(org: string): Promise<ConnectionRequest[]> {
    return this.request('GET', `organizations/${enc(org)}/connections`);
  }

  /** `deleteConnection` — DELETE /organizations/{org}/connections/{id} */
  deleteConnection(org: string, id: string): Promise<BatchResult> {
    return this.request(
      'DELETE',
      `organizations/${enc(org)}/connections/${enc(id)}`
    );
  }

  // --- Gateways -----------------------------------------------------------

  /** `registerOrganizationGateway` — PUT /organizations/{org}/gateway */
  registerOrganizationGateway(org: string): Promise<GatewayIdResponse> {
    return this.request('PUT', `organizations/${enc(org)}/gateway`);
  }

  /** `generateConfigFromPattern` — PUT /organizations/{org}/pattern */
  generateConfigFromPattern(
    org: string,
    body: GatewayPatternConfigRequest,
    query: { action: PatternAction; dryRun: boolean }
  ): Promise<unknown> {
    return this.request('PUT', `organizations/${enc(org)}/pattern`, {
      query,
      body,
    });
  }

  // --- Keys ---------------------------------------------------------------

  /** `createNewKey` — POST /organizations/{org}/keys */
  createNewKey(org: string, body: CreateNewKeyInput): Promise<unknown> {
    return this.request('POST', `organizations/${enc(org)}/keys`, { body });
  }

  // --- Runtime Groups -----------------------------------------------------

  /** `createRuntimeGroup` — PUT /organizations/{org}/runtime-groups */
  createRuntimeGroup(
    org: string,
    body: RuntimeGroupInput
  ): Promise<BatchResult> {
    return this.request('PUT', `organizations/${enc(org)}/runtime-groups`, {
      body,
    });
  }

  /** `listRuntimeGroups` — GET /organizations/{org}/runtime-groups */
  listRuntimeGroups(
    org: string,
    query: { filter?: RuntimeGroupFilter } = {}
  ): Promise<RuntimeGroup[]> {
    return this.request('GET', `organizations/${enc(org)}/runtime-groups`, {
      query,
    });
  }

  /** `deleteRuntimeGroup` — DELETE /organizations/{org}/runtime-groups/{name} */
  deleteRuntimeGroup(
    org: string,
    name: string,
    query: { force: boolean }
  ): Promise<BatchResult> {
    return this.request(
      'DELETE',
      `organizations/${enc(org)}/runtime-groups/${enc(name)}`,
      { query }
    );
  }

  /**
   * `registerRuntimeGroupGateway` —
   * PUT /organizations/{org}/runtime-groups/{name}/gateway
   */
  registerRuntimeGroupGateway(
    org: string,
    name: string
  ): Promise<GatewayIdResponse> {
    return this.request(
      'PUT',
      `organizations/${enc(org)}/runtime-groups/${enc(name)}/gateway`
    );
  }

  /**
   * `generateOneTimeUseToken` —
   * POST /organizations/{org}/runtime-groups/{name}/tokens
   */
  generateOneTimeUseToken(
    org: string,
    name: string
  ): Promise<OneTimeTokenResponse> {
    return this.request(
      'POST',
      `organizations/${enc(org)}/runtime-groups/${enc(name)}/tokens`
    );
  }

  // --- Services -----------------------------------------------------------

  /** `createOASService` — PUT /organizations/{org}/oas-services */
  createOASService(
    org: string,
    query: { subsystem: string },
    body: unknown
  ): Promise<BatchResult> {
    return this.request('PUT', `organizations/${enc(org)}/oas-services`, {
      query,
      body,
    });
  }

  /** `listOrganizationOASServices` — GET /organizations/{org}/oas-services */
  listOrganizationOASServices(org: string): Promise<ServiceCatalogEntry[]> {
    return this.request('GET', `organizations/${enc(org)}/oas-services`);
  }

  /**
   * `getOrganizationOASService` —
   * GET /organizations/{org}/oas-services/{name}
   */
  getOrganizationOASService(
    org: string,
    name: string
  ): Promise<ServiceCatalogEntry> {
    return this.request(
      'GET',
      `organizations/${enc(org)}/oas-services/${enc(name)}`
    );
  }

  /**
   * `deleteOrganizationOASService` —
   * DELETE /organizations/{org}/oas-services/{name}
   */
  deleteOrganizationOASService(
    org: string,
    name: string
  ): Promise<BatchResult> {
    return this.request(
      'DELETE',
      `organizations/${enc(org)}/oas-services/${enc(name)}`
    );
  }

  /**
   * `getOrganizationServiceSpec` —
   * GET /organizations/{org}/oas-services/{name}/oas-spec
   */
  getOrganizationServiceSpec(org: string, name: string): Promise<unknown> {
    return this.request(
      'GET',
      `organizations/${enc(org)}/oas-services/${enc(name)}/oas-spec`
    );
  }

  // --- Subsystems ---------------------------------------------------------

  /** `listSubsystemClients` — GET /organizations/{org}/clients */
  listSubsystemClients(org: string): Promise<SubsystemEntry[]> {
    return this.request('GET', `organizations/${enc(org)}/clients`);
  }

  /** `getSubsystemClient` — GET /organizations/{org}/clients/{name} */
  getSubsystemClient(org: string, name: string): Promise<SubsystemEntry> {
    return this.request(
      'GET',
      `organizations/${enc(org)}/clients/${enc(name)}`
    );
  }

  /** `createSubsystem` — PUT /organizations/{org}/subsystems */
  createSubsystem(org: string, body: SubsystemInput): Promise<BatchResult> {
    return this.request('PUT', `organizations/${enc(org)}/subsystems`, {
      body,
    });
  }

  /** `listSubsystems` — GET /organizations/{org}/subsystems */
  listSubsystems(org: string): Promise<Subsystem[]> {
    return this.request('GET', `organizations/${enc(org)}/subsystems`);
  }

  /** `deleteSubsystem` — DELETE /organizations/{org}/subsystems/{name} */
  deleteSubsystem(
    org: string,
    name: string,
    query: { force: boolean }
  ): Promise<BatchResult> {
    return this.request(
      'DELETE',
      `organizations/${enc(org)}/subsystems/${enc(name)}`,
      { query }
    );
  }

  /**
   * `registerSubsystemGateway` —
   * PUT /organizations/{org}/subsystems/{name}/gateway
   */
  registerSubsystemGateway(
    org: string,
    name: string,
    body: { runtimeGroupName: string }
  ): Promise<GatewayIdResponse> {
    return this.request(
      'PUT',
      `organizations/${enc(org)}/subsystems/${enc(name)}/gateway`,
      { body }
    );
  }

  // --- transport ----------------------------------------------------------

  private async request<T>(
    method: string,
    path: string,
    opts: RequestOptions = {}
  ): Promise<T> {
    // Keep paths relative (no leading slash) so the client's base-path prefix
    // (`/ds/api/sdx/v1`) is preserved during URL resolution.
    const relative = path.replace(/^\/+/, '') + buildQuery(opts.query);

    const init: RequestInit = { method };
    if (opts.body !== undefined) {
      init.body = JSON.stringify(opts.body);
      init.headers = { 'content-type': 'application/json' };
    }

    const res = await this.client.fetch(relative, init).catch((err) => {
      this.logger?.error(
        { err, method, path },
        'SDX member API request failed'
      );
      throw withDetails(new BadGatewayError('SDX member API request failed'), {
        method,
        path,
      });
    });

    if (!res.ok) {
      const detail = await safeText(res);
      this.logger?.error(
        { method, path, status: res.status, detail },
        'SDX member API returned an error'
      );
      let jsonDetail = { text: detail };
      try {
        jsonDetail = JSON.parse(detail);
      } catch {}

      throw withDetails(
        new BadGatewayError(`SDX member API responded ${res.status}`),
        { method, path, status: res.status, error: jsonDetail }
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

async function safeText(res: Response): Promise<string> {
  return res.text().catch(() => '');
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await safeText(res);
  if (text === '') return undefined as T;
  return JSON.parse(text) as T;
}
