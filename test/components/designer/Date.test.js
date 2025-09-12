import React from 'react';
import { render, screen } from '@testing-library/react';
import { DateDesigner } from 'src/components/designer/Date.jsx';

describe('DateDesigner', () => {
  const metadata = {
    concept: {
      name: 'Follow up Date',
      uuid: 'someUuid',
      dataType: 'Date',
    },
    type: 'obsControl',
    id: 'someId',
    properties: {},
  };

  it('should render a date input', () => {
    const { container } = render(<DateDesigner metadata={metadata} />);

    const dateInput = container.querySelector('input[type="date"]');
    expect(dateInput).toBeInTheDocument();
  });

  it('should return metadata from getJsonDefinition method', () => {
    const dateDesigner = new DateDesigner({ metadata });
    expect(dateDesigner.getJsonDefinition()).toEqual(metadata);
  });
});
