import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddMore } from 'src/components/AddMore.jsx';

describe('AddMore', () => {
  let mockOnAdd;
  let mockOnRemove;

  beforeEach(() => {
    mockOnAdd = jest.fn();
    mockOnRemove = jest.fn();
  });

  it('should render both add and remove buttons with proper callbacks', () => {
    render(<AddMore canAdd canRemove onAdd={mockOnAdd} onRemove={mockOnRemove} />);

    const buttons = screen.getAllByRole('button');
    const addButton = buttons.find(btn => btn.classList.contains('form-builder-add-more'));
    const removeButton = buttons.find(btn => btn.classList.contains('form-builder-remove'));
    
    expect(addButton).toBeInTheDocument();
    expect(removeButton).toBeInTheDocument();
    expect(addButton.querySelector('.fa-plus')).toBeInTheDocument();
    expect(removeButton.querySelector('.fa-remove')).toBeInTheDocument();
  });

  it('should not render add button when canAdd is false', () => {
    render(<AddMore canAdd={false} canRemove onAdd={mockOnAdd} onRemove={mockOnRemove} />);

    expect(document.querySelector('.form-builder-add-more')).not.toBeInTheDocument();
    expect(document.querySelector('.form-builder-remove')).toBeInTheDocument();
    expect(document.querySelector('.fa-remove')).toBeInTheDocument();
  });

  it('should not render remove button when canRemove is false', () => {
    render(<AddMore canAdd canRemove={false} onAdd={mockOnAdd} onRemove={mockOnRemove} />);

    expect(document.querySelector('.form-builder-add-more')).toBeInTheDocument();
    expect(document.querySelector('.form-builder-remove')).not.toBeInTheDocument();
    expect(document.querySelector('.fa-plus')).toBeInTheDocument();
  });

  it('should call correct callbacks on button clicks', async () => {
    render(<AddMore canAdd canRemove onAdd={mockOnAdd} onRemove={mockOnRemove} />);

    const addButton = document.querySelector('.form-builder-add-more');
    const removeButton = document.querySelector('.form-builder-remove');

    await userEvent.click(addButton);
    expect(mockOnAdd).toHaveBeenCalledTimes(1);

    await userEvent.click(removeButton);
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('should enable plus & remove buttons when enabled is true', () => {
    render(<AddMore canAdd canRemove onAdd={mockOnAdd} onRemove={mockOnRemove} />);

    const addButton = document.querySelector('.form-builder-add-more');
    const removeButton = document.querySelector('.form-builder-remove');

    expect(addButton).not.toBeDisabled();
    expect(removeButton).not.toBeDisabled();
  });

  it('should disable plus & remove buttons when enabled is false', () => {
    render(<AddMore canAdd canRemove enabled={false} onAdd={mockOnAdd} onRemove={mockOnRemove} />);

    const addButton = document.querySelector('.form-builder-add-more');
    const removeButton = document.querySelector('.form-builder-remove');

    expect(addButton).toBeDisabled();
    expect(removeButton).toBeDisabled();
  });
});
