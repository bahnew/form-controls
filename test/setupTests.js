import "@testing-library/jest-dom";

// Note: findDOMNode polyfill removed - no longer needed with react-select v5+

global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
