import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ProviderDesigner } from 'components/designer/Provider.jsx';
import { httpInterceptor } from 'src/helpers/httpInterceptor';

jest.mock('src/helpers/httpInterceptor');

describe('ProviderDesigner', () => {
  let metadata;
  const providerData = {
    results: [{ name: 'user1', id: 1 }, { name: 'user2', id: 2 }],
  };

  beforeEach(() => {
    metadata = {
      concept: {
        name: 'Provider',
        uuid: 'someUuid',
        datatype: 'Complex',
        handler: 'ProviderObsHandler',
      },
      type: 'obsControl',
      id: 'someId',
      properties: { style: 'autocomplete' },
    };
    httpInterceptor.get.mockClear();
  });

  it('should render the provider designer autocomplete component', async () => {
    httpInterceptor.get.mockResolvedValue(providerData);
    
    render(<ProviderDesigner metadata={metadata} />);
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    
    expect(httpInterceptor.get).toHaveBeenCalledWith('/openmrs/ws/rest/v1/provider?v=custom:(id,name,uuid)');
  });

  it('should render the provider designer dropdown component', async () => {
    metadata.properties.style = 'dropdown';
    httpInterceptor.get.mockResolvedValue(providerData);
    
    render(<ProviderDesigner metadata={metadata} />);
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('should call setError when given URL is invalid', async () => {
    const setErrorSpy = jest.fn();
    httpInterceptor.get.mockRejectedValue(new Error('Network error'));
    
    render(<ProviderDesigner metadata={metadata} setError={setErrorSpy} />);
    
    await waitFor(() => {
      expect(setErrorSpy).toHaveBeenCalledWith({ message: 'Invalid Provider URL' });
    });
  });
});
