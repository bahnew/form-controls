import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LabelDesigner } from 'components/designer/Label.jsx';
import { IDGenerator } from 'src/helpers/idGenerator';

describe('LabelDesigner', () => {
  let metadata;
  let idGenerator;
  let defaultProps;

  beforeEach(() => {
    idGenerator = new IDGenerator();
    metadata = { 
      id: '1', 
      type: 'label',
      value: 'History Notes', 
      properties: {} 
    };
    defaultProps = {
      clearSelectedControl: jest.fn(),
      deleteControl: jest.fn(),
      dispatch: jest.fn(),
      idGenerator,
      metadata,
      showDeleteButton: false,
      wrapper: jest.fn(),
    };
  });

  it('should render the non editable value', () => {
    render(<LabelDesigner {...defaultProps} />);
    expect(screen.getByText('History Notes')).toBeInTheDocument();
  });

  it('should allow editing of value on double click', () => {
    render(<LabelDesigner {...defaultProps} />);
    
    expect(screen.getByText('History Notes')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    fireEvent.doubleClick(screen.getByText('History Notes'));
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByText('History Notes')).not.toBeInTheDocument();
  });

  it('should not change translation key after editing the label', async () => {
    const user = userEvent.setup();
    const mockWrapper = jest.fn();
    
    render(
      <LabelDesigner 
        {...defaultProps} 
        wrapper={mockWrapper}
      />
    );

    fireEvent.doubleClick(screen.getByText('History Notes'));
    
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'My new value');
    
    fireEvent.keyUp(input, { keyCode: 13 });
    
    expect(screen.getByText('My new value')).toBeInTheDocument();
  });

  it('should display value in non editable mode after pressing enter', async () => {
    const user = userEvent.setup();
    render(<LabelDesigner {...defaultProps} />);

    fireEvent.doubleClick(screen.getByText('History Notes'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Note');
    
    fireEvent.keyUp(input, { keyCode: 13 });
    
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
  });

  it('should display value in non editable mode on blur', () => {
    render(<LabelDesigner {...defaultProps} />);

    fireEvent.doubleClick(screen.getByText('History Notes'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    fireEvent.blur(screen.getByRole('textbox'));
    
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('History Notes')).toBeInTheDocument();
  });

  it('should return appropriate JSON definition', () => {
    const { container } = render(<LabelDesigner {...defaultProps} />);
    const component = container.querySelector('.control-wrapper-content');
    
    expect(component).toBeInTheDocument();
    expect(screen.getByText('History Notes')).toBeInTheDocument();
  });

  it('should display existing value when only spaces are entered', async () => {
    const user = userEvent.setup();
    render(<LabelDesigner {...defaultProps} />);

    fireEvent.doubleClick(screen.getByText('History Notes'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '  ');
    
    fireEvent.keyUp(input, { keyCode: 13 });
    
    expect(screen.getByText('History Notes')).toBeInTheDocument();
  });

  it('should stop event propagation to upper component when click on label', () => {
    const dispatchSpy = jest.fn();
    const { container } = render(
      <LabelDesigner 
        {...defaultProps}
        dispatch={dispatchSpy}
      />
    );

    const wrapper = container.querySelector('.control-wrapper-content');
    fireEvent.click(wrapper, {
      preventDefault: jest.fn(),
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });

  it('should show delete button if the showDeleteButton props is true', () => {
    render(<LabelDesigner {...defaultProps} showDeleteButton={true} />);
    
    const deleteButton = screen.getByRole('button');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass('remove-control-button');
  });

  it('should call deleteControl when delete button is clicked', () => {
    const deleteControlSpy = jest.fn();
    render(
      <LabelDesigner 
        {...defaultProps}
        deleteControl={deleteControlSpy}
        showDeleteButton={true}
      />
    );

    fireEvent.click(screen.getByRole('button'), {
      preventDefault: jest.fn(),
    });

    expect(deleteControlSpy).toHaveBeenCalledTimes(1);
  });

  it('should not generate new translation key if it already exists', () => {
    const metadataWithKey = {
      ...metadata,
      units: '(/min)',
      translationKey: 'SOME_KEY',
    };

    render(
      <LabelDesigner 
        {...defaultProps}
        metadata={metadataWithKey}
      />
    );
    
    expect(screen.getByText('History Notes (/min)')).toBeInTheDocument();
  });

  it('should add hidden-label class when visible is false', () => {
    const { container } = render(
      <LabelDesigner 
        {...defaultProps}
        visible={false}
      />
    );
    
    const wrapper = container.querySelector('.control-wrapper-content');
    expect(wrapper).toHaveClass('hidden-label');
  });

  it('should not call dispatch when not provided', () => {
    const { container } = render(
      <LabelDesigner 
        {...defaultProps}
        dispatch={undefined}
      />
    );

    const wrapper = container.querySelector('.control-wrapper-content');
    fireEvent.click(wrapper);
  });

  it('should not show delete button when deleteControl is not provided', () => {
    render(
      <LabelDesigner 
        {...defaultProps}
        deleteControl={undefined}
        showDeleteButton={true}
      />
    );
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should handle non-enter key events', () => {
    render(<LabelDesigner {...defaultProps} />);

    fireEvent.doubleClick(screen.getByText('History Notes'));
    const input = screen.getByRole('textbox');
    
    fireEvent.keyUp(input, { keyCode: 27 }); // Escape key
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should handle blur when input has no value', () => {
    render(<LabelDesigner {...defaultProps} />);

    fireEvent.doubleClick(screen.getByText('History Notes'));
    const input = screen.getByRole('textbox');
    
    Object.defineProperty(input, 'value', {
      writable: true,
      value: '',
    });
    
    fireEvent.blur(input);
    
    expect(screen.getByText('History Notes')).toBeInTheDocument();
  });

  it('should display label value without units when units not provided', () => {
    const metadataWithoutUnits = {
      ...metadata,
      units: undefined,
    };

    render(
      <LabelDesigner 
        {...defaultProps}
        metadata={metadataWithoutUnits}
      />
    );
    
    expect(screen.getByText('History Notes')).toBeInTheDocument();
  });

  it('should handle empty input value on enter', async () => {
    const user = userEvent.setup();
    render(<LabelDesigner {...defaultProps} />);

    fireEvent.doubleClick(screen.getByText('History Notes'));
    const input = screen.getByRole('textbox');
    
    await user.clear(input);
    fireEvent.keyUp(input, { keyCode: 13 });
    
    expect(screen.getByText('History Notes')).toBeInTheDocument();
  });
});
