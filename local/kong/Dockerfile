FROM kong:2.8.3

USER root

RUN apk add git ethtool strace

ARG PLUGIN_VERSION=1.1.1-1
ARG PLUGIN_OIDC_VERSION=1.2.4-2
ARG PLUGIN_OIDC_CONSUMER_VERSION=0.0.1-0
ARG PLUGIN_UPSTREAM_BASIC_VERSION=1.0.0-1
ARG FORCE_BUILD=8

RUN git clone https://github.com/ikethecoder/kong-plugin-upstream-auth-basic.git
RUN (cd kong-plugin-upstream-auth-basic && luarocks make && luarocks pack kong-plugin-upstream-auth-basic ${PLUGIN_UPSTREAM_BASIC_VERSION})

RUN luarocks install lua-resty-openidc
RUN git clone -b v${PLUGIN_OIDC_VERSION} https://github.com/revomatico/kong-oidc.git
RUN (cd kong-oidc && luarocks make && luarocks pack kong-oidc ${PLUGIN_OIDC_VERSION})

RUN git clone https://github.com/ikethecoder/kong-oidc-consumer.git
RUN (cd kong-oidc-consumer && git checkout 6f15eaa)
RUN (cd kong-oidc-consumer && luarocks make && luarocks pack kong-oidc-consumer ${PLUGIN_OIDC_CONSUMER_VERSION})

RUN git clone https://github.com/ikethecoder/kong-plugin-jwt-keycloak.git
RUN (cd kong-plugin-jwt-keycloak && luarocks make && luarocks pack kong-plugin-jwt-keycloak ${PLUGIN_VERSION})

RUN git clone -b feature/kong-2.0-upgrade https://github.com/bcgov/gwa-kong-endpoint.git
RUN (cd gwa-kong-endpoint && ./devBuild.sh)

RUN git clone -b hotfix/ips-not-always-string https://github.com/bcgov/gwa-ip-anonymity.git
RUN (cd gwa-ip-anonymity && ./devBuild.sh)

RUN luarocks install lua-resty-jwt 0.2.2-0 \
  && luarocks install lua-resty-session 2.26-1 \
  && luarocks install lua-resty-openidc 1.7.5-1 \
  && luarocks install kong-spec-expose \
  && luarocks install kong-upstream-jwt \
  && luarocks install kong-plugin-referer \
  && luarocks install kong-upstream-jwt \
  && luarocks install kong-oidc/kong-oidc-${PLUGIN_OIDC_VERSION}.all.rock \
  && luarocks install kong-plugin-upstream-auth-basic/kong-plugin-upstream-auth-basic-${PLUGIN_UPSTREAM_BASIC_VERSION}.all.rock \
  && luarocks install kong-oidc-consumer/kong-oidc-consumer-${PLUGIN_OIDC_CONSUMER_VERSION}.all.rock \
  && luarocks install kong-plugin-jwt-keycloak/kong-plugin-jwt-keycloak-${PLUGIN_VERSION}.all.rock

RUN git clone https://github.com/Kong/priority-updater.git
RUN (cd priority-updater/template/plugin && KONG_PRIORITY=902 KONG_PRIORITY_NAME=rate-limiting /usr/local/openresty/luajit/bin/luajit ../priority.lua)
RUN (cd priority-updater/template/plugin && KONG_PRIORITY=1010 KONG_PRIORITY_NAME=jwt-keycloak /usr/local/openresty/luajit/bin/luajit ../priority.lua)

USER kong

ENV KONG_PLUGINS="bundled, jwt-keycloak_1010, rate-limiting_902, oidc, oidc-consumer, bcgov-gwa-endpoint, gwa-ip-anonymity, kong-spec-expose, kong-upstream-jwt, referer, jwt-keycloak, kong-upstream-jwt, upstream-auth-basic"