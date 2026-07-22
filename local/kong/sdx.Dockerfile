ARG KONG_VERSION="3.9.1"
FROM docker.io/kong:${KONG_VERSION}

ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

USER root

RUN apt-get update && apt-get -y install unzip curl

RUN echo with pep and plugin-log
RUN git clone -b feature/mtls https://github.com/bcgov/kong-oss-plugins.git \
  && cd kong-oss-plugins \
  && (cd plugins/dpop && luarocks make) \
  && (cd plugins/jwt-keycloak && luarocks make) \
  && (cd plugins/mtls-acl && luarocks make) \
  && (cd plugins/mtls-auth && luarocks make) \
  && (cd plugins/plugin-log && luarocks make) \
  && (cd plugins/oidc && luarocks make kong-plugin-oidc-1.5.0-2.rockspec) \
  && (cd plugins/oidc && \
     case "${KONG_VERSION}" in \
         (3*) luarocks build --deps-only kong-plugin-oidc-deps-k3-1.5.0-2.rockspec;; \
         (*)  luarocks build --deps-only kong-plugin-oidc-deps-k2-1.5.0-2.rockspec;; \
     esac) \
  && (cd plugins/oidc-consumer && luarocks make) \
  && (cd plugins/pep && luarocks make) \
  && (cd plugins/response-signer && luarocks make) \
  && (cd plugins/token-exchange && luarocks make) \
  && (cd plugins/trust-jwks && luarocks make) \
  && (cd plugins/trust-kms && luarocks make) \
  && (cd plugins/trust-ledger && luarocks make) \
  && (cd plugins/trust-registry && luarocks make) \
  && (cd plugins/trust-sign && luarocks make) \
  && (cd plugins/trust-timestamp && luarocks make) \
  && (cd plugins/trust-verify-digest && luarocks make) \
  && (cd plugins/trust-verify-signature && luarocks make)
 
RUN git clone -b kong3 https://github.com/bcgov/gwa-kong-endpoint.git
RUN (cd gwa-kong-endpoint && ./devBuild.sh)

RUN git clone -b kong3 https://github.com/bcgov/gwa-ip-anonymity.git
RUN (cd gwa-ip-anonymity && ./devBuild.sh)

RUN luarocks install kong-spec-expose \
 && luarocks install kong-upstream-jwt

RUN git clone https://github.com/Kong/priority-updater.git
RUN (cd priority-updater/template/plugin && KONG_PRIORITY=902 KONG_PRIORITY_NAME=rate-limiting /usr/local/openresty/luajit/bin/luajit ../priority.lua)
RUN (cd priority-updater/template/plugin && KONG_PRIORITY=1010 KONG_PRIORITY_NAME=jwt-keycloak /usr/local/openresty/luajit/bin/luajit ../priority.lua)
RUN (cd priority-updater/template/plugin && KONG_PRIORITY=770 KONG_PRIORITY_NAME=pre-function /usr/local/openresty/luajit/bin/luajit ../priority.lua)
RUN (cd priority-updater/template/plugin && KONG_PRIORITY=200 KONG_PRIORITY_NAME=post-function /usr/local/openresty/luajit/bin/luajit ../priority.lua)
RUN (cd priority-updater/template/plugin && KONG_PRIORITY=201 KONG_PRIORITY_NAME=post-function /usr/local/openresty/luajit/bin/luajit ../priority.lua)

USER kong

# ============================================
# Core Kong Configuration
# ============================================
# Specifies this instance runs as a data plane node in a hybrid deployment
ENV KONG_ROLE="data_plane"

# Disables local database - data planes sync config from control plane
ENV KONG_DATABASE="off"

# Uses traditional router for request matching (vs expressions router)
ENV KONG_ROUTER_FLAVOR="traditional"

ENV KONG_PREFIX="/kong_prefix/"

# ============================================
# Cluster Configuration (Hybrid Mode)
# ============================================
# Control plane endpoint that this data plane connects to
# ENV KONG_CLUSTER_CONTROL_PLANE="gwcluster.api.gov.bc.ca:443"

# Disables cluster listener - data planes don't accept cluster connections
ENV KONG_CLUSTER_LISTEN="off"

