

# Oauth Proxy
```
export COOKIE_SECRET=""
export OIDC_CLIENT_ID=""
export OIDC_CLIENT_SECRET=""
export OIDC_ISSUER=""

hostip=$(ifconfig en0 | awk '$1 == "inet" {print $2}')

docker run -ti --rm --name proxy -p 4180:4180 \
  quay.io/oauth2-proxy/oauth2-proxy \
    --http-address=0.0.0.0:4180 \
    --cookie-secret=$COOKIE_SECRET \
    --email-domain=* \
    --provider=keycloak \
    --client-id=${OIDC_CLIENT_ID} \
    --client-secret=${OIDC_CLIENT_SECRET} \
    --scope=openid \
    --oidc-issuer-url="${OIDC_ISSUER}" \
    --login-url="${OIDC_ISSUER}/protocol/openid-connect/auth" \
    --redeem-url="${OIDC_ISSUER}/protocol/openid-connect/token" \
    --validate-url="${OIDC_ISSUER}/protocol/openid-connect/userinfo" \
    --redirect-url="http://localhost:4180/oauth2/callback" \
    --cookie-secure=False \
    --cookie-refresh=60s \
    --cookie-name=app.sid \
    --pass-access-token \
    --pass-user-headers \
    --pass-host-header \
    --skip-auth-regex=/public \
    --upstream="http://${hostip}:9000"
```

# Sample Upstream

```
(cd sample-upstream && docker build --tag sample.local .)

docker run -ti --rm -p 9000:9000 \
    -e NODE_ENV=test \
    -e SESSION_SECRET=s3cr3t \
    -e JWKS_URL="${OIDC_ISSUER}/protocol/openid-connect/certs" \
    sample.local
```
