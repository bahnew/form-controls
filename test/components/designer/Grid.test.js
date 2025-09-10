import React from 'react';
import { render, act } from '@testing-library/react';
import { GridDesigner } from 'components/designer/Grid.jsx';
import constants from 'src/constants';
import { IDGenerator } from 'src/helpers/idGenerator';

describe('GridDesigner', () => {
  const wrapper = () => <div>Test</div>;
  const label = {
    id: 'someId',
    value: 'someLabelName',
    type: 'label',
  };

  const textBoxConcept = {
    uuid: '70645842-be6a-4974-8d5f-45b52990e132',
    name: 'Pulse',
    datatype: 'Text',
  };

  const numericBoxConcept = {
    uuid: '216861e7-23d8-468f-9efb-672ce427a14b',
    name: 'Temperature',
    datatype: 'Numeric',
  };

  const formResourceControls = [
    {
      id: '100',
      type: 'label',
      value: 'Pulse',
      properties: {
        location: {
          row: 0,
          column: 0,
        },
      },
    },
    {
      id: '101',
      type: 'obsControl',
      concept: textBoxConcept,
      label,
      properties: {
        location: {
          row: 0,
          column: 1,
        },
      },
    },
    {
      id: '102',
      type: 'obsControl',
      concept: numericBoxConcept,
      label,
      properties: {
        location: {
          row: 0,
          column: 2,
        },
      },
    },
  ];

  it('should render minimum number of rows when no controls provided', () => {
    const { container } = render(
      <GridDesigner
        controls={[]}
        idGenerator={new IDGenerator()}
        wrapper={wrapper}
      />
    );
    
    const gridContainer = container.querySelector('.grid');
    const rows = gridContainer.children;
    
    expect(rows).toHaveLength(constants.Grid.minRows);
  });

  it('should render grid with controls distributed across rows', () => {
    const { container } = render(
      <GridDesigner
        controls={formResourceControls}
        idGenerator={new IDGenerator()}
        wrapper={wrapper}
      />
    );
    
    const gridContainer = container.querySelector('.grid');
    const rows = gridContainer.children;
    
    expect(rows).toHaveLength(constants.Grid.minRows);
    expect(gridContainer).toBeInTheDocument();
  });

  it('should create additional rows when controls span beyond minimum rows', () => {
    const formControls = [...formResourceControls];
    formControls[2].properties.location.row = 4;

    const { container } = render(
      <GridDesigner
        controls={formControls}
        idGenerator={new IDGenerator()}
        wrapper={wrapper}
      />
    );
    
    const gridContainer = container.querySelector('.grid');
    const rows = gridContainer.children;
    
    expect(rows).toHaveLength(6);
  });

  it('should render all row designer components with proper structure', () => {
    const { container } = render(
      <GridDesigner
        controls={[formResourceControls[0]]}
        idGenerator={new IDGenerator()}
        wrapper={wrapper}
      />
    );
    
    const gridContainer = container.querySelector('.grid');
    const rows = gridContainer.children;
    
    expect(rows).toHaveLength(4);
    expect(gridContainer).toBeInTheDocument();
    
    Array.from(rows).forEach(row => {
      expect(row).toBeInTheDocument();
    });
  });

  it('should create grid with proper row count based on max row location', () => {
    const controlsWithHighRow = [...formResourceControls];
    controlsWithHighRow[2].properties.location.row = 5;

    const { container } = render(
      <GridDesigner
        controls={controlsWithHighRow}
        idGenerator={new IDGenerator()}
        wrapper={wrapper}
      />
    );
    
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer.children).toHaveLength(7);
  });

  it('should expose getControls method', () => {
    let gridRef;
    const RefWrapper = () => (
      <GridDesigner
        ref={(ref) => { gridRef = ref; }}
        controls={formResourceControls}
        idGenerator={new IDGenerator()}
        wrapper={wrapper}
      />
    );

    render(<RefWrapper />);
    
    expect(gridRef).toBeDefined();
    expect(typeof gridRef.getControls).toBe('function');
  });

  it('should handle changeHandler when adding new row at end', () => {
    let gridRef;
    const RefWrapper = () => (
      <GridDesigner
        ref={(ref) => { gridRef = ref; }}
        controls={formResourceControls}
        idGenerator={new IDGenerator()}
        wrapper={wrapper}
      />
    );

    const { container } = render(<RefWrapper />);
    
    const initialRowCount = container.querySelector('.grid').children.length;
    
    act(() => {
      gridRef.changeHandler(initialRowCount - 1);
    });
    
    const finalRowCount = container.querySelector('.grid').children.length;
    expect(finalRowCount).toBe(initialRowCount + 1);
  });

  it('should not add row when changeHandler called with non-last row index', () => {
    let gridRef;
    const RefWrapper = () => (
      <GridDesigner
        ref={(ref) => { gridRef = ref; }}
        controls={formResourceControls}
        idGenerator={new IDGenerator()}
        wrapper={wrapper}
      />
    );

    const { container } = render(<RefWrapper />);
    
    const initialRowCount = container.querySelector('.grid').children.length;
    
    act(() => {
      gridRef.changeHandler(0);
    });
    
    const finalRowCount = container.querySelector('.grid').children.length;
    expect(finalRowCount).toBe(initialRowCount);
  });
});
