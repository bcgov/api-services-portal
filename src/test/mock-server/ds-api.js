const express = require('express');
const fetch = require('node-fetch');
const { gql } = require('graphql-request');

const router = express.Router();

router.get('/directory', async (req, res) => {
  const query = gql`
    query GetProducts {
      allDiscoverableProducts {
        id
        name
        environments {
          name
        }
        dataset {
          name
          title
          notes
          sector
          license_title
          view_audience
          security_class
          record_publish_date
          tags
          organization {
            title
          }
          organizationUnit {
            title
          }
        }
        organization {
          title
        }
        organizationUnit {
          title
        }
      }
    }
  `;
  const request = await fetch('http://localhost:4000/gql/api', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      variables: {},
      query,
    }),
  });
  const result = await request.json();
  res.json(result.data.allDiscoverableProducts);
});

router.get('/documentation', async (req, res) => {
  res.json([
    {
      slug: 'platform-api-services-portal-released',
      title: 'API Services Portal Released',
      description: 'API Services Portal Released',
      tags: ['ns.platform'],
    },
    {
      slug: 'platform-api-owner-user-journey',
      title: 'API Owner User Journey',
      description:
        'Setup a new namespace for onboarding services on the API Gateway.',
      tags: ['ns.platform'],
    },
    {
      slug: 'moh-proto-the-pharmanet-api',
      title: 'The PharmaNet API',
      description: 'Getting Started with Electronic Prescribing',
      tags: ['ns.moh-proto'],
    },
  ]);
});

