import React from 'react';
import { render, screen } from '@testing-library/react';
import { ButtonDesigner } from 'components/designer/Button.jsx';

describe('Button Designer', () => {
  const options = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];

  it('should render designer button', () => {
    render(<ButtonDesigner options={options} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Yes');
    expect(buttons[1]).toHaveTextContent('No');
  });

  it('should return json definition', () => {
    const ref = React.createRef();
    render(<ButtonDesigner ref={ref} options={options} />);
    
    expect(ref.current.getJsonDefinition()).toEqual(options);
  });
});
