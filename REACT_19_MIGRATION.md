# React 19 Migration Guide

## Overview

Version 1.2.0 upgrades `bahmni-form-controls` to React 19.0.0 with updated dependencies and supported build configuration.

## What Changed

### Dependencies
- **React**: 18.3.1 → 19.0.0
- **React DOM**: 18.3.1 → 19.0.0
- **react-test-renderer**: Added at 19.0.0
- **@testing-library/react**: 15.0.6 → 16.1.0
- **@testing-library/dom**: → 10.4.0
- **@testing-library/jest-dom**: → 6.6.3
- **react-select**: 1.3.0 → 5.10.2
- **react-textarea-autosize**: 4.0.5 → 8.5.9

### Build Configuration
- Library output changed to **UMD format** (Universal Module Definition)
- React and ReactDOM are externalized (not bundled)
- Prevents React version mismatch errors by using consumer's React instance

### react-select Upgrade (v1 → v5)
- `Select.Async` → `AsyncSelect` (separate import)
- `Select.Creatable` → `CreatableSelect` (separate import)
- Prop changes: `multi` → `isMulti`, `searchable` → `isSearchable`
- **No changes needed** if you only use the Container component

## Migration Steps

### 1. Update Dependencies

```bash
# Update React to 19
npm install react@19 react-dom@19

# Update bahmni-form-controls
npm install bahmni-form-controls@1.2.0
```

Or with yarn:
```bash
yarn add react@19 react-dom@19
yarn add bahmni-form-controls@1.2.0
```

### 2. Update Your Code (If Needed)

#### If You Only Use Container Component
**No code changes needed!** The Container API is unchanged.

```jsx
import { Container } from 'bahmni-form-controls';
import 'bahmni-form-controls/dist/bundle.css';

// Works exactly the same
<Container
  metadata={formMetadata}
  observations={observations}
  patient={patient}
  translations={translations}
  validate={true}
/>
```

#### If You Extended AutoComplete or FreeTextAutoComplete
Update imports if you directly imported react-select components:

```jsx
// Before (v1)
import Select from 'react-select';
<Select.Async />
<Select.Creatable />

// After (v5)
import AsyncSelect from 'react-select/async';
import CreatableSelect from 'react-select/creatable';
<AsyncSelect />
<CreatableSelect />
```

### 3. Test Your Application

```bash
# Run your tests
npm test

# Start your dev server
npm run dev

# Check for console warnings
```

## Breaking Changes

### 1. React 19 Required
- **Before**: React 18.3.1
- **After**: React 19.0.0
- **Impact**: Must upgrade to React 19

### 2. react-textarea-autosize Upgrade
- **Before**: v4.0.5
- **After**: v8.5.9
- **Impact**: Bundled with library - no action needed

### 3. UMD Build Format
- **Before**: ES modules
- **After**: UMD (Universal Module Definition)
- **Benefit**: Prevents React version mismatch errors
- **Impact**: No action needed - automatically uses consumer's React

## Common Issues

### Issue: React version mismatch warnings
**Solution**: The UMD build should prevent this. Ensure you're using bahmni-form-controls 1.2.0

## Example Application

See `examples/react19-consumer-app/` for a complete working example with:
- React 19 setup
- All form controls
- Best practices
- Detailed documentation

```bash
cd examples/react19-consumer-app
npm install
npm run dev
```

## Resources

- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [react-select v5 Documentation](https://react-select.com/)
- [Example App](./examples/react19-consumer-app/)
- [Main README](./README.md)

## Need Help?

1. Check the [example app](./examples/react19-consumer-app/README.md)
2. Review [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
3. Check for console warnings in your browser