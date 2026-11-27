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
        # Merge the JSON reports once at the end so an earlier aggregate is not
        # fed back into mochawesome-merge.
        if [[ "$RUN_ENV" == "prod" ]]; then
            npm run cy:run:rcd
        else
            npm run cy:run
        fi
        portal_status=$?
        echo "Running Keycloak HA specs"
        export KEYCLOAK_SITE_A_HEALTH=http://keycloak-site-a:9000/health/ready
        export KEYCLOAK_SITE_B_HEALTH=http://keycloak-site-b:9000/health/ready
        export HAPROXY_SOCKET_HOST=keycloak
        npm run cy:run:ha
        ha_status=$?
        npm run moch:json
        npm run moch:html
        if [[ "$portal_status" -ne 0 || "$ha_status" -ne 0 ]]; then
            exit 1
        fi
        break
    else
        echo  "Waiting for Keycloak....."
        sleep 10s
    fi
done


