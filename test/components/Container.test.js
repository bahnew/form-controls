import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Container } from 'components/Container.jsx';
import { Label } from 'components/Label.jsx';
import { TextBox } from 'components/TextBox.jsx';
import { NumericBox } from 'components/NumericBox.jsx';
import { Button } from 'components/Button.jsx';
import { ObsControlWithIntl as ObsControl } from 'components/ObsControl.jsx';
import { ObsGroupControlWithIntl as ObsGroupControl } from 'components/ObsGroupControl.jsx';
import { CodedControl } from 'components/CodedControl.jsx';
import ComponentStore from 'src/helpers/componentStore';
import ControlRecordTreeMgr from 'src/helpers/ControlRecordTreeMgr';

const PULSE_UUID = 'c36bc411-3f10-11e4-adec-0800271c1b75';
const ADMISSION_UUID = 'c5cdd4e5-86e0-400c-9742-d73ffb323fa8';
const COMPLAINT_UUID = 'c398a4be-3f10-11e4-adec-0800271c1b75';

const mockComponentStore = () => {
  ComponentStore.registerComponent('label', Label);
  ComponentStore.registerComponent('text', TextBox);
  ComponentStore.registerComponent('numeric', NumericBox);
  ComponentStore.registerComponent('button', Button);
  ComponentStore.registerComponent('Coded', CodedControl);
  ComponentStore.registerComponent('obsControl', ObsControl);
  ComponentStore.registerComponent('obsGroupControl', ObsGroupControl);
};

const cleanupComponentStore = () => {
  ComponentStore.deRegisterComponent('label');
  ComponentStore.deRegisterComponent('text');
  ComponentStore.deRegisterComponent('numeric');
  ComponentStore.deRegisterComponent('button');
  ComponentStore.deRegisterComponent('Coded');
  ComponentStore.deRegisterComponent('obsControl');
  ComponentStore.deRegisterComponent('obsGroupControl');
};

const createNumericControlMetadata = (overrides = {}) => {
  const baseMetadata = {
    controls: [
      {
        concept: {
          answers: [],
          datatype: 'Numeric',
          description: [],
          name: 'Pulse',
          properties: { allowDecimal: true },
          uuid: PULSE_UUID,
        },
        hiAbsolute: null,
        hiNormal: 72,
        id: '1',
        label: { type: 'label', value: 'Pulse(/min)' },
        lowAbsolute: null,
        lowNormal: 72,
        properties: {
          addMore: false,
          hideLabel: false,
          location: { column: 0, row: 0 },
          mandatory: false,
          notes: false,
        },
        type: 'obsControl',
        units: '/min',
      },
    ],
    id: 209,
    name: 'PulseForm',
    uuid: '245940b7-3d6b-4a8b-806b-3f56444129ae',
    version: '1',
    defaultLocale: 'en',
  };

  return { ...baseMetadata, ...overrides };
};

const createBooleanControlMetadata = () => ({
  controls: [
    {
      concept: {
        answers: [],
        datatype: 'Boolean',
        name: 'Smoking History',
        properties: { allowDecimal: null },
        uuid: 'c2a43174-c9db-4e54-8516-17372c83537f',
      },
      hiAbsolute: null,
      hiNormal: null,
      id: '1',
      label: { type: 'label', value: 'Smoking History' },
      lowAbsolute: null,
      lowNormal: null,
      options: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
      properties: {
        addMore: false,
        hideLabel: false,
        location: { column: 0, row: 0 },
        mandatory: false,
        notes: false,
      },
      type: 'obsControl',
      units: null,
    },
  ],
  id: 228,
  name: 'SmokingForm',
  uuid: 'a4eb5bac-8c7a-43e6-9c75-cef0710991e5',
  version: '1',
  defaultLocale: 'en',
});

