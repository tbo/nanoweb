/**
 * @see https://jestjs.io/docs/configuration
 * @type {import('@jest/types').Config}
 */
export default {
  testMatch: ['**/tests/**/*.tsx'],
  testEnvironment: 'node',
  verbose: true,
  preset: 'ts-jest',
};
