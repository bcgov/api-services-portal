# KeystoneJS Starter Template

You've created a KeystoneJS project! This project contains a simple list of users and an admin application (`localhost:3000/admin`) with basic authentication.

## Running the Project.

To run this project first run `npm install`. Note: If you generated this project via the Keystone cli step this has been done for you \\o/.

Once running, the Keystone Admin UI is reachable via `localhost:3000/admin`.

### Docker

#### Proxy

```
docker run -ti --rm --name proxy -p 4180:4180 \
  quay.io/oauth2-proxy/oauth2-proxy \
    --http-address=0.0.0.0:4180 \
    --cookie-secret=s3r3t33333333333 \
    --email-domain=* \
    --provider=keycloak \
    --client-id=gwa \
    --client-secret=93d2b2f2-c2d9-d526-1f29-482d23eeaebf \
    --scope=openid \
    --login-url="https://authz-apps-gov-bc-ca.dev.apsgw.xyz/auth/realms/aps/protocol/openid-connect/auth" \
    --redeem-url="https://authz-apps-gov-bc-ca.dev.apsgw.xyz/auth/realms/aps/protocol/openid-connect/token" \
    --validate-url="https://authz-apps-gov-bc-ca.dev.apsgw.xyz/auth/realms/aps/protocol/openid-connect/userinfo" \
    --redirect-url="http://localhost:4180/oauth2/callback" \
    --cookie-secure=False \
    --cookie-name=keystone.sid \
    --pass-authorization-header \
    --pass-access-token \
    --pass-host-header \
    --upstream="http://httpbin.org"
    --upstream="http://192.168.1.68:3000"

    --upstream="http://httpbin.org"
```

```
docker build --tag portal-backend .

docker run -ti --rm \
  -e COOKIE_SECRET=s3cr3t \
  -e MONGO_URL="mongodb://192.168.1.68:17017/keystonedb2" \
  -e MONGO_USER="" \
  -e MONGO_PASSWORD="" \
  -p 4000:3000 portal-backend
```

## Next steps

This example has no front-end application but you can build your own using the GraphQL API (`http://localhost:3000/admin/graphiql`).
