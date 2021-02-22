

const fs = require('fs')
const fetch = require('node-fetch')

function portal (baseUrl) {

    return {
        fireAndForget: async function (url, payload) {

            return fetch(baseUrl + url, {
                method: 'put',
                body:    JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' },
            })
            .then(res => res.json())
        }
    }
}

module.exports = {
    portal: portal
}