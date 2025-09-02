import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../src/components/Button.jsx';

describe('Button (RTL Example)', () => {
  const defaultProps = {
    formFieldPath: 'test-0',
    onValueChange: jest.fn(),
    options: [
      { name: 'Option 1', value: 'option1' },
      { name: 'Option 2', value: 'option2' },
    ],
    validate: false,
    validateForm: false,
    validations: [],
  };

  it('should render button options', () => {
    render(<Button {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /option 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /option 2/i })).toBeInTheDocument();
  });

  it('should call onValueChange when button is clicked', async () => {
    const mockOnValueChange = jest.fn();
    render(<Button {...defaultProps} onValueChange={mockOnValueChange} />);
    
    await userEvent.click(screen.getByRole('button', { name: /option 1/i }));
    
    expect(mockOnValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Option 1', value: 'option1' }),
      expect.any(Array)
    );
  });

  it('should show disabled state when enabled is false', () => {
    render(<Button {...defaultProps} enabled={false} />);
    
    expect(screen.getByRole('button', { name: /option 1/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /option 2/i })).toBeDisabled();
  });
});
