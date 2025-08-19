import '@testing-library/jest-dom';

// Mock window.componentStore for tests
global.window = global.window || {};
global.window.componentStore = {
  componentList: {},
  designerComponentList: {},
  registerComponent: jest.fn(),
  getRegisteredComponent: jest.fn(),
  deRegisterComponent: jest.fn(),
  getAllRegisteredComponents: jest.fn(),
  registerDesignerComponent: jest.fn(),
  getDesignerComponent: jest.fn(),
  getAllDesignerComponents: jest.fn(),
  deRegisterDesignerComponent: jest.fn(),
};

// Mock lodash functions if needed
jest.mock('lodash/map', () => (collection, iteratee) => {
  if (Array.isArray(collection)) {
    return collection.map(iteratee);
  }
  return [];
});

jest.mock('lodash/isEmpty', () => (value) => {
  return value == null || (typeof value === 'object' && Object.keys(value).length === 0) || 
         (Array.isArray(value) && value.length === 0) || value === '';
});

jest.mock('lodash/clone', () => (value) => {
  if (Array.isArray(value)) {
    return [...value];
  }
  if (typeof value === 'object' && value !== null) {
    return { ...value };
  }
  return value;
});

jest.mock('lodash/find', () => (collection, predicate) => {
  if (Array.isArray(collection)) {
    return collection.find(predicate);
  }
  return undefined;
});

jest.mock('lodash/filter', () => (collection, predicate) => {
  if (Array.isArray(collection)) {
    return collection.filter(predicate);
  }
  return [];
});

jest.mock('lodash/isEqual', () => (value, other) => {
  return JSON.stringify(value) === JSON.stringify(other);
});