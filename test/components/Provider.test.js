import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'components/Provider.jsx';
import { httpInterceptor } from 'src/helpers/httpInterceptor';
import Constants from 'src/constants';

jest.mock('src/helpers/httpInterceptor');
jest.mock('src/helpers/componentStore', () => ({
  registerComponent: jest.fn(),
  registerDesignerComponent: jest.fn(),
}));

const mockHttpInterceptor = httpInterceptor;

describe('Provider', () => {
  const providerData = {
    results: [
      { name: 'Dr. Smith', id: 1 },
      { name: 'Dr. Johnson', id: 2 }
    ],
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
    mockHttpInterceptor.get.mockResolvedValue(providerData);
  });

  it('should render provider autocomplete with searchable functionality', async () => {
    render(<Provider {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox');
    expect(combobox).not.toHaveAttribute('aria-expanded', 'true');
    
    await userEvent.type(combobox, 'Dr');
    expect(combobox).toHaveValue('Dr');
  });

  it('should render provider dropdown with non-searchable functionality', async () => {
    const dropdownProps = {
      ...defaultProps,
      properties: { ...defaultProps.properties, style: 'dropdown' },
      value: '1'
    };

    render(<Provider {...dropdownProps} />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });

    const selectedValue = screen.getByText('Dr. Smith');
    expect(selectedValue).toBeInTheDocument();
  });

  it('does not refetch on typing (asynchronous=false)', async () => {
    render(<Provider {...defaultProps} />);

    await waitFor(() => {
      expect(mockHttpInterceptor.get).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByRole('combobox'), 'Dr');
    expect(mockHttpInterceptor.get).toHaveBeenCalledTimes(1);
  });

  it('opens only after 2 chars and shows fetched options', async () => {
    render(<Provider {...defaultProps} />);

    const input = await screen.findByRole('combobox');

    await userEvent.type(input, 'D');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await userEvent.type(input, 'r');
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dr. Smith' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dr. Johnson' })).toBeInTheDocument();
  });

  it('calls onChange with the selected option id (labelKey/valueKey mapping)', async () => {
    const onChangeSpy = jest.fn();
    render(<Provider {...defaultProps} onChange={onChangeSpy} />);

    const input = await screen.findByRole('combobox');
    await userEvent.type(input, 'Dr');
    const option = await screen.findByRole('option', { name: 'Dr. Johnson' });
    await userEvent.click(option);

    expect(onChangeSpy).toHaveBeenCalledWith({ value: 2, errors: [] });
  });

  it('dropdown is non-searchable and opens without typing (minimumInput=0)', async () => {
    const props = {
      ...defaultProps,
      properties: { ...defaultProps.properties, style: 'dropdown' },
      value: '1',
    };
    render(<Provider {...props} />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });

    const control = screen.getByRole('combobox');
    await userEvent.click(control);
    
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
      expect(screen.getAllByRole('option', { name: 'Dr. Smith' })).toHaveLength(2);
      expect(screen.getByRole('option', { name: 'Dr. Johnson' })).toBeInTheDocument();
    });

    await userEvent.type(control, 'foo');
    expect(control).not.toHaveValue('foo');
  });

  it('should display error notification when provider data fetch fails', async () => {
    const error = new Error('Network error');
    mockHttpInterceptor.get.mockRejectedValue(error);

    render(<Provider {...defaultProps} />);

    await waitFor(() => {
      expect(defaultProps.showNotification).toHaveBeenCalledTimes(1);
      expect(defaultProps.showNotification).toHaveBeenCalledWith(
        'Failed to fetch provider data',
        Constants.messageType.error
      );
    });
  });

  it('should show spinner when value is provided but data is still loading', () => {
    mockHttpInterceptor.get.mockImplementation(() => new Promise(() => {}));
    
    const { container } = render(<Provider {...defaultProps} value="1" />);

    expect(container.querySelector('.overlay')).toBeInTheDocument();
  });

  it('should use default URL when no URL is provided in properties', async () => {
    const propsWithoutURL = {
      ...defaultProps,
      properties: { style: 'autocomplete' }
    };

    render(<Provider {...propsWithoutURL} />);

    await waitFor(() => {
      expect(mockHttpInterceptor.get).toHaveBeenCalledWith(
        '/openmrs/ws/rest/v1/provider?v=custom:(id,name,uuid)'
      );
    });
  });

  it('should call onChange with undefined when provider value is cleared', async () => {
    const onChangeSpy = jest.fn();
    const testProps = { ...defaultProps, onChange: onChangeSpy, value: '1' };
    
    render(<Provider {...testProps} />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });

    const clearButton = screen.getByLabelText('Clear value');
    await userEvent.click(clearButton);

    expect(onChangeSpy).toHaveBeenCalledWith({
      value: undefined,
      errors: []
    });
  });
});
