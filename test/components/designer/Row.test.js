import React from 'react';
import { render } from '@testing-library/react';
import { RowDesigner } from 'components/designer/Row.jsx';
import Constants from 'src/constants';
import { IDGenerator } from 'src/helpers/idGenerator';

describe('Row', () => {
  const testComponent = () => <div>Test</div>;
  let mockRef;

  beforeEach(() => {
    mockRef = {
      getCellDefinition: jest.fn(() => ({ id: 'test', type: 'test' })),
    };
  });

  it('should render the default number of cells', () => {
    const idGenerator = new IDGenerator();

    const { container } = render(
      <RowDesigner
        idGenerator={idGenerator}
        onChange={() => {}}
        rowData={[]}
        rowPosition={0}
        wrapper={testComponent}
      />
    );

    const row = container.querySelector('.row0');
    const cells = container.querySelectorAll('.form-builder-column-wrapper');

    expect(row).toBeInTheDocument();
    expect(cells).toHaveLength(Constants.Grid.defaultRowWidth);
  });

  it('should render specified number of cells', () => {
    const idGenerator = new IDGenerator();

    const { container } = render(
      <RowDesigner
        columns={2}
        idGenerator={idGenerator}
        onChange={() => {}}
        rowData={[]}
        rowPosition={1}
        wrapper={testComponent}
      />
    );

    const row = container.querySelector('.row1');
    const cells = container.querySelectorAll('.form-builder-column-wrapper');

    expect(row).toBeInTheDocument();
    expect(cells).toHaveLength(2);
  });

  it('should render cells with correct row data', () => {
    const rowData = {
      properties: {
        location: { row: 0, column: 0 },
      },
    };
    const idGenerator = new IDGenerator();

    const { container } = render(
      <RowDesigner
        idGenerator={idGenerator}
        onChange={() => {}}
        rowData={[rowData]}
        rowPosition={0}
        wrapper={testComponent}
      />
    );

    const row = container.querySelector('.form-builder-row.row0');
    const cells = container.querySelectorAll('.form-builder-column-wrapper');

    expect(row).toBeInTheDocument();
    expect(cells).toHaveLength(Constants.Grid.defaultRowWidth);
  });

  it('should update cell data when receiving new props', () => {
    const initialRowData = [
      { properties: { location: { row: 0, column: 0 } } },
    ];
    const newRowData = [
      { properties: { location: { row: 0, column: 1 } } },
    ];
    const idGenerator = new IDGenerator();

    const { rerender } = render(
      <RowDesigner
        idGenerator={idGenerator}
        onChange={() => {}}
        rowData={initialRowData}
        rowPosition={0}
        wrapper={testComponent}
      />
    );

    rerender(
      <RowDesigner
        idGenerator={idGenerator}
        onChange={() => {}}
        rowData={newRowData}
        rowPosition={0}
        wrapper={testComponent}
      />
    );

    const cells = document.querySelectorAll('.form-builder-column-wrapper');
    expect(cells).toHaveLength(Constants.Grid.defaultRowWidth);
  });

  it('should call getRowDefinition method', () => {
    const idGenerator = new IDGenerator();
    let rowInstance;

    render(
      <RowDesigner
        ref={(ref) => { rowInstance = ref; }}
        idGenerator={idGenerator}
        onChange={() => {}}
        rowData={[]}
        rowPosition={0}
        wrapper={testComponent}
      />
    );

    expect(rowInstance).toBeTruthy();
    rowInstance.cellRef = { 0: mockRef };
    const definition = rowInstance.getRowDefinition();
    expect(Array.isArray(definition)).toBe(true);
    expect(mockRef.getCellDefinition).toHaveBeenCalled();
  });

  it('should handle changeHandler method', () => {
    const mockOnChange = jest.fn();
    const idGenerator = new IDGenerator();
    let rowInstance;

    render(
      <RowDesigner
        ref={(ref) => { rowInstance = ref; }}
        idGenerator={idGenerator}
        onChange={mockOnChange}
        rowData={[]}
        rowPosition={2}
        wrapper={testComponent}
      />
    );

    expect(rowInstance).toBeTruthy();
    rowInstance.changeHandler();
    expect(mockOnChange).toHaveBeenCalledWith(2);
  });

  it('should handle cellReference method', () => {
    const idGenerator = new IDGenerator();
    let rowInstance;

    render(
      <RowDesigner
        ref={(ref) => { rowInstance = ref; }}
        idGenerator={idGenerator}
        onChange={() => {}}
        rowData={[]}
        rowPosition={0}
        wrapper={testComponent}
      />
    );

    expect(rowInstance).toBeTruthy();
    const mockCellRef = { props: { location: { column: 1 } } };
    rowInstance.cellReference(mockCellRef);
    expect(rowInstance.cellRef[1]).toBe(mockCellRef);
  });

  it('should handle changeHandler when onChange is not provided', () => {
    const idGenerator = new IDGenerator();
    let rowInstance;

    render(
      <RowDesigner
        ref={(ref) => { rowInstance = ref; }}
        idGenerator={idGenerator}
        rowData={[]}
        rowPosition={0}
        wrapper={testComponent}
      />
    );

    expect(rowInstance).toBeTruthy();
    expect(() => rowInstance.changeHandler()).not.toThrow();
  });
});
