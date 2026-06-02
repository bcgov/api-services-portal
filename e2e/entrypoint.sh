#!/bin/bash

cd /tmp

while true; do
    keycloakstatus=$(curl -o /dev/null -sw '%{http_code}' http://keycloak.localtest.me:9081/auth/realms/master)
    echo "$keycloakstatus"
    if [[ "$keycloakstatus" == "200" ]]; then
        echo  "Keycloak is up"
        break
    else
        echo  "Waiting for Keycloak....."
        sleep 10s
    fi
done

cd /e2e
# added sleep to wait for initial data seeding
sleep 1m

while true; do
    proxystatus=$(curl -o /dev/null -s --connect-timeout 5 -w '%{http_code}' http://oauth2proxy.localtest.me:4180/ 2>/dev/null)
    echo "$proxystatus"
    if [[ "$proxystatus" =~ ^[1-9][0-9]{2}$ ]]; then
        echo "OAuth2 Proxy is up"
        break
    else
        echo  "Waiting for OAuth2 Proxy....."
        sleep 10s
    fi
done

if [[ "$RUN_ENV" == "prod" ]]; then
    npm run cy:run:rcd:html
else
    npm run cy:run:html
fi
