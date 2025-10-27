# Bahmni Form Controls - React 19 Consumer Application

This is a complete, working demo application that shows how to integrate and use the `bahmni-form-controls` library in a **React 19** application using the `Container` component.

## Features

✅ **React 19** with latest features
✅ **Vite** for fast development and building
✅ **Container Component** integration from bahmni-form-controls
✅ **Complete Vitals Form** with multiple control types
✅ **Form Validation** with error handling
✅ **Obs Groups** for related observations
✅ **Pre-populated Data** with sample observations
✅ **Real-time Updates** with onValueUpdated callback
✅ **Form State Management** with save/reset/clear actions
✅ **Beautiful UI** with responsive design

## What's Included

### Form Controls Demonstrated:
- **Numeric inputs** with normal/absolute ranges (Temperature, Pulse, BP)
- **Observation Groups** (Blood Pressure with Systolic/Diastolic)
- **Text inputs** (Chief Complaint, Notes)
- **Validation** with mandatory fields and value ranges
- **Pre-populated data** showing edit mode

### React 19 Features:
- Modern `createRoot` API
- Strict Mode enabled
- Functional components with hooks
- Ref forwarding to access Container methods

## Prerequisites

Before running this application, ensure you have:

1. **Node.js** (v18+ recommended)
2. **npm** or **yarn** package manager
3. **Built bahmni-form-controls library** in the parent directory

## Installation & Setup

### Step 1: Build the bahmni-form-controls Library

First, navigate to the main library directory and build it:

```bash
# From the root of form-controls directory
cd ../..
yarn install
yarn build
```

This creates the `dist/` folder with:
- `bundle.js` - Main component library
- `bundle.css` - Styles
- `helpers.js` - Utility functions

### Step 2: Install Consumer App Dependencies

Navigate to this directory and install dependencies:

```bash
cd examples/react19-consumer-app
npm install
# or
yarn install
```

This will:
- Install React 19 and React DOM 19
- Link to the local bahmni-form-controls package
- Install Vite and other dev dependencies

### Step 3: Run the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will open automatically at `http://localhost:3000`

## Project Structure

```
react19-consumer-app/
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.jsx           # React 19 entry point
│   ├── App.jsx            # Main application component
│   ├── App.css            # Application styles
│   └── formMetadata.js    # Form definition and sample data
└── README.md              # This file
```

## Key Files Explained

### `src/App.jsx`
The main application component that:
- Imports the `Container` component from bahmni-form-controls
- Sets up state management for observations and validation
- Implements form save/reset/clear handlers
- Uses `useRef` to access Container's `getValue()` method
- Demonstrates real-time form updates with `onValueUpdated` callback

### `src/formMetadata.js`
Contains:
- **Form metadata** - Complete form definition with controls
- **Sample observations** - Pre-populated vitals data
- **Patient data** - Sample patient information
- **Translations** - i18n translation mappings

### `src/main.jsx`
React 19 entry point using the new `createRoot` API:
```jsx
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

## Usage Examples

### 1. Using the Container Component

```jsx
import { Container } from 'bahmni-form-controls';
import 'bahmni-form-controls/dist/bundle.css';

function MyForm() {
  const containerRef = useRef(null);

  return (
    <Container
      ref={containerRef}
      metadata={formMetadata}
      observations={observations}
      patient={patient}
      translations={translations}
      validate={true}
      validateForm={true}
      collapse={false}
      locale="en"
      onValueUpdated={handleValueUpdated}
    />
  );
}
```

### 2. Getting Form Data

```jsx
const handleSaveForm = () => {
  if (containerRef.current) {
    const formData = containerRef.current.getValue();

    if (formData.errors && formData.errors.length > 0) {
      console.error('Validation errors:', formData.errors);
      return;
    }

    // Save observations to backend
    console.log('Saving:', formData.observations);
  }
};
```

### 3. Handling Form Updates

```jsx
const handleValueUpdated = useCallback((controlRecordTree) => {
  console.log('Form updated:', controlRecordTree);
  // Perform real-time validation or processing
}, []);
```

## Container Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `metadata` | Object | Yes | Form definition with controls |
| `observations` | Array | Yes | Existing observation data |
| `patient` | Object | Yes | Patient info (must have `uuid`) |
| `translations` | Object | Yes | i18n translations |
| `validate` | Boolean | Yes | Enable validation |
| `validateForm` | Boolean | Yes | Validate on mount |
| `collapse` | Boolean | Yes | Initial collapse state |
| `locale` | String | No | Language locale (default: 'en') |
| `onValueUpdated` | Function | No | Callback for value changes |

## Container Component Methods (via ref)

| Method | Returns | Description |
|--------|---------|-------------|
| `getValue()` | `{ observations, errors }` | Get form data and validation errors |

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

This creates an optimized build in the `dist/` folder.

To preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Troubleshooting

### Issue: Module not found 'bahmni-form-controls'

**Solution:** Make sure you've built the parent library first:
```bash
cd ../..
yarn build
cd examples/react19-consumer-app
rm -rf node_modules package-lock.json
npm install
```

### Issue: Styles not applied

**Solution:** Ensure you're importing the CSS:
```jsx
import 'bahmni-form-controls/dist/bundle.css';
```

### Issue: Container component not rendering

**Solution:** Check console for errors. Ensure all required props are provided:
- metadata (with valid structure)
- observations (array, can be empty)
- patient (object with uuid)
- translations (object with labels and concepts)
- validate, validateForm, collapse (boolean values)

### Issue: getValue() returns undefined

**Solution:** Make sure you're using a ref:
```jsx
const containerRef = useRef(null);
<Container ref={containerRef} ... />
```

## Demo Features to Try

### 1. Form Validation
- Try leaving mandatory fields (Temperature, Pulse) empty
- Enter values outside normal ranges to see warnings
- Click "Save Form" to trigger validation

### 2. Observation Groups
- The Blood Pressure section demonstrates obs groups
- Systolic and Diastolic are grouped together
- Try collapsing/expanding the section

### 3. Pre-populated Data
- Form loads with sample vitals data
- Shows how to edit existing observations
- Click "Reset" to restore sample data
- Click "Clear" to start with empty form

### 4. Real-time Updates
- Open browser console
- Make changes in the form
- See real-time updates logged via `onValueUpdated`

### 5. Form Controls Panel
- Toggle "Enable Validation" on/off
- Toggle "Validate on Mount" to see initial validation
- Toggle "Collapse Sections" to collapse obs groups

## Customization

### Adding Your Own Form

1. Edit `src/formMetadata.js`
2. Modify the `vitalsFormMetadata` object with your controls
3. Update `sampleObservations` if you want pre-populated data
4. Adjust `samplePatient` and `sampleTranslations` as needed

### Styling

- Modify `src/App.css` for application-level styles
- Form control styles are in `bahmni-form-controls/dist/bundle.css`
- Override specific form styles by targeting `.form-container` classes

### Adding More Pages

This is a single-page app, but you can add routing:

```bash
npm install react-router-dom
```

Then create multiple pages with different forms.

## Learn More

- [Bahmni Form Controls Documentation](../../README.md)
- [Integration Guide](../../INTEGRATION_GUIDE.md)
- [React 19 Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

## Support

For issues or questions:
- Check the main library [README](../../README.md)
- Review the [Integration Guide](../../INTEGRATION_GUIDE.md)
- Open an issue on GitHub

## License

GPL-2.0 (same as bahmni-form-controls)