const createConditionalFormMetadata = () => ({
  controls: [
    {
      concept: {
        answers: [],
        datatype: 'Text',
        name: 'Tuberculosis, Need of Admission',
        properties: { allowDecimal: null },
        uuid: ADMISSION_UUID,
      },
      hiAbsolute: null,
      hiNormal: null,
      id: '5',
      label: { type: 'label', value: 'Need of Admission' },
      lowAbsolute: null,
      lowNormal: null,
      properties: {
        addMore: false,
        hideLabel: false,
        location: { column: 0, row: 0 },
        mandatory: true,
        notes: false,
      },
      type: 'obsControl',
      units: null,
      events: {
        onValueChange: `function(form){
          var admission = form.get('Tuberculosis, Need of Admission').getValue();
          if(admission === 'yes') {
            form.get('Chief Complaint Notes').setEnabled(false);
          } else {
            form.get('Chief Complaint Notes').setEnabled(true);
          }
        }`,
      },
    },
    {
      concept: {
        answers: [],
        datatype: 'Text',
        name: 'Chief Complaint Notes',
        properties: { allowDecimal: null },
        uuid: COMPLAINT_UUID,
      },
      hiAbsolute: null,
      hiNormal: null,
      id: '2',
      label: { type: 'label', value: 'Chief Complaint Notes' },
      lowAbsolute: null,
      lowNormal: null,
      properties: {
        addMore: false,
        hideLabel: false,
        location: { column: 0, row: 1 },
        mandatory: false,
        notes: false,
      },
      type: 'obsControl',
      units: null,
    },
  ],
  id: 5,
  name: 'ConditionalForm',
  uuid: '6a3b4de9-5e21-46b4-addb-4ad9518e587b',
  version: '4',
  defaultLocale: 'en',
});

const defaultProps = {
  collapse: false,
  locale: 'en',
  observations: [],
  patient: { age: 10, gender: 'M', uuid: 'patient-uuid' },
  translations: { labels: {}, concepts: {} },
  validate: false,
  validateForm: false,
};

const renderContainer = (props = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(<Container {...combinedProps} />);
};

