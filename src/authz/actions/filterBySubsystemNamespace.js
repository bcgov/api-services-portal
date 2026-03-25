const filterBySubsystemNamespace = (context, value) => {
  const namespace = context['user']['namespace'];
  if (process.env.RULE_DEBUG) {
    console.log('Action: Filter By Package NS' + namespace);
  }

  return {
    subsystem: {
      namespace: namespace,
    },
  };
};

module.exports = filterBySubsystemNamespace;
