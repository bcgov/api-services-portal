const filterByServiceNS = (context, value) => {
  const namespace = context['user']['namespace'];
  if (process.env.RULE_DEBUG) {
    console.log('Action: Filter By Service NS' + namespace);
  }

  return { service: { namespace: namespace } };
};

module.exports = filterByServiceNS;
