import React from 'react';
import { Container } from '../src/components/Container.jsx';

/**
 * Example: Basic Container Component Usage
 *
 * The Container component is the main form renderer that takes form metadata
 * and observations to render a complete form with validation and events.
 */

// Example 1: Minimal Configuration
export const MinimalContainerExample = () => {
  const metadata = {
    id: 1,
    uuid: 'form-uuid-123',
    name: 'Patient Vitals Form',
    version: '1.0',
    controls: [
      {
        type: 'obsControl',
        label: {
          type: 'label',
          value: 'Temperature'
        },
        properties: {
          mandatory: true,
          location: { row: 0, column: 0 }
        },
        id: 'temp-1',
        concept: {
          uuid: 'temp-concept-uuid',
          name: 'Temperature',
          datatype: 'Numeric'
        }
      }
    ]
  };

  const observations = [];

  const patient = {
    uuid: 'patient-uuid-123',
    name: 'John Doe',
    age: 35
  };

  const translations = {
    labels: {},
    concepts: {}
  };

  return (
    <Container
      metadata={metadata}
      observations={observations}
      patient={patient}
      translations={translations}
      validate={true}
      validateForm={false}
      collapse={false}
    />
  );
};

// Example 2: Complete Configuration with All Properties
export const CompleteContainerExample = () => {
  const metadata = {
    id: 2,
    uuid: 'vitals-form-uuid',
    name: 'Comprehensive Vitals Form',
    version: '2.0',
    controls: [
      // Row 1: Temperature and Pulse
      {
        type: 'obsControl',
        label: {
          type: 'label',
          value: 'Temperature (°C)'
        },
        properties: {
          mandatory: true,
          location: { row: 0, column: 0 }
        },
        id: 'temp-control',
        concept: {
          uuid: 'c36af094-3f10-11e4-adec-0800271c1b75',
          name: 'Temperature',
          datatype: 'Numeric',
          lowNormal: 36.0,
          hiNormal: 37.5,
          lowAbsolute: 35.0,
          hiAbsolute: 43.0
        }
      },
      {
        type: 'obsControl',
        label: {
          type: 'label',
          value: 'Pulse (/min)'
        },
        properties: {
          mandatory: true,
          location: { row: 0, column: 1 }
        },
        id: 'pulse-control',
        concept: {
          uuid: 'c36bc1a4-3f10-11e4-adec-0800271c1b75',
          name: 'Pulse',
          datatype: 'Numeric',
          lowNormal: 60,
          hiNormal: 100,
          lowAbsolute: 40,
          hiAbsolute: 200
        }
      },
      // Row 2: Blood Pressure (ObsGroup)
      {
        type: 'obsGroupControl',
        label: {
          type: 'label',
          value: 'Blood Pressure'
        },
        properties: {
          location: { row: 1, column: 0 }
        },
        id: 'bp-group',
        concept: {
          uuid: 'bp-group-uuid',
          name: 'Blood Pressure',
          datatype: 'N/A',
          conceptClass: 'Concept Details',
          description: {
            value: 'Systolic and Diastolic blood pressure measurements'
          }
        },
        controls: [
          {
            type: 'obsControl',
            label: {
              type: 'label',
              value: 'Systolic (mmHg)'
            },
            properties: {
              mandatory: true,
              location: { row: 0, column: 0 }
            },
            id: 'systolic-control',
            concept: {
              uuid: 'systolic-uuid',
              name: 'Systolic BP',
              datatype: 'Numeric',
              lowNormal: 90,
              hiNormal: 120,
              lowAbsolute: 60,
              hiAbsolute: 250
            }
          },
          {
            type: 'obsControl',
            label: {
              type: 'label',
              value: 'Diastolic (mmHg)'
            },
            properties: {
              mandatory: true,
              location: { row: 0, column: 1 }
            },
            id: 'diastolic-control',
            concept: {
              uuid: 'diastolic-uuid',
              name: 'Diastolic BP',
              datatype: 'Numeric',
              lowNormal: 60,
              hiNormal: 80,
              lowAbsolute: 40,
              hiAbsolute: 150
            }
          }
        ]
      },
      // Row 3: Chief Complaint (Text)
      {
        type: 'obsControl',
        label: {
          type: 'label',
          value: 'Chief Complaint'
        },
        properties: {
          mandatory: false,
          location: { row: 2, column: 0 }
        },
        id: 'complaint-control',
        concept: {
          uuid: 'complaint-uuid',
          name: 'Chief Complaint',
          datatype: 'Text'
        }
      }
    ],
    events: {
      onFormInit: `
        // Example: Auto-populate default values
        console.log('Form initialized');
      `
    }
  };

  // Example observations (existing data)
  const observations = [
    {
      uuid: 'obs-temp-uuid',
      concept: {
        uuid: 'c36af094-3f10-11e4-adec-0800271c1b75',
        name: 'Temperature'
      },
      value: 37.2,
      formFieldPath: 'vitals-form-uuid.2/temp-control-0'
    },
    {
      uuid: 'obs-pulse-uuid',
      concept: {
        uuid: 'c36bc1a4-3f10-11e4-adec-0800271c1b75',
        name: 'Pulse'
      },
      value: 78,
      formFieldPath: 'vitals-form-uuid.2/pulse-control-0'
    }
  ];

  const patient = {
    uuid: 'patient-uuid-456',
    name: 'Jane Smith',
    age: 42,
    gender: 'F',
    identifier: 'PAT-12345'
  };

  const translations = {
    labels: {
      'TEMPERATURE_LABEL': 'Temperature',
      'PULSE_LABEL': 'Pulse'
    },
    concepts: {
      'Temperature': 'Temperatura',
      'Pulse': 'Pulso'
    }
  };

  // Callback when form values change
  const handleValueUpdated = (controlRecordTree) => {
    console.log('Form data updated:', controlRecordTree);
    // You can extract observations here if needed
  };

  return (
    <Container
      metadata={metadata}
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
};

// Example 3: Using Container with Ref to Get Form Data
export const ContainerWithRefExample = () => {
  const containerRef = React.useRef(null);

  const metadata = {
    id: 3,
    uuid: 'simple-form-uuid',
    name: 'Simple Form',
    version: '1.0',
    controls: [
      {
        type: 'obsControl',
        label: {
          type: 'label',
          value: 'Patient Weight (kg)'
        },
        properties: {
          mandatory: true,
          location: { row: 0, column: 0 }
        },
        id: 'weight-control',
        concept: {
          uuid: 'weight-uuid',
          name: 'Weight',
          datatype: 'Numeric'
        }
      }
    ]
  };

  const observations = [];
  const patient = { uuid: 'patient-789', name: 'Test Patient' };
  const translations = { labels: {}, concepts: {} };

  const handleSaveForm = () => {
    if (containerRef.current) {
      // Get form values including observations and errors
      const formData = containerRef.current.getValue();

      if (formData.errors && formData.errors.length > 0) {
        console.error('Form has validation errors:', formData.errors);
        alert('Please fix form errors before saving');
      } else {
        console.log('Form observations to save:', formData.observations);
        // Save to backend
        alert('Form saved successfully!');
      }
    }
  };

  return (
    <div>
      <Container
        ref={containerRef}
        metadata={metadata}
        observations={observations}
        patient={patient}
        translations={translations}
        validate={true}
        validateForm={true}
        collapse={false}
      />
      <button onClick={handleSaveForm} style={{ marginTop: '20px', padding: '10px' }}>
        Save Form
      </button>
    </div>
  );
};

// Example 4: Container with Event Scripts
export const ContainerWithEventsExample = () => {
  const metadata = {
    id: 4,
    uuid: 'bmi-form-uuid',
    name: 'BMI Calculator Form',
    version: '1.0',
    controls: [
      {
        type: 'obsControl',
        label: {
          type: 'label',
          value: 'Height (cm)'
        },
        properties: {
          mandatory: true,
          location: { row: 0, column: 0 }
        },
        id: 'height-control',
        concept: {
          uuid: 'height-uuid',
          name: 'Height',
          datatype: 'Numeric'
        },
        events: {
          onValueChange: `
            // Calculate BMI when height changes
            var height = context.getValue('height-control');
            var weight = context.getValue('weight-control');
            if (height && weight) {
              var heightM = height / 100;
              var bmi = weight / (heightM * heightM);
              context.setValue('bmi-control', bmi.toFixed(2));
            }
          `
        }
      },
      {
        type: 'obsControl',
        label: {
          type: 'label',
          value: 'Weight (kg)'
        },
        properties: {
          mandatory: true,
          location: { row: 1, column: 0 }
        },
        id: 'weight-control',
        concept: {
          uuid: 'weight-uuid-2',
          name: 'Weight',
          datatype: 'Numeric'
        },
        events: {
          onValueChange: `
            // Calculate BMI when weight changes
            var height = context.getValue('height-control');
            var weight = context.getValue('weight-control');
            if (height && weight) {
              var heightM = height / 100;
              var bmi = weight / (heightM * heightM);
              context.setValue('bmi-control', bmi.toFixed(2));
            }
          `
        }
      },
      {
        type: 'obsControl',
        label: {
          type: 'label',
          value: 'BMI (calculated)'
        },
        properties: {
          mandatory: false,
          location: { row: 2, column: 0 }
        },
        id: 'bmi-control',
        concept: {
          uuid: 'bmi-uuid',
          name: 'BMI',
          datatype: 'Numeric',
          conceptClass: 'Computed'
        }
      }
    ]
  };

  const observations = [];
  const patient = { uuid: 'patient-999', name: 'BMI Patient' };
  const translations = { labels: {}, concepts: {} };

  return (
    <Container
      metadata={metadata}
      observations={observations}
      patient={patient}
      translations={translations}
      validate={true}
      validateForm={false}
      collapse={false}
    />
  );
};

/**
 * Container Component Props Documentation:
 *
 * @prop {Object} metadata - Form definition (REQUIRED)
 *   - id: number - Form identifier
 *   - uuid: string - Form UUID
 *   - name: string - Form name
 *   - version: string - Form version
 *   - controls: Array - Array of control definitions
 *   - events: Object (optional) - Form-level event scripts
 *
 * @prop {Array} observations - Existing observations data (REQUIRED)
 *   Array of observation objects with uuid, concept, value, formFieldPath
 *
 * @prop {Object} patient - Patient information (REQUIRED)
 *   - uuid: string - Patient UUID
 *   - name: string (optional) - Patient name
 *   - Other patient properties as needed
 *
 * @prop {Object} translations - Translation mappings (REQUIRED)
 *   - labels: Object - Label translations
 *   - concepts: Object - Concept name translations
 *
 * @prop {boolean} validate - Enable validation (REQUIRED)
 *   When true, form controls will show validation errors
 *
 * @prop {boolean} validateForm - Validate on mount (REQUIRED)
 *   When true, validation runs immediately on form load
 *
 * @prop {boolean} collapse - Initial collapse state (REQUIRED)
 *   Controls whether sections/groups are collapsed by default
 *
 * @prop {string} locale - Locale for internationalization (optional)
 *   Default: 'en'
 *
 * @prop {function} onValueUpdated - Callback when values change (optional)
 *   Receives the updated control record tree
 *
 * @method getValue() - Returns form observations and errors
 *   Returns: { observations: Array, errors: Array }
 */

export default {
  MinimalContainerExample,
  CompleteContainerExample,
  ContainerWithRefExample,
  ContainerWithEventsExample
};
