import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropDown } from 'src/components/DropDown.jsx';
import constants from 'src/constants';
import { Error } from 'src/Error';

describe('DropDown Component', () => {
  const options = [
    { name: 'one', value: 'One', uuid: '1', display: 'One' },
    { name: 'two', value: 'Two', uuid: '2', display: 'Two' },
    { name: 'three', value: 'Three', uuid: '3', display: 'Three' },
  ];

  let mockOnValueChange;

  beforeEach(() => {
    mockOnValueChange = jest.fn();
  });

  describe('Rendering', () => {
    it('should render dropdown component', () => {
      render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
        />
      );

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeInTheDocument();
      expect(dropdown).not.toBeDisabled();
    });

    it('should render dropdown with default value', () => {
      render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
        />
      );

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeInTheDocument();
      expect(screen.getByText('One')).toBeInTheDocument();
    });

    it('should render dropdown as disabled when enabled is false', () => {
      render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          enabled={false}
        />
      );

      const selectControl = document.querySelector('.needsclick__control--is-disabled');
      expect(selectControl).toBeInTheDocument();
    });

    it('should show error state for validation errors', () => {
      const validations = [constants.validations.mandatory];
      render(
        <DropDown
          formFieldPath="test1.1/1-1"
          onValueChange={mockOnValueChange}
          options={options}
          validations={validations}
        />
      );

      const wrapper = screen.getByRole('combobox').closest('.obs-control-select-wrapper');
      expect(wrapper).toHaveClass('form-builder-error');
    });
  });

  describe('User Interactions', () => {
    it('should call onValueChange when option is selected', async () => {
      const user = userEvent.setup();

      render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
        />
      );

      const dropdown = screen.getByRole('combobox');
      await user.click(dropdown);

      await waitFor(() => {
        const option = screen.getByText('Two');
        expect(option).toBeInTheDocument();
      });

      const option = screen.getByText('Two');
      await user.click(option);

      expect(mockOnValueChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'two',
          value: 'Two',
          uuid: '2',
          display: 'Two',
        }),
        []
      );
    });

    it('should update displayed value when selection changes', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
        />
      );

      expect(screen.getByText('One')).toBeInTheDocument();

      rerender(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[1]}
        />
      );

      expect(screen.getByText('Two')).toBeInTheDocument();
    });

    it('should show options when dropdown is opened', async () => {
      const user = userEvent.setup();

      render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
        />
      );

      const dropdown = screen.getByRole('combobox');
      await user.click(dropdown);

      await waitFor(() => {
        expect(screen.getByText('One')).toBeInTheDocument();
        expect(screen.getByText('Two')).toBeInTheDocument();
        expect(screen.getByText('Three')).toBeInTheDocument();
      });
    });

    it('should not be searchable by default', async () => {
      const user = userEvent.setup();

      render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
        />
      );

      const dropdown = screen.getByRole('combobox');
      await user.type(dropdown, 'test');

      // Should not show typed text because it's not searchable
      expect(dropdown).not.toHaveValue('test');
    });

    it('should be searchable when searchable prop is true', async () => {
      const user = userEvent.setup();

      render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          searchable
        />
      );

      const dropdown = screen.getByRole('combobox');
      await user.type(dropdown, 'tw');

      // Should be able to type and filter options
      await waitFor(() => {
        expect(screen.getByText('Two')).toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('should call onValueChange with validation errors on mount when value is invalid', () => {
      const validations = [constants.validations.mandatory];

      render(
        <DropDown
          formFieldPath="test1.1/1-1"
          onValueChange={mockOnValueChange}
          options={options}
          validations={validations}
        />
      );

      const expectedError = new Error({ message: constants.validations.mandatory });
      expect(mockOnValueChange).toHaveBeenCalledWith(undefined, [expectedError]);
    });


    it('should remove validation errors when valid value is selected', async () => {
      const user = userEvent.setup();
      const validations = [constants.validations.mandatory];

      render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validations={validations}
        />
      );

      const dropdown = screen.getByRole('combobox');
      await user.click(dropdown);

      await waitFor(() => {
        const option = screen.getByText('One');
        expect(option).toBeInTheDocument();
      });

      const option = screen.getByText('One');
      await user.click(option);

      expect(mockOnValueChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'one',
          value: 'One',
        }),
        []
      );
    });
  });

  describe('Component Behavior', () => {
    it('should call onValueChange on mount when value is provided', () => {
      render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
        />
      );

      expect(mockOnValueChange).toHaveBeenCalled();
    });

    it('should handle prop changes correctly', () => {
      const { rerender } = render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
        />
      );

      expect(screen.getByText('One')).toBeInTheDocument();

      rerender(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[2]}
        />
      );

      expect(screen.getByText('Three')).toBeInTheDocument();
    });

    it('should handle undefined value gracefully', () => {
      render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={undefined}
        />
      );

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeInTheDocument();
      // When no value is selected, react-select shows placeholder or empty state
      expect(screen.queryByText('One')).not.toBeInTheDocument();
      expect(screen.queryByText('Two')).not.toBeInTheDocument();
      expect(screen.queryByText('Three')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={[]}
        />
      );

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeInTheDocument();
    });

    it('should handle options without uuid property', () => {
      const optionsWithoutUuid = [
        { name: 'option1', value: 'Option 1', display: 'Option 1' },
        { name: 'option2', value: 'Option 2', display: 'Option 2' },
      ];

      render(
        <DropDown
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={optionsWithoutUuid}
        />
      );

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeInTheDocument();
    });
  });
});
