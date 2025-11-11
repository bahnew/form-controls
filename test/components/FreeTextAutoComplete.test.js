import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FreeTextAutoComplete } from 'src/components/FreeTextAutoComplete.jsx';

// Mock react-select v5 CreatableSelect to make testing predictable
jest.mock('react-select/creatable', () => ({
  __esModule: true,
  default: ({ onChange, value, options = [], id, isMulti, isClearable, backspaceRemovesValue, ...props }) => {
    const currentValue = value || '';
    
    const handleSelectChange = (e) => {
      if (onChange) {
        onChange(e.target.value || null);
      }
    };

    const handleInputKeyDown = (e) => {
      if (e.key === 'Enter' && e.target.value.trim() && onChange) {
        onChange(e.target.value.trim());
        e.target.value = '';
      }
    };

    return (
      <div data-testid="select-container">
        <select
          data-testid="react-select"
          value={currentValue}
          onChange={handleSelectChange}
          id={id}
          data-is-multi={isMulti?.toString() || 'false'}
          data-is-clearable={isClearable?.toString() || 'false'}
          data-backspace-removes-value={backspaceRemovesValue?.toString() || 'false'}
          data-current-value={currentValue}
          {...props}
        >
          <option value="">Select option...</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
          {currentValue && !options.some(opt => opt.value === currentValue) && (
            <option value={currentValue}>{currentValue}</option>
          )}
        </select>
        <input
          data-testid="creatable-input"
          placeholder="Type to create new option"
          onKeyDown={handleInputKeyDown}
        />
      </div>
    );
  },
}));

