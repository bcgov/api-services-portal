#/bin/bash -e -x

python scripts/template.py scripts/feeder-init/legal.yaml legal.yaml
python scripts/template.py scripts/feeder-init/platform-authz-profile.yaml platform-authz-profile.yaml
python scripts/template.py scripts/feeder-init/platform-gwa-api.yaml platform-gwa-api.yaml

while true; do
    status=$(curl -o /dev/null -Isw '%{http_code}\n' ${PORTAL_URL}/health)
    echo "$status"
    if [[ "$status" == "200" ]]; then
        echo  "Portal is up"
        kubectl port-forward service/${SERVICE} 8080:80 &
        FWD_PID=$!
        echo "Port forwarded ${SERVICE} with $FWD_PID"
        curl --fail http://localhost:8080/push -F yaml=@legal.yaml
        curl --fail http://localhost:8080/push -F yaml=@platform-authz-profile.yaml
        curl --fail http://localhost:8080/push -F yaml=@platform-gwa-api.yaml
        kill -9 $FWD_PID
        break
    else
        echo  "Waiting for Portal....."
        sleep 1m
    fi
done