# Enables PKI-based mutual TLS for cluster communication
ENV KONG_CLUSTER_MTLS="pki"

# CA certificate to verify control plane identity
ENV KONG_CLUSTER_CA_CERT="/etc/secrets/sdx-edge-ca/ca.crt"

# Client certificate for authenticating to control plane
ENV KONG_CLUSTER_CERT="/etc/secrets/sdx-edge-cluster-cert/tls.crt"

# Private key for cluster client certificate
ENV KONG_CLUSTER_CERT_KEY="/etc/secrets/sdx-edge-cluster-cert/tls.key"

# Labels to identify this data plane instance (ministry, endpoint, role)
# ENV KONG_CLUSTER_DP_LABELS="role:sdx-access-point"

# ============================================
# TLS/SSL Configuration
# ============================================
# Server certificate for incoming HTTPS connections
ENV KONG_SSL_CERT="/etc/secrets/sdx-edge-server-cert/tls.crt"

# Private key for server certificate
ENV KONG_SSL_CERT_KEY="/etc/secrets/sdx-edge-server-cert/tls.key"

# Signing cert
ENV KONG_SIGNING_CERT="/etc/secrets/sdx-edge-signing-cert/tls.crt"

# Signing cert key
ENV KONG_SIGNING_CERT_KEY="/etc/secrets/sdx-edge-signing-cert/tls.key"

# Enables client certificate authentication for incoming requests
ENV KONG_CLIENT_SSL=on

# Client certificate to present when proxying to upstream services
ENV KONG_CLIENT_SSL_CERT="/etc/secrets/sdx-edge-client-cert/tls.crt"

# Private key for upstream client certificate
ENV KONG_CLIENT_SSL_CERT_KEY="/etc/secrets/sdx-edge-client-cert/tls.key"

# Make the env var available for using in custom plugins
# NOTE env KONG_CLIENT_SSL_CERT;env KONG_CLIENT_SSL_CERT_KEY only temporary until we add token exchange plugin
ENV KONG_NGINX_MAIN_ENV="KONG_SIGNING_CERT;env KONG_SIGNING_CERT_KEY;env APP_VERSION;env AWS_ACCESS_KEY_ID;env AWS_SECRET_ACCESS_KEY;env AWS_REGION;env KONG_CLIENT_SSL_CERT;env KONG_CLIENT_SSL_CERT_KEY"

# Client certificate to present when proxying to upstream services
ENV KONG_NGINX_PROXY_PROXY_SSL_CERTIFICATE="/etc/secrets/sdx-edge-client-cert/tls.crt"

# Private key for upstream client certificate
ENV KONG_NGINX_PROXY_PROXY_SSL_CERTIFICATE_KEY="/etc/secrets/sdx-edge-client-cert/tls.key"

# Trusted CA for verifying upstream SSL certificates
ENV KONG_NGINX_PROXY_PROXY_SSL_TRUSTED_CERTIFICATE="/etc/secrets/sdx-public-ca/ca.crt"

# Trusted CA for Lua SSL operations
ENV KONG_LUA_SSL_TRUSTED_CERTIFICATE="/etc/secrets/sdx-public-ca/ca.crt"

# CA for validating Client certificate for nginx proxy SSL operations
ENV KONG_NGINX_PROXY_SSL_CLIENT_CERTIFICATE="/etc/secrets/sdx-edge-ca/ca.crt"

# Enables verification of upstream SSL certificates
ENV KONG_NGINX_PROXY_PROXY_SSL_VERIFY=on

# Makes client certificate optional for incoming connections
ENV KONG_NGINX_PROXY_SSL_VERIFY_CLIENT=optional

# Set verify depth for certificate chain
ENV KONG_NGINX_PROXY_PROXY_SSL_VERIFY_DEPTH="2"

# ============================================
# Network Listeners
# ============================================
# Proxy listens on HTTP (8000) and HTTPS (8443) for both IPv4 and IPv6
ENV KONG_PROXY_LISTEN="0.0.0.0:8000, [::]:8000, 0.0.0.0:8443 http2 ssl, [::]:8443 http2 ssl"

# Admin API only accessible locally for security
ENV KONG_ADMIN_LISTEN="127.0.0.1:8444 http2 ssl, [::1]:8444 http2 ssl"

