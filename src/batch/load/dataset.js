const { graphql, lookup_id_from_name, lookup_id_from_attr } = require('./graphql')
const { iterate_through_json_content } = require('../utils')

/*
    name: {
        type: Text,
        isRequired: true,
    },
    sector: {
        type: Text,
        isRequired: false,
    },
    license_title: {
        type: Text,
        isRequired: false,
    },
    view_audience: {
        type: Text,
        isRequired: false,
    },
    private: {
        type: Checkbox,
        isRequired: false,
        default: false
    },
    tags: {
        type: Text,
        isRequired: false,
    },
    contacts: {
        type: Text,
        isRequired: false,
    },
    organization: { type: Relationship, ref: 'Organization' },
    organizationUnit: { type: Relationship, ref: 'OrganizationUnit' },
    securityClass: {
        type: Text,
        isRequired: false,
    },
    notes: {
      type: Text,
      isRequired: false,
    },
    title: {
        type: Text,
        isRequired: false,
    },
    catalogContent: {
      type: Markdown,
      isRequired: false,
    },
    isInCatalog: {
        type: Checkbox,
        isRequired: true,
        default: false
    }

                    "name": "GeoBC Inquiries",
                "private": "Display",
                "role": "pointOfContact",
                "branch": "e51a8106-11c7-4436-a967-7cee18bfb159",
                "organization": "3275286d-4ec9-422a-817f-ab0e232eddfe",
                "email": "GeoBCInfo@gov.bc.ca",
                "delete": "0"

*/
const ADD = `
    mutation Add(
        $name: String, 
        $sector: String, 
        $licenseTitle: String,
        $viewAudience: String,
        $securityClass: String,
        $notes: String, 
        $title: String,
        $contacts: String,
        $catalogContent: String,
        $orgId: ID!,
        $orgUnitId: ID!,
        $tags: String) {

        createDataset(data: { 
            name: $name, 
            sector: $sector, 
            license_title: $licenseTitle,
            view_audience: $viewAudience,
            securityClass: $securityClass,
            notes: $notes, 
            title: $title,
            tags: $tags,
            contacts: $contacts,
            catalogContent: $catalogContent,
            isInCatalog: true,
            organization: { connect: { id: $orgId } }
            organizationUnit: { connect: { id: $orgUnitId } }
        }) {
            id
            name
        }
    }
`;

function makeCatalogContent(record) {
    const contacts = record['contacts']
    var out = ""
    out += "# Contacts\n"
    for (contact of contacts) {
        out += `## ${contact.name}\n\nEmail: **${contact.email}**\n\n`
    }
    return out
}
function import_datasets() {
    iterate_through_json_content ('packages', async (file, json) => {
          console.log(file)
          const data = json['result']
          const name = data.name

          const orgId = await lookup_id_from_attr ('Organizations', 'bcdc_id', data.org)
          const orgUnitId = await lookup_id_from_attr ('OrganizationUnits', 'bcdc_id', data.organization.id)
          console.log("ORG = "+data.org + " == " + orgId)
          console.log("ORG UNIT = "+data.organization.id + " == " + orgUnitId)
          const out = {
              name: data.name,
              sector: data.sector,
              licenseTitle: data.license_title,
              viewAudience: data.view_audience,
              notes: data.notes,
              catalogContent: makeCatalogContent(data),
              contacts: "",
              title: data.title,
              securityClass: data.security_class,
              orgId: orgId,
              orgUnitId: orgUnitId,
              tags: JSON.stringify(data.tags),
          }

          const _id = await lookup_id_from_name ('Datasets', name)
          if (_id != null) {
              console.log("SKIPPING ALREADY EXISTS " + file);
          } else {
            const done = (data) => {
                console.log("[" + name + "] - DONE ");
            }
            await graphql(ADD, out).then(done).catch(err => {
                console.log("[" + name + "] - ERR  " + err)
            })
          }
        })
}

module.exports = {
    import_datasets: import_datasets
}