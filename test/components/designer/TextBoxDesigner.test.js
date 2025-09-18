import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextBoxDesigner } from 'components/designer/TextBoxDesigner.jsx';

describe('TextBoxDesigner', () => {
  let metadata;

  beforeEach(() => {
    metadata = {
      concept: {
        name: 'Pulse',
        uuid: 'someUuid',
      },
      displayType: 'text',
      type: 'obsControl',
      id: 'someId',
      properties: {},
    };
  });

  it('should render the TextBox designer component', () => {
    render(<TextBoxDesigner metadata={metadata} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should return json definition', () => {
    let componentRef;
    const TestWrapper = () => (
      <TextBoxDesigner
        ref={ref => { componentRef = ref; }}
        metadata={metadata}
      />
    );

    render(<TestWrapper />);
    expect(componentRef.getJsonDefinition()).toEqual(metadata);
  });
});
