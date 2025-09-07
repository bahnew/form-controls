import React from 'react';
import { render } from '@testing-library/react';
import { DateTimeDesigner } from 'src/components/designer/DateTime.jsx';

describe('DateTimeDesigner', () => {
  const metadata = {
    concept: {
      name: 'DateTime',
      uuid: 'someUuid',
      dataType: 'Date',
    },
    type: 'obsControl',
    id: 'someId',
    properties: {},
  };

  it('should render date and time inputs', () => {
    const { container } = render(<DateTimeDesigner metadata={metadata} />);
    
    const inputs = container.querySelectorAll('input');
    expect(inputs).toHaveLength(2);
    
    const dateInput = container.querySelector('input[type="date"]');
    const timeInput = container.querySelector('input[type="time"]');
    
    expect(dateInput).toBeInTheDocument();
    expect(timeInput).toBeInTheDocument();
  });

  it('should return metadata from getJsonDefinition method', () => {
    const dateTimeDesigner = new DateTimeDesigner({ metadata });
    expect(dateTimeDesigner.getJsonDefinition()).toEqual(metadata);
  });
});
