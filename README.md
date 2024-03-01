# API Services Portal

[![Lifecycle:Stable](https://img.shields.io/badge/Lifecycle-Stable-97ca00?style=for-the-badge)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/actions/workflow/status/bcgov/api-services-portal/ci-build-deploy.yaml?branch=dev&style=for-the-badge)](https://github.com/bcgov/api-services-portal/actions/workflows/ci-build-deploy.yaml)
[![Coverage](https://img.shields.io/sonar/coverage/aps-portal/dev?server=https%3A%2F%2Fsonarcloud.io&style=for-the-badge)](https://sonarcloud.io/summary/new_code?id=aps-portal)
![GitHub](https://img.shields.io/github/license/bcgov/aps-portal?style=for-the-badge)
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/bcgov/aps-portal?label=release&style=for-the-badge)


## Introduction


The `API Services Portal` is a frontend for API Providers to manage the lifecycle of their APIs and for Developers to discover and access these APIs. It works in combination with the Kong Community Edition Gateway and Keycloak IAM solution.


## Local Deployment


The repo is setup to create a local deployment of the Portal along with required support services (Postgres, Keycloak, OAuth2-proxy,  Feeder and Kong Gateway) using `docker compose`.

1. Clone and build the [Gateway Admin API](https://github.com/bcgov/gwa-api) (gwa-api)

    ```
    git clone https://github.com/bcgov/gwa-api
    cd ./microservices/gatewayApi
    docker build -t gwa-api:e2e .
    ```

1. Build: Back in `api-services-portal`, run `docker compose --profile testsuite build`.
1. Run: `docker compose up`. Wait for startup to complete - look for `Swagger UI registered`.
1. The Portal is now live at http://oauth2proxy.localtest.me:4180
    1. To login, use username `local` and password `local`, or username `janis@idir` and password `awsummer`.
1. If you have made any changes to the app code, update images by running `docker compose build` then `docker compose up`.
1. Clean up: `docker compose down` removes all the hosted services

### Cypress testing

To run the Cypress test automation suite, run `docker compose --profile testsuite up`.

### gwa CLI configuration

To use the `gwa` command line interace, configure it with:

```
gwa config set host oauth2proxy.localtest.me:4180
gwa config set scheme http
```

Run this command to test logging in and creating a namespace:

```
gwa login
gwa namespace create --name gw-12345
```

### Keycloak configuration

Keycloak is initialized with `master` realm. The realm configuration is saved in `local/keycloak/master-realm.json`. It also creates a realm user `local` with admin privileges.

### Development

Use the following configuration to run the Portal locally (outside of Docker) against the support components deployed with `docker compose`. Changes to the Portal code will live update instead of requiring `docker build`.

1. Follow [local deployment instructions](#local-deployment) and run `docker compose up`.
1. In `/src` run `npm install`.
    1. If using Node version > 17, run `npm install --legacy-peer-deps` 

1. Turn off the docker compose Portal: `docker stop apsportal`
1. Configure the `oauth2-proxy` that is running in Docker:
    1. Update `upstreams` in `oauth2-proxy/oauth2-proxy-local.cfg` to include the IP address of your local machine, e.g. `upstreams=["http://172.100.100.01:3000"]`
    <br>You can obtain the IP address using `hostname -I`.
    
    1. Restart the oauth2-proxy: `docker compose restart oauth2-proxy`

1. Start the Portal locally:

    ```sh
    cd src
    set -o allexport
    source ../.env.local
    LOG_LEVEL=debug
    KNEX_HOST=kong-db.localtest.me
    NEXT_PUBLIC_MOCKS=off
    set +o allexport

    npm run dev
    ```

1. The Portal is now live at http://oauth2proxy.localtest.me:4180 and should auto-update on code changes.


## Design


The `API Services Portal` is a React application using the Chakra UI component library, and using two frameworks: KeystoneJS V5, and NextJS.

The application is divided up into the following six components:

### 1. Data Model

The KeystoneJS lists define the aggregated data model that makes up this application.

Source: `src/lists/*`

### 2. UI

The actual pages and components for the `API Services Portal`.

Source: `src/nextapp/*`

### 3. Authentication

Support for an OAuth2-Proxy was added to allow authenticating with an OAuth2 flow. A Token is passed on to the KeystoneJS backend and our middleware verifies the token and starts a session.

Source: `src/auth/auth-oauth2-proxy.js`

### 4. Authorization

A decision matrix and authorization rules engine is implemented to centralize the rules around access to data.

It uses Permissions retrieved for the logged in user and a particular `Namespace` Resource. The Requesting Party Token (RPT) holding the permissions will be maintained in the KeystoneJS Session and refreshed accordingly.

Switching namespaces will result in getting a new RPT that has the relevant permission for the user for the `Namespace`.

| Function                                   | Access                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| Discover APIs                              | Guest                                                                               |
| API Access (Request Access)                | Authenticated                                                                       |
| API Access (Revoke, Documentation)         | Authenticated and Service Access (by Consumer for user or app)                      |
| Documentation (public)                     | Guest                                                                               |
| Documentation (private)                    | Authenticated and Service Access (by Consumer for user or app)                      |
| My Resources (Grant/Revoke/Approve/Reject) | Authenticated and `Resource Owner` for UMA `Namespace` Resource                     |
| My Resources (Create Service Account)      | Authenticated and `Resource Owner` for UMA `Namespace` Resource                     |
| Applications (Ministry)                    | Authenticated with IDIR or Github                                                   |
| Applications (Business)                    | Authenticated with BCeID                                                            |
| Namespaces                                 | Authenticated and `any` UMA `Namespace` Resource Permission                         |
| Namespaces (Create Namespace)              | Authenticated                                                                       |
| Namespaces (Delete Namespace)              | Authenticated and UMA `Namespace` Resource Permission `Namespace.Manage` (or Owner) |
| Products (and Environments)                | UMA `Namespace` Resource Permission `Namespace.Manage` or `Namespace.View`          |
| Services (View Config and Metrics)         | UMA `Namespace` Resource Permission `Namespace.Manage` or `Namespace.View`          |
| Consumers (Pending Approval)               | UMA `Namespace` Resource Permission `Access.Manage`                                 |
| Consumers (Service Access)                 | UMA `Namespace` Resource Permission `Access.Manage`                                 |
| Authorization Profiles (Credential Issuer) | UMA `Namespace` Resource Permission `Namespace.Manage`                              |
| Activity                                   | UMA `Namespace` Resource Permission `Namespace.Manage` or `Namespace.View`          |
| Publish Gateway Config                     | UMA `Namespace` Resource Permission `GatewayConfig.Publish`                         |
| Delete Gateway Config                      | UMA `Namespace` Resource Permission `GatewayConfig.Publish`                         |
| Namespace Profile (Org and Contacts)       | UMA `Namespace` Resource Permission `Namespace.Admin`                               |

Source: `src/authz`

### 5. Ingestor

An ingestion framework for adding content from external sources.

Source: `src/batch/feedWorker.js`

### 6. Feeders

A set of feeders that live close to the external sources for reading and sending data to the Ingestor

Currently support feeders:

- CKAN (Comprehensive Knowledge Archive Network)
- Kong
- Prometheus

Source: `feeds`


## Development


### TypeScript

The client-side Next.js application uses TypeScript, and because it plays nicely with GraphQL types, uses a codegen to generate the API types.
In `development` mode once the API server has started the types are automatically generated, but will need to be regenerated if you make changes to the
GraphQL schemas while the dev server is running.

If you want to manually build the types, first ensure the API server is running at `http://localhost:3000/admin/api` and run `$ npm run generate`

A `queries.types.ts` file is generated at `src/nextapp/shared/types`.

Example usage:

```typescript
import type { Query } from '@/types/queries.types';

const Component = () => {
   const { data } = useQuery<Query>(...);

   return (
     <div>{data.allPackages.map(...)}</div>
   )
}

```

All Typescript paths alias `src/nextapp` to `@/`.

### Storybook

[Chakra UI](https://chakra-ui.com) was chosen for the UI framework due to its utility and flexibility. A theme has been created which follows the [BC Government Web Design System](https://developer.gov.bc.ca/Design-System) alongside custom components written for the portal.

Storybook has been installed to demonstrate and preview custom components. To view run `$ npm run storybook`.

Core components like buttons and form elements have their own Chakra theme variant, all set by default so using a button like so;

```jsx
import { Button } from 'chakra-ui/react';

// Renders as a BC Primary Button
<Button>Primary<Button>

// or the longhand declarative version
<Button variant="primary">Primary</Button>
```

All the core components stories are located in `src/stories`. For custom components add the story in the component folder, ie `src/nextapp/components/card/card.stories.tsx`.

### Mock Server

For convenience a mock server is available to fake data via the GraphQL api. Run by opening a new shell window after running `$ npm run dev` and run the following:

```shell
$ cd src/
$ npm run mock-server
```

In `./src/.env.local` assign the Next and GWA `API_ROOT` values to the following

```
NEXT_PUBLIC_API_ROOT=http://localhost:4000
GWA_API_URL=http://localhost:4000
```

It should be noted that a 1-to-1 replication of the production API is not the goal of the mock server. It's simply to replicate requests and confirm the content returned will behave in an expected way.

#### Updating mock server schemas

When Keystone-level types are updated, there is a manual step required for the mock server in order to keep the mock data structure in sync with the production server. It is definitely manual at the moment, but fairly easy and quick to do.

1. After the Keystone dev server has started (`$ npm run dev`), open [http://localhost:3000/admin/graphiql](http://localhost:3000/admin/graphiql)
2. The far right of the graphiql interface are 2 tabs, `DOCS` and `SCHEMAS`. You can either download and copy or copy the contents of the `SCHEMAS` tab and paste it in `src/test/mock-server/schemas.js` inside the string literal.
3. Delete any instances of a `@deprecated(reason: "Use `path` instead")` string. These messages break the graphql-tools

### Coding Style

There isn't a strict, repo-wide coding style per se, but we use Prettier and ESLint to maintain a consistent code style. Both libraries are included locally as part of the node_modules, so it is recommended to configure your editor to run off local versions instead of global so any API changes between versions don't collide.

Keep your code neat with easy to understand variable names, common sense verbosity is encouraged so anyone can understand what the code does.

```javascript
// don't
const x = a + b;

if (x) c(x);

// do

const sumOfItems = itemA + itemB;

if (sumOfItems) {
  runResultOfSums(sumOfItems);
}

// you can use abbreviations for iterations though, as long as the list is explicit
const newItemsMapped = allNewItems.map((a) => ({ ...a, newKey: 'a' }));
```

### Database (KNex)

When using Postgres as a backend, there is limited support for migrations. So need to come up with a process for `upgrading` databases.

```
select 'drop table "' || tablename || '" cascade;' from pg_tables where schemaname='public';
```

In the mean time, it is possible to drop the tables and re-run the `init-aps-portal-keystonejs-batch-job`.