# Status endpoint for health checks on port 8100
ENV KONG_STATUS_LISTEN="0.0.0.0:8100, [::]:8100"

# Disables TCP/UDP stream proxying
ENV KONG_STREAM_LISTEN="off"

# Maps external ports to internal Kong ports (e.g., external 80 → internal 8000)
ENV KONG_PORT_MAPS="80:8000, 443:8443"

# Uses X-Forwarded-For header to get real client IP (behind load balancer)
ENV KONG_REAL_IP_HEADER="X-Forwarded-For"

# ============================================
# Plugins Configuration
# ============================================
# Enables bundled plugins plus custom authentication, rate limiting, and security plugins
ENV KONG_PLUGINS="bundled, jwt-keycloak_1010, rate-limiting_902, pre-function_770, post-function_200, post-function_201, oidc, oidc-consumer, kong-spec-expose, jwt-keycloak, kong-upstream-jwt, bcgov-gwa-endpoint, gwa-ip-anonymity, mtls-auth, mtls-acl, pep, plugin-log, response-signer, dpop, token-exchange, trust-jwks, trust-kms, trust-ledger, trust-registry, trust-sign, trust-timestamp, trust-verify-digest, trust-verify-signature"

# Custom Lua module search path for plugin code
ENV KONG_LUA_PACKAGE_PATH="/opt/?.lua;/opt/?/init.lua;;"

# Allows plugins to use table.concat function in sandboxed environment
ENV KONG_UNTRUSTED_LUA_SANDBOX_ENVIRONMENT="table.concat"

# Permits plugins to require specific Lua modules (JSON, HTTP, IO, etc.)
ENV KONG_UNTRUSTED_LUA_SANDBOX_REQUIRES="cjson.safe,resty.http,io,os,ffi,ngx.ssl"

# ============================================
# Nginx Performance Tuning
# ============================================
# Single worker process (adjust based on CPU cores)
ENV KONG_NGINX_WORKER_PROCESSES="2"

# Maximum open file descriptors per worker (supports high connection counts)
ENV KONG_NGINX_WORKER_RLIMIT_NOFILE="200000"

# Maximum simultaneous connections per worker
ENV KONG_NGINX_EVENTS_WORKER_CONNECTIONS="100000"

# Shared memory for caching and metrics (1MB cache, 20MB Prometheus metrics)
ENV KONG_NGINX_HTTP_LUA_SHARED_DICT="aps_proxy_cache 1m; lua_shared_dict prometheus_metrics 20m"

# Allows larger request headers (8 buffers of 32KB each)
ENV KONG_NGINX_PROXY_LARGE_CLIENT_HEADER_BUFFERS="8 32k"

# Buffer size for reading upstream response headers
ENV KONG_NGINX_PROXY_PROXY_BUFFER_SIZE="12k"

# Maximum size for temporary files when buffering upstream responses (8GB)
ENV KONG_NGINX_PROXY_PROXY_MAX_TEMP_FILE_SIZE="8192m"

# Runs nginx in foreground (required for containerized environments)
ENV KONG_NGINX_DAEMON="off"

# Includes custom nginx configuration snippets
ENV KONG_NGINX_PROXY_INCLUDE="/etc/secrets/kong-nginx-proxy-include/config"

# ============================================
# Logging Configuration
# ============================================
# Admin API access logs to stdout for container log collection
ENV KONG_ADMIN_ACCESS_LOG="/dev/stdout"

# Admin API errors to stderr
ENV KONG_ADMIN_ERROR_LOG="/dev/stderr"

# Admin GUI access logs to stdout
ENV KONG_ADMIN_GUI_ACCESS_LOG="/dev/stdout"

# Admin GUI errors to stderr
ENV KONG_ADMIN_GUI_ERROR_LOG="/dev/stderr"

# Disables status endpoint access logging (reduces noise)
ENV KONG_STATUS_ACCESS_LOG="off"

# Status endpoint errors to stderr
ENV KONG_STATUS_ERROR_LOG="/dev/stderr"

# Proxy Log off
ENV KONG_PROXY_ACCESS_LOG="off"

# Proxy endpoint errors to stderr
ENV KONG_PROXY_ERROR_LOG="/dev/stderr"