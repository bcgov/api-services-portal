#!/bin/bash

cd /tmp

while true; do
    keycloakstatus=$(curl -o /dev/null -Isw '%{http_code}\n' http://keycloak.localtest.me:9080/auth/realms/master)
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
        break
    else
        echo  "Waiting for Keycloak....."
        sleep 2m
    fi
done


