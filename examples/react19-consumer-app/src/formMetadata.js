/**
 * Sample form metadata for Vitals Form
 * This demonstrates a complete form with various control types
 */

export const vitalsFormMetadata = {
  id: 1,
  uuid: 'vitals-form-v1',
  name: 'Patient Vitals Assessment',
  version: '1.0',
  controls: [
    // Row 1: Basic Vitals
    {
      type: 'obsControl',
      label: {
        type: 'label',
        value: 'Temperature (°C)',
        translationKey: 'TEMPERATURE_LABEL'
      },
      properties: {
        mandatory: true,
        location: { row: 0, column: 0 }
      },
      id: 'temperature-control',
      concept: {
        uuid: 'c36af094-3f10-11e4-adec-0800271c1b75',
        name: 'Temperature',
        datatype: 'Numeric',
        conceptClass: 'Misc',
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
        value: 'Pulse Rate (/min)',
        translationKey: 'PULSE_LABEL'
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
        conceptClass: 'Misc',
        lowNormal: 60,
        hiNormal: 100,
        lowAbsolute: 40,
        hiAbsolute: 200
      }
    },

    // Row 2: Blood Pressure (Obs Group)
    {
      type: 'obsGroupControl',
      label: {
        type: 'label',
        value: 'Blood Pressure',
        translationKey: 'BP_LABEL'
      },
      properties: {
        location: { row: 1, column: 0 },
        abnormal: false
      },
      id: 'bp-group',
      concept: {
        uuid: 'c36e9f62-3f10-11e4-adec-0800271c1b75',
        name: 'Blood Pressure',
        datatype: 'N/A',
        conceptClass: 'Concept Details',
        description: {
          value: 'Systolic and Diastolic blood pressure measurements',
          translationKey: 'BP_DESCRIPTION'
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
            uuid: 'c36e9ed8-3f10-11e4-adec-0800271c1b75',
            name: 'Systolic Blood Pressure',
            datatype: 'Numeric',
            conceptClass: 'Misc',
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
            uuid: 'c36e9f4e-3f10-11e4-adec-0800271c1b75',
            name: 'Diastolic Blood Pressure',
            datatype: 'Numeric',
            conceptClass: 'Misc',
            lowNormal: 60,
            hiNormal: 80,
            lowAbsolute: 40,
            hiAbsolute: 150
          }
        }
      ]
    },

    // Row 3: Respiratory Rate and SpO2
    {
      type: 'obsControl',
      label: {
        type: 'label',
        value: 'Respiratory Rate (/min)'
      },
      properties: {
        mandatory: false,
        location: { row: 2, column: 0 }
      },
      id: 'respiratory-control',
      concept: {
        uuid: 'c36c7b28-3f10-11e4-adec-0800271c1b75',
        name: 'Respiratory Rate',
        datatype: 'Numeric',
        conceptClass: 'Misc',
        lowNormal: 12,
        hiNormal: 20,
        lowAbsolute: 8,
        hiAbsolute: 40
      }
    },
    {
      type: 'obsControl',
      label: {
        type: 'label',
        value: 'SpO2 (%)'
      },
      properties: {
        mandatory: false,
        location: { row: 2, column: 1 }
      },
      id: 'spo2-control',
      concept: {
        uuid: 'c36c7ce4-3f10-11e4-adec-0800271c1b75',
        name: 'Oxygen Saturation',
        datatype: 'Numeric',
        conceptClass: 'Misc',
        lowNormal: 95,
        hiNormal: 100,
        lowAbsolute: 70,
        hiAbsolute: 100
      }
    },

    // Row 4: Weight and Height
    {
      type: 'obsControl',
      label: {
        type: 'label',
        value: 'Weight (kg)'
      },
      properties: {
        mandatory: false,
        location: { row: 3, column: 0 }
      },
      id: 'weight-control',
      concept: {
        uuid: 'c36c7d5a-3f10-11e4-adec-0800271c1b75',
        name: 'Weight',
        datatype: 'Numeric',
        conceptClass: 'Misc'
      }
    },
    {
      type: 'obsControl',
      label: {
        type: 'label',
        value: 'Height (cm)'
      },
      properties: {
        mandatory: false,
        location: { row: 3, column: 1 }
      },
      id: 'height-control',
      concept: {
        uuid: 'c36c7dd6-3f10-11e4-adec-0800271c1b75',
        name: 'Height',
        datatype: 'Numeric',
        conceptClass: 'Misc'
      }
    },

    // Row 5: Chief Complaint (Text)
    {
      type: 'obsControl',
      label: {
        type: 'label',
        value: 'Chief Complaint'
      },
      properties: {
        mandatory: false,
        location: { row: 4, column: 0 }
      },
      id: 'complaint-control',
      concept: {
        uuid: 'c36c8094-3f10-11e4-adec-0800271c1b75',
        name: 'Chief Complaint',
        datatype: 'Text',
        conceptClass: 'Misc'
      }
    },

    // Row 6: Additional Notes
    {
      type: 'obsControl',
      label: {
        type: 'label',
        value: 'Additional Notes'
      },
      properties: {
        mandatory: false,
        location: { row: 5, column: 0 }
      },
      id: 'notes-control',
      concept: {
        uuid: 'c36c8110-3f10-11e4-adec-0800271c1b75',
        name: 'Additional Notes',
        datatype: 'Text',
        conceptClass: 'Misc'
      }
    }
  ],
  events: {
    onFormInit: `function(formContext, interceptor) {
      console.log('Vitals form initialized');
    }`
  }
};

