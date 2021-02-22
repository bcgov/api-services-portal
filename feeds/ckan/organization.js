const { graphql, lookup_id_from_name } = require('./graphql')
const { iterate_through_json_content } = require('../utils')

const ADD_ORG = `
    mutation AddOrg($name: String, $title: String, $description: String, $bcdc_id: String, $sector: String, $tags: String) {
        createOrganization(data: { name: $name, title: $title, description: $description, bcdc_id: $bcdc_id, sector: $sector, tags: $tags }) {
            name
            id
        }
    }
`;

const ADD_UNIT_TO_ORG = `
    mutation update($id: ID!, $data: OrganizationUpdateInput) {
        updateOrganization(id: $id, data: $data) {
            name
            orgUnits {
                name
            }
        }
    }
`;


function import_orgs() {
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
          if (data.groups.length > 0) {
              return;
          }
          const orgId = await lookup_id_from_name ('Organizations', data.name)
          if (orgId != null) {
              console.log("SKIPPING ALREADY EXISTS " + file);
          } else {
            const done = (data) => {
                console.log("[" + file + "] - DONE ");
            }
            await graphql(ADD_ORG, out).then(done).catch(err => {
                console.log("[" + file + "] - ERR  " + err)
            })
          }
        })
}


function find_all_children (name, cb) {
    const childs = []
    iterate_through_json_content ('orgs', async (file, json) => {
        data = json['result']
        if (data.groups.length > 0) {
            for (grp of data.groups) {
                    if (grp['name'] === name) {
                        childs.push(data.name)
                    }
            }
        }
    })
    cb(childs)
}

function update_orgs() {
    iterate_through_json_content ('orgs', async (file, json) => {
          data = json['result']
          if (data.groups.length > 0) {
              return
          }

          ((name) => {
            find_all_children (name, (async (childs) => {
                console.log(file);
                console.log("CHILDREN = "+childs);
                console.log("GET " + name);
                const orgId = await lookup_id_from_name ('Organizations', name)
                const ids = []
                for (child of childs) {
                    const orgUnitId = await lookup_id_from_name ('OrganizationUnits', child)
                    if (orgUnitId == null) {
                        continue
                    }
                    ids.push(orgUnitId)
                }
                const ee = await graphql(ADD_UNIT_TO_ORG, {id: orgId, data: { orgUnits: { disconnectAll: true, connect: ids.map(id => { return { id: id} }) }}})
                console.log("AAA = "+JSON.stringify(ee, null, 3))
            }))
          })(data.name)
    })
}

module.exports = {
    import_orgs: import_orgs,
    update_orgs: update_orgs
}