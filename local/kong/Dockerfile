ARG KONG_VERSION="3.9.1"
FROM docker.io/kong:${KONG_VERSION}

USER root

RUN apt-get update && apt-get -y install unzip curl && apt-get clean

RUN git clone https://github.com/bcgov/kong-oss-plugins.git \
  && cd kong-oss-plugins \
  && (cd plugins/jwt-keycloak && luarocks make) \
  && (cd plugins/oidc && luarocks make kong-plugin-oidc-1.5.0-2.rockspec) \
  && (cd plugins/oidc && \
     case "${KONG_VERSION}" in \
         (3*) luarocks build --deps-only kong-plugin-oidc-deps-k3-1.5.0-2.rockspec;; \
         (*)  luarocks build --deps-only kong-plugin-oidc-deps-k2-1.5.0-2.rockspec;; \
     esac) \
  && (cd plugins/oidc-consumer && luarocks make)
 
RUN git clone -b kong3 https://github.com/bcgov/gwa-kong-endpoint.git \
  && (cd gwa-kong-endpoint && ./devBuild.sh)

RUN git clone -b kong3 https://github.com/bcgov/gwa-ip-anonymity.git \
  && (cd gwa-ip-anonymity && ./devBuild.sh)

RUN luarocks install kong-spec-expose \
#  && luarocks install kong-plugin-referer \
 && luarocks install kong-upstream-jwt

RUN git clone https://github.com/Kong/priority-updater.git \
  && (cd priority-updater/template/plugin && KONG_PRIORITY=902 KONG_PRIORITY_NAME=rate-limiting /usr/local/openresty/luajit/bin/luajit ../priority.lua) \
  && (cd priority-updater/template/plugin && KONG_PRIORITY=1010 KONG_PRIORITY_NAME=jwt-keycloak /usr/local/openresty/luajit/bin/luajit ../priority.lua) \
  && (cd priority-updater/template/plugin && KONG_PRIORITY=770 KONG_PRIORITY_NAME=pre-function /usr/local/openresty/luajit/bin/luajit ../priority.lua) \
  && (cd priority-updater/template/plugin && KONG_PRIORITY=200 KONG_PRIORITY_NAME=post-function /usr/local/openresty/luajit/bin/luajit ../priority.lua) \
  && (cd priority-updater/template/plugin && KONG_PRIORITY=201 KONG_PRIORITY_NAME=post-function /usr/local/openresty/luajit/bin/luajit ../priority.lua)

USER kong

ENV KONG_PLUGINS="bundled, jwt-keycloak_1010, rate-limiting_902, pre-function_770, post-function_200, post-function_201, oidc, oidc-consumer, kong-spec-expose, kong-upstream-jwt, jwt-keycloak, kong-upstream-jwt, bcgov-gwa-endpoint, gwa-ip-anonymity"
