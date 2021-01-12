const fs = require('fs');
const fetch = require('node-fetch')

function checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res;
    } else {
        throw Error(res.statusText);
    }
}

function read (filename) {
    const infile = '../data/' + filename + '.json'
    return JSON.parse(fs.readFileSync(infile))
}
async function copy (url, filename) {
    const out = '../data/' + filename + '.json'
    return fetch (url)
    .then (checkStatus)
    .then (data => data.json())
    .then (json => {
        fs.writeFile(out, JSON.stringify(json, null, 4), null, (e) => {
        })
    })
    .catch (err => {
        console.log("filename " + err)
        //process.exit(1)
    })
}

//copy ('https://catalog.data.gov.bc.ca/api/action/organization_list_related', 'org-keys');
//copy ('https://catalog.data.gov.bc.ca/api/3/action/package_list', 'package-keys')
//copy ('https://catalog.data.gov.bc.ca/api/3/action/group_list', 'group-keys')

function load_all() {
    fs.mkdirSync('../data/orgs', { recursive: true })
    fs.mkdirSync('../data/groups', { recursive: true })
    fs.mkdirSync('../data/packages', { recursive: true })

    data = read('org-keys')
    for (item of data['result']) {
        copy ('https://catalog.data.gov.bc.ca/api/action/organization_show?id=' + item, 'orgs/' + item)
    }

    data = read('group-keys')
    for (item of data['result']) {
        copy ('https://catalog.data.gov.bc.ca/api/action/group_show?id=' + item, 'groups/' + item)
    }

    data = read('package-keys')
    for (item of data['result']) {
        copy ('https://catalog.data.gov.bc.ca/api/action/package_show?id=' + item, 'packages/' + item)
    }
}




function graphql(query, variables = {}) {
    return fetch('http://localhost:7000/admin/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        variables,
        query,
      }),
    }).then(x => x.json());
}

const ADD_ORG = `
    mutation AddOrg($name: String, $title: String, $description: String, $bcdc_id: String, $sector: String, $tags: String) {
        createOrganization(data: { name: $name, title: $title, description: $description, bcdc_id: $bcdc_id, sector: $sector, tags: $tags }) {
            name
            id
        }
    }
`;

const ADD_ORG_UNIT = `
    mutation AddOrg($name: String, $title: String, $description: String, $bcdc_id: String, $sector: String, $tags: String) {
        createOrganizationUnit(data: { name: $name, title: $title, description: $description, bcdc_id: $bcdc_id, sector: $sector, tags: $tags }) {
            name
            id
        }
    }
`;



function import_orgs() {
    fs.readdir('../data/orgs', (err, files) => {
        files.forEach(file => {
          console.log(file);
          
          data = JSON.parse(fs.readFileSync('../data/orgs/' + file))['result']
          out = {
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
          const done = (e) => {
              console.log(e)
              console.log("DNE"+JSON.stringify(e));
          }
          graphql(ADD_ORG, out).then(done).catch(err => {
              console.log("ERR" + err)
          });
          console.log(JSON.stringify(out, null, 3))
        });
    });
}

function import_org_units() {
    fs.readdir('../data/orgs', (err, files) => {
        files.forEach(file => {
          console.log(file);
          
          data = JSON.parse(fs.readFileSync('../data/orgs/' + file))['result']
          out = {
              name: data.name,
              title: data.title,
              description: data.description,
              bcdc_id: data.id,
              sector: data.sector,
              tags: JSON.stringify(data.tags),
          }
          if (data.groups.length == 0) {
            return;
          }

          const done = (e) => {
              console.log(e)
              console.log("DNE"+JSON.stringify(e));
          }
          graphql(ADD_ORG_UNIT, out).then(done).catch(err => {
              console.log("ERR" + err)
          });
          console.log(JSON.stringify(out, null, 3))
        });
    });
}

function find_all_children (name, cb) {
    const childs = []
    fs.readdir('../data/orgs', (err, files) => {
        files.forEach(file => {
          
          data = JSON.parse(fs.readFileSync('../data/orgs/' + file))['result']
          if (data.groups.length > 0) {
            for (grp of data.groups) {
                  if (grp['name'] === name) {
                      childs.push(data.name)
                  }
              }
          }
        });
        cb(childs)
    });
}

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

async function lookup_id_from_name (entity, name) {
    const GET = `
        query Get($name: String) {
            all${entity}(where: {name: $name}) {
                id
            }
        }
    `
    const result = await graphql(GET, {name: name})
    if (result.data['all' + entity].length == 0) {
        return null
    } else {
        return result.data['all' + entity][0].id
    }
}

function update_orgs() {
    fs.readdir('../data/orgs', async (err, files) => {
        files.forEach( file => {
          
          data = JSON.parse(fs.readFileSync('../data/orgs/' + file))['result']
          out = {
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

        //   if (data.name != "ministry-of-citizens-services") {
        //       return;
        //   }
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
                const ee = await graphql(ADD_UNIT_TO_ORG, {id: orgId, data: { orgUnits: { disconnectAll: true, connect: ids.map(id => { return { id: id} }) }}});//.then(ee => {
                console.log("AAA = "+JSON.stringify(ee, null, 3));
            }));
        })(data.name);
        });
    });
}


// import_org_units()
// import_orgs()
update_orgs()
