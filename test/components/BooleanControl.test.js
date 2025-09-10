import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BooleanControl } from 'components/BooleanControl.jsx';
import constants from 'src/constants';
import ComponentStore from 'src/helpers/componentStore';

jest.mock('src/helpers/componentStore', () => ({
  getRegisteredComponent: jest.fn(),
  registerComponent: jest.fn(),
  deRegisterComponent: jest.fn(),
}));

describe('BooleanControl', () => {
  const ProbeControl = ({ validations, options, value, onValueChange }) => (
    <div data-testid="dummy-control">
      <input data-testid="dummy-input" />
      <div data-testid="options-count">{options?.length || 0}</div>
      <div data-testid="validations-count">{validations?.length || 0}</div>
      <div data-testid="value">{value === undefined ? 'undefined' : JSON.stringify(value)}</div>
      <button 
        data-testid="trigger-yes" 
        onClick={() => onValueChange(options[0], [])}
      >
        Trigger Yes
      </button>
      <button 
        data-testid="trigger-no" 
        onClick={() => onValueChange(options[1], [])}
      >
        Trigger No
      </button>
      <button 
        data-testid="trigger-undefined" 
        onClick={() => onValueChange(undefined, [])}
      >
        Trigger Undefined
      </button>
    </div>
  );

  const options = [
    { translationKey: 'BOOLEAN_YES', name: 'Yes', value: true },
    { translationKey: 'BOOLEAN_NO', name: 'No', value: false },
  ];

  const mockIntl = {
    formatMessage: jest.fn(({ defaultMessage }) => defaultMessage),
  };

  const onChangeSpy = jest.fn();
  const validations = [constants.validations.allowDecimal, constants.validations.mandatory];

  beforeEach(() => {
    jest.clearAllMocks();
    ComponentStore.getRegisteredComponent.mockReturnValue(ProbeControl);
  });

  it('should render Dummy Control of displayType button by default', () => {
    render(
      <BooleanControl
        intl={mockIntl}
        onChange={onChangeSpy}
        options={options}
        validate={false}
        validateForm={false}
        validations={validations}
      />
    );

    expect(screen.getByTestId('dummy-control')).toBeInTheDocument();
    expect(screen.getByTestId('options-count')).toHaveTextContent('2');
    expect(screen.getByTestId('validations-count')).toHaveTextContent('2');
    expect(ComponentStore.getRegisteredComponent).toHaveBeenCalledWith('button');
  });

  it('should return null when registered component not found', () => {
    ComponentStore.getRegisteredComponent.mockReturnValue(null);
    
    render(
      <BooleanControl
        intl={mockIntl}
        onChange={onChangeSpy}
        options={options}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    expect(screen.getByText('Button component is not supported')).toBeInTheDocument();
    expect(screen.queryByTestId('dummy-control')).not.toBeInTheDocument();
  });

  it('should reRender on change of value in props', () => {
    const { rerender } = render(
      <BooleanControl
        intl={mockIntl}
        onChange={onChangeSpy}
        options={options}
        validate={false}
        validateForm={false}
        validations={[]}
        value={true}
      />
    );

    expect(screen.getByTestId('value')).toHaveTextContent('{"name":"Yes","value":true}');

    rerender(
      <BooleanControl
        intl={mockIntl}
        onChange={onChangeSpy}
        options={options}
        validate={false}
        validateForm={false}
        validations={[]}
        value={false}
      />
    );

    expect(screen.getByTestId('value')).toHaveTextContent('{"name":"No","value":false}');
  });

  it('should not call onChange when value is not changed', () => {
    const { rerender } = render(
      <BooleanControl
        intl={mockIntl}
        onChange={onChangeSpy}
        options={options}
        validate={false}
        validateForm={false}
        validations={[]}
        value={true}
      />
    );

    expect(screen.getByTestId('value')).toHaveTextContent('{"name":"Yes","value":true}');
    onChangeSpy.mockClear();

    rerender(
      <BooleanControl
        intl={mockIntl}
        onChange={onChangeSpy}
        options={options}
        validate={false}
        validateForm={false}
        validations={[]}
        value={true}
      />
    );

    expect(screen.getByTestId('value')).toHaveTextContent('{"name":"Yes","value":true}');
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('should return the boolean control value', () => {
    render(
      <BooleanControl
        intl={mockIntl}
        onChange={onChangeSpy}
        options={options}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    const yesButton = screen.getByTestId('trigger-yes');
    yesButton.click();

    expect(onChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ value: true, errors: [] })
    );
  });

  it('should return undefined if no value is selected', () => {
    render(
      <BooleanControl
        intl={mockIntl}
        onChange={onChangeSpy}
        options={options}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    const undefinedButton = screen.getByTestId('trigger-undefined');
    undefinedButton.click();

    expect(onChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ value: undefined, errors: [] })
    );
  });

  it('should handle options without translationKey', () => {
    const optionsWithoutTranslationKey = [
      { name: 'Yes', value: true },
      { name: 'No', value: false },
    ];

    render(
      <BooleanControl
        intl={mockIntl}
        onChange={onChangeSpy}
        options={optionsWithoutTranslationKey}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    expect(screen.getByTestId('dummy-control')).toBeInTheDocument();
    expect(mockIntl.formatMessage).toHaveBeenCalledWith(
      expect.objectContaining({ defaultMessage: 'Yes' })
    );
    expect(mockIntl.formatMessage).toHaveBeenCalledWith(
      expect.objectContaining({ defaultMessage: 'No' })
    );
  });

  it('should handle onValueChange with falsy values', () => {
    render(
      <BooleanControl
        intl={mockIntl}
        onChange={onChangeSpy}
        options={options}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    const noButton = screen.getByTestId('trigger-no');
    const undefinedButton = screen.getByTestId('trigger-undefined');

    noButton.click();
    expect(onChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ value: false, errors: [] })
    );

    undefinedButton.click();
    expect(onChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ value: undefined, errors: [] })
    );
  });
});
