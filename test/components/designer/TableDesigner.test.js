import React, { Component } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { TableDesigner } from 'components/designer/TableDesigner.jsx';
import { IDGenerator } from 'src/helpers/idGenerator';

jest.mock('components/designer/Grid.jsx', () => {
  const React = require('react');
  
  class MockGridDesigner extends React.Component {
    constructor(props) {
      super(props);
      this.cellRef = {};
    }
    getControls() { return this.props.controls || []; }
    render() { return React.createElement('div', { 'data-testid': 'grid-designer' }); }
  }
  
  return {
    GridDesigner: MockGridDesigner,
  };
});

import * as Grid from 'components/designer/Grid.jsx';

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

describe('TableDesigner', () => {
  let metadata;
  let idGenerator;
  const onSelectSpy = jest.fn();

  describe('when table is rendered', () => {
    const tableHeader = { id: 6, value: 'TableHeader' };
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
    const column1LabelJson = {
      translationKey: 'COLUMN1_1',
      type: 'label',
      value: 'Label1',
      id: '6',
    };
    const column2LabelJson = {
      translationKey: 'COLUMN2_2',
      type: 'label',
      value: 'Label2',
      id: '6',
    };


    beforeEach(() => {
      jest.clearAllMocks();
      metadata = {
        id: '123',
        type: 'table',
        label: tableHeader,
        properties,
        columnHeaders: [column1LabelJson, column2LabelJson],
        controls: [childControl],
      };

      const textBoxDescriptor = { control: DummyControl };
      componentStore.registerDesignerComponent('text', textBoxDescriptor); // eslint-disable-line no-undef
      idGenerator = new IDGenerator();
    });

    afterEach(() => {
      componentStore.deRegisterDesignerComponent('text'); // eslint-disable-line no-undef
    });

    const renderTableDesigner = (props = {}) => {
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

      return render(<TableDesigner {...defaultProps} />);
    };

    it('should call onSelect function on table click', () => {
      const { container } = renderTableDesigner();
      const fieldset = container.querySelector('.form-builder-fieldset');
      fireEvent.click(fieldset);
      expect(onSelectSpy).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect method with given metadata', () => {
      const { container } = renderTableDesigner();
      const fieldset = container.querySelector('.form-builder-fieldset');
      fireEvent.click(fieldset);
      expect(onSelectSpy).toHaveBeenCalledWith(expect.anything(), metadata);
    });

    it('should render column names as Column1 and Column2 when columnHeaders are not defined', () => {
      const metadataWithoutHeaders = {
        ...metadata,
        controls: undefined,
        columnHeaders: undefined,
      };

      renderTableDesigner({ metadata: metadataWithoutHeaders });

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('TableHeader')).toBeInTheDocument();
      expect(screen.getByText('Column1')).toBeInTheDocument();
      expect(screen.getByText('Column2')).toBeInTheDocument();
    });

    it('should render column names as what is passed in controls', () => {
      renderTableDesigner();

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('TableHeader')).toBeInTheDocument();
      expect(screen.getByText('Label1')).toBeInTheDocument();
      expect(screen.getByText('Label2')).toBeInTheDocument();
    });

    it('should render column names as they were when the table control dropped from one cell to other', () => {
      const updatedMetadata = {
        id: '6',
        type: 'table',
        label: { id: '6', translationKey: 'TABLE_6', type: 'label', value: 'TableHeader' },
        properties,
        columnHeaders: [column1LabelJson, column2LabelJson],
        controls: [childControl],
      };

      renderTableDesigner({ metadata: updatedMetadata });

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('TableHeader')).toBeInTheDocument();
      expect(screen.getByText('Label1')).toBeInTheDocument();
      expect(screen.getByText('Label2')).toBeInTheDocument();
    });

    it('should render a grid with appropriate props', () => {
      renderTableDesigner();

      expect(screen.getByTestId('grid-designer')).toBeInTheDocument();
    });

    it('should render section without any controls', () => {
      const metadataWithoutControls = { ...metadata, controls: undefined };

      renderTableDesigner({ metadata: metadataWithoutControls });

      expect(screen.getByTestId('grid-designer')).toBeInTheDocument();
    });

    it('should show delete button if the showDeleteButton props is true', () => {
      renderTableDesigner({ showDeleteButton: true });

      const deleteButton = screen.getByRole('button');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton.textContent).toBe('');
    });

    it('should not show delete button if the showDeleteButton props is false', () => {
      renderTableDesigner({ showDeleteButton: false });

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should call deleteControl when delete button is clicked', () => {
      const deleteControlSpy = jest.fn();
      const clearSelectedControlSpy = jest.fn();

      renderTableDesigner({
        deleteControl: deleteControlSpy,
        clearSelectedControl: clearSelectedControlSpy,
        showDeleteButton: true,
      });

      const deleteButton = screen.getByRole('button');
      fireEvent.click(deleteButton);

      expect(deleteControlSpy).toHaveBeenCalledTimes(1);
      expect(clearSelectedControlSpy).toHaveBeenCalledTimes(1);
    });

    it('should call clearSelectedControl prop when delete button is clicked', () => {
      const clearSelectedControlSpy = jest.fn();

      renderTableDesigner({
        clearSelectedControl: clearSelectedControlSpy,
        showDeleteButton: true,
      });

      const deleteButton = screen.getByRole('button');
      fireEvent.click(deleteButton);

      expect(clearSelectedControlSpy).toHaveBeenCalledTimes(1);
    });

    it('should call deleteControl prop when delete button is clicked', () => {
      const deleteControlSpy = jest.fn();

      renderTableDesigner({
        deleteControl: deleteControlSpy,
        showDeleteButton: true,
      });

      const deleteButton = screen.getByRole('button');
      fireEvent.click(deleteButton);

      expect(deleteControlSpy).toHaveBeenCalledTimes(1);
    });

    it('should return json definition', () => {
      let tableRef;
      renderTableDesigner({
        ref: (ref) => { tableRef = ref; },
      });

      expect(tableRef).toBeTruthy();
      tableRef.gridRef = { getControls: jest.fn().mockReturnValue([childControl]) };
      tableRef.labelControls = [
        { getJsonDefinition: jest.fn().mockReturnValue(column1LabelJson) },
        { getJsonDefinition: jest.fn().mockReturnValue(column2LabelJson) },
      ];
      tableRef.headerControl = { getJsonDefinition: jest.fn().mockReturnValue(tableHeader) };

      const expectedMetadata = { ...metadata, controls: [childControl] };
      expect(tableRef.getJsonDefinition()).toEqual(expectedMetadata);
    });

    it('should have addMore in unsupportedProperties', () => {
      const onControlDropSpy = jest.fn(({ successCallback }) => successCallback());
      const processDropSuccessCallback = jest.fn();

      let tableRef;
      renderTableDesigner({
        onControlDrop: onControlDropSpy,
        ref: (ref) => { tableRef = ref; },
      });

      expect(tableRef).toBeTruthy();
      tableRef.handleControlDrop({
        metadata: { type: 'obsControl' },
        cellMetadata: [],
        successCallback: processDropSuccessCallback,
      });

      expect(processDropSuccessCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'obsControl',
          unsupportedProperties: ['addMore'],
        })
      );
    });

    it('should not allow unsupported controls to be dropped', () => {
      const onControlDropSpy = jest.fn(({ successCallback }) => successCallback());
      const processDropSuccessCallback = jest.fn();

      let tableRef;
      renderTableDesigner({
        onControlDrop: onControlDropSpy,
        ref: (ref) => { tableRef = ref; },
      });

      expect(tableRef).toBeTruthy();
      tableRef.handleControlDrop({
        metadata: { type: 'section' },
        cellMetadata: [],
        successCallback: processDropSuccessCallback,
      });

      expect(processDropSuccessCallback).not.toHaveBeenCalled();
    });

    it('should update metadata of drag source cell when drop is not allowed', () => {
      const dragSourceCell = { updateMetadata: jest.fn() };
      const onControlDropSpy = jest.fn(({ successCallback }) => successCallback());
      const processDropSuccessCallback = jest.fn();

      let tableRef;
      renderTableDesigner({
        dragSourceCell,
        onControlDrop: onControlDropSpy,
        ref: (ref) => { tableRef = ref; },
      });

      expect(tableRef).toBeTruthy();
      const sectionMetadata = { type: 'section' };
      tableRef.handleControlDrop({
        metadata: sectionMetadata,
        cellMetadata: [],
        successCallback: processDropSuccessCallback,
      });

      expect(processDropSuccessCallback).not.toHaveBeenCalled();
      expect(dragSourceCell.updateMetadata).toHaveBeenCalledWith(sectionMetadata);
    });

    it('should not allow more than one control to be dropped in a cell', () => {
      const onControlDropSpy = jest.fn(({ successCallback }) => successCallback());
      const processDropSuccessCallback = jest.fn();

      let tableRef;
      renderTableDesigner({
        onControlDrop: onControlDropSpy,
        ref: (ref) => { tableRef = ref; },
      });

      expect(tableRef).toBeTruthy();
      tableRef.handleControlDrop({
        metadata: { type: 'obsControl' },
        cellMetadata: [{ type: 'obsControl' }],
        successCallback: processDropSuccessCallback,
      });

      expect(processDropSuccessCallback).not.toHaveBeenCalled();
    });
  });
});
