const { graphql, lookup_id_from_name } = require('./graphql')
const { iterate_through_json_content } = require('../utils')

const ADD_ORG_UNIT = `
    mutation AddOrg($name: String, $title: String, $description: String, $bcdc_id: String, $sector: String, $tags: String) {
        createOrganizationUnit(data: { name: $name, title: $title, description: $description, bcdc_id: $bcdc_id, sector: $sector, tags: $tags }) {
            name
            id
        }
    }
`

function import_org_units() {
    iterate_through_json_content ('orgs', async (file, json) => {
          const data = json['result']
          const out = {
              name: data.name,
              title: data.title,
              description: data.description,
              bcdc_id: data.id,
              sector: data.sector,
              tags: JSON.stringify(data.tags),
          }
          if (data.groups.length == 0) {
            return
          }
          const orgUnitId = await lookup_id_from_name ('OrganizationUnits', data.name)
          if (orgUnitId != null) {
            console.log("ORG UNIT SKIPPING " + file)
          } else {
            const done = (data) => {
                console.log("ORG UNIT [" + file + "] - DONE ");
            }
            await graphql(ADD_ORG_UNIT, out).then(done).catch(err => {
                console.log("ORG UNIT [" + file + "] - ERR  " + err)
            })
          }
    })
}

module.exports = {
    import_org_units: import_org_units
}