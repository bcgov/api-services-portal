const { filterByOwner } = require('./filterByUser');

const filterByAppOwner = (context, value) => {
  return {
    OR: [
      { application: filterByOwner(context, value) },
      { brokeredIdentity: filterByOwner(context, value) },
    ],
  };
};

module.exports = filterByAppOwner;
