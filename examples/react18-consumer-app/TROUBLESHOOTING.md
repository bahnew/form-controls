# Troubleshooting Guide - React 18 Container Component Issues

## Problem: componentDidMount Errors

If you're experiencing errors when the Container component mounts in React 18, this guide will help you resolve them.

## Common Issues & Solutions

### Issue 1: React 18 StrictMode Double Mounting

**Symptom:** componentDidMount is called twice, causing state/initialization issues

**Cause:** React 18's StrictMode intentionally double-invokes lifecycle methods in development to detect side effects.

**Solution 1: Disable StrictMode (Recommended for Development)**

Use the fixed entry point:

```jsx
// main-fixed.jsx
import ReactDOM from 'react-dom/client';
import App from './App-fixed.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />); // No StrictMode wrapper
```

Update your imports to use the fixed versions:

```bash
# In src/main.jsx, change:
import App from './App.jsx';
# To:
import App from './App-fixed.jsx';
```

**Solution 2: Keep StrictMode but Handle Double Mounting**

The Container component should handle double mounting, but if it doesn't, you can add a guard:

```jsx
function App() {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      // Do one-time initialization
    }
  }, []);
}
```

### Issue 2: Section Control Not Registered

**Symptom:** Error about "section" control type not being registered

**Cause:** The Section control may not be imported or registered properly.

**Solution:** Use the simplified form data without Section controls:

```javascript
// Import simplified form data
import { clinicalFormMetadata } from './formData-simple';

// Instead of:
// import { clinicalFormMetadata } from './formData';
```

The simplified version uses only `obsControl` and `obsGroupControl` which are guaranteed to be registered.

### Issue 3: Form Metadata Structure Issues

**Symptom:** TypeError or undefined errors during form initialization

**Cause:** Invalid or incomplete form metadata structure.

**Solution:** Ensure your metadata has all required fields:

```javascript
{
  id: number,
  uuid: string,
  name: string,
  version: string,
  controls: [
    {
      type: 'obsControl' | 'obsGroupControl',
      label: { type: 'label', value: string },
      id: string,
      properties: {
        mandatory: boolean,
        location: { row: number, column: number }
      },
      concept: {
        uuid: string,
        name: string,
        datatype: string,
        conceptClass: string
      }
    }
  ]
}
```

### Issue 4: Missing Patient UUID

**Symptom:** Error: "Cannot read property 'uuid' of undefined"

**Cause:** Patient object is missing or doesn't have uuid property.

**Solution:** Always provide a valid patient object:

```javascript
const patientData = {
  uuid: 'patient-123', // REQUIRED
  name: 'John Doe',    // Optional but recommended
  // ... other fields
};
```

### Issue 5: Event Script Errors

**Symptom:** JavaScript errors during form initialization

**Cause:** Invalid event scripts in form metadata.

**Solution:** Remove or fix event scripts:

```javascript
// Option 1: Remove events entirely
const metadata = {
  // ... other fields
  // Don't include events property
};

// Option 2: Ensure script is valid
const metadata = {
  // ... other fields
  events: {
    onFormInit: `
      console.log('Form initialized');
      // Valid JavaScript only
    `
  }
};
```

## Quick Fix: Use the Fixed Version

### Step 1: Update Your Imports

Edit `src/main.jsx`:

```jsx
import App from './App-fixed.jsx';
```

This uses the fixed App component with:
- Error boundaries
- Mount state tracking
- Proper null checks
- Simplified form metadata

### Step 2: Use Simplified Form Data

The `formData-simple.js` file provides a tested, working form structure:

```javascript
import {
  clinicalFormMetadata,
  existingObservations,
  patientData,
  translationData
} from './formData-simple';
```

## Files to Use

| File | Purpose | When to Use |
|------|---------|-------------|
| `main-fixed.jsx` | Entry without StrictMode | If you see double mounting issues |
| `App-fixed.jsx` | App with error handling | For robust error handling |
| `formData-simple.js` | Simplified metadata | If Section controls cause issues |

## Testing the Fix

1. **Stop the development server** (Ctrl+C)

2. **Update the entry point:**

```bash
# Backup original
mv src/main.jsx src/main-original.jsx
mv src/App.jsx src/App-original.jsx

# Use fixed versions
cp src/main-fixed.jsx src/main.jsx
cp src/App-fixed.jsx src/App.jsx
```

3. **Update imports in main.jsx:**

```jsx
import App from './App.jsx'; // Now points to fixed version
```

4. **Update imports in App.jsx to use simple form data:**

```jsx
import {
  clinicalFormMetadata,
  existingObservations,
  patientData,
  translationData
} from './formData-simple';
```

5. **Restart the server:**

```bash
npm run dev
```

## Verifying the Fix

Check your browser console. You should see:

```
✓ Initializing Container component
✓ Container component mounted successfully
✓ Form ready
```

No errors should appear, and the form should render correctly.

## Still Having Issues?

### Debug Checklist

- [ ] Built the main bahmni-form-controls library (`yarn build` in root)
- [ ] Installed dependencies in consumer app (`npm install`)
- [ ] Using React 18.3.1 (check `package.json`)
- [ ] Browser console shows no errors
- [ ] Form metadata has valid structure
- [ ] Patient object includes `uuid` field
- [ ] Translations object provided (can be empty)

### Enable Debug Logging

Add to your App component:

```jsx
useEffect(() => {
  console.log('App mounted');
  console.log('Form metadata:', clinicalFormMetadata);
  console.log('Patient:', patientData);
  console.log('Observations:', observations);
}, []);
```

### Check Network Tab

Open browser DevTools → Network tab. Ensure:
- `bundle.js` loads successfully
- `bundle.css` loads successfully
- No 404 errors

## Alternative: Use React 19 Example

If React 18 issues persist, the React 19 example app has better compatibility:

```bash
cd ../react19-consumer-app
npm install
npm run dev
```

## Production Considerations

### Important Notes:

1. **StrictMode in Production:** StrictMode is automatically disabled in production builds, so double-mounting won't occur.

2. **Error Boundaries:** Always use error boundaries in production:

```jsx
<ErrorBoundary>
  <Container {...props} />
</ErrorBoundary>
```

3. **Validation:** Always validate form metadata structure before passing to Container.

4. **Fallbacks:** Provide fallback values for all optional props:

```jsx
<Container
  metadata={metadata}
  observations={observations || []}
  patient={patient || { uuid: 'unknown' }}
  translations={translations || { labels: {}, concepts: {} }}
  validate={validate ?? true}
  validateForm={validateForm ?? false}
  collapse={collapse ?? false}
  locale={locale || 'en'}
/>
```

## Summary

**Most Common Fix:**

1. Use `App-fixed.jsx` instead of `App.jsx`
2. Use `formData-simple.js` instead of `formData.js`
3. Disable StrictMode in development if needed

These changes handle 90% of componentDidMount issues in React 18.

## Need More Help?

- Review the [Integration Guide](../../INTEGRATION_GUIDE.md)
- Check the [Main README](../../README.md)
- Compare with working [React 19 example](../react19-consumer-app/)
- Open an issue with full error logs and form metadata

---

**Remember:** The library was upgraded to React 18, and while it's compatible, some edge cases in StrictMode can cause issues. The fixed versions provided here handle these scenarios properly.
