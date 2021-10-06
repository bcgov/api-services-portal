export default function KongApiKeyAcl(namespace, appId) {
  return `
  plugins:
  - name: key-auth
    tags: [ ns.${namespace} ]
    protocols: [ http, https ]
    config:
      key_names: ["X-API-KEY"]
      run_on_preflight: true
      hide_credentials: true
      key_in_body: false
  - name: acl
    tags: [ ns.${namespace} ]
    config:
      hide_groups_header: true
      allow: [ ${appId} ]
`;
}
