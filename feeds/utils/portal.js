const fs = require('fs');
const fetch = require('node-fetch');

const checkStatus = require('./checkStatus').checkStatus;

const _logFeeds = ['yes', 'on', 'true', 'YES', 'ON', 'TRUE', true].includes(
  process.env.LOG_FEEDS
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function portal(baseUrl, logFeeds = _logFeeds) {
  return {
    fireAndForget: async (url, payload, attempts = 3) => {
      if (logFeeds) {
        fs.appendFile(
          'feeds.log',
          JSON.stringify({ url: url, payload: payload }) + '\n',
          (err) => {}
        );
      }

      let retry = attempts;
      while (retry <= attempts) {
        retry != attempts &&
          console.log('Retrying [' + (attempts - retry) + '] ' + url);
        try {
          return await fetch(baseUrl + url, {
            method: 'put',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
          })
            .then(checkStatus)
            .then((res) => res.json());
        } catch (err) {
          retry = retry - 1;
          if (retry == 0) {
            throw err;
          }
          await sleep(500);
        }
      }
    },
    fireAndForgetDeletion: async (url, attempts = 3) => {
      let retry = attempts;
      while (retry <= attempts) {
        retry != attempts &&
          console.log('Retrying [' + (attempts - retry) + '] ' + url);
        try {
          return await fetch(baseUrl + url, {
            method: 'delete',
          }).then(checkStatus);
        } catch (err) {
          retry = retry - 1;
          if (retry == 0) {
            throw err;
          }
          await sleep(500);
        }
      }
    },
    get: async (url) => {
      return await fetch(baseUrl + url, {
        method: 'get',
      })
        .then(checkStatus)
        .then((res) => res.json());
    },
  };
}

module.exports = {
  portal: portal,
};
