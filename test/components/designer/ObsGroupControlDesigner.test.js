import React, { Component } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ObsGroupControlDesigner } from 'components/designer/ObsGroupControlDesigner.jsx';
import { IDGenerator } from 'src/helpers/idGenerator';
import ComponentStore from 'src/helpers/componentStore';

const concept = { name: 'dummyPulse', datatype: 'text', uuid: 'dummyUuid' };
const properties = {};
const conceptWithDesc = Object.assign({}, concept);
conceptWithDesc.description = { value: 'concept set description' };

class DummyControl extends Component {
  getJsonDefinition() {
    return { concept, properties };
  }

  render() {
    return <input />;
  }
}

class DummyControlWithDescription extends DummyControl {
  getJsonDefinition() {
    return { concept: conceptWithDesc, properties };
  }
}

class MockWrapper extends Component {
  constructor(props) {
    super(props);
    this.getJsonDefinition = this.getJsonDefinition.bind(this);
  }

  getJsonDefinition() {
    if (this.props.metadata && this.props.metadata.concept) {
      return {
        id: this.props.metadata.id,
        type: this.props.metadata.type,
        concept: this.props.metadata.concept,
        label: this.props.metadata.label,
        properties: this.props.metadata.properties,
        controls: []
      };
    }
    return undefined;
  }

  render() {
    return <div data-testid="mock-wrapper">{this.props.children}</div>;
  }
}

