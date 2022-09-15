import subDays from 'date-fns/subDays';
import sample from 'lodash/sample';
import times from 'lodash/times';

const actors = ['Aidan Cope', 'Justin Tendeck', 'Niraj Patel', 'Joshua Jones'];
const actions = ['approved access', 'failed', 'edited', 'revoked', 'granted'];
const consumers = ['7AFFF375-E0ECE4972BC'];
const envs = ['conformance', 'dev', 'staging', 'production', 'sandbox', 'test'];
const products = ['PharmaNet Electronic Prescribing', 'eRX Demo API'];

const today = new Date();
let dateOffset = 0;

export const getActivityHandler = (req, res, ctx) => {
  const { first, skip } = req.variables;
  const result = [];
  const count = skip === 75 ? 5 : first;

  times(count, (n) => {
    const actor = sample(actors);
    const action = sample(actions);
    const consumer = sample(consumers);
    const env = sample(envs);
    const product = sample(products);
    const activityAt = subDays(today, dateOffset).toLocaleDateString();

    if (n % 4 === 0) {
      dateOffset = dateOffset + n;
    }

    result.push({
      id: `a${n * count}`,
      message: '{actor} {action} {entity} to {product} {env} from {consumer}',
      params: {
        actor,
        action,
        entity: 'access',
        product,
        env,
        consumer,
      },
      activityAt,
      blob: null,
    });
  });

  return res(
    ctx.delay(3000),
    ctx.data({
      getFilteredNamespaceActivity: result,
    })
  );
};
