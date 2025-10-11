module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/config/**',
      '!src/app.js'
    ],
    coverageDirectory: 'coverage',
    testMatch: [
      '**/tests/**/*.test.js'
    ]
  };