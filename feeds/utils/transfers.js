const fs = require('fs');
const fetch = require('node-fetch');
const url = require('url');
const PromisePool = require('es6-promise-pool');
const { checkStatus } = require('./checkStatus');
const { Logger } = require('../logger');

const log = Logger('utils.xfer');

function transfers(workingPath, baseUrl, exceptions) {
  fs.mkdirSync(workingPath, { recursive: true });

  return {
    copy: async function (_url, filename, index = 0) {
      log.debug('[copy] %s%s', baseUrl, _url);
      const out = workingPath + '/' + filename + '-' + index + '.json';
      return fetch(baseUrl + _url)
        .then(checkStatus)
        .then((data) => data.json())
        .then((json) => {
          fs.writeFileSync(out, JSON.stringify(json, null, 4), null);
          if (json.next != null) {
            this.copy(json.next, filename, index + 1);
          } else if ('result' in json && json['result'].length > 0) {
            const u = url.parse(baseUrl + _url, true);
            if ('limit' in u.query) {
              const newUrl = `${u.pathname}?limit=${u.query.limit}&offset=${
                Number(u.query.offset) + Number(u.query.limit)
              }`;
              this.copy(newUrl, filename, index + 1);
            }
          }
        })
        .catch((err) => {
          log.error('[copy] %s, %s', filename, err);
          exceptions.push({
            relativeUrl: url,
            filename: filename,
            error: '' + err,
          });
        });
    },

    copyOne: async function (_url, filename, index = 0) {
      log.debug('[copyOne] %s%s', baseUrl, _url);
      const out = workingPath + '/' + filename + '-' + index + '.json';
      return fetch(baseUrl + _url)
        .then(checkStatus)
        .then((data) => data.json())
        .then((json) => {
          fs.writeFileSync(
            out,
            JSON.stringify({ data: [json] }, null, 4),
            null
          );
        })
        .catch((err) => {
          log.error('[copyOne] %s, %s', filename, err);
          exceptions.push({
            relativeUrl: url,
            filename: filename,
            error: '' + err,
          });
        });
    },

    read: function (filename) {
      const infile = workingPath + '/' + filename + '.json';
      return JSON.parse(fs.readFileSync(infile));
    },

    concurrentWork: async function (producer, concurrency = 5) {
      var pool = new PromisePool(await producer, concurrency);

      // Start the pool.
      var poolPromise = pool.start();

      // Wait for the pool to settle.
      return poolPromise.then(
        function () {
          log.info('All promises fulfilled');
        },
        function (error) {
          log.error('Some promise rejected: ' + error.message);
          throw Error('Some promise rejected: ' + error.message);
        }
      );
    },

    iterate_through_json_content_sync:
      function iterate_through_json_content_sync(location, next) {
        const files = fs.readdirSync(workingPath + '/' + location);
        files.forEach((file) => {
          data = JSON.parse(
            fs.readFileSync(workingPath + '/' + location + '/' + file)
          );
          next(file, data);
        });
      },

    get_file_list: function iterate_through_json_content(location) {
      return fs.readdirSync(workingPath + '/' + location);
    },

    iterate_through_json_content: function iterate_through_json_content(
      location,
      next
    ) {
      fs.readdir(workingPath + '/' + location, (err, files) => {
        if (err) {
          throw err;
        }
        files.forEach((file) => {
          data = JSON.parse(
            fs.readFileSync(workingPath + '/' + location + '/' + file)
          );
          next(file, data);
        });
      });
    },

    get_json_content: function get_json_content(file) {
      let index = 0;
      let data = [];
      while (true) {
        filePath = workingPath + '/' + file + '-' + index + '.json';
        log.debug('[get_json_content] ' + filePath);
        if (fs.existsSync(filePath)) {
          fileData = JSON.parse(fs.readFileSync(filePath));
          data = data.concat(fileData['data']);
          index++;
        } else {
          log.debug('[get_json_content] %s records = %d', file, data.length);
          return { next: null, data: data };
        }
      }
    },

    get_list_ids: function get_list_ids(file) {
      let index = 0;
      let data = [];
      while (true) {
        filePath = workingPath + '/' + file + '-' + index + '.json';
        log.debug('[get_list_ids] ' + filePath);
        if (fs.existsSync(filePath)) {
          fileData = JSON.parse(fs.readFileSync(filePath));
          data = data.concat(fileData['result']);
          index++;
        } else {
          log.info('[get_list_ids] records = ' + data.length);
          return { next: null, data: data };
        }
      }
    },

    create_key_map: function create_key_map(list, idKey) {
      const map = {};
      for (item of list) {
        map[item[idKey]] = item;
      }
      return map;
    },

    inject_hash_and_source: function (source, payload) {
      const crypto = require('crypto');
      const body = JSON.stringify(payload);

      payload['extSource'] = source;
      payload['extRecordHash'] = crypto
        .createHash('sha256')
        .update(body)
        .digest('hex');
    },
  };
}

module.exports = {
  transfers: transfers,
};
