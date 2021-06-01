const filterByEnvironmentProductNSOrNS = (context, value) => {
  const namespace = context['user']['namespace'];
  if (process.env.RULE_DEBUG) {
    console.log('Action: Filter By Package NS' + namespace);
  }

  return {
    OR: [
      { namespace: namespace },
      { productEnvironment: { product: { namespace: namespace } } },
    ],
  };
};

module.exports = filterByEnvironmentProductNSOrNS;
