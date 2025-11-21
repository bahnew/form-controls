import "@testing-library/jest-dom";

// react-select v5+ no longer uses findDOMNode, so the polyfill has been removed

global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
