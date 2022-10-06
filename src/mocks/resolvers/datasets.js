import times from 'lodash/times';
import casual from 'casual-browserify';

export const handleAllDatasets = (req, res, ctx) => {
  const allDatasets = [];

  times(100, () => {
    allDatasets.push({
      id: casual.uuid,
      name: casual.name,
      title: casual.name,
    });
  });

  return res(
    ctx.data({
      allDatasets,
    })
  );
};
