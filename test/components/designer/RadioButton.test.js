import React from 'react';
import { render, screen } from '@testing-library/react';
import { RadioButtonDesigner } from 'components/designer/RadioButton.jsx';

describe('Radio Button Designer', () => {
  const options = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];

  const metadata = {
    concept: {
      name: 'Pulse',
      uuid: 'someUuid',
      datatype: 'boolean',
    },
    displayType: 'radio',
    type: 'obsControl',
    id: 'someId',
    options,
    properties: {},
  };

  it('should render the radio button', () => {
    render(<RadioButtonDesigner metadata={metadata} />);

    const radioInputs = screen.getAllByRole('radio');
    expect(radioInputs).toHaveLength(2);

    expect(radioInputs[0]).toHaveAttribute('type', 'radio');
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(radioInputs[0]).toHaveAttribute('value', 'true');

    expect(radioInputs[1]).toHaveAttribute('type', 'radio');
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(radioInputs[1]).toHaveAttribute('value', 'false');
  });

  it('should return json definition', () => {
    const ref = React.createRef();
    render(<RadioButtonDesigner ref={ref} metadata={metadata} />);
    
    expect(ref.current.getJsonDefinition()).toEqual(metadata);
  });
});
