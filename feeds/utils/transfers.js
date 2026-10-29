const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const url = require('url');
const PromisePool = require('es6-promise-pool');
const { checkStatus } = require('./checkStatus');
const { Logger } = require('../logger');
const stringify = require('json-stable-stringify');
const { ResultsService } = require('./results');

const log = Logger('utils.xfer');

function transfers(workingPath, baseUrl, exceptions) {
  fs.mkdirSync(workingPath, { recursive: true });

  const resultCollector = new ResultsService();
  resultCollector.init();

  // write each page to <stagingDir>/<index>.json, following Kong's `next` link
  // or the CKAN `offset`, and resolve with the number of pages written
  function copyPages(_url, stagingDir, index) {
    log.debug('[copy] %s%s', baseUrl, _url);
    return fetch(baseUrl + _url)
      .then(checkStatus)
      .then((data) => data.json())
      .then((json) => {
        fs.writeFileSync(
          stagingDir + '/' + index + '.json',
          JSON.stringify(json, null, 4),
          null
        );
        if (json.next != null) {
          return copyPages(json.next, stagingDir, index + 1);
        } else if ('result' in json && json['result'].length > 0) {
          const u = url.parse(baseUrl + _url, true);
          if ('limit' in u.query) {
            const newUrl = `${u.pathname}?limit=${u.query.limit}&offset=${
              Number(u.query.offset) + Number(u.query.limit)
            }`;
            return copyPages(newUrl, stagingDir, index + 1);
          }
        }
        return index + 1;
      });
  }

  return {
    resultCollector: () => resultCollector,

    // Fetch every page into a staging folder, and only replace the
    // <filename>-N.json pages once the whole chain has been fetched, so a
    // failed copy leaves the previous pages in place.
    copy: async function (_url, filename) {
      let stagingDir = null;
      try {
        stagingDir = fs.mkdtempSync(workingPath + '/.staging-');
        const pageCount = await copyPages(_url, stagingDir, 0);
        for (let index = 0; index < pageCount; index++) {
          const out = workingPath + '/' + filename + '-' + index + '.json';
          fs.mkdirSync(path.dirname(out), { recursive: true });
          fs.renameSync(stagingDir + '/' + index + '.json', out);
        }
        // drop higher-numbered pages left over from a longer earlier run
        this.clear_pages(filename, pageCount);
      } catch (err) {
        log.error('[copy] %s, %s', filename, err);
        exceptions.push({
          relativeUrl: url,
          filename: filename,
          error: '' + err,
        });
      } finally {
        if (stagingDir != null) {
          fs.rmSync(stagingDir, { recursive: true, force: true });
        }
      }
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

    copySearch: async function (_url, filename, index = 0) {
      log.debug('[copySearch] %s%s', baseUrl, _url);
      return fetch(baseUrl + _url)
        .then(checkStatus)
        .then((data) => data.json())
        .then((json) => {
          for (const item of json.result.results) {
            const out =
              workingPath + '/' + filename + item.name + '-' + index + '.json';
            fs.writeFileSync(
              out,
              JSON.stringify({ result: item }, null, 4),
              null
            );
          }
        })
        .catch((err) => {
          log.error('[copySearch] %s, %s', filename, err);
          exceptions.push({
            relativeUrl: url,
            filename: filename,
            error: '' + err,
          });
        });
    },

    // remove <filename>-<fromIndex>.json and later pages, up to the first
    // missing page, the same pages get_json_content() and get_list_ids() read
    clear_pages: function (filename, fromIndex = 0) {
      let index = fromIndex;
      while (true) {
        const page = workingPath + '/' + filename + '-' + index + '.json';
        if (!fs.existsSync(page)) {
          if (index > fromIndex) {
            log.debug(
              '[clear_pages] %s removed %d pages',
              filename,
              index - fromIndex
            );
          }
          return;
        }
        fs.unlinkSync(page);
        index++;
      }
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
          log.debug('All promises fulfilled');
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
      const body = stringify(payload);

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
