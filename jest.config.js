module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.js'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'test-file-stub'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.jsx',
  ],
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', {
      babelrc: false,
      configFile: false,
      presets: [
        ['@babel/preset-env', { targets: { node: '14' } }],
        '@babel/preset-react'
      ],
      plugins: ['@babel/plugin-proposal-object-rest-spread']
    }],
  },
  testMatch: [
    '<rootDir>/test/**/*.test.{js,jsx}'
  ],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testTimeout: 10000,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
};
