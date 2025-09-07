import React from 'react';
import { render, screen } from '@testing-library/react';
import { BooleanControlDesigner } from 'components/designer/BooleanControl.jsx';
import ComponentStore from 'src/helpers/componentStore';

describe('Boolean Control Designer', () => {
  const DummyControl = ({ options }) => <input data-testid="dummy-control" data-options={JSON.stringify(options)} />;
  let metadata;

  beforeAll(() => {
    ComponentStore.registerDesignerComponent('button', { control: DummyControl });
  });

  afterAll(() => {
    ComponentStore.deRegisterDesignerComponent('button');
  });

  const defaultOptions = [
    { translationKey: 'BOOLEAN_YES', name: 'Yes', value: true },
    { translationKey: 'BOOLEAN_NO', name: 'No', value: false },
  ];

  beforeEach(() => {
    metadata = {
      id: '100',
      type: 'obsControl',
      concept: {
        uuid: '70645842-be6a-4974-8d5f-45b52990e132',
        name: 'Pulse',
        datatype: 'Boolean',
      },
    };
  });

  it('should render Dummy Control with default options', () => {
    render(<BooleanControlDesigner metadata={metadata} />);

    const dummyControl = screen.getByTestId('dummy-control');
    expect(dummyControl).toBeInTheDocument();
    
    const actualOptions = JSON.parse(dummyControl.getAttribute('data-options'));
    expect(actualOptions).toEqual(defaultOptions);
  });

  it('should return null when registered component not found', () => {
    ComponentStore.deRegisterDesignerComponent('button');

    const { container } = render(<BooleanControlDesigner metadata={metadata} />);
    expect(container.firstChild).toBeNull();

    ComponentStore.registerDesignerComponent('button', { control: DummyControl });
  });

  it('should return the JSON Definition', () => {
    const expectedMetadata = Object.assign({}, metadata, { options: defaultOptions });
    
    let componentRef;
    const TestWrapper = () => (
      <BooleanControlDesigner 
        ref={ref => { componentRef = ref; }} 
        metadata={metadata} 
      />
    );
    
    render(<TestWrapper />);
    expect(componentRef.getJsonDefinition()).toEqual(expectedMetadata);
  });

  it('should override default options', () => {
    metadata.options = [
      { name: 'Ha', value: 'Yes' },
      { name: 'Na', value: 'No' },
    ];
    
    render(<BooleanControlDesigner metadata={metadata} />);

    const dummyControl = screen.getByTestId('dummy-control');
    const actualOptions = JSON.parse(dummyControl.getAttribute('data-options'));
    expect(actualOptions).toEqual(metadata.options);
  });
});
