import React from 'react';
import { render, screen } from '@testing-library/react';
import { ComplexControl } from 'src/components/ComplexControl.jsx';
import ComponentStore from 'src/helpers/componentStore';

jest.mock('src/helpers/componentStore', () => ({
  registerComponent: jest.fn(),
  deRegisterComponent: jest.fn(),
  getRegisteredComponent: jest.fn()
}));

describe('Complex Control', () => {
  let onChangeSpy;
  let addMoreSpy;
  let showNotificationSpy;
  const formFieldPath = 'test1.1/1-0';

  const DummyControl = (props) => (
    <input 
      data-testid="dummy-control"
      data-form-field-path={props.formFieldPath}
      data-on-change={props.onChange ? 'true' : 'false'}
      data-on-control-add={props.onControlAdd ? 'true' : 'false'}
      data-properties={JSON.stringify(props.properties)}
      onChange={props.onChange}
      {...props}
    />
  );

  beforeEach(() => {
    onChangeSpy = jest.fn();
    addMoreSpy = jest.fn();
    showNotificationSpy = jest.fn();
    jest.clearAllMocks();
  });

  it('should render ComplexControl if component is registered', () => {
    ComponentStore.getRegisteredComponent.mockReturnValue(DummyControl);

    render(
      <ComplexControl
        addMore
        conceptHandler={'someHandler'}
        formFieldPath={formFieldPath}
        onChange={onChangeSpy}
        onControlAdd={addMoreSpy}
        properties={{}}
        showNotification={showNotificationSpy}
        validate={false}
        validations={[]}
      />
    );

    const dummyControl = screen.getByTestId('dummy-control');
    expect(dummyControl).toBeInTheDocument();
    expect(dummyControl).toHaveAttribute('data-form-field-path', formFieldPath);
    expect(dummyControl).toHaveAttribute('data-on-change', 'true');
    expect(dummyControl).toHaveAttribute('data-properties', '{}');
    expect(dummyControl).toHaveAttribute('data-on-control-add', 'true');
    expect(ComponentStore.getRegisteredComponent).toHaveBeenCalledWith('someHandler');
  });

  it('should not render complex Control if corresponding control is not registered', () => {
    ComponentStore.getRegisteredComponent.mockReturnValue(null);

    const { container } = render(
      <ComplexControl
        addMore
        conceptHandler={'someHandler'}
        formFieldPath={formFieldPath}
        onChange={onChangeSpy}
        onControlAdd={addMoreSpy}
        properties={{}}
        showNotification={showNotificationSpy}
        validate={false}
        validations={[]}
      />
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('dummy-control')).not.toBeInTheDocument();
    expect(ComponentStore.getRegisteredComponent).toHaveBeenCalledWith('someHandler');
  });
});
