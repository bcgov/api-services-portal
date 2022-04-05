# Release 1.1 Notes

**UX Upgrades**

* API Directory Request Access
* My Access
* Applications
* Namespace Authorization Profiles
* My Profile

**New/Enhanced Features**

* Improved validation for Environment activation:
  * Namespace must be assigned to an Organization
  * Product's Dataset must belong to the same organization
* Organization Group access displayed on the Namespace Access page
* Directory API V2 released:
  * Organization access management (including membership, and namespace assignment)
  * Get Namespace Dataset, Product, Content, Issuer details
  * Activity at Organization and Namespace level
  * Get Gateway Services configuration
  * Delete Environment and Namespace with "force" verification
* Directory API V1 end of life Aug 31, 2022
* Cascade deletion of namespace and/or environment:
  * Revoking of all related consumer access
  * Revoking Service Accounts
  * Verify no Gateway Services still exist
  * Log activity for deleted namespace