describe('FreeTextAutoComplete', () => {
  const options = [
    { label: 'one', value: 'One' },
    { label: 'two', value: 'Two' },
    { label: 'three', value: 'Three' },
  ];

  let mockOnChange;

  beforeEach(() => {
    mockOnChange = jest.fn();
  });

  describe('rendering', () => {
    it('should render FreeTextAutoComplete component', () => {
      render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value={undefined}
        />
      );

      expect(screen.getByTestId('react-select')).toBeInTheDocument();
      expect(screen.getByTestId('creatable-input')).toBeInTheDocument();
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('should render options in select', () => {
      render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value={undefined}
        />
      );

      options.forEach((option) => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    it('should render with default value', () => {
      render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value="One"
        />
      );

      const selectElement = screen.getByTestId('react-select');
      expect(selectElement).toHaveAttribute('data-current-value', 'One');
    });

    it('should render with concept UUID as id', () => {
      const conceptUuid = 'test-concept-uuid';
      render(
        <FreeTextAutoComplete
          conceptUuid={conceptUuid}
          onChange={mockOnChange}
          options={options}
          value={undefined}
        />
      );

      expect(screen.getByTestId('react-select')).toHaveAttribute('id', conceptUuid);
    });

    it('should render with default props when not specified', () => {
      render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value={undefined}
        />
      );

      const selectElement = screen.getByTestId('react-select');
      // v5 prop names: isMulti, isClearable, backspaceRemovesValue
      expect(selectElement).toHaveAttribute('data-is-multi', 'false');
      expect(selectElement).toHaveAttribute('data-is-clearable', 'false');
      expect(selectElement).toHaveAttribute('data-backspace-removes-value', 'false');
    });
  });

  describe('user interactions', () => {
    it('should call onChange when selecting an option', async () => {
      render(
        <FreeTextAutoComplete
          locale="en"
          onChange={mockOnChange}
          options={options}
          translationKey="SOME_KEY"
          type="label"
          value="One"
        />
      );

      const selectElement = screen.getByTestId('react-select');
      await userEvent.selectOptions(selectElement, 'Two');

      expect(mockOnChange).toHaveBeenCalledWith('Two', 'label', 'SOME_KEY', 'en');
    });

    it('should handle onChange without optional parameters', async () => {
      render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value="One"
        />
      );

      const selectElement = screen.getByTestId('react-select');
      await userEvent.selectOptions(selectElement, 'Two');

      expect(mockOnChange).toHaveBeenCalledWith('Two', undefined, undefined, undefined);
    });

    it('should allow creating new options by typing', async () => {
      render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value={undefined}
        />
      );

      const creatableInput = screen.getByTestId('creatable-input');
      await userEvent.type(creatableInput, 'New Option');
      fireEvent.keyDown(creatableInput, { key: 'Enter', code: 'Enter' });

      expect(mockOnChange).toHaveBeenCalledWith('New Option', undefined, undefined, undefined);
    });

    it('should not trigger onChange when typing without pressing Enter', async () => {
      render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value={undefined}
        />
      );

      const creatableInput = screen.getByTestId('creatable-input');
      await userEvent.type(creatableInput, 'New Option');

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('prop updates', () => {
    it('should update displayed options when options prop changes', () => {
      const { rerender } = render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value="One"
        />
      );

      expect(screen.getByText('one')).toBeInTheDocument();
      expect(screen.getByText('two')).toBeInTheDocument();
      expect(screen.getByTestId('react-select')).toHaveAttribute('data-current-value', 'One');

      const newOptions = [
        { label: '1', value: 'One' },
        { label: '2', value: 'Two' },
      ];

      rerender(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={newOptions}
          value="Two"
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByTestId('react-select')).toHaveAttribute('data-current-value', 'Two');
      expect(screen.queryByText('one')).not.toBeInTheDocument();
      expect(screen.queryByText('three')).not.toBeInTheDocument();
    });

    it('should maintain options when other props change', () => {
      const { rerender } = render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value="One"
        />
      );

      expect(screen.getByText('one')).toBeInTheDocument();
      expect(screen.getByText('two')).toBeInTheDocument();
      expect(screen.getByTestId('react-select')).toHaveAttribute('data-current-value', 'One');

      rerender(
        <FreeTextAutoComplete
          clearable={true}
          onChange={mockOnChange}
          options={options}
          value="One"
        />
      );

      expect(screen.getByText('one')).toBeInTheDocument();
      expect(screen.getByText('two')).toBeInTheDocument();
      expect(screen.getByTestId('react-select')).toHaveAttribute('data-current-value', 'One');
    });

    it('should update both options and value simultaneously', () => {
      const { rerender } = render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value="One"
        />
      );

      const newOptions = [
        { label: 'first', value: 'First' },
        { label: 'second', value: 'Second' },
      ];

      rerender(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={newOptions}
          value="Second"
        />
      );

      expect(screen.getByText('first')).toBeInTheDocument();
      expect(screen.getByText('second')).toBeInTheDocument();
      expect(screen.getByTestId('react-select')).toHaveAttribute('data-current-value', 'Second');
    });
  });

  describe('component behavior', () => {
    it('should handle empty options array', () => {
      render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={[]}
          value={undefined}
        />
      );

      expect(screen.getByTestId('react-select')).toBeInTheDocument();
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('should handle null/undefined value', () => {
      render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value={null}
        />
      );

      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('should handle value not present in options', () => {
      render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value="NonExistentValue"
        />
      );

      expect(screen.getByTestId('react-select')).toHaveAttribute('data-current-value', 'NonExistentValue');
    });

    it('should pass through custom props to CreatableSelect', () => {
      render(
        <FreeTextAutoComplete
          backspaceRemoves={true}
          clearable={true}
          multi={true}
          onChange={mockOnChange}
          options={options}
          value="One"
        />
      );

      const selectElement = screen.getByTestId('react-select');
      // v5: Check the correct prop names that were converted
      expect(selectElement).toHaveAttribute('data-is-multi', 'true');
      expect(selectElement).toHaveAttribute('data-is-clearable', 'true');
      expect(selectElement).toHaveAttribute('data-backspace-removes-value', 'true');
    });
  });

  describe('edge cases', () => {

    it('should handle empty string value', () => {
      render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value=""
        />
      );

      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('should maintain component functionality after multiple re-renders', async () => {
      const { rerender } = render(
        <FreeTextAutoComplete
          onChange={mockOnChange}
          options={options}
          value="One"
        />
      );

      // Multiple re-renders
      for (let i = 0; i < 5; i++) {
        rerender(
          <FreeTextAutoComplete
            onChange={mockOnChange}
            options={options}
            value={i % 2 === 0 ? "One" : "Two"}
          />
        );
      }

      // Component should still be functional
      const selectElement = screen.getByTestId('react-select');
      await userEvent.selectOptions(selectElement, 'Three');

      expect(mockOnChange).toHaveBeenCalledWith('Three', undefined, undefined, undefined);
    });
  });
});
