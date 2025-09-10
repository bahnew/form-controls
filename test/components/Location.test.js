import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Location } from 'components/Location.jsx';
import { httpInterceptor } from 'src/helpers/httpInterceptor';
import Constants from 'src/constants';

jest.mock('src/helpers/httpInterceptor');
jest.mock('src/helpers/componentStore', () => ({
  registerComponent: jest.fn(),
  registerDesignerComponent: jest.fn(),
}));

const mockHttpInterceptor = httpInterceptor;

describe('Location', () => {
  const locationData = {
    results: [{ name: 'loc1', id: 1 }, { name: 'loc2', id: 2 }],
  };
  
  const defaultProps = {
    formFieldPath: 'test1.1/1-0',
    onChange: jest.fn(),
    properties: { URL: 'someUrl', style: 'autocomplete' },
    showNotification: jest.fn(),
    validate: false,
    validations: [],
    addMore: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHttpInterceptor.get.mockResolvedValue(locationData);
  });

  it('should render location autocomplete with searchable functionality', async () => {
    render(<Location {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox');
    await userEvent.type(combobox, 'lo');
    expect(combobox).toHaveValue('lo');
  });

  it('should render location dropdown with non-searchable functionality', async () => {
    const dropdownProps = {
      ...defaultProps,
      properties: { ...defaultProps.properties, style: 'dropdown' },
      value: '1'
    };

    render(<Location {...dropdownProps} />);

    await waitFor(() => {
      expect(screen.getByText('loc1')).toBeInTheDocument();
    });

    const selectedValue = screen.getByText('loc1');
    expect(selectedValue).toBeInTheDocument();
  });

  it('should show error notification when URL is invalid', async () => {
    const error = new Error('Network error');
    mockHttpInterceptor.get.mockRejectedValue(error);

    render(<Location {...defaultProps} />);

    await waitFor(() => {
      expect(defaultProps.showNotification).toHaveBeenCalledTimes(1);
      expect(defaultProps.showNotification).toHaveBeenCalledWith(
        'Failed to fetch location data',
        Constants.messageType.error
      );
    });
  });

  it('should call onChange with selected value when option is selected', async () => {
    const onChangeSpy = jest.fn();
    render(<Location {...defaultProps} onChange={onChangeSpy} />);

    const input = await screen.findByRole('combobox');
    await userEvent.type(input, 'lo');
    
    const option = await screen.findByRole('option', { name: 'loc1' });
    await userEvent.click(option);

    expect(onChangeSpy).toHaveBeenCalledWith({ value: 1, errors: [] });
  });

  it('uses provided URL when properties.URL is set', async () => {
    render(<Location {...defaultProps} />);

    await waitFor(() => {
      expect(mockHttpInterceptor.get).toHaveBeenCalledWith('someUrl');
    });
  });

  it('does not refetch on typing (asynchronous=false)', async () => {
    render(<Location {...defaultProps} />);

    await waitFor(() => {
      expect(mockHttpInterceptor.get).toHaveBeenCalledTimes(1);
    });

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'lo');

    expect(mockHttpInterceptor.get).toHaveBeenCalledTimes(1);
  });

  it('maps selection using valueKey (loc2 → id=2)', async () => {
    const onChange = jest.fn();
    render(<Location {...defaultProps} onChange={onChange} />);

    const input = await screen.findByRole('combobox');
    await userEvent.type(input, 'lo');

    const opt = await screen.findByRole('option', { name: 'loc2' });
    await userEvent.click(opt);

    expect(onChange).toHaveBeenCalledWith({ value: 2, errors: [] });
  });

  it('does not call onChange on mount when value is supplied (dropdown)', async () => {
    const onChange = jest.fn();
    render(
      <Location
        {...defaultProps}
        onChange={onChange}
        properties={{ ...defaultProps.properties, style: 'dropdown' }}
        value="1"
      />
    );

    await screen.findByText('loc1');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should use default URL when no URL is provided in properties', async () => {
    const propsWithoutURL = {
      ...defaultProps,
      properties: { style: 'autocomplete' }
    };

    render(<Location {...propsWithoutURL} />);

    await waitFor(() => {
      expect(mockHttpInterceptor.get).toHaveBeenCalledWith(
        '/openmrs/ws/rest/v1/location?v=custom:(id,name,uuid)'
      );
    });
  });

  it('opens only after 2 chars and shows fetched options', async () => {
    render(<Location {...defaultProps} />);

    const input = await screen.findByRole('combobox');

    await userEvent.type(input, 'l');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await userEvent.type(input, 'o');
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'loc1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'loc2' })).toBeInTheDocument();
  });

  it('dropdown is non-searchable and opens without typing', async () => {
    const props = {
      ...defaultProps,
      properties: { ...defaultProps.properties, style: 'dropdown' },
      value: '1',
    };
    render(<Location {...props} />);

    await waitFor(() => {
      expect(screen.getByText('loc1')).toBeInTheDocument();
    });

    const control = screen.getByRole('combobox');
    await userEvent.click(control);
    
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
      expect(screen.getAllByRole('option', { name: 'loc1' })).toHaveLength(2);
      expect(screen.getByRole('option', { name: 'loc2' })).toBeInTheDocument();
    });

    await userEvent.type(control, 'foo');
    expect(control).not.toHaveValue('foo');
  });

  it('should call onChange with undefined when location value is cleared', async () => {
    const onChangeSpy = jest.fn();
    const testProps = { ...defaultProps, onChange: onChangeSpy, value: '1' };
    
    render(<Location {...testProps} />);

    await waitFor(() => {
      expect(screen.getByText('loc1')).toBeInTheDocument();
    });

    const clearButton = screen.getByLabelText('Clear value');
    await userEvent.click(clearButton);

    expect(onChangeSpy).toHaveBeenCalledWith({
      value: undefined,
      errors: []
    });
  });
});
