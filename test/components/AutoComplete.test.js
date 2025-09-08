import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
      results: []
    })
  }
}));

describe('AutoComplete', () => {
  const concept = [{
    uuid: '70645842-be6a-4974-8d5f-45b52990e132',
    name: 'Pulse',
    dataType: 'Text',
  }];

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
        />
      );

      expect(document.querySelector('.obs-control-select-wrapper')).toHaveClass('form-builder-error');
    });

    it('should not show error when initial value is not in options for asynchronous mode', () => {
      render(
        <AutoComplete
          asynchronous
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={{ name: 'four', value: 'Four' }}
        />
      );

      expect(document.querySelector('.obs-control-select-wrapper')).not.toHaveClass('form-builder-error');
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
        />
      );

      expect(document.querySelector('.obs-control-select-wrapper')).not.toHaveClass('form-builder-error');
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
        />
      );

      expect(document.querySelector('.Select')).toBeInTheDocument();
    });

    it('should display loading state initially for async mode', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-1"
          minimumInput={3}
          onValueChange={mockOnValueChange}
          options={options}
          url="http://systemurl.com"
        />
      );

      const input = document.querySelector('input');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle minimum input requirement', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-1"
          minimumInput={3}
          onValueChange={mockOnValueChange}
          options={options}
          url="http://systemurl.com"
        />
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
        />
      );

      expect(document.querySelector('.Select')).toBeInTheDocument();
      expect(document.querySelector('.Select')).not.toHaveClass('is-disabled');
    });

    it('should call onValueChange on mount when value is provided', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          value={concept[0]}
        />
      );

      expect(mockOnValueChange).toHaveBeenCalledWith(concept[0], []);
    });

    it('should be disabled when enabled prop is false', () => {
      render(
        <AutoComplete
          enabled={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
        />
      );

      expect(document.querySelector('.Select')).toHaveClass('is-disabled');
    });

    it('should be enabled when enabled prop is true', () => {
      render(
        <AutoComplete
          enabled
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
        />
      );

      expect(document.querySelector('.Select')).not.toHaveClass('is-disabled');
    });

    it('should update when enabled prop changes', () => {
      const { rerender } = render(
        <AutoComplete
          enabled
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
        />
      );

      expect(document.querySelector('.Select')).not.toHaveClass('is-disabled');

      rerender(
        <AutoComplete
          enabled={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
        />
      );

      expect(document.querySelector('.Select')).toHaveClass('is-disabled');
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
        />
      );

      expect(document.querySelector('.Select')).toBeInTheDocument();
    });

    it('should call onValueChange when initialized', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={options[0]}
        />
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
        />
      );

      expect(document.querySelector('.Select')).not.toHaveClass('is-disabled');
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
        />
      );

      expect(mockOnValueChange).toHaveBeenCalledWith(
        undefined, 
        expect.arrayContaining([
          expect.objectContaining({ message: constants.validations.mandatory })
        ])
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
        />
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
        />
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
        />
      );

      expect(document.querySelector('.Select')).toHaveClass('Select--multi');
    });

    it('should render with conceptUuid as id', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          conceptUuid="test-uuid"
        />
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
        />
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
        />
      );

      expect(document.querySelector('.Select')).not.toHaveClass('is-searchable');
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
        />
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
        />
      );

      expect(document.querySelector('.Select')).toBeInTheDocument();
    });

    it('should handle autoload prop in async mode', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          autoload
        />
      );

      expect(document.querySelector('.Select')).toBeInTheDocument();
    });

    it('should handle cache prop in async mode', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          cache
        />
      );

      expect(document.querySelector('.Select')).toBeInTheDocument();
    });

    it('should handle undefined value', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={undefined}
        />
      );

      expect(document.querySelector('.Select')).toBeInTheDocument();
    });

    it('should handle null value', () => {
      render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          value={null}
        />
      );

      expect(document.querySelector('.Select')).toBeInTheDocument();
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
        />
      );

      expect(document.querySelector('.Select')).toBeInTheDocument();
    });

    it('should handle options prop changes', () => {
      const { rerender } = render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
        />
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
        />
      );

      expect(document.querySelector('.Select')).toBeInTheDocument();
    });

    it('should handle component updates correctly', () => {
      const { rerender } = render(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          enabled
        />
      );

      expect(document.querySelector('.Select')).not.toHaveClass('is-disabled');

      rerender(
        <AutoComplete
          asynchronous={false}
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          options={options}
          enabled={false}
        />
      );

      expect(document.querySelector('.Select')).toHaveClass('is-disabled');
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
        />
      );

      expect(document.querySelector('#integration-test')).toBeInTheDocument();
      expect(document.querySelector('.Select')).not.toHaveClass('is-disabled');
      expect(document.querySelector('.Select')).toHaveClass('is-searchable');
    });

    it('should handle async mode with URL', () => {
      render(
        <AutoComplete
          formFieldPath="test1.1/1-0"
          onValueChange={mockOnValueChange}
          url="http://test.com"
          minimumInput={3}
          terminologyServiceConfig={{ limit: 20 }}
        />
      );

      expect(document.querySelector('.Select')).toBeInTheDocument();
    });
  });
});
