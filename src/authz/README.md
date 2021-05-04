# Decision Matrix

The authorization will use a decision matrix to determine whether a user is allowed to perform the particular operation.

The columns are grouped by the following:

* Column 1 is the Rule ID - if it left blank then it will be referenced as the Row #
* Column 2..N are the Conditions that must be met for the Rule to trigger the Action
* Column N..M are the Actions that will be performed (such as DENY or ALLOW)


## Actions

Actions can be: "allow" and "deny", but they can also be GraphQLWhere clauses (i.e./ `{ name_contains: 'k' }`)


## Enhancements

* For Developer role, only show Datasets, Organizations, OrganizationUnits, ServiceRoutes that are linked to a Package or Environment

* This one is for Applications that an API Owner can see.  They should be able to see their own applications, and the Applications that have made a Request for Access to a PackageEnvironment that they are associated with by namespace.

* Secure Content - allow an API Owner to associate content to a Package, and have it available once they have been approved for using that Package


## Principals

* Rules are evaluated sequentially and once a `result` of `allow` or `deny` is received, then evaluation stops

* A user can belong to multiple roles

* Rules for fields are only evaluated if the `matchFieldKey` is specified


## Permission Rules

| Lists                                                     | Approach             |
|-----------------------------------------------------------|----------------------|
| AccessRequest                                             |                      |
| Activity, Blob                                            | Allow create if namespaced, readonly namespaced, no update, no delete |
| Alert, Metric                                             | readonly             |
| Application, CredentialIssuer                             | Individual ownership |
| Content                                                   |                      |
| Dataset, Organization, Organization Unit                  | readonly             |
| Environment                                               |                      |
| GatewayConsumer                                           | no access            |
| GatewayGroup, GatewayPlugin, GatewayRoute, GatewayService | readonly namespaced  |
| Legal                                                     | readonly             |
| Product                                                   |                      |
| ServiceAccess                                             |                      |
| TemporaryIdentity                                         | readonly by self, no edit |
| User                                                      |                      |

ServiceAccess:
* Read: User must be an api-owner for the related namespace OR owner of related Application

GatewayConsumer:
* Read: no

AccessRequest is the entry point for Developers to see information about ServiceAccess and Consumer information.
* Have a MyAccessRequests
* Allow Create Access Request
* No access to ServiceAccess and GatewayConsumer

Products:
* For a Developer, Products and Environments have no access
* Have a ProductDirectory call to get details about the Product and Environment

