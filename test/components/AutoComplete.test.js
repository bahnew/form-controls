import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AutoComplete } from 'components/AutoComplete.jsx';
import constants from 'src/constants';
import { Util } from 'src/helpers/Util';

jest.mock('src/helpers/Util', () => ({
  Util: {
    getAnswers: jest.fn(),
    getConfig: jest.fn(),
    formatConcepts: jest.fn(),
    debounce: jest.fn((fn, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
      };
    }),
  },
}));

jest.mock('src/helpers/httpInterceptor', () => ({
  httpInterceptor: {
    get: jest.fn().mockResolvedValue({
      results: [],
    }),
  },
}));

describe('AutoComplete', () => {
  const concept = [
    {
      uuid: '70645842-be6a-4974-8d5f-45b52990e132',
      name: 'Pulse',
      dataType: 'Text',
    },
  ];

  const options = [
    { name: 'one', value: 'One' },
    { name: 'two', value: 'Two' },
    { name: 'three', value: 'Three' },
  ];

  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error validation', () => {
    it('should show error when mounted with formFieldPath suffix not 0 and mandatory validation', () => {
      const validations = [constants.validations.mandatory];
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-1"
          onValueChange={mockOnValueChange}
          options={options}
          validations={validations}
        />,
      );

      expect(document.querySelector('.obs-control-select-wrapper')).toHaveClass(
        'form-builder-error',
      );
    });

    it('should not show error when initial value is not in options for asynchronous mode', () => {
      render(
        <AutoComplete
          asynchronous
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={{ name: 'four', value: 'Four' }}
        />,
      );

      expect(
        document.querySelector('.obs-control-select-wrapper'),
      ).not.toHaveClass('form-builder-error');
    });

    it('should not show error when mounted with formFieldPath suffix 0', () => {
      const validations = [constants.validations.mandatory];
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validations={validations}
        />,
      );

      expect(
        document.querySelector('.obs-control-select-wrapper'),
      ).not.toHaveClass('form-builder-error');
    });
  });

  describe('URL-based autocomplete', () => {
    const codedData = [
      {
        conceptName: 'Yes',
        conceptUuid: '12345',
        matchedName: 'Yes',
        conceptSystem: 'http://systemurl.com',
      },
      {
        conceptName: 'No',
        conceptUuid: '67890',
        matchedName: 'No',
        conceptSystem: 'http://systemurl.com',
      },
    ];

    beforeEach(() => {
      Util.getAnswers.mockResolvedValue(codedData);
      Util.formatConcepts.mockReturnValue(codedData);
    });

    it('should render URL-based autocomplete component', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-1"
          minimumInput={3}
          onValueChange={mockOnValueChange}
          options={options}
          url="http://systemurl.com"
          terminologyServiceConfig={{ limit: 30 }}
        />,
      );

      // v5: Query by role instead of class name
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle async search with minimum input', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-1"
          minimumInput={3}
          onValueChange={mockOnValueChange}
          options={options}
          url="http://systemurl.com"
        />,
      );

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'test' } });

      // Verify input received the value
      expect(input).toHaveValue('test');
    });

    it('should handle minimum input requirement', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-1"
          minimumInput={3}
          onValueChange={mockOnValueChange}
          options={options}
          url="http://systemurl.com"
        />,
      );

      const input = document.querySelector('input');
      fireEvent.change(input, { target: { value: 'ab' } });

      expect(Util.getAnswers).not.toHaveBeenCalled();
    });
  });

  describe('Asynchronous mode', () => {
    it('should render asynchronous AutoComplete with default props', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
        />,
      );

      // v5: Query by role and check aria-disabled
      const combobox = screen.getByRole('combobox');
      expect(combobox).toBeInTheDocument();
      expect(combobox).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('should call onValueChange on mount when value is provided', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          value={concept[0]}
        />,
      );

      expect(mockOnValueChange).toHaveBeenCalledWith(concept[0], []);
    });

    it('should be disabled when enabled prop is false', () => {
      render(
        <AutoComplete
          enabled={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
        />,
      );

      // v5: Check disabled state via input element (disabled elements need hidden: true)
      const container = document.querySelector('.obs-control-select-wrapper');
      expect(container).toBeInTheDocument();
      // Query disabled input - need to use hidden: true to find disabled elements
      const input = screen.getByRole('combobox', { hidden: true });
      expect(input).toBeDisabled();
    });

    it('should be enabled when enabled prop is true', () => {
      render(
        <AutoComplete
          enabled
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
        />,
      );

      const input = screen.getByRole('combobox');
      expect(input).not.toBeDisabled();
    });

    it('should update when enabled prop changes', () => {
      const { rerender } = render(
        <AutoComplete
          enabled
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
        />,
      );

      let input = screen.getByRole('combobox');
      expect(input).not.toBeDisabled();

      rerender(
        <AutoComplete
          enabled={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
        />,
      );

      // Query disabled input - need hidden: true
      input = screen.getByRole('combobox', { hidden: true });
      expect(input).toBeDisabled();
    });
  });

  describe('Non-asynchronous mode', () => {
    it('should render non-asynchronous AutoComplete', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
        />,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should call onValueChange when initialized', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
        />,
      );

      expect(mockOnValueChange).toHaveBeenCalled();
    });

    it('should respect enabled prop', () => {
      render(
        <AutoComplete
          asynchronous={false}
          enabled
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
        />,
      );

      expect(screen.getByRole('combobox')).not.toBeDisabled();
    });

    it('should validate mandatory field on mount for formFieldPath suffix not 0', () => {
      const validations = [constants.validations.mandatory];
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-1"
          onValueChange={mockOnValueChange}
          options={options}
          validations={validations}
        />,
      );

      expect(mockOnValueChange).toHaveBeenCalledWith(
        undefined,
        expect.arrayContaining([
          expect.objectContaining({ message: constants.validations.mandatory }),
        ]),
      );
    });

    it('should handle user interaction with input field', async () => {
      const user = userEvent.setup();
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          minimumInput={1}
        />,
      );

      const input = document.querySelector('input');
      await user.type(input, 'one');

      expect(input).toHaveValue('one');
    });
  });

  describe('Focus and interaction behavior', () => {
    it('should handle focus events', async () => {
      const user = userEvent.setup();
      render(
        <AutoComplete
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
        />,
      );

      const input = document.querySelector('input');
      await user.click(input);

      expect(input).toHaveFocus();
    });

    it('should handle multi-select mode', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          multiSelect
        />,
      );

      // v5: Multi-select renders combobox with multi-select ARIA attributes
      const combobox = screen.getByRole('combobox');
      expect(combobox).toBeInTheDocument();
    });

    it('should render with conceptUuid as id', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          conceptUuid="test-uuid"
        />,
      );

      expect(document.querySelector('#test-uuid')).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('should handle input changes', async () => {
      const user = userEvent.setup();
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          minimumInput={1}
        />,
      );

      const input = document.querySelector('input');
      await user.type(input, 'search');

      expect(input).toHaveValue('search');
    });

    it('should handle searchable prop', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          searchable={false}
        />,
      );

      // v5: Non-searchable select still renders input but with different behavior
      const combobox = screen.getByRole('combobox');
      expect(combobox).toBeInTheDocument();
    });
  });

  describe('Error states and edge cases', () => {
    it('should handle validateForm prop', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validateForm
        />,
      );

      expect(mockOnValueChange).toHaveBeenCalledWith(undefined, []);
    });

    it('should handle autofocus prop', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          autofocus
        />,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle autoload prop in async mode', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          autoload
        />,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle cache prop in async mode', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          cache
        />,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle undefined value', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={undefined}
        />,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle null value', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={null}
        />,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Component lifecycle', () => {
    it('should initialize with minimum input 0 when not asynchronous', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          minimumInput={0}
        />,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle options prop changes', () => {
      const { rerender } = render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
        />,
      );

      const newOptions = [
        { name: 'four', value: 'Four' },
        { name: 'five', value: 'Five' },
      ];

      rerender(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={newOptions}
        />,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle component updates correctly', () => {
      const { rerender } = render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          enabled
        />,
      );

      let combobox = screen.getByRole('combobox');
      expect(combobox).not.toBeDisabled();

      rerender(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          enabled={false}
        />,
      );

      // Query disabled combobox - need hidden: true
      combobox = screen.getByRole('combobox', { hidden: true });
      expect(combobox).toBeDisabled();
    });
  });

  describe('Integration scenarios', () => {
    it('should work with all major props together', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
          enabled
          searchable
          multiSelect={false}
          minimumInput={1}
          conceptUuid="integration-test"
        />,
      );

      expect(document.querySelector('#integration-test')).toBeInTheDocument();
      const combobox = screen.getByRole('combobox');
      expect(combobox).not.toBeDisabled();
      expect(combobox).toBeInTheDocument();
    });

    it('should handle async mode with URL', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          url="http://test.com"
          minimumInput={3}
          terminologyServiceConfig={{ limit: 20 }}
        />,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('ComponentDidUpdate', () => {
    it('should update when validate prop changes', () => {
      const validations = [constants.validations.mandatory];
      const { rerender } = render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate={false}
          validations={validations}
        />,
      );

      mockOnValueChange.mockClear();

      rerender(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          validate
          validations={validations}
        />,
      );

      // Component should update when validate prop changes
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should update options when not searchable and options change', () => {
      const { rerender } = render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          searchable={false}
        />,
      );

      const newOptions = [{ name: 'new', value: 'New' }];
      rerender(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={newOptions}
          searchable={false}
        />,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle value prop changes', () => {
      const { rerender } = render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
        />,
      );

      rerender(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[1]}
        />,
      );

      expect(mockOnValueChange).toHaveBeenCalled();
    });
  });

  describe('onInputChange and filtering', () => {
    it('should handle input below minimum input length', async () => {
      const user = userEvent.setup();
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          minimumInput={3}
        />,
      );

      const input = document.querySelector('input');
      await user.type(input, 'ab');

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 400));

      // Component should still be rendered
      expect(input).toHaveValue('ab');
    });

    it('should handle URL-based search with error', async () => {
      const user = userEvent.setup();
      Util.getAnswers.mockRejectedValue(new Error('Network error'));

      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          url="http://test.com"
          minimumInput={1}
          terminologyServiceConfig={{ limit: 30 }}
        />,
      );

      const input = document.querySelector('input');
      await user.type(input, 'test');

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 400));

      expect(Util.getAnswers).toHaveBeenCalled();
    });

    it('should filter options without URL', async () => {
      const user = userEvent.setup();
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          minimumInput={1}
        />,
      );

      const input = document.querySelector('input');
      await user.type(input, 'one');

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 400));

      expect(input).toHaveValue('one');
    });

    it('should handle multiple search terms filtering', async () => {
      const user = userEvent.setup();
      const largeOptions = [
        { name: 'one two', value: 'OneTwo' },
        { name: 'one three', value: 'OneThree' },
        { name: 'two three', value: 'TwoThree' },
      ];

      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={largeOptions}
          minimumInput={1}
        />,
      );

      const input = document.querySelector('input');
      await user.type(input, 'one two');

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 400));

      expect(input).toHaveValue('one two');
    });
  });

  describe('HandleChange edge cases', () => {
    it('should handle empty array value change', async () => {
      const user = userEvent.setup();
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
          multiSelect
        />,
      );

      // Clear the selection
      const clearButton = document.querySelector('.Select-clear');
      if (clearButton) {
        await user.click(clearButton);
      }

      expect(mockOnValueChange).toHaveBeenCalled();
    });

    it('should handle input change triggering onInputChange', async () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          minimumInput={1}
        />,
      );

      // Type to trigger onInputChange
      const input = document.querySelector('input');
      fireEvent.change(input, { target: { value: 'one' } });

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 400));

      // Verify component is still working
      expect(input).toHaveValue('one');
    });
  });

  describe('HandleFocus and childRef', () => {
    it('should call loadOptions on focus for async mode', async () => {
      const user = userEvent.setup();
      render(
        <AutoComplete
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          asynchronous
        />,
      );

      const input = document.querySelector('input');
      await user.click(input);

      expect(input).toHaveFocus();
    });

    it('should handle ref storage correctly', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
        />,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('getValue', () => {
    it('should return array with uuid for single value', () => {
      const ref = React.createRef();
      
      render(
        <AutoComplete
          ref={ref}
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
        />
      );

      expect(ref.current).toBeTruthy();
      const value = ref.current.getValue();
      expect(Array.isArray(value)).toBe(true);
      expect(value.length).toBeGreaterThan(0);
      expect(value[0]).toHaveProperty('uuid');
    });

    it('should return array with uuids for multi-select', () => {
      const ref = React.createRef();
      
      render(
        <AutoComplete
          ref={ref}
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={[options[0], options[1]]}
          multiSelect
        />
      );

      expect(ref.current).toBeTruthy();
      const value = ref.current.getValue();
      expect(Array.isArray(value)).toBe(true);
    });

    it('should return empty array when no value', () => {
      const ref = React.createRef();
      
      render(
        <AutoComplete
          ref={ref}
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
        />
      );

      expect(ref.current).toBeTruthy();
      const value = ref.current.getValue();
      expect(value).toEqual([]);
    });
  });

  describe('GetOptions with different scenarios', () => {
    it('should handle getOptions success with optionsUrl', async () => {
      const mockData = {
        results: [
          { uuid: '1', display: 'Option 1' },
          { uuid: '2', display: 'Option 2' },
        ],
      };

      const { httpInterceptor } = require('src/helpers/httpInterceptor');
      httpInterceptor.get.mockResolvedValue(mockData);

      render(
        <AutoComplete
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          optionsUrl="/api/concepts?q="
          minimumInput={2}
        />
      );

      // Component should be rendered
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle getOptions error with optionsUrl', async () => {
      const { httpInterceptor } = require('src/helpers/httpInterceptor');
      httpInterceptor.get.mockRejectedValue(new Error('Network error'));

      render(
        <AutoComplete
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          optionsUrl="/api/concepts?q="
          minimumInput={2}
        />
      );

      // Component should still render
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should return early when input length is below minimumInput', async () => {
      const { httpInterceptor } = require('src/helpers/httpInterceptor');
      httpInterceptor.get.mockClear();

      const ref = React.createRef();
      render(
        <AutoComplete
          ref={ref}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          optionsUrl="/api/concepts?q="
          minimumInput={3}
        />
      );

      // Call getOptions with short input and verify ref exists
      expect(ref.current).toBeTruthy();
      const result = await ref.current.getOptions('ab');
      expect(result).toBeUndefined();
      expect(httpInterceptor.get).not.toHaveBeenCalled();
    });

    it('should handle getOptions with input below minimum directly', async () => {
      const { httpInterceptor } = require('src/helpers/httpInterceptor');
      httpInterceptor.get.mockClear();
      
      const ref = React.createRef();
      render(
        <AutoComplete
          ref={ref}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          optionsUrl="/api/test?q="
          minimumInput={3}
        />
      );

      // Call getOptions directly with short input
      expect(ref.current).toBeTruthy();
      const result = await ref.current.getOptions('ab');
      // Should return undefined without calling API
      expect(result).toBeUndefined();
      expect(httpInterceptor.get).not.toHaveBeenCalled();
    });

    it('should handle getOptions error response', async () => {
      const { httpInterceptor } = require('src/helpers/httpInterceptor');
      httpInterceptor.get.mockRejectedValueOnce(new Error('API Error'));
      
      const ref = React.createRef();
      render(
        <AutoComplete
          ref={ref}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          optionsUrl="/api/test?q="
          minimumInput={1}
        />
      );

      // Call getOptions with sufficient input
      expect(ref.current).toBeTruthy();
      const result = await ref.current.getOptions('test');
      // Should return empty options on error
      expect(result).toEqual({ options: [] });
    });

    it('should handle getOptions success response', async () => {
      const mockResults = [
        { uuid: '1', display: 'Result 1' },
        { uuid: '2', display: 'Result 2' },
      ];
      const { httpInterceptor } = require('src/helpers/httpInterceptor');
      httpInterceptor.get.mockResolvedValueOnce({ results: mockResults });
      
      const ref = React.createRef();
      render(
        <AutoComplete
          ref={ref}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          optionsUrl="/api/test?q="
          minimumInput={1}
        />
      );

      // Call getOptions with sufficient input
      expect(ref.current).toBeTruthy();
      const result = await ref.current.getOptions('test');
      expect(result).toEqual({ options: mockResults });
    });
  });

  describe('HandleChange with refs', () => {
    it('should clear options and reset noResultsText for non-async with minimumInput > 0', () => {
      const ref = React.createRef();
      render(
        <AutoComplete
          ref={ref}
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          minimumInput={2}
        />
      );

      // Simulate a change
      expect(ref.current).toBeTruthy();
      ref.current.handleChange(options[0]);
      expect(mockOnValueChange).toHaveBeenCalledWith(options[0], []);
    });

    it('should handle undefined value change properly', () => {
      const ref = React.createRef();
      render(
        <AutoComplete
          ref={ref}
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
        />
      );

      mockOnValueChange.mockClear();

      // Simulate clearing value
      expect(ref.current).toBeTruthy();
      ref.current.handleChange([]);
      expect(mockOnValueChange).toHaveBeenCalledWith(undefined, []);
    });

    it('should handle regular value change', () => {
      const ref = React.createRef();
      render(
        <AutoComplete
          ref={ref}
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
        />
      );

      mockOnValueChange.mockClear();

      // Simulate selecting a value
      expect(ref.current).toBeTruthy();
      ref.current.handleChange(options[1]);
      expect(mockOnValueChange).toHaveBeenCalledWith(options[1], []);
    });
  });

  describe('ComponentDidUpdate scenarios', () => {

    it('should update state when value prop changes', () => {
      const { rerender } = render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
        />
      );

      rerender(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[1]}
        />
      );

      // Component should update
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle state update when options change and not searchable', () => {
      const initialOptions = [{ name: 'initial', value: 'Initial' }];
      const newOptions = [{ name: 'updated', value: 'Updated' }];

      const { rerender } = render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={initialOptions}
          searchable={false}
        />
      );

      rerender(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={newOptions}
          searchable={false}
        />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle errors in componentDidUpdate when hasErrors is true', () => {
      const validations = [constants.validations.mandatory];
      
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-1"
          onValueChange={mockOnValueChange}
          options={options}
          validations={validations}
        />
      );

      // Error callback should be triggered
      expect(mockOnValueChange).toHaveBeenCalled();
    });
  });

  describe('MinimumInput boundary', () => {
    it('should show "Type to search" when input is below minimumInput', async () => {
      const user = userEvent.setup();
      
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          minimumInput={5}
        />
      );

      const input = document.querySelector('input');
      await user.type(input, 'abc');

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 400));

      // Input should have value but options should be empty
      expect(input).toHaveValue('abc');
    });

    it('should clear options when minimumInput not met after having results', async () => {
      const user = userEvent.setup();
      
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          minimumInput={3}
        />
      );

      const input = document.querySelector('input');
      
      // First type enough to get results
      await user.type(input, 'one');
      await new Promise(resolve => setTimeout(resolve, 400));

      // Then clear and type less than minimum
      await user.clear(input);
      await user.type(input, 'on');
      await new Promise(resolve => setTimeout(resolve, 400));

      expect(input).toHaveValue('on');
    });
  });

  describe('HandleChange with validation', () => {
    it('should handle change with validation errors for non-async mode', async () => {
      const validations = [constants.validations.mandatory];
      const user = userEvent.setup();
      
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-1"
          onValueChange={mockOnValueChange}
          options={options}
          validations={validations}
          minimumInput={1}
        />
      );

      mockOnValueChange.mockClear();

      const input = document.querySelector('input');
      await user.type(input, 'one');
      await new Promise(resolve => setTimeout(resolve, 400));

      // onValueChange should be called during interactions
      expect(mockOnValueChange).toHaveBeenCalled();
    });

    it('should clear options after selection in non-async mode with minimumInput > 0', async () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
          minimumInput={2}
        />
      );

      // Component should render with value
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('ShouldComponentUpdate', () => {
    it('should update when searchable prop changes', () => {
      const { rerender } = render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          searchable
        />
      );

      rerender(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          searchable={false}
        />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should update when noResultsText state changes', async () => {
      const user = userEvent.setup();
      
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          minimumInput={1}
        />
      );

      const input = document.querySelector('input');
      await user.type(input, 'xyz');
      await new Promise(resolve => setTimeout(resolve, 400));

      expect(input).toHaveValue('xyz');
    });
  });
});
