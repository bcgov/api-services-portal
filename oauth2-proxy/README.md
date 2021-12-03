# Oauth Proxy

```
export COOKIE_SECRET=""
export OIDC_CLIENT_ID=""
export OIDC_CLIENT_SECRET=""
export OIDC_ISSUER=""

hostip=$(ifconfig en0 | awk '$1 == "inet" {print $2}')

docker run -ti --rm --name proxy -p 4180:4180 \
  quay.io/oauth2-proxy/oauth2-proxy:v7.2.0 \
    --http-address=0.0.0.0:4180 \
    --cookie-secret=$COOKIE_SECRET \
    --cookie-secure=False \
    --cookie-refresh=1m \
    --cookie-expire=24h \
    --insecure-oidc-allow-unverified-email=true \
    --insecure-oidc-skip-issuer-verification=true \
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
    --pass-basic-auth=false \
    --pass-access-token=true \
    --set-xauthrequest=true \
    --skip-jwt-bearer-tokens=false \
    --set-authorization-header=false \
    --pass-authorization-header=false \
    --skip-auth-regex="/health|/public|/docs|/redirect|/_next|/images|/devportal|/manager|/about|/maintenance|/admin/session|/ds/api|/feed/|/signout|^[/]$" \
    --whitelist-domain="${OIDC_ISSUER_HOSTNAME}" \
    --upstream="http://${hostip}:3000"
```

Alternate for unprotected the "/" root:

```
    --skip-auth-regex="/home|/public|/docs|/_next|/images/|^[/]$" \
```

# Sample Upstream

```
(cd sample-upstream && docker build --tag sample.local .)

docker run -ti --rm -p 3000:9000 \
    -e NODE_ENV=test \
    -e SESSION_SECRET=s3cr3t \
    -e JWKS_URL="${OIDC_ISSUER}/protocol/openid-connect/certs" \
    sample.local
```

Go to: `http://localhost:4180/public`

# Session Test Scenarios

Two session cookies are maintained - one for Oauth2 Proxy and the other for KeystoneJS, so some logic is required to handle different scenarios.

- `Oauth2 Proxy`:
  - The Proxy refreshes the JWT Token based on the `cookie-refresh` time. If this is less than the Access Token Lifespan configured in the IdP then Keystone `auth-oauth2-proxy : [check-jwt-error]` will trigger, which clears the KeystoneJS session and returns a 401. If the cookie refresh is less, then it will continue to pass a valid JWT Token to KeystoneJS.
- `KeystoneJS`:
  - `/admin/signin` : If there is an invalid token, then a forced signout occurs. Under normal circumstances a JWT Token should not become expired as the OAuth2 Proxy should be refreshing it
  - `/admin/session`: Bypasses the OAuth2 Proxy auth handling and returns successfully as long as the JWT Token exists, the JWT Token has not expired, and the Subject in the JWT Token matches the Subject in the KeystoneJS Session. If there is no JWT Token (Oauth2 Proxy cookie expired) or there is a Subject mismatch, then the KeystoneJS Session is ended and a 401 response is sent (the frontend NextJS app will show a "Unauthorized" page if a 401 response is returned). If the JWT has expired, then a forced Signout (HTTP 302) is returned as this is a special case that can be considered "mis-configuration" rather than expected functionality.

Scenarios:

- New browser session, login
- Sitting on an unprotected page when the JWT Token expires and hasn't been refreshed by the OAuth2 Proxy
- Sitting on an protected page when the JWT Token expires and hasn't been refreshed by the OAuth2 Proxy
- Sitting on a unprotected page when switching namespace
- Sitting on a protected page when switching namespace
- Sitting on a protected page when the JWT Refresh limit is reached
- Sitting on a protected page when the 24 hr OAuth2 Proxy session expires
- Sitting on a protected page when the 24 hr KeystoneJS session expires
- Logout
