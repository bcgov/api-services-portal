const actionFilterNSorSharedTrue = (context, value) => {
  const namespace = context['user']['namespace'];

  return { OR: [{ namespace: namespace }, { isShared: true }] };
};

module.exports = actionFilterNSorSharedTrue;
