#!/bin/bash

apk add --no-cache curl
cd /tmp

while true; do
    keycloakstatus=$(curl -o /dev/null -Isw '%{http_code}\n' http://keycloak.localtest.me:9080/auth/realms/master)
    echo "$keycloakstatus"
    if [[ "$keycloakstatus" == "200" ]]; then
        echo  "Keycloak is up"
        curl http://feeder.localtest.me:6000/push -F yaml=@legal.yaml
        curl http://feeder.localtest.me:6000/push -F yaml=@idir-user.yaml
        curl http://feeder.localtest.me:6000/push -F yaml=@developer-user.yaml
        curl http://feeder.localtest.me:6000/push -F yaml=@platform-authz-profile.yaml
        curl http://feeder.localtest.me:6000/push -F yaml=@platform-gwa-api.yaml
<<<<<<< HEAD
        curl http://feeder.localtest.me:6000/push -F yaml=@organization-unit.yaml

=======
        curl http://feeder.localtest.me:6000/push -F yaml=@organization.yaml
        curl http://feeder.localtest.me:6000/push -F yaml=@organization-unit.yaml
>>>>>>> feature/rate-limit-redis
        break
    else
        echo  "Waiting for Keycloak....."
        sleep 1m
    fi
done

