const fs = require('fs')
const { copy, read } = require('../utils')

function extract_bcdc_all() {
    fs.mkdirSync('../../_data/orgs', { recursive: true })
    fs.mkdirSync('../../_data/groups', { recursive: true })
    fs.mkdirSync('../../_data/packages', { recursive: true })

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

module.exports = {
    extract_bcdc_all: extract_bcdc_all
}