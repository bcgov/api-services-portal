# Decision Matrix

The authorization will use a decision matrix to determine whether a user is allowed to perform the particular operation.

The columns are grouped by the following:

* Column 1 is the Rule ID - if it left blank then it will be referenced as the Row #
* Column 2..N are the Conditions that must be met for the Rule to trigger the Action
* Column N..M are the Actions that will be performed (such as DENY or ALLOW)


## Actions

Actions can be: "allow" and "deny", but they can also be GraphQLWhere clauses (i.e./ `{ name_contains: 'k' }`)


## Enhancements

* For Developer role, only show Datasets, Organizations, OrganizationUnits, ServiceRoutes that are linked to an Environment
