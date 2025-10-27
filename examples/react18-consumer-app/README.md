# Bahmni Form Controls - React 18 Consumer Application

A complete, production-ready demo application showing how to integrate and use the `bahmni-form-controls` library in a **React 18.3.1** application.

## 🎯 Overview

This application demonstrates a **Clinical Assessment Form** with comprehensive vitals tracking, validation, and data management using the Bahmni Form Controls library's `Container` component.

## ✨ Features

### Form Features
- ✅ **Complete Clinical Form** with vitals and anthropometric measurements
- ✅ **Sections** for organizing related controls
- ✅ **Observation Groups** (Blood Pressure with multiple measurements)
- ✅ **Pre-populated Data** showing edit mode functionality
- ✅ **Real-time Validation** with configurable rules
- ✅ **Form State Management** (Save/Reset/Clear operations)
- ✅ **Error Handling** with detailed validation messages

### Technical Features
- ✅ **React 18.3.1** with modern hooks
- ✅ **Vite** for blazing-fast development
- ✅ **Ref-based API** for accessing Container methods
- ✅ **TypeScript-ready** structure
- ✅ **Responsive Design** with mobile support
- ✅ **Real-time Updates** with callbacks

## 📋 Form Controls Demonstrated

| Control Type | Example | Description |
|--------------|---------|-------------|
| **Numeric** | Temperature, Heart Rate, BP | With normal/absolute ranges |
| **Section** | Vital Signs | Groups related controls |
| **Obs Group** | Blood Pressure | Nested observations |
| **Text** | Chief Complaint, Notes | Free-text entry |
| **Computed** | BMI | Calculated fields |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or npm/yarn
- Built bahmni-form-controls library

### Step 1: Build the Main Library

From the root `form-controls` directory:

```bash
cd /Users/sumazfiles/tw-projects/Bahmni/form-controls
yarn install
yarn build
```

This generates the required `dist/` folder with:
- `bundle.js` - Component library
- `bundle.css` - Styles
- `helpers.js` - Utility functions

### Step 2: Install Dependencies

Navigate to this directory and install:

```bash
cd examples/react18-consumer-app
npm install
# or
yarn install
```

### Step 3: Run Development Server

Start the dev server:

```bash
npm run dev
# or
yarn dev
```

The app will automatically open at `http://localhost:3001`

## 📁 Project Structure

```
react18-consumer-app/
├── index.html                 # HTML entry point
├── package.json               # Dependencies (React 18.3.1)
├── vite.config.js             # Vite configuration
├── .gitignore                 # Git ignore rules
├── src/
│   ├── main.jsx              # React 18 entry with createRoot
│   ├── App.jsx               # Main application component
│   ├── App.css               # Application styles
│   └── formData.js           # Form metadata & sample data
└── README.md                 # This file
```

## 🔧 Key Files

### `src/App.jsx`

Main application component featuring:

```jsx
import { Container } from 'bahmni-form-controls';
import 'bahmni-form-controls/dist/bundle.css';

function App() {
  const formRef = useRef(null);

  const handleSave = () => {
    const formData = formRef.current.getValue();
    // Handle validation and save
  };

  return (
    <Container
      ref={formRef}
      metadata={clinicalFormMetadata}
      observations={existingObservations}
      patient={patientData}
      translations={translationData}
      validate={true}
      validateForm={false}
      collapse={false}
      locale="en"
      onValueUpdated={handleFormValueUpdated}
    />
  );
}
```

### `src/formData.js`

Complete form definition including:

- **Form Metadata**: Structured control definitions
- **Existing Observations**: Pre-populated patient data
- **Patient Data**: Sample patient information
- **Translations**: i18n labels and concepts

### `src/main.jsx`

React 18 entry point using `createRoot`:

```jsx
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
```

## 🎮 Using the Application

### 1. View Patient Information
- Patient details are displayed at the top
- Includes name, MRN, age, gender, and UUID

### 2. Configure Form Behavior
Toggle options to see different behaviors:
- **Enable Validation**: Show/hide validation errors
- **Validate on Load**: Run validation immediately
- **Collapse Sections**: Start with sections collapsed

### 3. Fill Out the Form
The form includes:
- **Vital Signs Section**:
  - Body Temperature (°C)
  - Heart Rate (bpm)
  - Respiratory Rate (/min)
  - SpO2 (%)

- **Blood Pressure Group**:
  - Systolic BP (mmHg)
  - Diastolic BP (mmHg)
  - Position During Measurement

- **Anthropometric**:
  - Weight (kg)
  - Height (cm)
  - BMI (calculated)

- **Clinical Notes**:
  - Chief Complaint
  - History of Present Illness
  - Additional Clinical Notes

### 4. Validate and Save
- Click **"💾 Save Form"** to validate and save
- Validation errors will be displayed if any
- Successfully saved data is shown in JSON format

### 5. Reset or Clear
- **"🔄 Reset"**: Restore original sample data
- **"🗑️ Clear"**: Start with an empty form

