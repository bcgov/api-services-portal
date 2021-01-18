const fs = require('fs')
const { copy, read } = require('../utils')

function extract_kong_all() {
    const baseUrl = 'https://adminapi-264e6f-dev.apps.silver.devops.gov.bc.ca'

    fs.mkdirSync('../../_data/kong', { recursive: true })

    copy (`${baseUrl}/services`, 'kong/gw-services')
    copy (`${baseUrl}/routes`, 'kong/gw-routes')
    copy (`${baseUrl}/consumers`, 'kong/gw-consumers')
    copy (`${baseUrl}/plugins`, 'kong/gw-plugins')
}


module.exports = {
    extract_kong_all: extract_kong_all
}