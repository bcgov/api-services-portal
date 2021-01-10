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
    return fetch('http://localhost:3000/admin/api', {
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
                  if (grp['name'] == name) {
                      childs.push(data.name)
                  }
              }
          }
        });
        cb(childs)
    });
}

const GET_ORG_BY_NAME = `
    query GetOrg($name: String) {
        allOrganizations(where: {name: $name}) {
            id
            name
        }
    }
`


const GET_BY_NAME = `
    query GetOrgUnit($name: String) {
        allOrganizationUnits(where: {name: $name}) {
            id
            name
        }
    }
`
const ADD_UNIT_TO_ORG = `
    mutation update($id: ID!, $data: OrganizationUpdateInput) {
        updateOrganization(id: $id, data: $data) {
            name
            id
        }
    }
`;



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

          ((name) => {
            find_all_children (name, (childs => {
                console.log(file);
                console.log("CHILDREN = "+childs);
                graphql(GET_ORG_BY_NAME, {name: name}).then(getorg => {
                    for (child of childs) {
                        graphql(GET_BY_NAME, {name: child}).then(getby => {
                            console.log(JSON.stringify(getby.data.allOrganizationUnits[0].id))

                            graphql(ADD_UNIT_TO_ORG, {id: getorg.data.allOrganizations[0].id, data: { orgUnits: { disconnectAll: false, connect: [ { id:getby.data.allOrganizationUnits[0].id }] }}}).then(ee => {
                                console.log("AAA = "+JSON.stringify(ee));
                            }).catch(err => {
                                console.log("ERR" + err)
                            })

                        }).catch(err => {
                            console.log("ERR" + err)
                        });
                    }
            })}));
        })(data.name);

        // });
        //   const done = (e) => {
        //       console.log(e)
        //       console.log("DNE"+JSON.stringify(e));
        //   }
        //   graphql(ADD_ORG, out).then(done).catch(err => {
        //       console.log("ERR" + err)
        //   });
        //   console.log(JSON.stringify(out, null, 3))
        });
    });
}


import_orgs()
import_org_units()
update_orgs()