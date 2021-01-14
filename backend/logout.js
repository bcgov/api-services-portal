
//curl -v -H "X-Auth-Request-Redirect: https://google.com" http://localhost:4180//oauth2/sign_out?rd=https://authz-apps-gov-bc-ca.dev.apsgw.xyz/auth/realms/aps-v2/protocol/openid-connect/certs
const querystring = require('querystring')

const proxy = "http://localhost:4180"
const authLogoutUrl = encodeURI("https://authz-apps-gov-bc-ca.dev.apsgw.xyz/auth/realms/aps-v2/protocol/openid-connect/logout?redirect_uri="+proxy)
console.log(querystring.escape(authLogoutUrl))