## Form Controls

This library provides a range of form controls that can be used to create customized forms within the Bahmni platform.

### Requirements

- React 19.0.0 or higher
- React DOM 19.0.0 or higher

### File naming conventions

1. All components should be in Pascal Case (camel case starting with uppercase letter)
2. Other files including styles should be in Camel Case starting with lowercase letter
3. Test files should have the same name as the file followed by .spec.js

### Setup Steps

1. Install nvm
2. Install node
3. Install yarn - https://yarnpkg.com/en/docs/install

### Build

1. Install dependencies - `yarn`
2. Build - `yarn build`
3. Test - `yarn test`

### SNOMED Integration Support

form-controls also integrates with SNOMED for terminology lookup as part of form configuration and generation. More details can be found in [this](https://bahmni.atlassian.net/wiki/spaces/BAH/pages/3132686337/SNOMED+FHIR+Terminology+Server+Integration+with+Bahmni) Wiki link

## Changelog

### Version 1.1.0 (React 18 Upgrade)

This release upgrades the library to React 18.3.1, bringing performance improvements and modern React APIs while maintaining backward compatibility.

**Breaking Changes:**

- **React 18 Upgrade**: Upgraded from React 17.0.2 to React 18.3.1
  - Updated peer dependencies: `react` and `react-dom` to `^18.3.1`
  - Container component API remains unchanged - no code changes needed for consumers

- **ReactDOM API**: Migrated to React 18's createRoot API
  - Updated `formRenderer.js` with proper root management and cleanup
  - See [Migration Guide](./REACT_18_MIGRATION.md) for API details

- **Component Updates**: Removed deprecated `UNSAFE_` lifecycle methods from 11 components
  - See [Migration Guide](./REACT_18_MIGRATION.md) for complete list of updated components

**New Features:**

- React 18 example application in `examples/react18-consumer-app/`
- Comprehensive troubleshooting and quick-fix documentation

**Performance Improvements:**

- Automatic batching reduces unnecessary re-renders
- Better root management and memory cleanup
- Foundation for future concurrent rendering features

**Migration:**

For detailed migration steps, see [REACT_18_MIGRATION.md](./REACT_18_MIGRATION.md)

Quick steps:
1. Update React dependencies to 18.3.1
2. Update entry point to use `createRoot` (if using formRenderer directly)
3. Update custom components (if extended any form-controls components)
4. Run tests

**Resources:**
- [Migration Guide](./REACT_18_MIGRATION.md) - Detailed migration steps and API changes
- [Example App](./examples/react18-consumer-app/) - Working React 18 integration example
---

### Version 1.0.0 (Major Release)

This major release includes significant infrastructure upgrades and modernization of the codebase to ensure better performance, maintainability, and long-term support.

**Breaking Changes:**

- **React Upgrade**: Upgraded React to version 17.0.2 and associated dependencies

  - Updated react-dom to 17.0.2
  - Migrated from legacy React patterns to modern React 17 features
  - Removed deprecated React addon dependencies from webpack configuration

- **Testing Framework Migration**: Complete migration from Enzyme to Jest + React Testing Library (RTL)

  - Replaced all Enzyme-based tests with RTL tests for better React 17 compatibility
  - Removed obsolete Enzyme test dependencies and setup files
  - Implemented comprehensive RTL tests for all components, helpers, mappers, and designers
  - Added Jest test validation to GitHub Actions workflow
  - Improved test reliability and maintainability with modern testing practices

- **Build Tools Upgrade**: Upgraded Babel, Webpack, and ESLint configurations
  - Upgraded Webpack to version 5.x with modern configuration
  - Upgraded Babel to version 7.x with latest presets and plugins
  - Updated ESLint configuration for better code quality enforcement
  - Configured webpack to output library as ES modules for better tree-shaking support
  - Removed unused Enzyme scripts and dependencies
  - Fixed linting issues across the codebase

**Migration Notes:**

This major version bump reflects significant infrastructure upgrades that may require updates to consuming applications. Please review your dependencies and ensure compatibility with:

- React 17.x
- Webpack 5.x
- Babel 7.x
- Modern ES module output format

**Benefits:**

- Better performance with Webpack 5 optimizations
- Improved developer experience with modern tooling
- More reliable tests with React Testing Library
- Better long-term maintainability and support
- Enhanced tree-shaking capabilities with ES module output
