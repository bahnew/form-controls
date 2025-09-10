import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DropTarget } from 'src/components/DropTarget.jsx';

const DropTargetWrapper = ({ children = 'Drop target content', onProcessDrop, onProcessMove, onProcessDragEnter, onProcessDragLeave, onProcessDragOver }) => {
  const dropTarget = new DropTarget();

  if (onProcessDrop) dropTarget.processDrop = onProcessDrop;
  if (onProcessMove) dropTarget.processMove = onProcessMove;
  if (onProcessDragEnter) dropTarget.processDragEnter = onProcessDragEnter;
  if (onProcessDragLeave) dropTarget.processDragLeave = onProcessDragLeave;
  if (onProcessDragOver) dropTarget.processDragOver = onProcessDragOver;
  
  return (
    <div
      data-testid="drop-target-element"
      onDragOver={dropTarget.onDragOver}
      onDrop={dropTarget.onDrop}
      onDragEnter={dropTarget.onDragEnter}
      onDragLeave={dropTarget.onDragLeave}
    >
      {children}
    </div>
  );
};

describe('DropTarget', () => {
  const testContext = { type: 'testType', data: { id: '123' } };
  
  let mockEventData;

  beforeEach(() => {
    mockEventData = {
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
      dataTransfer: {
        getData: jest.fn().mockReturnValue(JSON.stringify(testContext)),
        dropEffect: 'move',
      },
    };
  });

  describe('class instantiation', () => {
    it('should create instance with data', () => {
      const testData = { some: 'data' };
      const dropTarget = new DropTarget(testData);
      
      expect(dropTarget.data).toBe(testData);
    });

    it('should create instance without data', () => {
      const dropTarget = new DropTarget();
      
      expect(dropTarget.data).toBeUndefined();
    });

    it('should bind methods correctly', () => {
      const dropTarget = new DropTarget();
      
      expect(typeof dropTarget.onDragOver).toBe('function');
      expect(typeof dropTarget.onDrop).toBe('function');
      expect(typeof dropTarget.onDragEnter).toBe('function');
      expect(typeof dropTarget.onDragLeave).toBe('function');
    });
  });

  describe('drag over behavior', () => {
    it('should prevent default on drag over', () => {
      const dropTarget = new DropTarget();
      
      dropTarget.onDragOver(mockEventData);
      
      expect(mockEventData.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('should call processDragOver when drag over happens', () => {
      const dropTarget = new DropTarget();
      const processDragOverSpy = jest.spyOn(dropTarget, 'processDragOver');
      
      dropTarget.onDragOver(mockEventData);
      
      expect(processDragOverSpy).toHaveBeenCalledWith(mockEventData);
    });

    it('should return event from processDragOver by default', () => {
      const dropTarget = new DropTarget();
      const result = dropTarget.processDragOver(mockEventData);
      
      expect(result).toBe(mockEventData);
    });
  });

  describe('drop behavior', () => {
    it('should prevent default and stop propagation on drop', () => {
      const dropTarget = new DropTarget();
      
      dropTarget.onDrop(mockEventData);
      
      expect(mockEventData.preventDefault).toHaveBeenCalledTimes(1);
      expect(mockEventData.stopPropagation).toHaveBeenCalledTimes(1);
    });

    it('should call processDrop with parsed context when drop happens', () => {
      const dropTarget = new DropTarget();
      const processDropSpy = jest.spyOn(dropTarget, 'processDrop');
      
      dropTarget.onDrop(mockEventData);
      
      expect(processDropSpy).toHaveBeenCalledWith(testContext);
    });

    it('should return context from processDrop by default', () => {
      const dropTarget = new DropTarget();
      const result = dropTarget.processDrop(testContext);
      
      expect(result).toBe(testContext);
    });

    it('should handle malformed JSON data gracefully', () => {
      const dropTarget = new DropTarget();
      mockEventData.dataTransfer.getData.mockReturnValue('invalid json');
      
      expect(() => {
        dropTarget.onDrop(mockEventData);
      }).toThrow();
    });
  });

  describe('move notification behavior', () => {
    it('should call processMove when dropEffect is move', () => {
      const dropTarget = new DropTarget();
      const processMoveSpy = jest.spyOn(dropTarget, 'processMove');
      mockEventData.dataTransfer.dropEffect = 'move';

      dropTarget.notifyMove(mockEventData, testContext);

      expect(processMoveSpy).toHaveBeenCalledWith(testContext);
    });

    it('should not call processMove when dropEffect is none', () => {
      const dropTarget = new DropTarget();
      const processMoveSpy = jest.spyOn(dropTarget, 'processMove');
      mockEventData.dataTransfer.dropEffect = 'none';

      dropTarget.notifyMove(mockEventData, testContext);

      expect(processMoveSpy).not.toHaveBeenCalled();
    });

    it('should not call processMove when dataTransfer is missing', () => {
      const dropTarget = new DropTarget();
      const processMoveSpy = jest.spyOn(dropTarget, 'processMove');
      const eventWithoutDataTransfer = { ...mockEventData };
      delete eventWithoutDataTransfer.dataTransfer;

      dropTarget.notifyMove(eventWithoutDataTransfer, testContext);

      expect(processMoveSpy).not.toHaveBeenCalled();
    });

    it('should return context from processMove by default', () => {
      const dropTarget = new DropTarget();
      const result = dropTarget.processMove(testContext);
      
      expect(result).toBe(testContext);
    });
  });

  describe('drag enter behavior', () => {
    it('should call processDragEnter when drag enter happens', () => {
      const dropTarget = new DropTarget();
      const processDragEnterSpy = jest.spyOn(dropTarget, 'processDragEnter');

      dropTarget.onDragEnter(mockEventData);

      expect(processDragEnterSpy).toHaveBeenCalledWith(mockEventData);
    });

    it('should return event from processDragEnter by default', () => {
      const dropTarget = new DropTarget();
      const result = dropTarget.processDragEnter(mockEventData);
      
      expect(result).toBe(mockEventData);
    });
  });

  describe('drag leave behavior', () => {
    it('should call processDragLeave when drag leave happens', () => {
      const dropTarget = new DropTarget();
      const processDragLeaveSpy = jest.spyOn(dropTarget, 'processDragLeave');

      dropTarget.onDragLeave(mockEventData);

      expect(processDragLeaveSpy).toHaveBeenCalledWith(mockEventData);
    });

    it('should return event from processDragLeave by default', () => {
      const dropTarget = new DropTarget();
      const result = dropTarget.processDragLeave(mockEventData);
      
      expect(result).toBe(mockEventData);
    });
  });

  describe('integration with React component', () => {
    it('should handle drag over events when rendered', () => {
      const mockProcessDragOver = jest.fn();
      render(
        <DropTargetWrapper onProcessDragOver={mockProcessDragOver} />
      );

      const dropTargetElement = screen.getByTestId('drop-target-element');
      
      fireEvent.dragOver(dropTargetElement);

      expect(mockProcessDragOver).toHaveBeenCalled();
    });

    it('should handle drop events when rendered', () => {
      const mockProcessDrop = jest.fn();
      render(
        <DropTargetWrapper onProcessDrop={mockProcessDrop} />
      );

      const dropTargetElement = screen.getByTestId('drop-target-element');
      
      fireEvent.drop(dropTargetElement, {
        dataTransfer: {
          getData: jest.fn().mockReturnValue(JSON.stringify(testContext)),
        },
      });

      expect(mockProcessDrop).toHaveBeenCalledWith(testContext);
    });

    it('should handle drag enter events when rendered', () => {
      const mockProcessDragEnter = jest.fn();
      render(
        <DropTargetWrapper onProcessDragEnter={mockProcessDragEnter} />
      );

      const dropTargetElement = screen.getByTestId('drop-target-element');
      
      fireEvent.dragEnter(dropTargetElement);

      expect(mockProcessDragEnter).toHaveBeenCalled();
    });

    it('should handle drag leave events when rendered', () => {
      const mockProcessDragLeave = jest.fn();
      render(
        <DropTargetWrapper onProcessDragLeave={mockProcessDragLeave} />
      );

      const dropTargetElement = screen.getByTestId('drop-target-element');
      
      fireEvent.dragLeave(dropTargetElement);

      expect(mockProcessDragLeave).toHaveBeenCalled();
    });

    it('should prevent default behavior on drag over in rendered component', () => {
      const dropTarget = new DropTarget();
      const preventDefault = jest.fn();
      const mockEvent = { preventDefault };
      
      dropTarget.onDragOver(mockEvent);

      expect(preventDefault).toHaveBeenCalled();
    });

    it('should prevent default and stop propagation on drop in rendered component', () => {
      const dropTarget = new DropTarget();
      const preventDefault = jest.fn();
      const stopPropagation = jest.fn();
      const mockEvent = {
        preventDefault,
        stopPropagation,
        dataTransfer: {
          getData: jest.fn().mockReturnValue(JSON.stringify(testContext)),
        },
      };
      
      dropTarget.onDrop(mockEvent);

      expect(preventDefault).toHaveBeenCalled();
      expect(stopPropagation).toHaveBeenCalled();
    });
  });

  describe('complete drag and drop sequence', () => {
    it('should handle full drag and drop interaction', () => {
      const mockProcessDragEnter = jest.fn();
      const mockProcessDragOver = jest.fn();
      const mockProcessDrop = jest.fn();
      const mockProcessDragLeave = jest.fn();
      
      render(
        <DropTargetWrapper 
          onProcessDragEnter={mockProcessDragEnter}
          onProcessDragOver={mockProcessDragOver}
          onProcessDrop={mockProcessDrop}
          onProcessDragLeave={mockProcessDragLeave}
        />
      );

      const dropTargetElement = screen.getByTestId('drop-target-element');

      fireEvent.dragEnter(dropTargetElement);
      fireEvent.dragOver(dropTargetElement);
      fireEvent.drop(dropTargetElement, {
        dataTransfer: {
          getData: jest.fn().mockReturnValue(JSON.stringify(testContext)),
        },
      });
      fireEvent.dragLeave(dropTargetElement);

      expect(mockProcessDragEnter).toHaveBeenCalled();
      expect(mockProcessDragOver).toHaveBeenCalled();
      expect(mockProcessDrop).toHaveBeenCalledWith(testContext);
      expect(mockProcessDragLeave).toHaveBeenCalled();
    });

    it('should handle move notification after successful drop', () => {
      const dropTarget = new DropTarget();
      const processMoveSpy = jest.spyOn(dropTarget, 'processMove');

      mockEventData.dataTransfer.dropEffect = 'move';
      dropTarget.notifyMove(mockEventData, testContext);

      expect(processMoveSpy).toHaveBeenCalledWith(testContext);
    });
  });

  describe('edge cases', () => {
    it('should handle empty context data', () => {
      const dropTarget = new DropTarget();
      const emptyContext = {};
      
      expect(() => {
        dropTarget.processDrop(emptyContext);
        dropTarget.processMove(emptyContext);
      }).not.toThrow();
    });

    it('should handle null context data', () => {
      const dropTarget = new DropTarget();
      
      expect(() => {
        dropTarget.processDrop(null);
        dropTarget.processMove(null);
      }).not.toThrow();
    });

    it('should handle undefined dataTransfer', () => {
      const dropTarget = new DropTarget();
      const eventWithoutDataTransfer = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      
      expect(() => {
        dropTarget.notifyMove(eventWithoutDataTransfer, testContext);
      }).not.toThrow();
    });

    it('should handle various dropEffect values', () => {
      const dropTarget = new DropTarget();
      const processMoveSpy = jest.spyOn(dropTarget, 'processMove');
      
      const testCases = [
        { effect: 'copy', shouldCall: true },
        { effect: 'link', shouldCall: true },
        { effect: 'move', shouldCall: true },
        { effect: 'none', shouldCall: false },
      ];

      testCases.forEach(({ effect, shouldCall }) => {
        processMoveSpy.mockClear();
        mockEventData.dataTransfer.dropEffect = effect;
        
        dropTarget.notifyMove(mockEventData, testContext);
        
        if (shouldCall) {
          expect(processMoveSpy).toHaveBeenCalledWith(testContext);
        } else {
          expect(processMoveSpy).not.toHaveBeenCalled();
        }
      });
    });
  });
});