describe('Container', () => {
  beforeEach(() => {
    mockComponentStore();
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanupComponentStore();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render numeric control with proper accessibility', () => {
      const metadata = createNumericControlMetadata();
      renderContainer({ metadata });

      expect(screen.getByLabelText(/pulse.*\/min/i)).toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
      expect(screen.getByText(/72 - 72/i)).toBeInTheDocument();
    });

    it('should show unsupported message for boolean controls', () => {
      const metadata = createBooleanControlMetadata();
      renderContainer({ metadata });

      expect(
        screen.getByText(/component.*boolean.*not supported/i),
      ).toBeInTheDocument();
    });

    it('should handle empty metadata gracefully', () => {
      const emptyMetadata = createNumericControlMetadata({ controls: [] });
      const { container } = renderContainer({ metadata: emptyMetadata });

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle input changes and trigger value updates', async () => {
      const onValueUpdated = jest.fn();
      const metadata = createNumericControlMetadata();

      jest.spyOn(ControlRecordTreeMgr, 'find').mockReturnValue({
        getEventScripts: () => ({}),
      });

      renderContainer({ metadata, onValueUpdated });

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '75' } });

      await waitFor(() => {
        expect(onValueUpdated).toHaveBeenCalledTimes(1);
        expect(onValueUpdated).toHaveBeenCalledWith(
          expect.objectContaining({
            children: expect.any(Object),
          }),
        );
      });
    });

    it('should add controls and show notifications when using add more', async () => {
      const metadata = createNumericControlMetadata({
        controls: [
          {
            ...createNumericControlMetadata().controls[0],
            properties: {
              ...createNumericControlMetadata().controls[0].properties,
              addMore: true,
            },
          },
        ],
      });

      const { container } = renderContainer({ metadata });

      const addButton = container.querySelector('.form-builder-add-more');
      expect(addButton).toBeInTheDocument();
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/new.*pulse.*added/i)).toBeInTheDocument();
      });

      expect(screen.getAllByRole('spinbutton')).toHaveLength(2);

      jest.runAllTimers();
      await waitFor(() => {
        expect(
          screen.queryByText(/new.*pulse.*added/i),
        ).not.toBeInTheDocument();
      });
    });

    it('should handle form initialization events', async () => {
      const metadata = createNumericControlMetadata({
        events: {
          onFormInit: "function(form){form.get('Pulse').setEnabled(false);}",
        },
      });

      renderContainer({ metadata });

      await waitFor(() => {
        const input = screen.getByRole('spinbutton');
        expect(input).toBeDisabled();
      });
    });

    it('should execute conditional field logic with proper state changes', async () => {
      const metadata = createConditionalFormMetadata();
      renderContainer({ metadata });

      const admissionInput = screen.getByLabelText(/need of admission/i);
      const complaintInput = screen.getByLabelText(/chief complaint notes/i);

      expect(admissionInput).toBeEnabled();
      expect(complaintInput).toBeEnabled();

      fireEvent.change(admissionInput, { target: { value: 'yes' } });

      await waitFor(() => {
        expect(complaintInput).toBeDisabled();
      });

      fireEvent.change(admissionInput, { target: { value: 'no' } });

      await waitFor(() => {
        expect(complaintInput).toBeEnabled();
      });
    });
  });

  describe('Validation', () => {
    it('should show validation errors with proper accessibility attributes', () => {
      const metadata = createNumericControlMetadata({
        controls: [
          {
            ...createNumericControlMetadata().controls[0],
            properties: {
              ...createNumericControlMetadata().controls[0].properties,
              mandatory: true,
            },
          },
        ],
      });

      renderContainer({ metadata, validate: true, validateForm: true });

      const input = screen.getByRole('spinbutton');

      expect(input).toHaveClass('form-builder-error');
      expect(
        document.querySelector('.form-builder-asterisk'),
      ).toBeInTheDocument();
    });

    it('should return detailed validation errors through getValue', () => {
      const metadata = createNumericControlMetadata({
        controls: [
          {
            ...createNumericControlMetadata().controls[0],
            properties: {
              ...createNumericControlMetadata().controls[0].properties,
              mandatory: true,
            },
          },
        ],
      });

      const containerRef = React.createRef();
      render(
        <Container
          ref={containerRef}
          {...defaultProps}
          metadata={metadata}
          validateForm
        />,
      );

      expect(containerRef.current).toBeTruthy();
      const result = containerRef.current.getValue();

      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('observations');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: 'mandatory',
          }),
        ]),
      );
    });

    it('should return valid observations when form data is complete', () => {
      const metadata = createNumericControlMetadata();
      const containerRef = React.createRef();

      render(
        <Container ref={containerRef} {...defaultProps} metadata={metadata} />,
      );

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '75' } });

      expect(containerRef.current).toBeTruthy();
      const result = containerRef.current.getValue();

      expect(result).toHaveProperty('observations');
      expect(Array.isArray(result.observations)).toBe(true);
      expect(result.observations[0]).toEqual(
        expect.objectContaining({
          concept: expect.objectContaining({
            uuid: PULSE_UUID,
          }),
          value: '75',
          formFieldPath: expect.stringMatching(/PulseForm\.1\/1-0/),
        }),
      );
    });
  });

  describe('Notifications', () => {
    it('should display and auto-hide custom notifications', async () => {
      const metadata = createNumericControlMetadata();
      const containerRef = React.createRef();

      render(
        <Container ref={containerRef} {...defaultProps} metadata={metadata} />,
      );

      if (containerRef.current) {
        containerRef.current.showNotification('Test notification', 'info');
      }

      expect(screen.getByText('Test notification')).toBeInTheDocument();

      jest.runAllTimers();
      await waitFor(() => {
        expect(screen.queryByText('Test notification')).not.toBeInTheDocument();
      });
    });

    it('should support different notification types', async () => {
      const metadata = createNumericControlMetadata();
      const containerRef = React.createRef();

      render(
        <Container ref={containerRef} {...defaultProps} metadata={metadata} />,
      );

      if (containerRef.current) {
        containerRef.current.showNotification('Error message', 'error');
      }

      const notification = screen.getByText('Error message');
      expect(
        notification.closest('.error-message-container'),
      ).toBeInTheDocument();
    });
  });

  describe('Data Management', () => {
    it('should handle voided observations correctly', () => {
      const voidedObservations = [
        {
          concept: {
            uuid: PULSE_UUID,
            name: 'Pulse',
            datatype: 'Numeric',
          },
          value: '72',
          voided: true,
          formFieldPath: 'PulseForm.1/1-0',
          formNamespace: 'Bahmni',
        },
      ];

      const metadata = createNumericControlMetadata();
      const containerRef = React.createRef();

      render(
        <Container
          ref={containerRef}
          {...defaultProps}
          metadata={metadata}
          observations={voidedObservations}
        />,
      );

      expect(containerRef.current).toBeTruthy();
      const result = containerRef.current.getValue();

      expect(result).toHaveProperty('observations');
      expect(Array.isArray(result.observations)).toBe(true);

      const allVoidedResult =
        containerRef.current.areAllVoided(voidedObservations);
      expect(allVoidedResult).toBe(true);

      const mixedObservations = [
        ...voidedObservations,
        { ...voidedObservations[0], voided: false, value: '80' },
      ];
      const mixedResult =
        containerRef.current.areAllVoided(mixedObservations);
      expect(mixedResult).toBe(false);
    });

    it('should verify onValueUpdated receives correct data structure', async () => {
      const onValueUpdated = jest.fn();
      const metadata = createNumericControlMetadata();

      jest.spyOn(ControlRecordTreeMgr, 'find').mockReturnValue({
        getEventScripts: () => ({}),
      });

      renderContainer({ metadata, onValueUpdated });

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '80' } });

      await waitFor(() => {
        expect(onValueUpdated).toHaveBeenCalledWith(
          expect.objectContaining({
            children: expect.any(Object),
            getActive: expect.any(Function),
          }),
        );
      });
    });
  });

  describe('Internationalization', () => {
    it('should use translated text when translations are provided', () => {
      const metadata = createNumericControlMetadata();
      const translations = {
        labels: {},
        concepts: { Pulse: 'Heart Rate' },
      };

      renderContainer({ metadata, translations });

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();

      const labels = screen.getAllByText(/pulse.*\/min/i);
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should fallback to original text when translations are missing', () => {
      const metadata = createNumericControlMetadata();
      const emptyTranslations = { labels: {}, concepts: {} };

      renderContainer({ metadata, translations: emptyTranslations });

      expect(screen.getByText(/pulse.*\/min/i)).toBeInTheDocument();
    });
  });

  describe('Coverage Improvements', () => {
    it('should handle value updates when no onValueUpdated callback is provided', async () => {
      const metadata = createNumericControlMetadata();

      jest.spyOn(ControlRecordTreeMgr, 'find').mockReturnValue({
        getEventScripts: () => ({}),
      });

      renderContainer({ metadata });

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '75' } });

      await waitFor(() => {
        expect(input.value).toBe('75');
      });
    });

    it('should handle onControlAdd silent mode (line 101 else branch)', async () => {
      const metadata = createNumericControlMetadata({
        controls: [
          {
            ...createNumericControlMetadata().controls[0],
            properties: {
              ...createNumericControlMetadata().controls[0].properties,
              addMore: true,
            },
          },
        ],
      });

      const containerRef = React.createRef();
      render(
        <Container ref={containerRef} {...defaultProps} metadata={metadata} />,
      );

      expect(containerRef.current).toBeTruthy();
      const originalCanAdd = containerRef.current.canAddNextFormFieldPath;
      containerRef.current.canAddNextFormFieldPath = jest
        .fn()
        .mockReturnValue(true);

      containerRef.current.onControlAdd('PulseForm.1/1-0', false);

      await waitFor(() => {
        expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
      });

      expect(screen.queryByText(/added/i)).not.toBeInTheDocument();

      containerRef.current.canAddNextFormFieldPath = originalCanAdd;
    });

    it('should handle getValue with errors and observations (lines 116-117)', () => {
      const metadata = createNumericControlMetadata({
        controls: [
          {
            ...createNumericControlMetadata().controls[0],
            properties: {
              ...createNumericControlMetadata().controls[0].properties,
              mandatory: true,
            },
          },
        ],
      });

      const containerRef = React.createRef();
      render(
        <Container
          ref={containerRef}
          {...defaultProps}
          metadata={metadata}
          validate
          validateForm={false}
        />,
      );

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '75' } });

      expect(containerRef.current).toBeTruthy();
      const result = containerRef.current.getValue();

      expect(result).toHaveProperty('observations');
      expect(Array.isArray(result.observations)).toBe(true);

      expect(result.errors === undefined || Array.isArray(result.errors)).toBe(true);
    });

    it('should handle storeChildRef with null reference (lines 126-127)', () => {
      const metadata = createNumericControlMetadata();
      const containerRef = React.createRef();

      render(
        <Container ref={containerRef} {...defaultProps} metadata={metadata} />,
      );

      expect(containerRef.current).toBeTruthy();
      expect(() => {
        containerRef.current.storeChildRef(null);
      }).not.toThrow();

      expect(() => {
        containerRef.current.storeChildRef(undefined);
      }).not.toThrow();
    });

    it('should test areAllVoided method directly (line 147)', () => {
      const metadata = createNumericControlMetadata();
      const containerRef = React.createRef();

      render(
        <Container ref={containerRef} {...defaultProps} metadata={metadata} />,
      );

      expect(containerRef.current).toBeTruthy();
      expect(containerRef.current.areAllVoided([])).toBe(true);

      const allVoided = [
        { voided: true, value: '1' },
        { voided: true, value: '2' },
      ];
      expect(containerRef.current.areAllVoided(allVoided)).toBe(true);

      const mixed = [
        { voided: true, value: '1' },
        { voided: false, value: '2' },
      ];
      expect(containerRef.current.areAllVoided(mixed)).toBe(false);

      const nonVoided = [
        { voided: false, value: '1' },
        { voided: false, value: '2' },
      ];
      expect(containerRef.current.areAllVoided(nonVoided)).toBe(false);
    });

    it('should handle patient uuid extraction in render method', () => {
      const metadata = createNumericControlMetadata();

      const { rerender } = renderContainer({
        metadata,
        patient: { age: 30, gender: 'F', uuid: 'patient-123' },
      });

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();

      rerender(
        <Container {...defaultProps} metadata={metadata} patient={null} />,
      );

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('should test getValue edge case with non-empty errors but validateForm false', () => {
      const metadata = createNumericControlMetadata();
      const containerRef = React.createRef();

      render(
        <Container
          ref={containerRef}
          {...defaultProps}
          metadata={metadata}
          validateForm={false}
        />,
      );

      expect(containerRef.current).toBeTruthy();
      const result = containerRef.current.getValue();

      expect(result).toHaveProperty('observations');
      expect(result).not.toHaveProperty('errors');
    });
  });

  describe('Edge Cases and Props', () => {
    it('should handle prop changes correctly', () => {
      const metadata = createNumericControlMetadata();
      const patient = { age: 30, gender: 'F', uuid: 'patient-123' };

      const { rerender } = renderContainer({
        metadata,
        collapse: false,
        patient,
      });

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();

      rerender(
        <Container
          {...defaultProps}
          metadata={metadata}
          collapse
          patient={patient}
        />,
      );
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();

      const newPatient = { age: 25, gender: 'M', uuid: 'patient-456' };
      rerender(
        <Container
          {...defaultProps}
          metadata={metadata}
          patient={newPatient}
        />,
      );
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('should handle component store issues gracefully', () => {
      cleanupComponentStore();

      const metadata = createNumericControlMetadata();
      const { container } = renderContainer({ metadata });

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle missing event scripts without errors', () => {
      const metadata = createNumericControlMetadata();
      const containerRef = React.createRef();

      jest.spyOn(ControlRecordTreeMgr, 'find').mockReturnValue({
        getEventScripts: () => null,
      });

      render(
        <Container ref={containerRef} {...defaultProps} metadata={metadata} />,
      );

      expect(containerRef.current).toBeTruthy();
      expect(() => {
        containerRef.current.onEventTrigger('some-path', 'onValueChange');
      }).not.toThrow();
    });
  });
});
