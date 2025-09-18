import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from 'src/components/Button.jsx';
import constants from 'src/constants';
import { Validator } from 'src/helpers/Validator';

describe('Button Component', () => {
  const value = { name: 'Yes', value: true };
  const options = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];

  let mockOnValueChange;

  beforeEach(() => {
    mockOnValueChange = jest.fn();
  });

  describe('Rendering', () => {
    it('should render button component', () => {
      render(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument();

      expect(buttons[0]).toHaveClass('fl');
      expect(buttons[1]).toHaveClass('fl');
      expect(buttons[0].closest('div')).toHaveClass('form-control-buttons');
    });

    it('should render button with default value', () => {
      render(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={value}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toHaveClass('fl active');
      expect(screen.getByRole('button', { name: /no/i })).toHaveClass('fl');
    });

    it('should show error state when formFieldPath suffix is not 0', () => {
      render(
        <Button
          formFieldPath="test1.1/1-1"
          onValueChange={mockOnValueChange}
          options={options}
          validate
          validateForm={false}
          validations={[constants.validations.mandatory]}
        />
      );

      expect(screen.getAllByRole('button')[0].closest('div')).toHaveClass('form-builder-error');
    });

    it('should not show error state when formFieldPath suffix is 0', () => {
      render(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      expect(screen.getAllByRole('button')[0].closest('div')).not.toHaveClass('form-builder-error');
    });
  });

  describe('User Interactions', () => {
    it('should change the value on click', async () => {
      const { rerender } = render(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={value}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toHaveClass('fl active');
      expect(screen.getByRole('button', { name: /no/i })).toHaveClass('fl');

      await userEvent.click(screen.getByRole('button', { name: /no/i }));
      expect(mockOnValueChange).toHaveBeenCalledWith(options[1], []);

      rerender(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={options[1]}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toHaveClass('fl');
      expect(screen.getByRole('button', { name: /no/i })).toHaveClass('fl active');
    });

    it('should change the value to undefined if double clicked', async () => {
      const { rerender } = render(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: /no/i }));
      expect(mockOnValueChange).toHaveBeenCalledWith(options[1], []);

      rerender(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={options[1]}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: /no/i }));
      expect(mockOnValueChange).toHaveBeenCalledWith(undefined, []);
    });

    it('should show validation error on change if present', async () => {
      const validations = [constants.validations.mandatory];
      const { rerender } = render(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={validations}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: /no/i }));
      expect(screen.getAllByRole('button')[0].closest('div')).toHaveClass('form-control-buttons');

      rerender(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={validations}
          value={options[1]}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: /no/i }));
      expect(screen.getAllByRole('button')[0].closest('div')).toHaveClass('form-control-buttons form-builder-error');
    });

    it('should change the value on click for multiselect', async () => {
      const { rerender } = render(
        <Button
          formFieldPath="test1.1/1-0"
          multiSelect
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={undefined}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toHaveClass('fl');
      expect(screen.getByRole('button', { name: /no/i })).toHaveClass('fl');

      await userEvent.click(screen.getByRole('button', { name: /no/i }));
      expect(mockOnValueChange).toHaveBeenCalledWith([options[1]], []);

      rerender(
        <Button
          formFieldPath="test1.1/1-0"
          multiSelect
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={[options[1]]}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toHaveClass('fl');
      expect(screen.getByRole('button', { name: /no/i })).toHaveClass('fl active');
    });

    it('should return empty array when chosen value is deselected', async () => {
      render(
        <Button
          formFieldPath="test1.1/1-0"
          multiSelect
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={[options[0]]}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toHaveClass('fl active');
      expect(screen.getByRole('button', { name: /no/i })).toHaveClass('fl');

      await userEvent.click(screen.getByRole('button', { name: /yes/i }));
      expect(mockOnValueChange).toHaveBeenCalledWith([], []);
    });

    it('should take value based on the valueKey specified', async () => {
      const optionsWithoutValueKey = [
        { name: 'Yes' },
        { name: 'No' },
      ];

      render(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={optionsWithoutValueKey}
          validate={false}
          validateForm={false}
          validations={[]}
          value={{ name: 'Yes' }}
          valueKey="name"
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toHaveClass('fl active');
      expect(screen.getByRole('button', { name: /no/i })).toHaveClass('fl');

      await userEvent.click(screen.getByRole('button', { name: /no/i }));
      expect(mockOnValueChange).toHaveBeenCalledWith(optionsWithoutValueKey[1], []);
    });
  });

  describe('Component Behavior', () => {
    it('should not re-render if value is same', () => {
      const { rerender } = render(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={value}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toHaveClass('fl active');
      expect(screen.getByRole('button', { name: /no/i })).toHaveClass('fl');

      rerender(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={{ name: 'Yes', value: true }}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toHaveClass('fl active');
      expect(screen.getByRole('button', { name: /no/i })).toHaveClass('fl');
    });

    it('should validate Button when validate is set to true', () => {
      const validations = [constants.validations.mandatory];
      const { rerender } = render(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={validations}
          value
        />
      );

      rerender(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate
          validateForm={false}
          validations={validations}
          value={undefined}
        />
      );

      expect(screen.getAllByRole('button')[0].closest('div')).toHaveClass('form-control-buttons');
      expect(screen.getAllByRole('button')[0].closest('div')).toHaveClass('form-builder-error');
    });

    it('should re-render on change of value', () => {
      const { rerender } = render(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={value}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toHaveClass('fl active');
      expect(screen.getByRole('button', { name: /no/i })).toHaveClass('fl');

      rerender(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={undefined}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toHaveClass('fl');
      expect(screen.getByRole('button', { name: /no/i })).toHaveClass('fl');

      rerender(
        <Button
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={{ name: 'No', value: false }}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toHaveClass('fl');
      expect(screen.getByRole('button', { name: /no/i })).toHaveClass('fl active');
    });

    it('should render button with multiple values', () => {
      render(
        <Button
          formFieldPath="test1.1/1-0"
          multiSelect
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={options}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toHaveClass('fl active');
      expect(screen.getByRole('button', { name: /no/i })).toHaveClass('fl active');
    });

    it('should disable buttons when enabled is false', () => {
      const { rerender } = render(
        <Button
          enabled
          formFieldPath="test1.1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /no/i })).not.toBeDisabled();

      rerender(
        <Button
          enabled={false}
          formFieldPath="test1.1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      expect(screen.getByRole('button', { name: /yes/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /no/i })).toBeDisabled();
    });

    it('should trigger onValueChange when mounting component with value', () => {
      render(
        <Button
          enabled
          formFieldPath="test1.1-0"
          onValueChange={mockOnValueChange}
          options={[]}
          validate={false}
          validateForm={false}
          validations={[]}
          value={value}
        />
      );

      expect(mockOnValueChange).toHaveBeenCalled();
    });

    it('should trigger onValueChange when value prop changes', () => {
      const { rerender } = render(
        <Button
          formFieldPath="test1.1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      rerender(
        <Button
          formFieldPath="test1.1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[]}
          value={[options[1]]}
        />
      );

      expect(mockOnValueChange).toHaveBeenCalledWith([options[1]], []);
    });

    it('should handle undefined errors from validator gracefully', () => {
      const getErrorsSpy = jest.spyOn(Validator, 'getErrors').mockReturnValue(undefined);
      render(
        <Button
          formFieldPath="test1.1/1-1"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validateForm={false}
          validations={[constants.validations.mandatory]}
        />
      );

      expect(screen.getAllByRole('button')[0].closest('div')).not.toHaveClass('form-builder-error');
      expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument();

      getErrorsSpy.mockRestore();
    });
  });
});
