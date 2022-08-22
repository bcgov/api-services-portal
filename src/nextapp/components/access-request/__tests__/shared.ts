export const serviceOptions = [
  {
    id: 1,
    name: 'Service 1',
    extForeignKey: 's1',
  },
  {
    id: 2,
    name: 'Service 2',
    extForeignKey: 's2',
  },
];
export const routeOptions = [
  {
    id: 1,
    name: 'Route 1',
    extForeignKey: 'r1',
  },
  {
    id: 2,
    name: 'Route 2',
    extForeignKey: 'r2',
  },
];

// This seems unnecesary but Jest won't ignore this file...
describe.skip('shared', () => {
  it('should be falsy', () => {
    expect(false).toBeFalsy();
  });
});
