FROM kong:2.5.0

USER root

RUN apk add git

ARG PLUGIN_VERSION=1.1.0-1
ARG FORCE_BUILD=1

RUN git clone https://github.com/ikethecoder/kong-plugin-jwt-keycloak.git
RUN (cd kong-plugin-jwt-keycloak && luarocks make && luarocks pack kong-plugin-jwt-keycloak ${PLUGIN_VERSION})

RUN git clone -b feature/kong-2.0-upgrade https://github.com/bcgov/gwa-kong-endpoint.git
RUN (cd gwa-kong-endpoint && ./devBuild.sh)

RUN git clone -b hotfix/ips-not-always-string https://github.com/bcgov/gwa-ip-anonymity.git
RUN (cd gwa-ip-anonymity && ./devBuild.sh)

RUN luarocks install lua-resty-jwt 0.2.2-0 \
  && luarocks install lua-resty-openidc 1.6.1-1 \
  && luarocks install kong-oidc \
  && luarocks install kong-spec-expose \
  && luarocks install kong-plugin-referer \
  && luarocks install kong-plugin-jwt-keycloak/kong-plugin-jwt-keycloak-${PLUGIN_VERSION}.all.rock

USER kong

ENV KONG_PLUGINS="bundled, oidc, bcgov-gwa-endpoint, gwa-ip-anonymity, kong-spec-expose, referer, jwt-keycloak"