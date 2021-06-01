const filterBySelf = (context, value) => {
  const id = context['user']['id'];
  return { id: id };
};

module.exports = filterBySelf;
