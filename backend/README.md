# KeystoneJS Starter Template

You've created a KeystoneJS project! This project contains a simple list of users and an admin application (`localhost:3000/admin`) with basic authentication.

## Running the Project.

To run this project first run `npm install`. Note: If you generated this project via the Keystone cli step this has been done for you \\o/.

Once running, the Keystone Admin UI is reachable via `localhost:3000/admin`.

### Docker

```
docker build --tag portal-backend .

docker run -ti --rm \
  -e COOKIE_SECRET=s3cr3t \
  -e MONGO_URL="mongodb://192.168.1.68:17017/keystonedb2" \
  -e MONGO_USER="" \
  -e MONGO_PASSWORD = "" \
  -p 4000:3000 portal-backend
```

## Next steps

This example has no front-end application but you can build your own using the GraphQL API (`http://localhost:3000/admin/graphiql`).
