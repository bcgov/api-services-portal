export default function KongAclOnly(namespace, appId) {
  return `
  plugins:
  - name: acl
    tags: [ ns.${namespace} ]
    config:
      hide_groups_header: true
      allow: [ ${appId} ]
`;
}
