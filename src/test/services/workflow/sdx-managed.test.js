import {
  assertNotSdxConsumer,
  isSdxConsumer,
} from '../../../services/workflow/sdx-managed';

it('recognises consumers tagged sdx', function () {
  expect(isSdxConsumer({ tags: JSON.stringify(['sdx', 'acl']) })).toBe(true);
  expect(isSdxConsumer({ tags: JSON.stringify(['ns.abc']) })).toBe(false);
  expect(isSdxConsumer({ tags: null })).toBe(false);
  expect(isSdxConsumer({})).toBe(false);
});

it('refuses changes to SDX consumers', function () {
  expect(() => assertNotSdxConsumer({ tags: JSON.stringify(['sdx']) })).toThrow(
    'SDX consumers are managed through their SDX connections'
  );
  expect(() =>
    assertNotSdxConsumer({ tags: JSON.stringify(['ns.abc']) })
  ).not.toThrow();
});
