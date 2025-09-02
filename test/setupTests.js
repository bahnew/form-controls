import '@testing-library/jest-dom';

global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
};

import { cleanup } from '@testing-library/react';
afterEach(() => {
    cleanup();
});
