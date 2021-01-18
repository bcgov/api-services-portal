const fs = require('fs')
const { copyv2, read } = require('../utils')

function extract_kong_all() {
    const baseUrl = 'http://localhost:7001'

    fs.mkdirSync('../../_data/kong', { recursive: true })

    copyv2 (baseUrl, `/services`, 'kong/gw-services')
    copyv2 (baseUrl, `/routes`, 'kong/gw-routes')
    copyv2 (baseUrl, `/consumers`, 'kong/gw-consumers')
    copyv2 (baseUrl, `/plugins`, 'kong/gw-plugins')
}


module.exports = {
    extract_kong_all: extract_kong_all
}