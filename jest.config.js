module.exports = {
  projects: ['<rootDir>/packages/*', '<rootDir>/benchmarks/'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.tsx?'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
