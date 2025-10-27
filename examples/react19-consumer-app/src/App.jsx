import React, { useRef, useState, useCallback } from 'react';
import { Container } from 'bahmni-form-controls';
import 'bahmni-form-controls/dist/bundle.css';
import {
  vitalsFormMetadata,
  sampleObservations,
  samplePatient,
  sampleTranslations
} from './formMetadata';
import './App.css';

/**
 * React 19 Demo Application using bahmni-form-controls
 *
 * This demonstrates how to integrate the Container component
 * in a React 19 application with all necessary props and handlers.
 */
function App() {
  const containerRef = useRef(null);
  const [observations, setObservations] = useState(sampleObservations);
  const [savedData, setSavedData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [formMessage, setFormMessage] = useState({ text: '', type: '' });
  const [validate, setValidate] = useState(true);
  const [validateForm, setValidateForm] = useState(false);
  const [collapse, setCollapse] = useState(false);

  /**
   * Callback triggered when form values change
   */
  const handleValueUpdated = useCallback((controlRecordTree) => {
    console.log('Form updated:', controlRecordTree);
    // You can perform real-time validation or processing here
  }, []);

  /**
   * Save form handler - extracts and validates form data
   */
  const handleSaveForm = useCallback(() => {
    if (!containerRef.current) {
      setFormMessage({ text: 'Form not initialized', type: 'error' });
      return;
    }

    try {
      const formData = containerRef.current.getValue();

      // Check for validation errors
      if (formData.errors && formData.errors.length > 0) {
        setValidationErrors(formData.errors);
        setFormMessage({
          text: `Please fix ${formData.errors.length} validation error(s)`,
          type: 'error'
        });
        return;
      }

      // Clear errors
      setValidationErrors([]);

      // Simulate API call
      console.log('Saving observations:', formData.observations);

      // In a real application, you would send to backend:
      // await fetch('/api/observations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData.observations)
      // });

      setSavedData(formData.observations);
      setFormMessage({ text: 'Form saved successfully!', type: 'success' });

      // Auto-hide message after 3 seconds
      setTimeout(() => setFormMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error saving form:', error);
      setFormMessage({ text: 'Error saving form', type: 'error' });
    }
  }, []);

  /**
   * Reset form to initial state
   */
  const handleResetForm = useCallback(() => {
    setObservations(sampleObservations);
    setSavedData(null);
    setValidationErrors([]);
    setFormMessage({ text: 'Form reset', type: 'info' });
    setTimeout(() => setFormMessage({ text: '', type: '' }), 2000);
  }, []);

  /**
   * Clear all form data
   */
  const handleClearForm = useCallback(() => {
    setObservations([]);
    setSavedData(null);
    setValidationErrors([]);
    setFormMessage({ text: 'Form cleared', type: 'info' });
    setTimeout(() => setFormMessage({ text: '', type: '' }), 2000);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bahmni Form Controls - React 19 Demo</h1>
        <p className="subtitle">
          Patient Vitals Assessment Form using bahmni-form-controls library
        </p>
      </header>

      <div className="app-container">
        {/* Patient Info Card */}
        <div className="patient-card">
          <h2>Patient Information</h2>
          <div className="patient-info">
            <div className="info-item">
              <span className="label">Name:</span>
              <span className="value">{samplePatient.name}</span>
            </div>
            <div className="info-item">
              <span className="label">ID:</span>
              <span className="value">{samplePatient.identifier}</span>
            </div>
            <div className="info-item">
              <span className="label">Age/Gender:</span>
              <span className="value">{samplePatient.age}Y / {samplePatient.gender}</span>
            </div>
          </div>
        </div>

        {/* Form Controls Panel */}
        <div className="controls-panel">
          <h3>Form Controls</h3>
          <div className="controls-group">
            <label>
              <input
                type="checkbox"
                checked={validate}
                onChange={(e) => setValidate(e.target.checked)}
              />
              Enable Validation
            </label>
            <label>
              <input
                type="checkbox"
                checked={validateForm}
                onChange={(e) => setValidateForm(e.target.checked)}
              />
              Validate on Mount
            </label>
            <label>
              <input
                type="checkbox"
                checked={collapse}
                onChange={(e) => setCollapse(e.target.checked)}
              />
              Collapse Sections
            </label>
          </div>
        </div>

        {/* Message Display */}
        {formMessage.text && (
          <div className={`message message-${formMessage.type}`}>
            {formMessage.text}
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <h3>Validation Errors:</h3>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error.message || JSON.stringify(error)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Form */}
        <div className="form-container">
          <h2>Vitals Form</h2>
          <Container
            ref={containerRef}
            metadata={vitalsFormMetadata}
            observations={observations}
            patient={samplePatient}
            translations={sampleTranslations}
            validate={validate}
            validateForm={validateForm}
            collapse={collapse}
            locale="en"
            onValueUpdated={handleValueUpdated}
          />
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={handleSaveForm}
          >
            💾 Save Form
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleResetForm}
          >
            🔄 Reset to Sample Data
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleClearForm}
          >
            🗑️ Clear Form
          </button>
        </div>

        {/* Saved Data Display */}
        {savedData && (
          <div className="saved-data">
            <h3>Saved Data (JSON):</h3>
            <pre>{JSON.stringify(savedData, null, 2)}</pre>
          </div>
        )}

        {/* Info Panel */}
        <div className="info-panel">
          <h3>ℹ️ About This Demo</h3>
          <ul>
            <li>Built with <strong>React 19</strong></li>
            <li>Using <strong>bahmni-form-controls</strong> library</li>
            <li>Features validation, obs groups, and multiple control types</li>
            <li>Pre-populated with sample vitals data</li>
            <li>Console logs show form updates in real-time</li>
          </ul>
        </div>
      </div>

      <footer className="app-footer">
        <p>
          View source code in <code>examples/react19-consumer-app/</code>
        </p>
      </footer>
    </div>
  );
}

export default App;
