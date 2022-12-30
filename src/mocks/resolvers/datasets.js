import times from 'lodash/times';
import casual from 'casual-browserify';

const allDatasets = [];

times(100, () => {
  const name = casual.word;
  allDatasets.push({
    id: casual.uuid,
    name: `My Test Dataset ${name}`,
    title: `My Test Dataset ${name}`,
  });
});

export const handleAllDatasets = (req, res, ctx) => {
  return res(
    ctx.data({
      allDatasets,
    })
  );
};