router.get('/documentation/:slug', async (_, res) => {
  res.json({
    slug: 'platform-api-owner-user-journey',
    tags: ['ns.platform'],
    title: 'API Owner User Journey',
    content:
      '# API Owner Flow\n\nThe following steps walk an API Owner through setting up an API on the BC Gov API Gateway in our Test instance.  If you are ready to deploy to our Production instance, use the links [here](#production-links).\n\n## 1. Register a new namespace\n\nA `namespace` represents a collection of Kong Services and Routes that are managed independently.\n\nTo create a new namespace, go to the [API Services Portal](https://gwa-apps-gov-bc-ca.test.api.gov.bc.ca/int).\n\nAfter login (and selection of an existing namespace if you have one already assigned), go to the `New Namespace` tab and click the `Create Namespace` button.\n\nThe namespace must be an alphanumeric string between 5 and 15 characters (RegExp reference: `^[a-z][a-z0-9-]{3,13}[a-z0-9]$`).\n\nLogout by clicking your username at the top right of the page.  When you login again, you should be able to select the new namespace from the `API Programme Services` project selector.\n\n## 2. Generate a Service Account\n\nGo to the `Service Accounts` tab and click the `Create Service Account`.  A new credential will be created - make a note of the `ID` and `Secret`.\n\nThe credential has the following access:\n* `Gateway.Write` : Permission to publish gateway configuration to Kong\n* `Access.Write`  : Permission to update the Access Control List for controlling access to viewing metrics, service configuration and service account management\n* `Catalog.Write` : Permission to update BC Data Catalog datasets for describing APIs available for consumption\n\n## 3. Prepare configuration\n\nThe gateway configuration can be hand-crafted or you can use a command line interface that we developed called `gwa` to convert your Openapi v3 spec to a Kong configuration.\n\n### 3.1. Hand-crafted (recommended if you don\'t have an Openapi spec)\n\n**Simple Example**\n\n``` bash\nexport NS="my_namespace"\nexport NAME="a-service-for-$NS"\necho "\nservices:\n- name: $NAME\n  host: httpbin.org\n  tags: [ ns.$NS ]\n  port: 443\n  protocol: https\n  retries: 0\n  routes:\n  - name: $NAME-route\n    tags: [ ns.$NS ]\n    hosts:\n    - $NAME.api.gov.bc.ca\n    paths:\n    - /\n    strip_path: false\n    https_redirect_status_code: 426\n    path_handling: v0\n" > sample.yaml\n```\n\n> To view common plugin config go to [COMMON-CONFIG.md](/docs/COMMON-CONFIG.md)\n\n> To view some other plugin examples go [here](/docs/samples/service-plugins).\n\n> **Declarative Config** Behind the scenes, DecK is used to sync your configuration with Kong.  For reference: https://docs.konghq.com/deck/overview/\n\n> **Splitting Your Config:** A namespace `tag` with the format `ns.$NS` is mandatory for each service/route/plugin.  But if you have separate pipelines for your environments (i.e./ dev, test and prod), you can split your configuration and update the `tags` with the qualifier.  So for example, you can use a tag `ns.$NS.dev` to sync Kong configuration for `dev` Service and Routes only.\n\n> **Upstream Services on OCP4:** If your service is running on OCP4, you should specify the Kubernetes Service in the `Service.host`.  It must have the format: `<name>.<ocp-namespace>.svc`.  Also make sure your `Service.port` matches your Kubernetes Service Port.  Any Security Policies for egress from the Gateway will be setup automatically on the API Gateway side.\n> The Aporeto Network Security Policies are being removed in favor of the Kubernetes Security Policies (KSP).  You will need to create a KSP on your side looking something like this to allow the Gateway\'s test and prod environments to route traffic to your API:\n\n``` yaml\nkind: NetworkPolicy\napiVersion: networking.k8s.io/v1\nmetadata:\n  name: allow-traffic-from-gateway-to-your-api\nspec:\n  podSelector:\n    matchLabels:\n      name: my-upstream-api\n  ingress:\n    - from:\n        - namespaceSelector:\n            matchLabels:\n              environment: test\n              name: 264e6f\n    - from:\n        - namespaceSelector:\n            matchLabels:\n              environment: prod\n              name: 264e6f\n```\n\n> **Migrating from OCP3 to OCP4?** Please review the [OCP4-Migration](docs/OCP4-MIGRATION.md) instructions to help with transitioning to OCP4 and the new APS Gateway.\n\n> **Require mTLS between the Gateway and your Upstream Service?** To support mTLS on your Upstream Service, you will need to provide client certificate details and if you want to verify the upstream endpoint then the `ca_certificates` and `tls_verify` is required as well.  An example:\n\n``` yaml\nservices:\n- name: my-upstream-service\n  host: my-upstream.site\n  tags: [ _NS_ ]\n  port: 443\n  protocol: https\n  tls_verify: true\n  ca_certificates: [ 0a780ee0-626c-11eb-ae93-0242ac130012 ]\n  client_certificate: 8fc131ef-9752-43a4-ba70-eb10ba442d4e\n  routes: [ ... ]\ncertificates:\n- cert: "<PEM FORMAT>"\n  key: "<PEM FORMAT>"\n  tags: [ _NS_ ]\n  id: 8fc131ef-9752-43a4-ba70-eb10ba442d4e\nca_certificates:\n- cert: "<PEM FORMAT>"\n  tags: [ _NS_ ]\n  id: 0a780ee0-626c-11eb-ae93-0242ac130012\n```\n\n> NOTE: You must generate a UUID (`python -c \'import uuid; print(uuid.uuid4())\'`) for each certificate and ca_certificate you create (set the `id`) and reference it in your `services` details.\n\n> HELPER: Python command to get a PEM file on one line: `python -c \'import sys; import json; print(json.dumps(open(sys.argv[1]).read()))\' my.pem`\n\n### 3.2. gwa Command Line\n\nRun: `gwa new` and follow the prompts.\n\nExample:\n\n``` bash\ngwa new -o sample.yaml \\\n  --route-host myapi.api.gov.bc.ca \\\n  --service-url https://httpbin.org \\\n  https://bcgov.github.io/gwa-api/openapi/simple.yaml\n```\n\n> See below for the `gwa` CLI install instructions.\n\n## 4. Apply gateway configuration\n\nThe Swagger console for the `gwa-api` can be used to publish Kong Gateway configuration, or the `gwa Command Line` can be used.\n\n### 4.1. gwa Command Line (recommended)\n\n**Install (for Linux)**\n\n``` bash\nGWA_CLI_VERSION=v1.1.3; curl -L -O https://github.com/bcgov/gwa-cli/releases/download/${GWA_CLI_VERSION}/gwa_${GWA_CLI_VERSION}_linux_x64.zip\nunzip gwa_${GWA_CLI_VERSION}_linux_x64.zip\n./gwa --version\n```\n\n> **Using MacOS or Windows?** Download here: https://github.com/bcgov/gwa-cli/releases/tag/v1.1.3\n\n**Configure**\n\nCreate a `.env` file and update the CLIENT_ID and CLIENT_SECRET with the new credentials that were generated in step #2:\n\n``` bash\necho "\nGWA_NAMESPACE=$NS\nCLIENT_ID=<YOUR SERVICE ACCOUNT ID>\nCLIENT_SECRET=<YOUR SERVICE ACCOUNT SECRET>\nGWA_ENV=test\n" > .env\n\nOR run:\n\ngwa init -T --namespace=$NS --client-id=<YOUR SERVICE ACCOUNT ID> --client-secret=<YOUR SERVICE ACCOUNT SECRET>\n\n```\n\n> NOTE: The `-T` indicates our Test environment.  For production use `-P`.\n\n**Publish**\n\n``` bash\ngwa pg sample.yaml \n```\n\nIf you want to see the expected changes but not actually apply them, you can run:\n\n``` bash\ngwa pg --dry-run sample.yaml\n```\n\n### 4.2. Swagger Console\n\nGo to <a href="https://gwa-api-gov-bc-ca.test.api.gov.bc.ca/api/doc" target="_blank">gwa-api Swagger Console</a>.\n\nSelect the `PUT` `/namespaces/{namespace}/gateway` API.\n\nThe Service Account uses the OAuth2 Client Credentials Grant Flow.  Click the `lock` link on the right and enter in the Service Account credentials that were generated in step #2.\n\nFor the `Parameter namespace`, enter the namespace that you created in step #1.\n\nSelect `dryRun` to `true`.\n\nSelect a `configFile` file.\n\nSend the request.\n\n### 4.3. Postman\n\nFrom the Postman App, click the `Import` button and go to the `Link` tab.\n\nEnter a URL: https://openapi-to-postman-api-gov-bc-ca.test.api.gov.bc.ca/?url=https://gwa-api-gov-bc-ca.test.api.gov.bc.ca/api/doc/swagger.json\n\nAfter creation, go to `Collections` and right-click on the `Gateway Administration (GWA) API` collection and select `edit`.\n\nGo to the `Authorization` tab, enter in your `Client ID` and `Client Secret` and click `Get New Access Token`.\n\nYou should get a successful dialog to proceed.  Click `Proceed` and `Use Token`.\n\nYou can then verify that the token works by going to the Collection `Return key information about authenticated identity` and click `Send`.\n\n## 5. Verify routes\n\nTo verify that the Gateway can access the upstream services, run the command: `gwa status`.\n\nIn our test environment, the hosts that you defined in the routes get altered; to see the actual hosts, log into the <a href="https://gwa-apps-gov-bc-ca.test.api.gov.bc.ca/int" target="_blank">API Services Portal</a> and view the hosts under `Services`.\n\n``` bash\ncurl https://${NAME}-api-gov-bc-ca.test.api.gov.bc.ca/headers\n\nab -n 20 -c 2 https://${NAME}-api-gov-bc-ca.test.api.gov.bc.ca/headers\n\n```\n\nTo help with troubleshooting, you can use the GWA API to get a health check for each of the upstream services to verify the Gateway is connecting OK.\n\nGo to the <a href="https://gwa-api-gov-bc-ca.test.api.gov.bc.ca/api/doc#/Service%20Status/get_namespaces__namespace__services">GWA API</a>, enter in the new credentials that were generated in step #2, click `Try it out`, enter your namespace and click `Execute`.  The results are returned in a JSON object.\n\n## 6. View metrics\n\nThe following metrics can be viewed in real-time for the Services that you configure on the Gateway:\n\n* Request Rate : Requests / Second (by Service/Route, by HTTP Status)\n* Latency : Standard deviations measured for latency inside Kong and on the Upstream Service (by Service/Route)\n* Bandwidth : Ingress/egress bandwidth (by Service/Route)\n* Total Requests : In 5 minute windows (by Consumer, by User Agent, by Service, by HTTP Status)\n\nAll metrics can be viewed by an arbitrary time window - defaults to `Last 24 Hours`.\n\nGo to <a href="https://grafana-apps-gov-bc-ca.test.api.gov.bc.ca" target="_blank">Grafana</a> to view metrics for your configured services.\n\nYou can also access the metrics from the `API Services Portal`.\n\n## 7. Grant access to others\n\nThe `acl` command provides a way to update the access for the namespace.  It expects an all-inclusive membership list, so if a user is not either part of the `--users` list or the `--managers` list, they will be removed from the namespace.\n\nFor elevated privileges (such as managing Service Accounts), add the usernames to the `--managers` argument.\n\n``` bash\ngwa acl --users jjones@idir --managers acope@idir\n```\n\nThe result will show the ACL changes.  The Add/Delete counts represent the membership changes of registered users.  The Missing count represents the users that will automatically be added to the namespace once they have logged into the `APS Services Portal`.\n\n## 8. Add to your CI/CD Pipeline\n\nUpdate your CI/CD pipelines to run the `gwa-cli` to keep your services updated on the gateway.\n\n### 8.1. Github Actions Example\n\nIn the repository that you maintain your CI/CD Pipeline configuration, use the Service Account details from `Step 2` to set up two `Secrets`:\n\n* GWA_ACCT_ID\n\n* GWA_ACCT_SECRET\n\nAdd a `.gwa` folder (can be called anything) that will be used to hold your gateway configuration.\n\nAn example Github Workflow:\n\n``` yaml\nenv:\n  NS: "<your namespace>"\n  \njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v2\n      with:\n        fetch-depth: 0\n        \n    - uses: actions/setup-node@v1\n      with:\n        node-version: 10\n        TOKEN: ${{ secrets.GITHUB_TOKEN }}\n\n    - name: Get GWA Command Line\n      run: |\n        curl -L -O https://github.com/bcgov/gwa-cli/releases/download/v1.1.3/gwa_v1.1.3_linux_x64.zip\n        unzip gwa_v1.1.3_linux_x64.zip\n        export PATH=`pwd`:$PATH\n\n    - name: Apply Namespace Configuration\n      run: |\n        export PATH=`pwd`:$PATH\n        cd .gwa/$NS\n\n        gwa init -T \\\n          --namespace=$NS \\\n          --client-id=${{ secrets.TEST_GWA_ACCT_ID }} \\\n          --client-secret=${{ secrets.TEST_GWA_ACCT_SECRET }}\n\n        gwa pg\n\n        gwa acl --managers acope@idir\n       \n```\n\n## 9. Share your API for Discovery\n\nPackage your APIs and make them available for discovery through the API Portal and BC Data Catalog.\n\n**Coming soon!**\n\n# Production Links\n\n* <a href="https://gwa2.apps.gov.bc.ca/int" target="_blank">API Services Portal</a>\n* <a href="https://gwa.api.gov.bc.ca/api/doc" target="_blank">gwa-api Swagger Console</a>\n* OpenAPI to Postman Converter: https://openapi-to-postman.api.gov.bc.ca/?u=https://gwa.api.gov.bc.ca/api/doc/swagger.json\n* <a href="https://grafana.apps.gov.bc.ca" target="_blank">APS Metrics - Grafana</a>\n',
    readme: null,
    githubRepository: null,
    publishDate: '2021-05-27T12:00:00.000-08:00',
  });
});

router.get('/directory/:id', async (req, res) => {
  const query = gql`
    query GetProduct($id: ID!) {
      DiscoverableProduct(where: { id: $id }) {
        id
        name
        environments {
          name
          active
          flow
          services {
            name
            host
          }
        }
        dataset {
          name
          title
          notes
          sector
          license_title
          security_class
          view_audience
          tags
          record_publish_date
          isInCatalog
          organization {
            title
          }
          organizationUnit {
            title
          }
        }
        organization {
          title
        }
        organizationUnit {
          title
        }
      }
    }
  `;
  const request = await fetch('http://localhost:4000/gql/api', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      variables: { id: req.params.id },
      query,
    }),
  });
  const result = await request.json();
  res.json(result.data.DiscoverableProduct);
});

router.get('/namespaces/:namespace/datasets', async (req, res) => {
  res.json([]);
});

module.exports = router;
