export default function KongAclOnly(namespace: string, appId: string): string {
  return `
  plugins:
  - name: acl
    tags: [ ns.${namespace} ]
    config:
      hide_groups_header: true
      allow: [ "${appId}" ]
`;
}