/**
 * Sample existing observations (pre-populated data)
 */
export const sampleObservations = [
  {
    uuid: 'obs-temp-001',
    concept: {
      uuid: 'c36af094-3f10-11e4-adec-0800271c1b75',
      name: 'Temperature'
    },
    value: 37.2,
    formFieldPath: 'vitals-form-v1.1/temperature-control-0',
    encounterUuid: 'encounter-001',
    obsDateTime: '2024-10-24T10:30:00.000Z',
    voided: false
  },
  {
    uuid: 'obs-pulse-001',
    concept: {
      uuid: 'c36bc1a4-3f10-11e4-adec-0800271c1b75',
      name: 'Pulse'
    },
    value: 78,
    formFieldPath: 'vitals-form-v1.1/pulse-control-0',
    encounterUuid: 'encounter-001',
    obsDateTime: '2024-10-24T10:30:00.000Z',
    voided: false
  },
  {
    uuid: 'obs-systolic-001',
    concept: {
      uuid: 'c36e9ed8-3f10-11e4-adec-0800271c1b75',
      name: 'Systolic Blood Pressure'
    },
    value: 118,
    formFieldPath: 'vitals-form-v1.1/bp-group-0/systolic-control-0',
    encounterUuid: 'encounter-001',
    obsDateTime: '2024-10-24T10:30:00.000Z',
    voided: false
  },
  {
    uuid: 'obs-diastolic-001',
    concept: {
      uuid: 'c36e9f4e-3f10-11e4-adec-0800271c1b75',
      name: 'Diastolic Blood Pressure'
    },
    value: 75,
    formFieldPath: 'vitals-form-v1.1/bp-group-0/diastolic-control-0',
    encounterUuid: 'encounter-001',
    obsDateTime: '2024-10-24T10:30:00.000Z',
    voided: false
  }
];

/**
 * Sample patient data
 */
export const samplePatient = {
  uuid: 'patient-12345',
  name: 'John Doe',
  age: 45,
  gender: 'M',
  identifier: 'PAT-2024-001',
  birthdate: '1978-03-15'
};

/**
 * Sample translations
 */
export const sampleTranslations = {
  labels: {
    'TEMPERATURE_LABEL': 'Temperature',
    'PULSE_LABEL': 'Pulse Rate',
    'BP_LABEL': 'Blood Pressure',
    'BP_DESCRIPTION': 'Systolic and Diastolic blood pressure measurements'
  },
  concepts: {
    'Temperature': 'Temperature',
    'Pulse': 'Pulse Rate',
    'Blood Pressure': 'Blood Pressure',
    'Systolic Blood Pressure': 'Systolic',
    'Diastolic Blood Pressure': 'Diastolic'
  }
};
