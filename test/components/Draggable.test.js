import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Draggable } from 'src/components/Draggable.jsx';

// Test wrapper component to provide draggable functionality
const DraggableWrapper = ({ context, parentRef, children = 'Draggable content' }) => {
  const draggable = new Draggable({ parentRef });

  return (
    <div
      data-testid="draggable-element"
      draggable
      onDragStart={draggable.onDragStart(context)}
      onDragEnd={draggable.onDragEnd(context)}
    >
      {children}
    </div>
  );
};

describe('Draggable', () => {
  const mockContext = {
    type: 'controlType',
    data: { value: 'contextValue' },
  };

  describe('drag start behavior', () => {
    it('should set drag data when drag starts', () => {
      render(<DraggableWrapper context={mockContext} />);

      const draggableElement = screen.getByTestId('draggable-element');
      const mockSetData = jest.fn();

      fireEvent.dragStart(draggableElement, {
        dataTransfer: {
          setData: mockSetData,
        },
      });

      expect(mockSetData).toHaveBeenCalledWith(
        'data',
        JSON.stringify(mockContext)
      );
    });

    it('should process drag start context', () => {
      const mockProcessDragStart = jest.fn().mockReturnValue(mockContext);
      const draggableInstance = new Draggable();
      draggableInstance.processDragStart = mockProcessDragStart;

      render(
        <div
          data-testid="draggable-element"
          draggable
          onDragStart={draggableInstance.onDragStart(mockContext)}
        />
      );

      const draggableElement = screen.getByTestId('draggable-element');

      fireEvent.dragStart(draggableElement, {
        dataTransfer: {
          setData: jest.fn(),
        },
      });

      expect(mockProcessDragStart).toHaveBeenCalledWith(mockContext);
    });

    it('should prevent event propagation on drag start', () => {
      const draggable = new Draggable();
      const mockStopPropagation = jest.fn();
      const mockEvent = {
        dataTransfer: {
          setData: jest.fn(),
        },
        stopPropagation: mockStopPropagation,
      };

      const dragStartHandler = draggable.onDragStart(mockContext);
      dragStartHandler(mockEvent);

      expect(mockStopPropagation).toHaveBeenCalled();
    });
  });

  describe('drag end behavior', () => {
    it('should notify parent when drag ends and parent ref exists', () => {
      const mockNotifyMove = jest.fn();
      const mockParentRef = {
        notifyMove: mockNotifyMove,
      };

      render(
        <DraggableWrapper
          context={mockContext}
          parentRef={mockParentRef}
        />
      );

      const draggableElement = screen.getByTestId('draggable-element');

      fireEvent.dragEnd(draggableElement);

      expect(mockNotifyMove).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'dragend',
        }),
        mockContext
      );
    });

    it('should not throw when drag ends without parent ref', () => {
      render(<DraggableWrapper context={mockContext} />);

      const draggableElement = screen.getByTestId('draggable-element');

      expect(() => {
        fireEvent.dragEnd(draggableElement);
      }).not.toThrow();
    });

    it('should prevent event propagation on drag end', () => {
      const draggable = new Draggable({});
      const mockStopPropagation = jest.fn();
      const mockEvent = {
        stopPropagation: mockStopPropagation,
      };

      const dragEndHandler = draggable.onDragEnd(mockContext);
      dragEndHandler(mockEvent);

      expect(mockStopPropagation).toHaveBeenCalled();
    });
  });

  describe('drag behavior integration', () => {
    it('should handle complete drag sequence', () => {
      const mockNotifyMove = jest.fn();
      const mockParentRef = {
        notifyMove: mockNotifyMove,
      };
      const mockSetData = jest.fn();

      render(
        <DraggableWrapper
          context={mockContext}
          parentRef={mockParentRef}
        />
      );

      const draggableElement = screen.getByTestId('draggable-element');

      fireEvent.dragStart(draggableElement, {
        dataTransfer: {
          setData: mockSetData,
        },
      });

      // End drag
      fireEvent.dragEnd(draggableElement);

      expect(mockSetData).toHaveBeenCalledWith(
        'data',
        JSON.stringify(mockContext)
      );
      expect(mockNotifyMove).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'dragend',
        }),
        mockContext
      );
    });

    it('should handle drag with modified context from processDragStart', () => {
      const modifiedContext = {
        ...mockContext,
        modified: true,
      };

      const draggableInstance = new Draggable();
      draggableInstance.processDragStart = jest.fn().mockReturnValue(modifiedContext);
      const mockSetData = jest.fn();

      render(
        <div
          data-testid="draggable-element"
          draggable
          onDragStart={draggableInstance.onDragStart(mockContext)}
        />
      );

      const draggableElement = screen.getByTestId('draggable-element');

      fireEvent.dragStart(draggableElement, {
        dataTransfer: {
          setData: mockSetData,
        },
      });

      expect(mockSetData).toHaveBeenCalledWith(
        'data',
        JSON.stringify(modifiedContext)
      );
    });
  });

  describe('class instantiation', () => {
    it('should create instance with data', () => {
      const testData = { parentRef: { notifyMove: jest.fn() } };
      const draggable = new Draggable(testData);

      expect(draggable.data).toBe(testData);
    });

    it('should create instance without data', () => {
      const draggable = new Draggable();

      expect(draggable.data).toBeUndefined();
    });

    it('should bind methods correctly', () => {
      const draggable = new Draggable();

      expect(typeof draggable.onDragStart).toBe('function');
      expect(typeof draggable.onDragEnd).toBe('function');
    });

    it('should return context unchanged from processDragStart by default', () => {
      const draggable = new Draggable();
      const result = draggable.processDragStart(mockContext);

      expect(result).toBe(mockContext);
    });
  });
});