describe('ObsGroupControlDesigner', () => {
  let metadata;
  let onSelectSpy;

  beforeEach(() => {
    onSelectSpy = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should inject concept to metadata', () => {
    metadata = { id: 'someId', type: 'obsGroupControl' };
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
      handler: 'someHandler',
      uuid: 'someUuid',
      allowDecimal: false,
      set: true,
      setMembers: [],
    };

    const expectedMetadata = {
      id: 'someId',
      type: 'obsGroupControl',
      concept: {
        name: 'someName',
        datatype: 'someDatatype',
        conceptClass: 'Misc',
        conceptHandler: 'someHandler',
        uuid: 'someUuid',
        set: true,
        setMembers: [],
        description: undefined,
      },
      label: {
        type: 'label',
        value: someConcept.name.name,
      },
      properties: {
        addMore: false,
        location: { row: 0, column: 0 },
      },
      controls: [],
    };
    const metadataWithConcept = ObsGroupControlDesigner.injectConceptToMetadata(
      metadata,
      someConcept,
      new IDGenerator()
    );
    expect(metadataWithConcept).toEqual(expectedMetadata);
  });

  describe('when concept is not present', () => {
    beforeEach(() => {
      metadata = { id: '123', label: {}, type: 'obsControl', properties };
    });

    it('should render simple div with select message', () => {
      const idGenerator = new IDGenerator();
      render(
        <ObsGroupControlDesigner
          clearSelectedControl={() => {}}
          deleteControl={() => {}}
          idGenerator={idGenerator}
          metadata={metadata}
          onSelect={onSelectSpy}
          wrapper={MockWrapper}
        />
      );

      expect(screen.getByText('Select ObsGroup Source')).toBeInTheDocument();
    });

    it('should call onSelect function when clicked', () => {
      const idGenerator = new IDGenerator();
      render(
        <ObsGroupControlDesigner
          clearSelectedControl={() => {}}
          deleteControl={() => {}}
          idGenerator={idGenerator}
          metadata={metadata}
          onSelect={onSelectSpy}
          wrapper={MockWrapper}
        />
      );

      const selectDiv = screen.getByText('Select ObsGroup Source');
      fireEvent.click(selectDiv);

      expect(onSelectSpy).toHaveBeenCalledTimes(1);
      expect(onSelectSpy).toHaveBeenCalledWith(
        expect.any(Object),
        { id: '123', label: {}, properties: {}, type: 'obsControl' }
      );
    });

    it('should return undefined for getJsonDefinition call', () => {
      const idGenerator = new IDGenerator();
      let componentRef;
      render(
        <ObsGroupControlDesigner
          ref={(ref) => { componentRef = ref; }}
          clearSelectedControl={() => {}}
          deleteControl={() => {}}
          idGenerator={idGenerator}
          metadata={metadata}
          onSelect={onSelectSpy}
          wrapper={MockWrapper}
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
    const childControl = {
      id: '124',
      type: 'obsControl',
      concept,
      label,
      properties: {
        location: { row: 0, column: 0 }
      },
    };

    beforeEach(() => {
      metadata = {
        id: '123',
        type: 'obsGroupControl',
        concept,
        label,
        properties,
        controls: [childControl],
      };

      const textBoxDescriptor = { control: DummyControl };
      ComponentStore.registerDesignerComponent('text', textBoxDescriptor);
    });

    afterEach(() => {
      ComponentStore.deRegisterDesignerComponent('text');
    });

    it('should render add more when addMore property is true', () => {
      const newProperties = Object.assign({}, metadata.properties, { addMore: true });
      const newMetadata = Object.assign({}, metadata, { properties: newProperties });
      const idGenerator = new IDGenerator();

      render(
        <ObsGroupControlDesigner
          clearSelectedControl={() => {}}
          deleteControl={() => {}}
          idGenerator={idGenerator}
          metadata={newMetadata}
          onSelect={onSelectSpy}
          wrapper={MockWrapper}
        />
      );

      const addMoreContainer = screen.getByRole('group').querySelector('.form-builder-clone');
      expect(addMoreContainer).toBeInTheDocument();
      expect(addMoreContainer.querySelector('.form-builder-add-more')).toBeInTheDocument();
    });

    it('should render fieldset with appropriate label', () => {
      const idGenerator = new IDGenerator();
      render(
        <ObsGroupControlDesigner
          clearSelectedControl={() => {}}
          deleteControl={() => {}}
          idGenerator={idGenerator}
          metadata={metadata}
          onSelect={onSelectSpy}
          wrapper={MockWrapper}
        />
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('dummyPulse')).toBeInTheDocument();
    });

    it('should render grid component', () => {
      const idGenerator = new IDGenerator();
      render(
        <ObsGroupControlDesigner
          clearSelectedControl={() => {}}
          deleteControl={() => {}}
          idGenerator={idGenerator}
          metadata={metadata}
          onSelect={onSelectSpy}
          wrapper={MockWrapper}
        />
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
      const fieldset = screen.getByRole('group');
      expect(fieldset.querySelector('.obsGroup-controls')).toBeInTheDocument();
    });

    it('should call onSelect function when fieldset is clicked', () => {
      const idGenerator = new IDGenerator();
      render(
        <ObsGroupControlDesigner
          clearSelectedControl={() => {}}
          deleteControl={() => {}}
          idGenerator={idGenerator}
          metadata={metadata}
          onSelect={onSelectSpy}
          wrapper={MockWrapper}
        />
      );

      const fieldset = screen.getByRole('group');
      fireEvent.click(fieldset);

      expect(onSelectSpy).toHaveBeenCalledTimes(1);
      expect(onSelectSpy).toHaveBeenCalledWith(expect.any(Object), metadata);
    });

    it('should return json definition with translation key', () => {
      const idGenerator = new IDGenerator();
      let componentRef;
      render(
        <ObsGroupControlDesigner
          ref={(ref) => { componentRef = ref; }}
          clearSelectedControl={() => {}}
          deleteControl={() => {}}
          idGenerator={idGenerator}
          metadata={metadata}
          onSelect={onSelectSpy}
          wrapper={MockWrapper}
        />
      );

      expect(componentRef).toBeDefined();
      const result = componentRef.getJsonDefinition();
      expect(result).toBeDefined();
      expect(result.label).toBeDefined();
      expect(result.label.translationKey).toBe('DUMMYPULSE_123');
      expect(result.controls).toHaveLength(1);
      expect(result.controls[0].id).toBe('124');
      expect(result.id).toBe('123');
    });

    it('should show delete button when showDeleteButton prop is true', () => {
      const idGenerator = new IDGenerator();
      render(
        <ObsGroupControlDesigner
          clearSelectedControl={() => {}}
          deleteControl={() => {}}
          idGenerator={idGenerator}
          metadata={metadata}
          onSelect={onSelectSpy}
          showDeleteButton={true}
          wrapper={MockWrapper}
        />
      );

      const deleteButton = screen.getByRole('button');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveClass('remove-control-button');
    });

    it('should call deleteControl when delete button is clicked', () => {
      const deleteControlSpy = jest.fn();
      const clearSelectedControlSpy = jest.fn();
      const idGenerator = new IDGenerator();
      render(
        <ObsGroupControlDesigner
          clearSelectedControl={clearSelectedControlSpy}
          deleteControl={deleteControlSpy}
          dispatch={() => {}}
          idGenerator={idGenerator}
          metadata={metadata}
          onSelect={() => {}}
          showDeleteButton={true}
          wrapper={MockWrapper}
        />
      );

      const deleteButton = screen.getByRole('button');
      fireEvent.click(deleteButton);

      expect(deleteControlSpy).toHaveBeenCalledTimes(1);
      expect(clearSelectedControlSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('when concept set has description', () => {
    const label = {
      type: 'label',
      value: concept.name,
      properties: {},
    };

    beforeEach(() => {
      metadata = {
        id: '123',
        type: 'obsGroupControl',
        concept: conceptWithDesc,
        label,
        properties,
        controls: [],
      };

      const textBoxDescriptor = { control: DummyControlWithDescription };
      ComponentStore.registerDesignerComponent('text', textBoxDescriptor);
    });

    afterEach(() => {
      ComponentStore.deRegisterDesignerComponent('text');
    });

    it('should show concept description when present', () => {
      const idGenerator = new IDGenerator();
      render(
        <ObsGroupControlDesigner
          clearSelectedControl={() => {}}
          deleteControl={() => {}}
          idGenerator={idGenerator}
          metadata={metadata}
          onSelect={onSelectSpy}
          wrapper={{}}
        />
      );

      expect(screen.getByText('concept set description')).toBeInTheDocument();
    });

    it('should include translationKey in json definition when description is present', () => {
      const idGenerator = new IDGenerator();
      let componentRef;
      render(
        <ObsGroupControlDesigner
          ref={(ref) => { componentRef = ref; }}
          clearSelectedControl={() => {}}
          deleteControl={() => {}}
          idGenerator={idGenerator}
          metadata={metadata}
          onSelect={onSelectSpy}
          wrapper={{}}
        />
      );

      expect(componentRef).toBeDefined();
      const result = componentRef.getJsonDefinition();
      expect(result).toBeDefined();
      expect(result.concept.description.translationKey).toBe('DUMMYPULSE_123_DESC');
      expect(result.label.translationKey).toBe('DUMMYPULSE_123');
    });
  });
});
