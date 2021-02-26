# API Developer and Management Portal

## Running the Project.

To run this project first run `npm install`.

This application requires to have an Authentication proxy in front of it. Go to [oauth2-proxy](oauth2-proxy) for instructions on starting the proxy locally.

You can then run `npm run dev` to start the application on port 3000. The proxy runs on port 4180.

```
hostip=$(ifconfig en0 | awk '$1 == "inet" {print $2}')

export AUTH_STRATEGY=Oauth2Proxy
export ADAPTER=knex
export KNEX_HOST=$hostip
export KNEX_DATABASE=keystonejs
export KNEX_USER=""
export KNEX_PASSWORD=""
export MONGO_URL=mongodb://$hostip:17017/keystonedb3
export MONGO_USER=""
export MONGO_PASSWORD=""

export KONG_URL=""
export OIDC_ISSUER=""
export JWKS_URL=${OIDC_ISSUER}/protocol/openid-connect/certs

export EXTERNAL_URL="http://localhost:4180"

npm run dev
```

Once running, the `aps portal` application is reachable via `localhost:4180`.

## Design

The application is built around the KeystoneJS V5 and NextJS frameworks.

The following customizations have been implemented

### Authentication

Support for an OAuth-Proxy for the Admin API was added to support authenticating with in OAuth flow

### Authorization

A decision matrix and authorization rules engine was implemented to centralize the rules around access to data

### Injestor

An ingestion framework for adding content from external sources

### Feeders

A set of feeders that live close to the external sources for reading and sending data to the Ingestor



## User Journeys
Roles:

- **Credential Admin**: Application for authenticating with an OIDC Auth provider for the purposes of client registration. The Credential Issuer will generate the new credentials and provide a mechanism for the Developer to retrieve them.
- **API Manager**: The API Manager makes APIs available for consumption with supporting documentation. They approve requests for access.
- **API Owner**: Does the technical deployment of the API on the Gateway under a particular Namespace - Gateway Services.
- **Developer**: A Developer discovers APIs, requests access if required and consumes them.

Typical Flow:

- API Owner: Technical deployment to the Gateway by the API Owner
- API Owner: Create a new DataSet (API) (belongs to a namespace) which can have one or more Gateway Services. Choose the Credential Issuer and the Policies that will be enforced on the gateway for the Gateway Services. A Gateway Service can only belong to one DataSet. A DataSet belongs to one Organization Unit. Only certain Gateway Services will be part of a DataSet (i.e./ only Prod Services).
- API Owner: Publish DataSet to BC Data Catalog or keep private
- API Manager: If private, an API Manager can create an Access Request on behalf of a user - choose DataSet, enter Email; notification sent to Developer
- Developer: If public, a Developer can login, view available APIs and Request Access, Open Console, Launch
- API Manager approves Access Request; Credential Issuer Admin will be notified there is a pending approval request
- Credential Admin will view the Access Request, will authenticate with the Credential Provider and do Client Registration (or create a Registration Token) and update the Access Request with a temporary Token (or contact the Client), marking Access Request as Reg Token Generated or Complete if the Developer got the Token (Automated, Semi-automated, Manual)
- Developer: Go to Pending Requests and Generate Token, where the Developer will make a note of the Credential, Access Request marked Completed
- Developer: Go to Access APIs to view the Gateway Services that the user has access to (public or with Applications). Have available: Open Console, Launch App

Sandbox vs Production for same DataSet. Credential Issuer can be different for different Gateway Services (ie./ dev/test/prod). Should we introduce environment?

Gateway Services will have attributes that are read only and some editable by the API Owner.

(Import from Kong could backfill the Gateway Services, Plugins, Credential Issuer)

Other capabilities: API Manager to Revoke Access.

The Credential Issuer will be displayed as a Type: Public, OIDC, API Key. If OIDC it will have the Discovery URL and the Client ID.

| Entity        | Credential Admin                      | API Manager                   | API Owner | Developer | APS Platform |
| ------------- | ------------------------------------- | ----------------------------- | --------- | --------- | ------------ |
| AccessRequest | If Approved then Edit only Cred field | If Pending then Mark Approved |

AccessRequest - most complicated as different people can edit at different times
Consumer (Kong) **
Content - TBD
CredentialIssuer editable by Owner or Admin only.
Dataset (BCDC) **
DatasetGroup only editable by API Owner - Admin of Namespace
Gateway (Keycloak) **
Group (Keycloak) **
Organization (BCDC) **
OrganizationUnit (BCDC) **
Plugin (Kong) **
ServiceRoute (Kong) (most fields - update with DataSet, CredentialIssuer) **
TemporaryIdentity (created at login so that it can be used in the KeystoneJS Authorization model)

\*\* Read Only because they are generated from other systems.

AccessRequest: Pending -> Approved -> Issued -> Complete; at any time it can be Cancelled

CredentialIssuer can be for an API Key as well - in this case the CredentialAdmin will generate the API Key and email it to the Deveoper after the API Owner approves.

Emails: AccessRequest flow (Pending Approval, Pending Creation, Credentials Issued - Body of message)

AccessRequest can have credentials issued in three ways:

- Manual - credentials are created and passed manually by the Credential Admin to the Developer
- Semi-automatic - similar to Automatic except that the Credential Admin can review before sending the Email
- Automatic (one or two step) - the CredentialIssuer uses the supplied Client ID/Client Secret (or Token) to mint new Credentials (one step) or Token to generate new Client Credentials (two step).

Maybe better as:

- One step - credentials are passed on via email to the user (or can be "picked up" in the Developer Portal)
- Two step - temporary token saved and an email is sent to tell user credentials are approved and ready to generate

Generating the credentials (manual, using client registration service, using temporary registration token)
Communicating the credentials to the Developer (manually add creds in email - creds not persisted, have developer pick them up on portal)

CredentialIssuer -> AuthenticationPolicy / SecurityPolicy

Have code that:

- Calls API
- Loops through each (in batch) and does a search for the IDs; calculate hash; if diff do update, if missing do insert.
- Insertions should add standard addt'l fields that relate to the SystemOfRecord
- Get full list of IDs, remove ones that were retrieved from API and do a deletion (full sync).

Update gwa-api to return the Keycloak details, Kong details and BCDC details. For now just go direct for Kong and BCDC.

## Development

#### TypeScript

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

All Typescript paths alias `src/nextapp` to `@/` for easier module loading.

#### Mock Server

For convenience a mock server is available to fake data via the GraphQL api. To use along side running `$ npm run dev`:

```shell
$ cd src/
$ node test/mock-server/server.js
```

In `./src/.env.local` be sure to set these

```
NEXT_PUBLIC_API_ROOT=http://localhost:4000
```



### Database (KNex)

When using Postgres as a backend, there is limited support for migrations.  So need to come up with a process for `upgrading` databases.

```
select 'drop table "' || tablename || '" cascade;' from pg_tables where schemaname='public';
```

In the mean time, it is possible to drop the tables and re-run the `init-aps-portal-keystonejs-batch-job`.
