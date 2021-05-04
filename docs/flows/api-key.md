# API Key

**websequencediagrams.com**

```
title Onboarding

actor API Owner
actor Developer

Developer -> API Developer Portal : Login (Redirect)
Developer -> oidc.gov.bc.ca : Login (IDIR, Github, BCeID)
Developer -> API Developer Portal : Create Application
Developer -> API Developer Portal : Find Product API
Developer -> API Developer Portal : Request Access
API Owner -> API Manager : Approve Access
API Manager -> Kong : InsertIfNotExists Consumer
API Manager -> Kong : Add Product API Controls (i.e./ rate limiting)
API Manager -> Kong : Generate API Key
API Manager -> Kong : Generate ACL Record (Group=Product+Env)
Developer -> API Developer Portal : Generate Credentials
API Developer Portal -> Kong : Generate API Key
Developer -> Product API : Call API (with Token)


```
