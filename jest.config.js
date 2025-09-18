module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.js'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^helpers/(.*)$': '<rootDir>/src/helpers/$1',
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
        ['@babel/preset-env', {
          targets: { node: '14' },
          useBuiltIns: 'usage',
          corejs: 3
        }],
        ['@babel/preset-react', {
          runtime: 'automatic',
          development: true
        }]
      ],
      plugins: []
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
