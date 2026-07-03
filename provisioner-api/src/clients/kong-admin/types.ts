/**
 * Minimal types for the Kong Admin API. Hand-maintained subset of the upstream
 * responses; extend as more endpoints are wrapped.
 */

/** `GET /` — node information. */
export interface NodeInformation {
  version?: string;
  hostname?: string;
  node_id?: string;
  lua_version?: string;
  tagline?: string;
  configuration?: Record<string, unknown>;
  plugins?: {
    available_on_server?: Record<string, unknown>;
    enabled_in_cluster?: string[];
  };
}

/**
 * A Kong Consumer as returned by the Admin API (`/consumers`). A consumer is
 * identified by `username` and/or `custom_id`; at least one is required.
 */
export interface KongConsumer {
  id?: string;
  username?: string;
  custom_id?: string;
  tags?: string[];
  created_at?: number;
  updated_at?: number;
}

/** Writable fields accepted when creating/updating a Kong Consumer. */
export interface KongConsumerInput {
  username?: string;
  custom_id?: string;
  tags?: string[];
}

/** `GET /status` — node health and (on DB-backed nodes) connection stats. */
export interface NodeStatus {
  database?: { reachable?: boolean };
  server?: {
    connections_active?: number;
    connections_accepted?: number;
    connections_handled?: number;
    connections_reading?: number;
    connections_writing?: number;
    connections_waiting?: number;
    total_requests?: number;
  };
  memory?: Record<string, unknown>;
}
