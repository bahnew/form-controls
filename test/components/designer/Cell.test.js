import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CellDesigner } from 'components/designer/Cell.jsx';
import { IDGenerator } from 'src/helpers/idGenerator';

describe('Cell', () => {
  let defaultProps;
  const metadata = { id: '123', properties: {}, type: 'obsControl', unsupportedProperties: [] };
  const TestComponent = () => <div>TestComponent</div>;
  const location = { column: 0, row: 0 };

  beforeEach(() => {
    defaultProps = {
      cellData: [],
      idGenerator: new IDGenerator(),
      location,
      onChange: jest.fn(),
      wrapper: TestComponent,
    };
  });

  it('should be a drop target', () => {
    const mockOnControlDrop = jest.fn((args) => args.successCallback(args.metadata));
    const props = { ...defaultProps, onControlDrop: mockOnControlDrop };

    const { container } = render(<CellDesigner {...props} />);
    const cell = container.querySelector('.form-builder-column');
    
    expect(cell).toBeInTheDocument();
    
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { getData: () => JSON.stringify(metadata) }
    });
    
    fireEvent(cell, dropEvent);
    expect(mockOnControlDrop).toHaveBeenCalled();
  });

  it('should render empty cell when no cellData', () => {
    const { container } = render(<CellDesigner {...defaultProps} />);
    
    const emptyCell = container.querySelector('.cell');
    expect(emptyCell).toBeInTheDocument();
  });

  it('should render dropped component', () => {
    const mockOnControlDrop = jest.fn((args) => args.successCallback(args.metadata));
    const props = { ...defaultProps, onControlDrop: mockOnControlDrop };

    const { container } = render(<CellDesigner {...props} />);
    const cell = container.querySelector('.form-builder-column');
    
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { getData: () => JSON.stringify(metadata) }
    });
    
    fireEvent(cell, dropEvent);
    
    expect(screen.getByText('TestComponent')).toBeInTheDocument();
  });

  it('should update components location when dropped', () => {
    const mockOnControlDrop = jest.fn((args) => args.successCallback(args.metadata));
    const customLocation = { column: 10, row: 1 };
    const props = { ...defaultProps, location: customLocation, onControlDrop: mockOnControlDrop };

    const { container } = render(<CellDesigner {...props} />);
    const cell = container.querySelector('.form-builder-column');
    
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { getData: () => JSON.stringify(metadata) }
    });
    
    fireEvent(cell, dropEvent);
    
    expect(mockOnControlDrop).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          id: '123',
          type: 'obsControl'
        }),
        successCallback: expect.any(Function)
      })
    );
  });

  it('should call onChange when control is dropped', () => {
    const mockOnChange = jest.fn();
    const mockOnControlDrop = jest.fn((args) => args.successCallback(args.metadata));
    const props = { ...defaultProps, onChange: mockOnChange, onControlDrop: mockOnControlDrop };

    const { container } = render(<CellDesigner {...props} />);
    const cell = container.querySelector('.form-builder-column');
    
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { getData: () => JSON.stringify(metadata) }
    });
    
    fireEvent(cell, dropEvent);
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should pass appropriate props to children', () => {
    const propsWithData = { ...defaultProps, cellData: [metadata] };

    render(<CellDesigner {...propsWithData} />);
    
    expect(screen.getByText('TestComponent')).toBeInTheDocument();
  });

  it('should handle dragAllowed false and prevent component rendering', () => {
    const mockOnControlDrop = jest.fn();
    const props = { ...defaultProps, dragAllowed: false, onControlDrop: mockOnControlDrop };

    const { container } = render(<CellDesigner {...props} />);
    const cell = container.querySelector('.form-builder-column');
    
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { getData: () => JSON.stringify(metadata) }
    });
    
    fireEvent(cell, dropEvent);
    
    expect(mockOnControlDrop).not.toHaveBeenCalled();
    expect(screen.queryByText('TestComponent')).not.toBeInTheDocument();
  });

  it('should render different layout when isBeingDragged is true', () => {
    const propsWithDragging = { ...defaultProps, isBeingDragged: true, cellData: [metadata] };

    const { container } = render(<CellDesigner {...propsWithDragging} />);
    
    const cell = container.querySelector('.form-builder-column');
    expect(cell).toBeInTheDocument();
    expect(screen.getByText('TestComponent')).toBeInTheDocument();
  });

  it('should toggle active class on drag enter and leave', () => {
    const { container, rerender } = render(<CellDesigner {...defaultProps} />);
    let cell = container.querySelector('.form-builder-column');
    
    expect(cell).toHaveClass('form-builder-column');
    
    fireEvent.dragEnter(cell);
    rerender(<CellDesigner {...defaultProps} />);
    cell = container.querySelector('.form-builder-column');
    
    fireEvent.dragLeave(cell);
    rerender(<CellDesigner {...defaultProps} />);
    cell = container.querySelector('.form-builder-column');
    
    expect(cell).toHaveClass('form-builder-column');
  });

  it('should handle multiple controls and test deleteControl functionality', () => {
    const MockControlWithDelete = ({ metadata, deleteControl, parentRef }) => {
      const handleDelete = () => deleteControl(metadata.id);
      return (
        <div data-testid={`control-${metadata.id}`}>
          <span>Control-{metadata.id}</span>
          <button onClick={handleDelete} data-testid={`delete-${metadata.id}`}>
            Delete
          </button>
        </div>
      );
    };
    
    const control1 = { id: '1', type: 'obsControl', properties: {} };
    const control2 = { id: '2', type: 'obsControl', properties: {} };
    
    const propsWithMultipleControls = {
      ...defaultProps,
      cellData: [control1, control2],
      wrapper: MockControlWithDelete
    };

    render(<CellDesigner {...propsWithMultipleControls} />);
    
    expect(screen.getByTestId('control-1')).toBeInTheDocument();
    expect(screen.getByTestId('control-2')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('delete-1'));
    
    expect(screen.queryByTestId('control-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('control-2')).toBeInTheDocument();
  });

  it('should handle child component references', () => {
    const MockControlWithRef = ({ metadata, parentRef, ref }) => {
      React.useEffect(() => {
        if (ref && parentRef) {
          const mockRef = {
            props: { metadata },
            getJsonDefinition: () => ({ id: metadata.id, type: metadata.type })
          };
          parentRef.storeChildRef(mockRef);
        }
      }, [metadata, parentRef, ref]);
      
      return <div data-testid={`ref-control-${metadata.id}`}>RefControl-{metadata.id}</div>;
    };
    
    const propsWithRef = {
      ...defaultProps,
      cellData: [metadata],
      wrapper: MockControlWithRef
    };

    const { container } = render(<CellDesigner {...propsWithRef} />);
    
    expect(screen.getByTestId('ref-control-123')).toBeInTheDocument();
    expect(container.querySelector('.form-builder-column-wrapper')).toBeInTheDocument();
  });

  it('should handle component state initialization and updates', () => {
    const initialData = [{ id: 'initial', type: 'obsControl', properties: {} }];
    const MockInitialComponent = ({ metadata }) => (
      <div data-testid={`initial-${metadata.id}`}>Initial-{metadata.id}</div>
    );
    
    const propsWithInitialData = {
      ...defaultProps,
      cellData: initialData,
      wrapper: MockInitialComponent
    };
    
    render(<CellDesigner {...propsWithInitialData} />);
    
    expect(screen.getByTestId('initial-initial')).toBeInTheDocument();
    expect(screen.getByText('Initial-initial')).toBeInTheDocument();
  });
});