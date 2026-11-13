#!/usr/bin/bash
# Site A imports the realm. If Keycloak 26.8 rejects the Keycloak 15 export,
# start again without --import-realm and create the session user through the admin API.
# The bootstrap admin (admin / local) is created by Keycloak itself.
set -uo pipefail

KC=/opt/keycloak/bin/kc.sh
HOST_HEADER="keycloak.localtest.me:9081"
pid=""

forward_stop() {
  if [[ -n "${pid}" ]]; then
    kill -TERM "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  fi
  exit 0
}

kc_request() {
  local method="$1"
  local path="$2"
  local content_type="$3"
  local body="$4"
  local auth_header="$5"
  local outfile="$6"
  exec 3<>/dev/tcp/127.0.0.1/9081 || return 1
  {
    printf '%s %s HTTP/1.0\r\n' "$method" "$path"
    printf 'Host: %s\r\n' "$HOST_HEADER"
    printf 'Connection: close\r\n'
    if [[ -n "$auth_header" ]]; then
      printf 'Authorization: Bearer %s\r\n' "$auth_header"
    fi
    if [[ -n "$body" ]]; then
      printf 'Content-Type: %s\r\n' "$content_type"
      printf 'Content-Length: %s\r\n' "${#body}"
    fi
    printf '\r\n'
    if [[ -n "$body" ]]; then
      printf '%s' "$body"
    fi
  } >&3
  cat <&3 >"$outfile"
  exec 3<&-
  exec 3>&-
}

http_status() {
  sed -n '1s/.* \([0-9][0-9][0-9]\).*/\1/p' "$1" | sed -n '1p'
}

http_body() {
  sed '1,/^\r$/d' "$1"
}

ensure_local_user() {
  local i status token body user_id role_id tmp
  tmp=/tmp/keycloak-site-a-admin
  token=""
  for ((i = 1; i <= 60; i++)); do
    if kc_request POST /auth/realms/master/protocol/openid-connect/token \
      application/x-www-form-urlencoded \
      "grant_type=password&client_id=admin-cli&username=admin&password=local" \
      "" "$tmp"; then
      status=$(http_status "$tmp")
      if [[ "$status" == "200" ]]; then
        token=$(sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p' "$tmp" | sed -n '1p')
        if [[ -n "$token" ]]; then
          break
        fi
      fi
    fi
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "Keycloak exited before the admin API was ready"
      return 0
    fi
    sleep 2
  done
  if [[ -z "$token" ]]; then
    echo "Could not obtain the bootstrap admin token; site A stays up without creating user local"
    rm -f "$tmp"
    return 0
  fi

  kc_request GET "/auth/admin/realms/master/users?username=local&exact=true" "" "" "$token" "$tmp" || true
  status=$(http_status "$tmp")
  body=$(http_body "$tmp")
  if [[ "$status" == "200" && "$body" != "[]" && "$body" != $'[]\r' ]]; then
    echo "User local already exists"
    rm -f "$tmp"
    return 0
  fi

  echo "Creating master realm user local through the admin API"
  kc_request POST /auth/admin/realms/master/users application/json \
    '{"username":"local","enabled":true,"email":"local@development.me","firstName":"local F","lastName":"local L","emailVerified":true}' \
    "$token" "$tmp" || true
  status=$(http_status "$tmp")
  if [[ "$status" != "201" && "$status" != "409" ]]; then
    echo "Creating user local failed with HTTP ${status}"
    rm -f "$tmp"
    return 0
  fi

  kc_request GET "/auth/admin/realms/master/users?username=local&exact=true" "" "" "$token" "$tmp" || true
  user_id=$(http_body "$tmp" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | sed -n '1p')
  if [[ -z "$user_id" ]]; then
    echo "Could not read the id for user local"
    rm -f "$tmp"
    return 0
  fi

  kc_request PUT "/auth/admin/realms/master/users/${user_id}/reset-password" application/json \
    '{"type":"password","value":"local","temporary":false}' \
    "$token" "$tmp" || true

  kc_request GET /auth/admin/realms/master/roles/admin "" "" "$token" "$tmp" || true
  role_id=$(http_body "$tmp" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | sed -n '1p')
  if [[ -n "$role_id" ]]; then
    kc_request POST "/auth/admin/realms/master/users/${user_id}/role-mappings/realm" application/json \
      "[{\"id\":\"${role_id}\",\"name\":\"admin\"}]" \
      "$token" "$tmp" || true
  fi
  echo "User local is ready"
  rm -f "$tmp"
}

args=("$@")
import_requested=false
filtered=()
for arg in "${args[@]}"; do
  if [[ "$arg" == "--import-realm" ]]; then
    import_requested=true
  else
    filtered+=("$arg")
  fi
done

trap forward_stop TERM INT

if [[ "$import_requested" == true ]]; then
  "$KC" "${filtered[@]}" --import-realm &
  pid=$!
  set +e
  wait "$pid"
  status=$?
  set -e
  # The process stays up after a successful import. A startup failure is a normal non-zero exit.
  if [[ $status -eq 0 || $status -ge 128 ]]; then
    exit "$status"
  fi
  echo "Realm import failed with exit ${status}. Starting without import."
  pid=""
fi

"$KC" "${filtered[@]}" &
pid=$!
if [[ "$import_requested" == true ]]; then
  ensure_local_user
fi
set +e
wait "$pid"
status=$?
set -e
exit "$status"
