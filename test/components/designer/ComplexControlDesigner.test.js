import React from 'react';
import { queryAllByTestId, render } from '@testing-library/react';
import { ComplexControlDesigner } from 'components/designer/ComplexControlDesigner.jsx';
import ComponentStore from 'src/helpers/componentStore';

describe('ComplexControlDesigner', () => {
  let metadata;

  const DummyControl = () => <input data-testid="dummy-control" />;

  beforeAll(() => {
    ComponentStore.registerDesignerComponent('someHandler', { control: DummyControl });
  });

  afterAll(() => {
    ComponentStore.deRegisterDesignerComponent('someHandler');
  });

  beforeEach(() => {
    metadata = {
      concept: {
        name: 'Image',
        uuid: 'someUuid',
        conceptHandler: 'someHandler',
      },
      type: 'obsControl',
      id: 'someId',
      properties: {},
    };
  });

  it('should render the ComplexControl designer component', () => {
    const { getByTestId } = render(<ComplexControlDesigner metadata={metadata} />);
    expect(getByTestId('dummy-control')).toBeInTheDocument();
  });

  it('should not render complexControl if corresponding control is not registered', () => {
    ComponentStore.deRegisterDesignerComponent('someHandler');
    const { container } = render(<ComplexControlDesigner metadata={metadata} />);
    expect(container.firstChild).toBeNull();
    ComponentStore.registerDesignerComponent('someHandler', { control: DummyControl });
  });

  it('should return json definition through public API', () => {
    const ref = React.createRef();
    render(<ComplexControlDesigner ref={ref} metadata={metadata} />);
    expect(ref.current.getJsonDefinition()).toEqual(metadata);
  });
});
