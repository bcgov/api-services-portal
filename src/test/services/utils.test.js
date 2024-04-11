import { alphanumericNoSpaces } from '../../services/utils';

describe('alphanumericNoSpaces tests', () => {
  it('should remove spaces from the string', () => {
    const input = 'hello world';
    const expectedOutput = 'helloworld';
    expect(alphanumericNoSpaces(input)).toEqual(expectedOutput);
  });

  it('should remove special characters', () => {
    const input = 'hello@world!how%^&*are you?';
    const expectedOutput = 'helloworldhowareyou';
    expect(alphanumericNoSpaces(input)).toEqual(expectedOutput);
  });

  it('should replace colons with hyphens', () => {
    const input = 'this:is:a:test';
    const expectedOutput = 'this-is-a-test';
    expect(alphanumericNoSpaces(input)).toEqual(expectedOutput);
  });

  it('should handle empty string', () => {
    const input = '';
    const expectedOutput = '';
    expect(alphanumericNoSpaces(input)).toEqual(expectedOutput);
  });

  it('should handle string with only special characters', () => {
    const input = '@#$%^&*()';
    const expectedOutput = '';
    expect(alphanumericNoSpaces(input)).toEqual(expectedOutput);
  });

  it('should handle string with only colons', () => {
    const input = ':::';
    const expectedOutput = '---';
    expect(alphanumericNoSpaces(input)).toEqual(expectedOutput);
  });

  it('should handle string with only alphanumeric characters', () => {
    const input = 'abcdef12345';
    const expectedOutput = 'abcdef12345';
    expect(alphanumericNoSpaces(input)).toEqual(expectedOutput);
  });

  it('should handle string with mixed characters', () => {
    const input = 'hello!-world, how:are?you';
    const expectedOutput = 'hello-worldhow-areyou';
    expect(alphanumericNoSpaces(input)).toEqual(expectedOutput);
  });
});
