FROM docker.io/kong:3.9.0

USER root

RUN apt-get update && apt-get install -y git ethtool strace unzip

RUN git clone -b main https://github.com/bcgov/kong-oss-plugins.git \
 && cd kong-oss-plugins/plugins \
 && (cd jwt-keycloak && luarocks make) \
 && (cd oidc && luarocks make kong-plugin-oidc-1.5.0-2.rockspec) \
 && (cd oidc-consumer && luarocks make kong-oidc-consumer-0.0.1-0.rockspec)

RUN git clone -b kong3 https://github.com/bcgov/gwa-kong-endpoint.git
RUN (cd gwa-kong-endpoint && ./devBuild.sh)

RUN git clone -b kong3 https://github.com/bcgov/gwa-ip-anonymity.git
RUN (cd gwa-ip-anonymity && ./devBuild.sh)

RUN git clone https://github.com/Optum/kong-spec-expose.git \
    && cd kong-spec-expose \
    && luarocks make \
    && cd .. \
    && git clone https://github.com/Optum/kong-upstream-jwt.git \
    && cd kong-upstream-jwt \
    && luarocks make

RUN git clone https://github.com/Kong/priority-updater.git
RUN (cd priority-updater/template/plugin && KONG_PRIORITY=902 KONG_PRIORITY_NAME=rate-limiting /usr/local/openresty/luajit/bin/luajit ../priority.lua)
RUN (cd priority-updater/template/plugin && KONG_PRIORITY=1010 KONG_PRIORITY_NAME=jwt-keycloak /usr/local/openresty/luajit/bin/luajit ../priority.lua)
RUN (cd priority-updater/template/plugin && KONG_PRIORITY=200 KONG_PRIORITY_NAME=post-function /usr/local/openresty/luajit/bin/luajit ../priority.lua)

USER kong

ENV KONG_PLUGINS="bundled, jwt-keycloak_1010, rate-limiting_902, post-function_200, oidc, oidc-consumer, bcgov-gwa-endpoint, gwa-ip-anonymity, kong-spec-expose, kong-upstream-jwt, jwt-keycloak, kong-upstream-jwt"