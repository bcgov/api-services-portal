

const fs = require('fs')
const fetch = require('node-fetch')

const _logFeeds = ['yes', 'on', 'true', 'YES', 'ON', 'TRUE', true].includes(process.env.LOG_FEEDS)

function portal (baseUrl, logFeeds = _logFeeds) {

    return {
        fireAndForget: (url, payload) => {
            if (logFeeds) {
                fs.appendFile('feeds.log', JSON.stringify({url: url, payload: payload}) + "\n", (err) => {});
            }
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