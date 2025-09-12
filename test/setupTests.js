import "@testing-library/jest-dom";

import { cleanup } from "@testing-library/react";
afterEach(() => {
  cleanup();
});

global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
