# Feeds

## Summary

- BCDC
  - Organization
  - OrganizationUnit
  - Dataset
- Keycloak
  - Clients
  - Groups
- Kong
  - Service
  - Route
  - Plugin
  - Consumer
- Prometheus
  - Metric
- GWA API
  - Activity
- Keystone
  - User
  - Content

## Batch Jobs for syncing on a period cycle

| Feeder                | Source     | Frequency | Lists                                          | Access                              |
|-----------------------|------------|-----------|------------------------------------------------|-------------------------------------|
| feeder-for-bcdc       | BCDC       | 1 hour    | Organization, OrganizationUnit, Dataset        | Public Data from BCDC API           |
| feeder-for-kong       | Kong       | 1 hour    | GatewayService, GatewayRoute, Plugin, Consumer | Inside cluster Admin API            |
| feeder-for-prometheus | Prometheus | 1 hour    | GatewayMetric                                  | Inside cluster Prometheus Query API |
| feeder-for-github     | Github     | 1 hour    | Content                                        | Personal Access Token               |
| feeder-for-keycloak   | Keycloak   | 1 hour    | Gateway, Group, ServiceAccount                 | Admin Username / Password           |
| gwa-api               | gwa-api    | On Demand | Activity (Kong Lists, Keycloak Lists)          | Integrated with gwa-api             |


## Kong

## Configuration

```
export LOG_FEEDS=ON
export DESTINATION_URL=https://aps-portal-feature-sprint13-poc.apps.silver.devops.gov.bc.ca
export WORKING_PATH=`pwd`/_tmp
export KONG_ADMIN_URL=https://adminapi-264e6f-dev.apps.silver.devops.gov.bc.ca
export CKAN_URL=https://catalog.data.gov.bc.ca
export PROM_URL=https://prom-264e6f-dev.apps.silver.devops.gov.bc.ca

npm run start
```

#### GatewayService

```
cd kong/service

curl -v -X PUT http://localhost:3000/feed/GatewayService/0126b693-efe7-4f02-8d26-986dfb42916e -H "Content-Type: application/json" --data-binary @gw-services-0.json

curl -v -X DELETE http://localhost:3000/feed/GatewayService/0126b693-efe7-4f02-8d26-986dfb42916e

```

#### GatewayRoute

```
cd kong/route

curl -v -X PUT http://localhost:3000/feed/GatewayRoute/119904b5-62c6-4be8-9eb7-560fefe2e415 -H "Content-Type: application/json" --data-binary @gw-routes-0.json
```

#### Prep for plugin tests

```
cd kong/service

curl -v -X PUT http://localhost:3000/feed/GatewayService -H "Content-Type: application/json" --data-binary @plugin-test.json
curl -v -X PUT http://localhost:3000/feed/GatewayService -H "Content-Type: application/json" --data-binary @plugin-test-2.json

cd ../route
curl -v -X PUT http://localhost:3000/feed/GatewayRoute -H "Content-Type: application/json" --data-binary @plugin-test.json

```

#### Plugin

```
cd kong/plugin

curl -v -X PUT http://localhost:3000/feed/Plugin -H "Content-Type: application/json" --data-binary @service.json
```

## BCDC

### Organization and Organization Unit

JSON is slightly modified in that the wrapped "results" is removed.

```
cd bcdc/organization

```

#### Org and Org Unit

```
curl -v -X PUT http://localhost:3000/feed/Organization/4f7ae636-4cdf-4273-b274-6608c615dba0 -H "Content-Type: application/json" --data-binary @ministry-of-citizens-services.json

curl -v -X PUT http://localhost:3000/feed/OrganizationUnit/d8e38fa3-e522-4d65-9ae1-b1402dd342c3 -H "Content-Type: application/json" --data-binary @data-innovation-program-dip.json
```

#### Insert and Delete Sample

```
curl -v -X PUT http://localhost:3000/feed/Organization/007ae636-4cdf-4273-b274-6608c615dba0 -H "Content-Type: application/json" --data-binary @sample.json

curl -v -X DELETE http://localhost:3000/feed/Organization/007ae636-4cdf-4273-b274-6608c615dba0


```

#### Dataset

```
cd bcdc/dataset

curl -v -X PUT http://localhost:3000/feed/Dataset/582a6147-4e24-468c-a048-762302139afc -H "Content-Type: applicatary @agriculture-capability-mapping.json

curl -v -X DELETE http://localhost:3000/feed/Dataset/582a6147-4e24-468c-a048-762302139afc

```

#### PENDING - Org Unit Relationship

```
curl -v -X PUT http://localhost:3000/feed/Dataset/582a6147-4e24-468c-a048-762302139afc -H "Content-Type: application/json" --data-binary @agriculture-capability-mapping.json
```


### Prometheus Metrics


```
cd prometheus

curl -v -X PUT http://localhost:3000/feed/GatewayMetric/a-service-for-jh-etk-prod-001 -H "Content-Type: application/json" --data-binary @result.json

curl -v -X DELETE http://localhost:3000/feed/GatewayMetric/a-service-for-jh-etk-prod-001

```

### Keystone User

```
cd keystone

curl -v -X PUT http://localhost:3000/feed/User/acope@idir -H "Content-Type: application/json" --data-binary @user.json
```

### GWA-API Activity

```
curl -v -X PUT http://localhost:3000/feed/Activity/007ae636-4cdf-4273-b274-6608c615dba0 -H "Content-Type: application/json" --data-binary @activity.json


```

# Capabiltities for the Feed Worker

* `ConnectOne` (Activity): Looks up value in a list by a key (ie/ by username in Users) and connects using that ID
* `ConnectOne with diff key` (Dataset): Looks up value in a list by a key (ie/ by username in Users) and connects using that ID
* `ConnectOne with diff dotkey` (GatewayMetric) : 'metric.service'

* If there is a transformation, it seems to update every time - need to only update if it has changed

There are many cases of exclusive collections:

* GatewayService --> GatewayRoute[] : `Accomplished with ConnectOne`
* GatewayService --> Plugin[] : `Accomplished with connectExclusiveList`
* GatewayRoute --> Plugin[] : `Accomplished with connectExclusiveList`
* Consumer --> Plugin[] : `Accomplished with connectExclusiveList`
* Organization -> OrganizationUnit[]

Should support two ways:
* `linkToParent` : Child updates the link on Put (and automatically delinked on Delete)
* `connectExclusiveList` : Parent has the child records included (more performant option)

`Consumer` is a special case because it will not be part of the "exclusive plugins" - will need to add something to the Plugin to specify a Service/Route reference.  Otherwise in the case of Consumer, will not know whether its for a global, service or route scope.
