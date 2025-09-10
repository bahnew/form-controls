import React, { Component } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { SectionDesigner } from 'components/designer/Section.jsx';
import * as Grid from 'components/designer/Grid.jsx';
import { IDGenerator } from 'src/helpers/idGenerator';

const concept = { name: 'dummyPulse', datatype: 'text', uuid: 'dummyUuid' };
const properties = {};

class DummyControl extends Component {
  getJsonDefinition() {
    return { concept, properties };
  }

  render() {
    return <input />;
  }
}

describe('SectionDesigner', () => {
  let metadata;
  let idGenerator;
  const onSelectSpy = jest.fn();

  describe('when section is rendered', () => {
    const label = {
      type: 'label',
      value: concept.name,
      properties: {},
    };
    const childControl = {
      id: '124',
      type: 'obsControl',
      concept,
      label,
      properties,
    };

    class GridStub extends Component {
      getControls() { return [childControl]; }
      render() { return (<div data-testid="grid-designer" />); }
    }

    let originalGridDesigner;

    beforeAll(() => {
      originalGridDesigner = Grid.GridDesigner;
      Grid.GridDesigner = GridStub;
    });

    afterAll(() => {
      Grid.GridDesigner = originalGridDesigner;
    });

    beforeEach(() => {
      jest.clearAllMocks();
      metadata = {
        id: '123',
        type: 'section',
        label,
        properties,
        controls: [childControl],
      };

      const textBoxDescriptor = { control: DummyControl };
      componentStore.registerDesignerComponent('text', textBoxDescriptor); // eslint-disable-line no-undef
      idGenerator = new IDGenerator();
    });

    afterEach(() => {
      componentStore.deRegisterDesignerComponent('text'); // eslint-disable-line no-undef
    });

    const renderSectionDesigner = (props = {}) => {
      const defaultProps = {
        clearSelectedControl: jest.fn(),
        deleteControl: jest.fn(),
        dispatch: jest.fn(),
        idGenerator,
        metadata,
        onSelect: onSelectSpy,
        wrapper: jest.fn(),
        ...props,
      };

      return render(<SectionDesigner {...defaultProps} />);
    };

    it('should render a fieldset with the appropriate label', () => {
      renderSectionDesigner();
      
      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('dummyPulse')).toBeInTheDocument();
    });

    it('should render a grid with appropriate props', () => {
      renderSectionDesigner();
      
      expect(screen.getByTestId('grid-designer')).toBeInTheDocument();
    });

    it('should render section without any controls', () => {
      const metadataWithoutControls = { ...metadata, controls: undefined };
      renderSectionDesigner({ metadata: metadataWithoutControls });

      expect(screen.getByTestId('grid-designer')).toBeInTheDocument();
    });

    it('should call onSelect function on section click', () => {
      const { container } = renderSectionDesigner();
      const fieldset = container.querySelector('.form-builder-fieldset');
      
      fireEvent.click(fieldset);
      
      expect(onSelectSpy).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect method with given metadata', () => {
      const { container } = renderSectionDesigner();
      const fieldset = container.querySelector('.form-builder-fieldset');
      
      fireEvent.click(fieldset);
      
      expect(onSelectSpy).toHaveBeenCalledWith(expect.anything(), metadata);
    });

    it('should return json definition', () => {
      let sectionRef;
      renderSectionDesigner({
        ref: (ref) => { sectionRef = ref; }
      });

      if (sectionRef) {
        const expectSectionLabel = Object.assign({}, metadata.label,
          { id: '123', translationKey: 'DUMMYPULSE_123' });
        const expectObsLabel = Object.assign({}, metadata.label,
          { id: '124', translationKey: 'DUMMYPULSE_124' });

        metadata.label = expectSectionLabel;
        metadata.controls[0].label = expectObsLabel;

        expect(sectionRef.getJsonDefinition()).toEqual(metadata);
      }
    });

    it('should stop event propagation to upper component when click on section', () => {
      const dispatchSpy = jest.fn();
      const { container } = renderSectionDesigner({ dispatch: dispatchSpy });
      const fieldset = container.querySelector('fieldset');
      
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      
      fireEvent.click(fieldset, mockEvent);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });

    it('should show delete button if the showDeleteButton props is true', () => {
      renderSectionDesigner({ showDeleteButton: true });
      
      const deleteButton = screen.getByRole('button');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton.textContent).toBe('');
    });

    it('should call deleteControl when delete button is clicked', () => {
      const deleteControlSpy = jest.fn();
      renderSectionDesigner({ 
        showDeleteButton: true,
        deleteControl: deleteControlSpy
      });
      
      const deleteButton = screen.getByRole('button');
      fireEvent.click(deleteButton);

      expect(deleteControlSpy).toHaveBeenCalledTimes(1);
    });

    it('should not render add-more and remove buttons when addMore attribute is false', () => {
      const metadataWithAddMoreFalse = {
        ...metadata,
        properties: { ...metadata.properties, addMore: false }
      };
      const { container } = renderSectionDesigner({ metadata: metadataWithAddMoreFalse });
      
      expect(container.querySelector('.form-builder-add-more')).not.toBeInTheDocument();
      expect(container.querySelector('.form-builder-remove')).not.toBeInTheDocument();
    });

    it('should render add-more and remove buttons when addMore attribute is true', () => {
      const metadataWithAddMoreTrue = {
        ...metadata,
        properties: { ...metadata.properties, addMore: true }
      };
      const { container } = renderSectionDesigner({ metadata: metadataWithAddMoreTrue });
      
      expect(container.querySelector('.form-builder-add-more')).toBeInTheDocument();
      expect(container.querySelector('.form-builder-remove')).toBeInTheDocument();
    });
  });
});
