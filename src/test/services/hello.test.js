import fetch from 'node-fetch';

describe('Hello', function () {
  describe('saying hello', function () {
    it('it should say hello', async function () {
      const result = await fetch('http://hello').then((res) => res.json());
      expect(result.message).toBe('hello');
    });
  });
});
