import React, { Component } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ObsControlDesigner } from 'components/designer/ObsControlDesigner.jsx';
import ComponentStore from 'src/helpers/componentStore';

const concept = { name: 'dummyPulse', datatype: 'text', uuid: 'dummyUuid' };
const properties = {};
const conceptWithDesc = Object.assign({}, concept);
conceptWithDesc.description = { value: 'concept description' };

class DummyControl extends Component {
  getJsonDefinition() {
    return { concept, properties };
  }

  render() {
    return <input data-testid="dummy-input" />;
  }
}

class DummyControlWithDescription extends DummyControl {
  getJsonDefinition() {
    return { concept: conceptWithDesc, properties };
  }
}

describe('ObsControlDesigner', () => {
  let metadata;
  let mockOnSelect;
  let mockDeleteControl;
  let mockClearSelectedControl;

  beforeEach(() => {
    mockOnSelect = jest.fn();
    mockDeleteControl = jest.fn();
    mockClearSelectedControl = jest.fn();
  });

  describe('injectConceptToMetadata static method', () => {
    it('should inject concept to metadata', () => {
      metadata = { id: 'someId', type: 'obsControl' };
      const someConcept = {
        name: {
          name: 'someName',
        },
        datatype: {
          name: 'someDatatype',
        },
        conceptClass: {
          name: 'Misc',
        },
        uuid: 'someUuid',
        allowDecimal: false,
        handler: 'someHandler',
      };
      const expectedMetadata = {
        id: 'someId',
        type: 'obsControl',
        concept: {
          name: 'someName',
          description: undefined,
          datatype: 'someDatatype',
          conceptClass: 'Misc',
          uuid: 'someUuid',
          properties: { allowDecimal: false },
          answers: undefined,
          conceptHandler: 'someHandler',
        },
        units: undefined,
        hiNormal: undefined,
        lowNormal: undefined,
        hiAbsolute: undefined,
        lowAbsolute: undefined,
        label: {
          type: 'label',
          value: someConcept.name.name,
        },
      };
      const metadataWithConcept = ObsControlDesigner.injectConceptToMetadata(metadata, someConcept);
      expect(metadataWithConcept).toEqual(expectedMetadata);
    });
  });

  describe('when concept is not present', () => {
    beforeEach(() => {
      metadata = { id: '123', label: {}, type: 'obsControl', properties };
    });

    it('should render simple div when there is no concept', () => {
      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      expect(screen.getByText('Select Obs Source')).toBeInTheDocument();
    });

    it('should call onSelect function when clicked', () => {
      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      fireEvent.click(screen.getByText('Select Obs Source'));
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.any(Object),
        { id: '123', label: {}, properties: {}, type: 'obsControl' }
      );
    });

    it('should show delete button if the showDeleteButton props is true', () => {
      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={true}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should call deleteControl after delete button is clicked', () => {
      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={true}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(mockDeleteControl).toHaveBeenCalledTimes(1);
    });

    it('should return undefined for getJsonDefinition call', () => {
      let componentRef;
      render(
        <ObsControlDesigner
          ref={(ref) => { componentRef = ref; }}
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      const json = componentRef.getJsonDefinition();
      expect(json).toBeUndefined();
    });
  });

  describe('when concept is present', () => {
    const label = {
      type: 'label',
      value: concept.name,
      properties: {},
    };

    beforeEach(() => {
      metadata = {
        id: '123',
        type: 'obsControl',
        concept,
        label,
        properties,
      };

      const textBoxDescriptor = { control: DummyControl };
      ComponentStore.registerDesignerComponent('text', textBoxDescriptor);
    });

    afterEach(() => {
      ComponentStore.deRegisterDesignerComponent('text');
    });

    it('should render label and obsControl of appropriate displayType', () => {
      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      expect(screen.getByTestId('dummy-input')).toBeInTheDocument();
      expect(screen.getByText('dummyPulse')).toBeInTheDocument();
    });

    it('should not display asterisk when field is not mandatory', () => {
      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('should display asterisk when field is mandatory', () => {
      const mandatoryMetadata = {
        ...metadata,
        properties: { mandatory: true },
      };

      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={mandatoryMetadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      const asterisk = screen.getByText('*');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass('form-builder-asterisk');
    });

    it('should pass appropriate props to Label', () => {
      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      const labelElement = screen.getByText('dummyPulse');
      expect(labelElement).toBeInTheDocument();
    });

    it('should not render obsControl if there is no registered designer component', () => {
      ComponentStore.deRegisterDesignerComponent('text');
      const conceptClone = { ...concept, datatype: 'somethingRandom' };
      const metadataClone = { ...metadata, concept: conceptClone };

      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadataClone}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      expect(screen.queryByTestId('dummy-input')).not.toBeInTheDocument();
      expect(screen.getByText('Select Obs Source')).toBeInTheDocument();
    });

    it('should call onSelect function when form field wrap is clicked', () => {
      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      fireEvent.click(screen.getByText('dummyPulse').closest('.form-field-wrap'));
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(expect.any(Object), metadata);
    });

    it('should render comment if notes is configured', () => {
      const notesMetadata = {
        ...metadata,
        properties: { notes: true },
      };

      const { container } = render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={notesMetadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      expect(container.querySelector('.form-builder-comment-toggle')).toBeInTheDocument();
    });

    it('should not render comment if notes is not configured', () => {
      const { container } = render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      expect(container.querySelector('.form-builder-comment-toggle')).not.toBeInTheDocument();
    });

    it('should hide label if hideLabel is true', () => {
      const hideLabelMetadata = {
        ...metadata,
        properties: { hideLabel: true },
      };

      const { container } = render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={hideLabelMetadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      expect(container.querySelector('.hidden-label')).toBeInTheDocument();
    });

    it('should show label when hideLabel is set to false', () => {
      const showLabelMetadata = {
        ...metadata,
        properties: { hideLabel: false },
      };

      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={showLabelMetadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      expect(screen.getByText('dummyPulse')).toBeInTheDocument();
    });

    it('should show delete button if the showDeleteButton props is true', () => {
      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={true}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show script button if control has onValueChange events', () => {
      const eventsMetadata = {
        ...metadata,
        events: { onValueChange: 'some content' },
      };

      const { container } = render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={eventsMetadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      const scriptIcon = container.querySelector('.fa-code.script-circle');
      expect(scriptIcon).toBeInTheDocument();
    });

    it('should call deleteControl after delete button is clicked', () => {
      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={true}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(mockDeleteControl).toHaveBeenCalledTimes(1);
    });

    it('should render abnormal button if abnormal is configured', () => {
      const abnormalMetadata = {
        ...metadata,
        properties: { abnormal: true },
      };

      render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={abnormalMetadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      expect(screen.getByText('Abnormal')).toBeInTheDocument();
    });

    it('should return json definition with units', () => {
      const metadataWithUnits = { ...metadata, units: '/min' };
      let componentRef;
      
      render(
        <ObsControlDesigner
          ref={(ref) => { componentRef = ref; }}
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadataWithUnits}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      const json = componentRef.getJsonDefinition();
      expect(json.concept).toEqual(concept);
      expect(json.label.value).toBe('dummyPulse');
      expect(json.label.units).toBe('(/min)');
      expect(json.properties).toEqual({});
    });
  });

  describe('when concept has description', () => {
    const label = {
      type: 'label',
      value: concept.name,
      properties: {},
    };

    beforeEach(() => {
      metadata = {
        id: '123',
        type: 'obsControl',
        concept: conceptWithDesc,
        label,
        properties,
      };

      const textBoxDescriptor = { control: DummyControlWithDescription };
      ComponentStore.registerDesignerComponent('text', textBoxDescriptor);
    });

    afterEach(() => {
      ComponentStore.deRegisterDesignerComponent('text');
    });

    it('should show help tooltip if concept description is present', () => {
      const { container } = render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      const tooltipTrigger = container.querySelector('.fa-question-circle.form-builder-tooltip-trigger');
      expect(tooltipTrigger).toBeInTheDocument();
    });

    it('should toggle help text when tooltip is clicked', () => {
      const { container } = render(
        <ObsControlDesigner
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      const tooltipTrigger = container.querySelector('.fa-question-circle.form-builder-tooltip-trigger');
      
      expect(screen.getByText('concept description')).toBeInTheDocument();
      
      fireEvent.click(tooltipTrigger);
      const tooltipWrapper = container.querySelector('.form-builder-tooltip-wrap.active');
      expect(tooltipWrapper).toBeInTheDocument();
    });

    it('should include translationKey if description is present', () => {
      let componentRef;
      
      render(
        <ObsControlDesigner
          ref={(ref) => { componentRef = ref; }}
          clearSelectedControl={mockClearSelectedControl}
          deleteControl={mockDeleteControl}
          metadata={metadata}
          onSelect={mockOnSelect}
          showDeleteButton={false}
        />
      );

      const json = componentRef.getJsonDefinition();
      expect(json.concept.description.translationKey).toBe('DUMMYPULSE_123_DESC');
      expect(json.label.translationKey).toBe('DUMMYPULSE_123');
    });
  });
});
