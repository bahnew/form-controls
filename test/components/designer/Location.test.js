import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { LocationDesigner } from 'components/designer/Location.jsx';

jest.mock('src/helpers/httpInterceptor', () => ({
  httpInterceptor: {
    get: jest.fn(),
  },
}));
import { httpInterceptor } from 'src/helpers/httpInterceptor';

jest.mock('src/components/AutoComplete', () => {
  const React = require('react');
  const AutoComplete = ({
    asynchronous,
    options,
    searchable,
    minimumInput,
    labelKey,
    valueKey,
  }) => (
    <div
      data-testid="AutoComplete"
      data-asynchronous={String(asynchronous)}
      data-options={JSON.stringify(options ?? null)}
      data-searchable={String(searchable)}
      data-minimum-input={String(minimumInput)}
      data-label-key={String(labelKey)}
      data-value-key={String(valueKey)}
    />
  );
  AutoComplete.displayName = 'AutoComplete';
  return { AutoComplete };
});

describe('LocationDesigner', () => {
  const locationData = {
    results: [
      { name: 'loc1', id: 1 },
      { name: 'loc2', id: 2 },
    ],
  };

  let metadata;

  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();

    metadata = {
      concept: {
        name: 'Location',
        uuid: 'someUuid',
        datatype: 'Complex',
        handler: 'LocationObsHandler',
      },
      type: 'obsControl',
      id: 'someId',
      properties: { style: 'autocomplete' },
    };
  });

  it('should render the Location designer autocomplete component', async () => {
    httpInterceptor.get.mockResolvedValueOnce(locationData);

    render(<LocationDesigner metadata={metadata} />);

    const autoComplete = await screen.findByTestId('AutoComplete'); // waits for async render

    expect(autoComplete).toBeInTheDocument();
    expect(autoComplete.dataset.asynchronous).toBe('false');
    expect(JSON.parse(autoComplete.dataset.options)).toEqual(locationData.results);
    expect(autoComplete.dataset.searchable).toBe('true');
    expect(autoComplete.dataset.minimumInput).toBe('2');
    expect(autoComplete.dataset.labelKey).toBe('name');
    expect(autoComplete.dataset.valueKey).toBe('id');
  });

  it('should render the Location designer dropdown component', async () => {
    httpInterceptor.get.mockResolvedValueOnce(locationData);

    const dropdownMeta = {
      ...metadata,
      properties: { ...metadata.properties, style: 'dropdown' },
    };

    render(<LocationDesigner metadata={dropdownMeta} />);

    const autoComplete = await screen.findByTestId('AutoComplete');

    expect(autoComplete).toBeInTheDocument();
    expect(JSON.parse(autoComplete.dataset.options)).toEqual(locationData.results);
    expect(autoComplete.dataset.searchable).toBe('false');
    expect(autoComplete.dataset.minimumInput).toBe('0');
    expect(autoComplete.dataset.labelKey).toBe('name');
    expect(autoComplete.dataset.valueKey).toBe('id');
  });

  it('should call setError if given URL is invalid', async () => {
    const setError = jest.fn();
    httpInterceptor.get.mockRejectedValueOnce(new Error('error'));

    render(<LocationDesigner metadata={metadata} setError={setError} />);

    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith({ message: 'Invalid Location URL' });
    });
  });

  it('does not throw or call setError on failure when setError is not provided', async () => {
    httpInterceptor.get.mockRejectedValueOnce(new Error('boom'));
    const dropdownMeta = {
      ...metadata,
      properties: { ...metadata.properties, style: 'dropdown' },
    };
    render(<LocationDesigner metadata={dropdownMeta} />);
    await waitFor(() => {
      expect(httpInterceptor.get).toHaveBeenCalled();
    });
  });
});
