#!/bin/bash

cd /tmp

while true; do
    keycloakstatus=$(curl -o /dev/null -sw '%{http_code}\n' http://keycloak.localtest.me:9081/auth/realms/master)
    echo "$keycloakstatus"
    if [[ "$keycloakstatus" == "200" ]]; then
        echo  "Keycloak is up"
        cd /e2e
        # added sleep to wait for initial data seeding
        sleep 1m
        if [[ "$RUN_ENV" == "prod" ]]; then
            npm run cy:run:rcd:html
        else
            npm run cy:run:html
        fi
        break
    else
        echo  "Waiting for Keycloak....."
        sleep 10s
    fi
done