## 📚 Container Component API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `metadata` | Object | Form definition with controls |
| `observations` | Array | Existing observation data (can be empty) |
| `patient` | Object | Patient info (must have `uuid` property) |
| `translations` | Object | i18n translations for labels/concepts |
| `validate` | Boolean | Enable/disable validation |
| `validateForm` | Boolean | Run validation on mount |
| `collapse` | Boolean | Initial collapse state for sections |

### Optional Props

| Prop | Type | Description |
|------|------|-------------|
| `locale` | String | Language locale (default: 'en') |
| `onValueUpdated` | Function | Callback fired on every form change |

### Component Methods (via ref)

| Method | Returns | Description |
|--------|---------|-------------|
| `getValue()` | `{ observations, errors }` | Get current form data and validation errors |

## 💡 Usage Examples

### Example 1: Basic Form Rendering

```jsx
import { Container } from 'bahmni-form-controls';
import 'bahmni-form-controls/dist/bundle.css';

function MyForm() {
  return (
    <Container
      metadata={formMetadata}
      observations={[]}
      patient={{ uuid: 'patient-123' }}
      translations={{ labels: {}, concepts: {} }}
      validate={true}
      validateForm={false}
      collapse={false}
    />
  );
}
```

### Example 2: Form with Validation & Save

```jsx
function MyForm() {
  const formRef = useRef(null);

  const handleSave = async () => {
    const { observations, errors } = formRef.current.getValue();

    if (errors && errors.length > 0) {
      alert('Please fix validation errors');
      return;
    }

    // Save to backend
    await fetch('/api/observations', {
      method: 'POST',
      body: JSON.stringify(observations)
    });
  };

  return (
    <>
      <Container
        ref={formRef}
        metadata={formMetadata}
        // ... other props
      />
      <button onClick={handleSave}>Save</button>
    </>
  );
}
```

### Example 3: Real-time Updates

```jsx
function MyForm() {
  const handleUpdate = useCallback((controlRecordTree) => {
    console.log('Form changed:', controlRecordTree);
    // Auto-save, change tracking, etc.
  }, []);

  return (
    <Container
      metadata={formMetadata}
      onValueUpdated={handleUpdate}
      // ... other props
    />
  );
}
```

## 🏗️ Building for Production

Create an optimized production build:

```bash
npm run build
# or
yarn build
```

Preview the production build:

```bash
npm run preview
# or
yarn preview
```

## ⚠️ componentDidMount Issues?

If you experience errors during Container initialization, use the **fixed version**:

```bash
# Use pre-built fixed files
cp src/main-fixed.jsx src/main.jsx
cp src/App-fixed.jsx src/App.jsx
npm run dev
```

See **[QUICK_FIX.md](./QUICK_FIX.md)** for a 3-step solution, or **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for detailed troubleshooting.

**Why?** React 18's StrictMode can cause double-mounting issues. The fixed version disables StrictMode and uses simplified form metadata.

## 🐛 Troubleshooting

### Issue: Cannot find module 'bahmni-form-controls'

**Solution**: Rebuild the main library and reinstall dependencies:

```bash
# In form-controls root
cd ../..
yarn build

# In this directory
cd examples/react18-consumer-app
rm -rf node_modules package-lock.json
npm install
```

### Issue: Styles not applied

**Solution**: Ensure CSS import is present:

```jsx
import 'bahmni-form-controls/dist/bundle.css';
```

### Issue: Form not rendering

**Solution**: Check that all required props are provided:
- `metadata` - Valid form structure
- `observations` - Array (can be empty)
- `patient` - Object with `uuid`
- `translations` - Object with `labels` and `concepts`
- `validate`, `validateForm`, `collapse` - Boolean values

### Issue: getValue() returns undefined

**Solution**: Ensure proper ref usage:

```jsx
const formRef = useRef(null);

// In JSX:
<Container ref={formRef} ... />

// To access:
const data = formRef.current?.getValue();
```

### Issue: Port 3001 already in use

**Solution**: Change port in `vite.config.js`:

```js
server: {
  port: 3002, // Change to any available port
  open: true
}
```

## 🎨 Customization

### Modify Form Controls

Edit `src/formData.js` to:
- Add new controls
- Change validation rules
- Modify control layout (row/column)
- Add new sections or obs groups

### Style Customization

Edit `src/App.css` to change:
- Colors (CSS variables in `:root`)
- Layout and spacing
- Component appearance
- Responsive breakpoints

### Add More Features

Extend the app with:
- Multiple forms/pages (add React Router)
- Backend integration (REST API calls)
- State management (Redux, Zustand)
- Form templates
- Data export functionality

## 📖 Learn More

- [Main Library README](../../README.md)
- [Integration Guide](../../INTEGRATION_GUIDE.md)
- [React 18 Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Bahmni Documentation](https://bahmni.org)

## 🆚 React 18 vs React 19

This app uses **React 18.3.1**. For React 19 example, see:
- [React 19 Consumer App](../react19-consumer-app/)

Both versions demonstrate the same functionality with framework-specific implementations.

## 🤝 Support

For issues or questions:
- Check the [Integration Guide](../../INTEGRATION_GUIDE.md)
- Review the main [README](../../README.md)
- Open an issue on GitHub
- Check browser console for errors

## 📄 License

GPL-2.0 (same as bahmni-form-controls)

---

**Happy Coding! 🚀**
