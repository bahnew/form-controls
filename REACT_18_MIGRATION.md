# React 18 Migration Guide

## Overview

Version 1.1.0 upgrades `bahmni-form-controls` to React 18.3.1. This guide covers the essential steps to migrate your application.

## What Changed

### Dependencies
- `react`: `17.0.2` → `^18.3.1`
- `react-dom`: `17.0.2` → `^18.3.1`
- `react-test-renderer`: → `^18.3.1`
- `@testing-library/react`: → `^15.0.6`

### ReactDOM API Modernization

**formRenderer.js Changes:**
- Migrated from `ReactDOM.render()` to React 18's `createRoot()` API
- Implemented root instance caching using a Map for proper cleanup and re-rendering
- Updated `unMountForm()` to use new `root.unmount()` API instead of `ReactDOM.unmountComponentAtNode()`
- Added proper root management to prevent memory leaks

**Benefits:**
- Automatic batching for better performance
- Concurrent rendering support
- Improved memory management
- Better cleanup on unmount

### Component Lifecycle Updates

Removed all deprecated `UNSAFE_` lifecycle methods from 11 components:

**Replaced `UNSAFE_componentWillMount` → `componentDidMount` in:**
- `src/components/FreeTextAutoComplete.jsx`
- `src/components/Image.jsx`
- `src/components/NumericBox.jsx`
- `src/components/ObsGroupControl.jsx`
- `src/components/RadioButton.jsx`
- `src/components/designer/Grid.jsx`
- `src/components/designer/Row.jsx`

**Replaced `UNSAFE_componentWillReceiveProps` → `componentDidUpdate` in:**
- `src/components/AutoComplete.jsx`
- `src/components/Container.jsx`
- `src/components/DateTime.jsx`
- `src/components/Section.jsx`

**Why This Matters:**
- Eliminates console warnings in React 18
- Prevents potential issues with concurrent rendering
- Aligns with React's modern best practices
- Ensures components work correctly with React 18's features

### Testing Infrastructure

**Updated Test Suite:**
- All component tests updated for React 18 rendering behavior
- Added comprehensive test coverage for `AutoComplete.jsx` (346 new lines)
- Fixed test assertions for React 18's asynchronous rendering
- Updated `formRenderer.test.js` for createRoot API
- Modified tests in `Container.test.js` and `DateTime.test.js`

**Container Component API:**
No changes required - the Container component API remains fully backward compatible

## Migration Steps

### 1. Update Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "bahmni-form-controls": "^1.1.0"
  }
}
```

```bash
npm install
# or
yarn install
```

### 2. Update Application Entry Point

**Before (React 17):**
```jsx
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

**After (React 18):**
```jsx
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

### 4. Update Custom Components (If Extended)

If you've extended form-controls components, update lifecycle methods:

**Replace:**
- `UNSAFE_componentWillMount` → `componentDidMount`
- `UNSAFE_componentWillReceiveProps` → `componentDidUpdate`

**Example:**
```jsx
// Before
UNSAFE_componentWillReceiveProps(nextProps) {
  if (this.props.value !== nextProps.value) {
    this.handleChange(nextProps.value);
  }
}

// After
componentDidUpdate(prevProps) {
  if (this.props.value !== prevProps.value) {
    this.handleChange(this.props.value);
  }
}
```

### 5. Update Tests

Use `waitFor` for async operations:

```jsx
import { render, waitFor } from '@testing-library/react';

test('renders form', async () => {
  render(<MyForm />);
  
  await waitFor(() => {
    expect(screen.getByLabelText('Temperature')).toBeInTheDocument();
  });
});
```

## Common Issues

### Double Mounting in Development

React 18's StrictMode intentionally mounts components twice in development to catch bugs. This is expected behavior.

**Solution:** Ensure effects have proper cleanup:
```jsx
useEffect(() => {
  const subscription = subscribeToData();
  return () => subscription.unsubscribe();
}, []);
```

### StrictMode Issues with Forms

If you encounter initialization issues, see `examples/react18-consumer-app/QUICK_FIX.md` for solutions.

## Benefits

- **Automatic Batching**: Reduces re-renders
- **Better Performance**: Improved root management
- **Modern APIs**: Future-ready for concurrent features
- **No Console Warnings**: Clean development experience

## Example Application

Complete working example: `examples/react18-consumer-app/`

```bash
cd examples/react18-consumer-app
yarn install
yarn run dev
```

## Need Help?

- Check `examples/react18-consumer-app/README.md`
- Review `examples/react18-consumer-app/TROUBLESHOOTING.md`
- See [main README](./README.md) for changelog details

## Resources

- [React 18 Release Notes](https://react.dev/blog/2022/03/29/react-v18)
- [Bahmni Form Controls README](./README.md)
