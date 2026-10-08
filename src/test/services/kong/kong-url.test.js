import { kongUrlForConsumer } from '../../../services/kong/kong-url';

const env = { ...process.env };

beforeEach(() => {
  process.env.KONG_URL = 'http://kong:8001';
  process.env.SDX_KONG_URL = 'http://kong-sdx:8001';
});

afterAll(() => {
  process.env = env;
});

it('uses the SDX Kong for consumers tagged sdx', function () {
  expect(kongUrlForConsumer({ tags: JSON.stringify(['sdx', 'acl']) })).toBe(
    'http://kong-sdx:8001'
  );
});

it('uses the APS Kong for other consumers', function () {
  expect(kongUrlForConsumer({ tags: JSON.stringify(['ns.abc']) })).toBe(
    'http://kong:8001'
  );
  expect(kongUrlForConsumer({})).toBe('http://kong:8001');
});

it('falls back to the APS Kong when SDX_KONG_URL is unset', function () {
  delete process.env.SDX_KONG_URL;
  expect(kongUrlForConsumer({ tags: JSON.stringify(['sdx']) })).toBe(
    'http://kong:8001'
  );
});
