import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Container } from 'bahmni-form-controls';
import 'bahmni-form-controls/dist/bundle.css';
import {
  clinicalFormMetadata,
  existingObservations,
  patientData,
  translationData
} from './formData-simple';
import './App.css';

/**
 * React 18 Demo Application - Clinical Assessment Form (Fixed Version)
 *
 * This version addresses componentDidMount issues by:
 * 1. Using simplified form metadata without Section controls
 * 2. Proper error boundaries
 * 3. Defensive programming with null checks
 * 4. Can work with or without StrictMode
 */
function App() {
  // Reference to Container component
  const formRef = useRef(null);

  // State management
  const [observations, setObservations] = useState(existingObservations);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [errors, setErrors] = useState([]);
  const [lastSavedData, setLastSavedData] = useState(null);
  const [containerMounted, setContainerMounted] = useState(false);

  // Form configuration state
  const [config, setConfig] = useState({
    validate: true,
    validateForm: false,
    collapse: false
  });

  // Track when Container is actually mounted
  useEffect(() => {
    if (formRef.current) {
      setContainerMounted(true);
      console.log('Container component mounted successfully');
    }
  }, [formRef.current]);

  /**
   * Display notification message
   */
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 4000);
  }, []);

  /**
   * Handle form value updates (called on every change)
   */
  const handleFormValueUpdated = useCallback((controlRecordTree) => {
    console.log('Form updated:', controlRecordTree);
  }, []);

  /**
   * Save form data with error handling
   */
  const handleSave = useCallback(async () => {
    if (!formRef.current) {
      showNotification('Form not ready. Please wait...', 'warning');
      return;
    }

    if (!containerMounted) {
      showNotification('Form is still initializing...', 'warning');
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      // Get current form data
      const formData = formRef.current.getValue();

      if (!formData) {
        throw new Error('Unable to retrieve form data');
      }

      // Check for validation errors
      if (formData.errors && formData.errors.length > 0) {
        setErrors(formData.errors);
        showNotification(
          `Validation failed: ${formData.errors.length} error(s) found`,
          'error'
        );
        setIsLoading(false);
        return;
      }

      // Log observations
      console.log('Saving observations:', formData.observations);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setLastSavedData(formData.observations);
      showNotification('Form saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving form:', error);
      showNotification(`Failed to save form: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification, containerMounted]);

  /**
   * Reset form to initial data
   */
  const handleReset = useCallback(() => {
    setObservations([...existingObservations]);
    setErrors([]);
    setLastSavedData(null);
    showNotification('Form reset to initial data', 'info');
  }, [showNotification]);

  /**
   * Clear all form data
   */
  const handleClear = useCallback(() => {
    setObservations([]);
    setErrors([]);
    setLastSavedData(null);
    showNotification('Form cleared', 'info');
  }, [showNotification]);

  /**
   * Toggle configuration options
   */
  const handleConfigChange = useCallback((key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>Clinical Assessment Form</h1>
          <p className="subtitle">React 18 + Bahmni Form Controls Demo (Fixed)</p>
        </div>
      </header>

      <div className="main-content">
        <div className="container">
          {/* Patient Information Panel */}
          <section className="panel patient-panel">
            <h2>Patient Details</h2>
            <div className="patient-grid">
              <div className="patient-field">
                <label>Name:</label>
                <span>{patientData.name}</span>
              </div>
              <div className="patient-field">
                <label>MRN:</label>
                <span>{patientData.identifier}</span>
              </div>
              <div className="patient-field">
                <label>Age:</label>
                <span>{patientData.age} years</span>
              </div>
              <div className="patient-field">
                <label>Gender:</label>
                <span>{patientData.gender === 'F' ? 'Female' : 'Male'}</span>
              </div>
              <div className="patient-field">
                <label>DOB:</label>
                <span>{patientData.birthdate}</span>
              </div>
              <div className="patient-field">
                <label>UUID:</label>
                <span className="uuid">{patientData.uuid}</span>
              </div>
            </div>
          </section>

          {/* Configuration Panel */}
          <section className="panel config-panel">
            <h3>Form Configuration</h3>
            <div className="config-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.validate}
                  onChange={() => handleConfigChange('validate')}
                />
                <span>Enable Validation</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.validateForm}
                  onChange={() => handleConfigChange('validateForm')}
                />
                <span>Validate on Load</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.collapse}
                  onChange={() => handleConfigChange('collapse')}
                />
                <span>Collapse Sections</span>
              </label>
            </div>
            {!containerMounted && (
              <p style={{ marginTop: '1rem', color: '#f39c12' }}>
                ⏳ Form is initializing...
              </p>
            )}
            {containerMounted && (
              <p style={{ marginTop: '1rem', color: '#27ae60' }}>
                ✓ Form ready
              </p>
            )}
          </section>

          {/* Notification */}
          {notification.message && (
            <div className={`notification notification-${notification.type}`}>
              <span className="notification-icon">
                {notification.type === 'success' && '✓'}
                {notification.type === 'error' && '✗'}
                {notification.type === 'warning' && '⚠'}
                {notification.type === 'info' && 'ℹ'}
              </span>
              <span>{notification.message}</span>
            </div>
          )}

          {/* Validation Errors */}
          {errors.length > 0 && (
            <section className="panel error-panel">
              <h3>Validation Errors ({errors.length})</h3>
              <ul className="error-list">
                {errors.map((error, index) => (
                  <li key={index}>
                    {error.message || JSON.stringify(error)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Form Container with Error Boundary */}
          <section className="panel form-panel">
            <div className="form-header">
              <h2>Clinical Assessment</h2>
              <span className="form-version">v{clinicalFormMetadata.version}</span>
            </div>

            <div className="form-wrapper">
              <ErrorBoundary>
                <Container
                  ref={formRef}
                  metadata={clinicalFormMetadata}
                  observations={observations}
                  patient={patientData}
                  translations={translationData}
                  validate={config.validate}
                  validateForm={config.validateForm}
                  collapse={config.collapse}
                  locale="en"
                  onValueUpdated={handleFormValueUpdated}
                />
              </ErrorBoundary>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="actions">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isLoading || !containerMounted}
            >
              {isLoading ? 'Saving...' : '💾 Save Form'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={isLoading || !containerMounted}
            >
              🔄 Reset
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={isLoading || !containerMounted}
            >
              🗑️ Clear
            </button>
          </section>

          {/* Saved Data Display */}
          {lastSavedData && (
            <section className="panel data-panel">
              <h3>Last Saved Data</h3>
              <div className="data-summary">
                <p>
                  <strong>Total Observations:</strong> {lastSavedData.length}
                </p>
                <details>
                  <summary>View JSON</summary>
                  <pre className="json-output">
                    {JSON.stringify(lastSavedData, null, 2)}
                  </pre>
                </details>
              </div>
            </section>
          )}

          {/* Info Panel */}
          <section className="panel info-panel">
            <h3>About This Demo (Fixed Version)</h3>
            <ul className="info-list">
              <li>
                <strong>Framework:</strong> React 18.3.1
              </li>
              <li>
                <strong>Library:</strong> bahmni-form-controls
              </li>
              <li>
                <strong>Fixed Issues:</strong> componentDidMount errors resolved
              </li>
              <li>
                <strong>Features:</strong> Error boundaries, null checks, mount tracking
              </li>
              <li>
                <strong>Form:</strong> Obs Groups, Validation, Pre-filled Data
              </li>
              <li>
                <strong>Console:</strong> Check browser console for debug info
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>
          Bahmni Form Controls React 18 Demo (Fixed) |
          Source: <code>examples/react18-consumer-app/</code>
        </p>
      </footer>
    </div>
  );
}

/**
 * Error Boundary Component for Container
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Container Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          color: '#721c24'
        }}>
          <h3>⚠️ Form Error</h3>
          <p><strong>Error:</strong> {this.state.error?.toString()}</p>
          <details style={{ marginTop: '1rem' }}>
            <summary>Error Details</summary>
            <pre style={{
              background: '#fff',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.875rem'
            }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#721c24',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default App;
