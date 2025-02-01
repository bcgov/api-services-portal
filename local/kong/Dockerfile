FROM docker.io/kong:2.8.5

USER root

RUN apk add git ethtool strace unzip

RUN git clone -b cleanup https://github.com/bcgov/kong-oss-plugins.git \
 && cd kong-oss-plugins/plugins \
 && (cd jwt-keycloak && luarocks make) \
 && (cd oidc && luarocks make) \
 && (cd oidc-consumer && luarocks make)

RUN git clone -b feature/kong-2.0-upgrade https://github.com/bcgov/gwa-kong-endpoint.git
RUN (cd gwa-kong-endpoint && ./devBuild.sh)

RUN git clone -b hotfix/ips-not-always-string https://github.com/bcgov/gwa-ip-anonymity.git
RUN (cd gwa-ip-anonymity && ./devBuild.sh)

RUN luarocks install kong-spec-expose \
 && luarocks install kong-plugin-referer \
 && luarocks install kong-upstream-jwt

RUN git clone https://github.com/Kong/priority-updater.git
RUN (cd priority-updater/template/plugin && KONG_PRIORITY=902 KONG_PRIORITY_NAME=rate-limiting /usr/local/openresty/luajit/bin/luajit ../priority.lua)
RUN (cd priority-updater/template/plugin && KONG_PRIORITY=1010 KONG_PRIORITY_NAME=jwt-keycloak /usr/local/openresty/luajit/bin/luajit ../priority.lua)
RUN (cd priority-updater/template/plugin && KONG_PRIORITY=200 KONG_PRIORITY_NAME=post-function /usr/local/openresty/luajit/bin/luajit ../priority.lua)

USER kong

ENV KONG_PLUGINS="bundled, jwt-keycloak_1010, rate-limiting_902, post-function_200, oidc, oidc-consumer, bcgov-gwa-endpoint, gwa-ip-anonymity, kong-spec-expose, kong-upstream-jwt, referer, jwt-keycloak, kong-upstream-jwt, upstream-auth-basic"