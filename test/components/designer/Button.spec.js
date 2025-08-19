import React from 'react';
import { render, screen } from '@testing-library/react';
import { ButtonDesigner } from 'components/designer/Button.jsx';

// Mock ComponentStore
jest.mock('src/helpers/componentStore', () => ({
  registerDesignerComponent: jest.fn(),
}));

describe('Button Designer', () => {
  const options = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];

  const defaultProps = {
    options: options,
  };

  it('should render designer button', () => {
    render(<ButtonDesigner {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument();
    
    // Designer buttons should be disabled
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('should have correct button attributes', () => {
    render(<ButtonDesigner {...defaultProps} />);
    
    const yesButton = screen.getByRole('button', { name: /yes/i });
    const noButton = screen.getByRole('button', { name: /no/i });
    
    expect(yesButton).toHaveAttribute('title', 'Yes');
    expect(noButton).toHaveAttribute('title', 'No');
    expect(yesButton).toHaveAttribute('type', 'button');
    expect(noButton).toHaveAttribute('type', 'button');
  });

  it('should render with form-control-buttons class', () => {
    const { container } = render(<ButtonDesigner {...defaultProps} />);
    
    const buttonContainer = container.querySelector('.form-control-buttons');
    expect(buttonContainer).toBeInTheDocument();
  });

  it('should handle empty options array', () => {
    render(<ButtonDesigner options={[]} />);
    
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('should render multiple options correctly', () => {
    const multipleOptions = [
      { name: 'Option 1', value: 1 },
      { name: 'Option 2', value: 2 },
      { name: 'Option 3', value: 3 },
      { name: 'Option 4', value: 4 },
    ];

    render(<ButtonDesigner options={multipleOptions} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);

    multipleOptions.forEach((option, index) => {
      expect(screen.getByRole('button', { name: new RegExp(option.name, 'i') })).toBeInTheDocument();
      expect(buttons[index]).toHaveAttribute('title', option.name);
    });
  });
});
