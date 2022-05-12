#/bin/bash -e -x

python scripts/template.py scripts/feeder-init/legal.yaml legal.yaml
python scripts/template.py scripts/feeder-init/platform-authz-profile.yaml platform-authz-profile.yaml
python scripts/template.py scripts/feeder-init/platform-dataset.yaml platform-dataset.yaml
python scripts/template.py scripts/feeder-init/platform-gwa-api.yaml platform-gwa-api.yaml

while true; do
    status=$(curl -o /dev/null -Isw '%{http_code}\n' ${PORTAL_URL}/health)
    echo "$status"
    if [[ "$status" == "200" ]]; then
        echo  "Portal is up"
        nohup kubectl port-forward service/${SERVICE} 8080:80 &
        FWD_PID=$!
        echo "Port forwarded ${SERVICE} with $FWD_PID"
        sleep 5
        curl --fail -v http://localhost:8080/push -F yaml=@legal.yaml
        curl --fail -v http://localhost:8080/push -F yaml=@platform-authz-profile.yaml
        curl --fail -v http://localhost:8080/push -F yaml=@platform-dataset.yaml
        curl --fail -v http://localhost:8080/push -F yaml=@platform-gwa-api.yaml
        curl --fail -v http://localhost:8080/push -F yaml=@organization-unit.yaml
        curl --fail -v http://localhost:8080/push -F yaml=@dataset-test.yaml
        kill $FWD_PID
        break
    else
        echo  "Waiting for Portal....."
        sleep 1m
    fi
done
