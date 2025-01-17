#!/bin/bash

while true; do
    keycloakstatus=$(curl -o /dev/null -Isw '%{http_code}\n' http://keycloak.localtest.me:9081/auth/realms/master)
    echo "$keycloakstatus"
    if [[ "$keycloakstatus" == "200" ]]; then
        echo  "Keycloak is up... waiting to finish seeding"
        cd /e2e-playwright
        # added sleep to wait for initial data seeding
        sleep 30s
        echo "Running Playwright tests..."
        npx playwright test
        break
    else
        echo  "Waiting for Keycloak....."
        sleep 10s
    fi
done


