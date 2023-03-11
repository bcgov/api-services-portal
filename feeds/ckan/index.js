const fs = require('fs');
const { transfers } = require('../utils/transfers');
const { portal } = require('../utils/portal');
const { strict: assert } = require('assert');
const { v4: uuidv4 } = require('uuid');

async function scopedSync(
  { url, workingPath, destinationUrl },
  scope,
  scopeKey
) {
  assert.strictEqual(scope, 'dataset', 'Only dataset is supported');

  const scopedDir = `${workingPath}/${uuidv4()}`;

  fs.mkdirSync(scopedDir + '/packages', { recursive: true });

  const exceptions = [];
  const xfer = transfers(scopedDir, url, exceptions);

  const packageKeys = {
    result: [scopeKey],
  };

  fs.writeFileSync(
    `${scopedDir}/package-keys-0.json`,
    JSON.stringify(packageKeys, null, 3),
    (err) => {
      assert.strictEqual(err, null, 'Error ' + err);
    }
  );

  await xfer.concurrentWork(
    getCkanDataProducer(
      xfer,
      'package-keys',
      '/api/action/package_show',
      'packages/'
    ),
    10
  );
  console.log('Exceptions? ' + (exceptions.length == 0 ? 'NO' : 'YES!'));
  console.log(JSON.stringify(exceptions, null, 4));

  // Now, send to portal
  await xfer.concurrentWork(
    loadDatasetProducer(xfer, scopedDir, destinationUrl)
  );

  fs.rmSync(scopedDir, { recursive: true });
}

async function syncOrgs({ url, workingPath, destinationUrl }) {
  fs.mkdirSync(workingPath + '/orgs', { recursive: true });

  const exceptions = [];
  const xfer = transfers(workingPath, url, exceptions);

  await xfer.copy(
    '/api/3/action/organization_list?limit=1000&offset=0',
    'organization-keys'
  );
  await xfer.concurrentWork(
    getCkanDataProducer(
      xfer,
      'organization-keys',
      '/api/3/action/organization_show',
      'orgs/'
    )
  );
  console.log('Exceptions? ' + (exceptions.length == 0 ? 'NO' : 'YES!'));
  console.log(JSON.stringify(exceptions, null, 4));

  // Now, send to portal
  await xfer.concurrentWork(loadOrgProducer(xfer, workingPath, destinationUrl));
}

async function sync({ url, workingPath, destinationUrl }) {
  fs.mkdirSync(workingPath + '/groups', { recursive: true });
  fs.mkdirSync(workingPath + '/packages', { recursive: true });

  const exceptions = [];
  const xfer = transfers(workingPath, url, exceptions);

  await xfer.copy('/api/action/group_list?limit=100&offset=0', 'group-keys');
  await xfer.copy(
    '/api/action/package_list?limit=100&offset=0',
    'package-keys'
  );

  await xfer.concurrentWork(
    getCkanDataProducer(xfer, 'group-keys', '/api/action/group_show', 'groups/')
  );
  await xfer.concurrentWork(
    getCkanDataProducer(
      xfer,
      'package-keys',
      '/api/action/package_show',
      'packages/'
    ),
    10
  );
  console.log('Exceptions? ' + (exceptions.length == 0 ? 'NO' : 'YES!'));
  console.log(JSON.stringify(exceptions, null, 4));

  // Now, send to portal
  await xfer.concurrentWork(
    loadDatasetProducer(xfer, workingPath, destinationUrl)
  );
}

function loadOrgProducer(xfer, workingPath, destinationUrl) {
  const destination = portal(destinationUrl);
  const fileList = xfer.get_file_list('orgs');
  let index = 0;
  return () => {
    if (index == fileList.length) {
      console.log('Finished producing ' + index + ' records.');
      return null;
    }
    const file = fileList[index];

    const data = JSON.parse(
      fs.readFileSync(workingPath + '/' + 'orgs' + '/' + file)
    )['result'];
    index++;

    if (isOrgUnit(data)) {
      return new Promise((resolve, reject) => resolve());
    }

    xfer.inject_hash_and_source('ckan', data);

    console.log(new Date() + ' : ' + data['name']);
    data['orgUnits'] = findAllChildren(xfer, data['name']);
    data['orgUnits'].map((orgUnit) =>
      xfer.inject_hash_and_source('ckan', orgUnit)
    );

    return destination
      .fireAndForget('/feed/Organization', data)
      .then((result) => console.log(`[${data['name']}] OK`, result))
      .catch((err) => console.log(`[${data['name']}] ERR ${err}`));
  };
}

function loadDatasetProducer(xfer, workingPath, destinationUrl) {
  const destination = portal(destinationUrl);
  const fileList = xfer.get_file_list('packages');
  let index = 0;
  return () => {
    if (index == fileList.length) {
      console.log('Finished producing ' + index + ' records.');
      return null;
    }
    const file = fileList[index];
    xfer.inject_hash_and_source('ckan', file);

    const data = JSON.parse(
      fs.readFileSync(workingPath + '/' + 'packages' + '/' + file)
    )['result'];
    data['tags'] = data['tags'].map((tag) => tag.name);
    index++;

    console.log(new Date() + ' : ' + data['name']);
    return destination
      .fireAndForget('/feed/Dataset', data)
      .then((result) => console.log(`[${data['name']}] OK`, result))
      .catch((err) => console.log(`[${data['name']}] ERR ${err}`));
  };
}

function getCkanDataProducer(xfer, keyFile, apiCall, outFolder) {
  const data = xfer.get_list_ids(keyFile);
  let index = 0;
  return () => {
    if (index == data.data.length) {
      console.log('Finished producing ' + index + ' records.');
      return null;
    }
    const item = data.data[index];
    index++;
    return xfer.copy(apiCall + '?id=' + item, outFolder + item);
  };
}

function findAllChildren(xfer, parentName) {
  const childs = [];
  xfer.iterate_through_json_content_sync('orgs', (file, json) => {
    data = json['result'];
    if (isThisAChildOfParent(data, parentName)) {
      childs.push(data);
    }
  });
  return childs;
}

function isThisAChildOfParent(data, parentName) {
  if (data.groups.length > 0) {
    for (grp of data.groups) {
      if (grp['name'] === parentName) {
        return true;
      }
    }
  }
  return false;
}

function isOrgUnit(data) {
  return data.groups.length > 0;
}

module.exports = {
  sync,
  syncOrgs,
  scopedSync,
};
