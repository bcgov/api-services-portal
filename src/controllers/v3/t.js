function getMatchHostList(serviceName) {
  return [
    `${serviceName}.api.gov.bc.ca`,
    `${serviceName}-api-gov-bc-ca.dev.api.gov.bc.ca`,
    `${serviceName}-api-gov-bc-ca.test.api.gov.bc.ca`,
  ];
}

function isTaken(records, matchHosts) {
  return (
    records.filter(
      (r) => r.hosts.filter((h) => matchHosts.indexOf(h) >= 0).length > 0
    ).length > 0
  );
}

const records = [
  {
    hosts: ['abc-api-gov-bc-ca.test.api.gov.bc.ca'],
  },
];

const serviceName = 'abc';
let counter = 0;
let matchHostList;
do {
  matchHostList = getMatchHostList(
    counter == 0 ? serviceName : `${serviceName}-${counter}`
  );
  counter++;
} while (isTaken(records, matchHostList));

console.log(matchHostList);
