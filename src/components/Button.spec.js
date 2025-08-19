import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button.tsx';
import constants from '../constants.js';

// Mock the Validator
jest.mock('../helpers/Validator', () => ({
  Validator: {
    getErrors: jest.fn(() => []),
  },
}));

// Mock ComponentStore
jest.mock('../helpers/componentStore', () => ({
  registerComponent: jest.fn(),
}));

describe('Button Component', () => {
  const value = { name: 'Yes', value: true };
  const options = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];

  let mockOnValueChange;

  beforeEach(() => {
    mockOnValueChange = jest.fn();
    jest.clearAllMocks();
  });

  const defaultProps = {
    formFieldPath: "test1.1/1-0",
    onValueChange: mockOnValueChange,
    options: options,
    validate: false,
    validateForm: false,
    validations: [],
  };

  it('should render button component', () => {
    render(<Button {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    
    expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument();
    
    expect(buttons[0]).toHaveClass('fl');
    expect(buttons[1]).toHaveClass('fl');
    
    const container = screen.getByRole('group');
    expect(container).toHaveClass('form-control-buttons');
  });

  it('should render button with default value', () => {
    render(<Button {...defaultProps} value={value} />);
    
    const yesButton = screen.getByRole('button', { name: /yes/i });
    const noButton = screen.getByRole('button', { name: /no/i });
    
    expect(yesButton).toHaveClass('fl', 'active');
    expect(noButton).toHaveClass('fl');
    expect(noButton).not.toHaveClass('active');
  });

  it('should check errors after mount if the formFieldPath suffix is not 0', () => {
    const { Validator } = require('');
    Validator.getErrors.mockReturnValue([{ errorType: 'mandatory' }]);
    
    render(
      <Button
        {...defaultProps}
        formFieldPath="test1.1/1-1"
        validate={true}
        validations={[constants.validations.mandatory]}
      />
    );

    const container = screen.getByRole('group');
    expect(container).toHaveClass('form-builder-error');
  });

  it('should not check errors after mount if the formFieldPath suffix is 0', () => {
    render(<Button {...defaultProps} />);

    const container = screen.getByRole('group');
    expect(container).not.toHaveClass('form-builder-error');
  });

  it('should change the value on click', async () => {
    const user = userEvent.setup();
    
    render(<Button {...defaultProps} value={value} />);
    
    const yesButton = screen.getByRole('button', { name: /yes/i });
    const noButton = screen.getByRole('button', { name: /no/i });
    
    expect(yesButton).toHaveClass('active');
    expect(noButton).not.toHaveClass('active');

    await user.click(noButton);
    
    expect(mockOnValueChange).toHaveBeenCalledWith(options[1], []);
  });

  it('should change the value to undefined if double clicked', async () => {
    const user = userEvent.setup();
    
    const { rerender } = render(<Button {...defaultProps} />);
    
    const noButton = screen.getByRole('button', { name: /no/i });
    
    await user.click(noButton);
    expect(mockOnValueChange).toHaveBeenCalledWith(options[1], []);

    // Simulate prop update
    rerender(<Button {...defaultProps} value={options[1]} />);

    await user.click(noButton);
    expect(mockOnValueChange).toHaveBeenCalledWith(undefined, []);
  });

  it('should throw validation error on change if present', async () => {
    const user = userEvent.setup();
    const { Validator } = require('../helpers/Validator');
    
    // Mock validation error when value is undefined
    Validator.getErrors.mockImplementation((controlDetails) => {
      if (!controlDetails.value) {
        return [{ errorType: 'mandatory' }];
      }
      return [];
    });

    const validations = [constants.validations.mandatory];
    const { rerender } = render(
      <Button
        {...defaultProps}
        validations={validations}
      />
    );
    
    const container = screen.getByRole('group');
    expect(container).toHaveClass('form-control-buttons');
    expect(container).not.toHaveClass('form-builder-error');

    const noButton = screen.getByRole('button', { name: /no/i });
    await user.click(noButton);

    // Simulate prop update with value
    rerender(
      <Button
        {...defaultProps}
        validations={validations}
        value={options[1]}
      />
    );

    // Click again to deselect
    await user.click(noButton);
    
    await waitFor(() => {
      const updatedContainer = screen.getByRole('group');
      expect(updatedContainer).toHaveClass('form-control-buttons', 'form-builder-error');
    });
  });

  it('should validate Button when validate is set to true', async () => {
    const { Validator } = require('../helpers/Validator');
    Validator.getErrors.mockReturnValue([{ errorType: 'mandatory' }]);

    const validations = [constants.validations.mandatory];
    const { rerender } = render(
      <Button
        {...defaultProps}
        validations={validations}
        value={undefined}
        validate={false}
      />
    );

    let container = screen.getByRole('group');
    expect(container).toHaveClass('form-control-buttons');
    expect(container).not.toHaveClass('form-builder-error');

    rerender(
      <Button
        {...defaultProps}
        validations={validations}
        value={undefined}
        validate={true}
      />
    );

    await waitFor(() => {
      container = screen.getByRole('group');
      expect(container).toHaveClass('form-builder-error');
    });
  });

  it('should render button with multiple values', () => {
    render(
      <Button
        {...defaultProps}
        multiSelect={true}
        value={options}
      />
    );
    
    const yesButton = screen.getByRole('button', { name: /yes/i });
    const noButton = screen.getByRole('button', { name: /no/i });
    
    expect(yesButton).toHaveClass('fl', 'active');
    expect(noButton).toHaveClass('fl', 'active');
  });

  it('should change the value on click for multiselect', async () => {
    const user = userEvent.setup();
    
    render(
      <Button
        {...defaultProps}
        multiSelect={true}
        value={undefined}
      />
    );
    
    const yesButton = screen.getByRole('button', { name: /yes/i });
    const noButton = screen.getByRole('button', { name: /no/i });
    
    expect(yesButton).not.toHaveClass('active');
    expect(noButton).not.toHaveClass('active');

    await user.click(noButton);
    expect(mockOnValueChange).toHaveBeenCalledWith([options[1]], []);
  });

  it('should return empty array when chosen value is deselected', async () => {
    const user = userEvent.setup();
    
    render(
      <Button
        {...defaultProps}
        multiSelect={true}
        value={[options[0]]}
      />
    );
    
    const yesButton = screen.getByRole('button', { name: /yes/i });
    const noButton = screen.getByRole('button', { name: /no/i });
    
    expect(yesButton).toHaveClass('active');
    expect(noButton).not.toHaveClass('active');

    await user.click(yesButton);
    expect(mockOnValueChange).toHaveBeenCalledWith([], []);
  });

  it('should take value based on the valueKey specified', () => {
    const optionsWithoutValueKey = [
      { name: 'Yes' },
      { name: 'No' },
    ];

    render(
      <Button
        {...defaultProps}
        options={optionsWithoutValueKey}
        value={{ name: 'Yes' }}
        valueKey="name"
      />
    );
    
    const yesButton = screen.getByRole('button', { name: /yes/i });
    const noButton = screen.getByRole('button', { name: /no/i });
    
    expect(yesButton).toHaveClass('active');
    expect(noButton).not.toHaveClass('active');
  });

  it('should update component when the value of enabled is changed', () => {
    const { rerender } = render(
      <Button
        {...defaultProps}
        enabled={true}
      />
    );
    
    let buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).not.toBeDisabled();
    });

    rerender(
      <Button
        {...defaultProps}
        enabled={false}
      />
    );

    buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('should trigger onValueChange when mounting component and the value is not undefined', () => {
    render(
      <Button
        {...defaultProps}
        value={value}
      />
    );
    
    expect(mockOnValueChange).toHaveBeenCalledWith(value, [], true);
  });

  it('should trigger onValueChange when the value is changed', () => {
    const { rerender } = render(<Button {...defaultProps} />);

    rerender(<Button {...defaultProps} value={[options[1]]} />);
    
    expect(mockOnValueChange).toHaveBeenCalledWith([options[1]], []);
  });

  it('should have proper accessibility attributes', () => {
    render(<Button {...defaultProps} value={value} />);
    
    const container = screen.getByRole('group');
    expect(container).toHaveAttribute('aria-label', 'Button group');
    
    const yesButton = screen.getByRole('button', { name: /yes/i });
    const noButton = screen.getByRole('button', { name: /no/i });
    
    expect(yesButton).toHaveAttribute('aria-pressed', 'true');
    expect(noButton).toHaveAttribute('aria-pressed', 'false');
    expect(yesButton).toHaveAttribute('type', 'button');
    expect(noButton).toHaveAttribute('type', 'button');
  });
});
