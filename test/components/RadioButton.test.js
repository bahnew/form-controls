import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RadioButton } from 'components/RadioButton.jsx';
import constants from 'src/constants';

describe('RadioButton Component', () => {
  const value = true;
  const options = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];

  let valueChangeSpy;

  beforeEach(() => {
    valueChangeSpy = jest.fn();
  });

  it('should render the radio component', () => {
    const { container } = render(
      <RadioButton
        onValueChange={valueChangeSpy}
        options={options}
        validate={false}
        validations={[]}
      />
    );

    const radioInputs = screen.getAllByRole('radio');
    expect(radioInputs).toHaveLength(2);

    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(radioInputs[0]).not.toBeChecked();

    expect(screen.getByText('No')).toBeInTheDocument();
    expect(radioInputs[1]).not.toBeChecked();

    expect(container.firstChild).not.toHaveClass('form-builder-error');
  });

  it('should render the radio button with selected value', () => {
    render(
      <RadioButton
        onValueChange={valueChangeSpy}
        options={options}
        validate={false}
        validations={[]}
        value={value}
      />
    );

    const radioInputs = screen.getAllByRole('radio');
    expect(radioInputs[0]).toBeChecked();
    expect(radioInputs[1]).not.toBeChecked();
  });

  it('should change the value on select', () => {
    render(
      <RadioButton
        onValueChange={valueChangeSpy}
        options={options}
        validate={false}
        validations={[]}
      />
    );

    const noOption = screen.getByText('No');
    fireEvent.click(noOption);

    const radioInputs = screen.getAllByRole('radio');
    expect(radioInputs[1]).toBeChecked();
    expect(valueChangeSpy).toHaveBeenCalledWith(false, []);
  });

  it('should render the radio button with error if hasErrors is true', () => {
    const { container, rerender } = render(
      <RadioButton
        onValueChange={valueChangeSpy}
        options={options}
        validate={false}
        validations={[constants.validations.mandatory]}
        value={value}
      />
    );

    rerender(
      <RadioButton
        onValueChange={valueChangeSpy}
        options={options}
        validate
        validations={[constants.validations.mandatory]}
        value={undefined}
      />
    );

    expect(container.firstChild).toHaveClass('form-builder-error');
  });

  it('should not reRender if value is same', () => {
    const { rerender } = render(
      <RadioButton
        onValueChange={valueChangeSpy}
        options={options}
        validate={false}
        validations={[]}
        value={value}
      />
    );

    const radioInputs = screen.getAllByRole('radio');
    expect(radioInputs[0]).toBeChecked();
    expect(radioInputs[1]).not.toBeChecked();

    rerender(
      <RadioButton
        onValueChange={valueChangeSpy}
        options={options}
        validate={false}
        validations={[]}
        value
      />
    );

    const updatedRadioInputs = screen.getAllByRole('radio');
    expect(updatedRadioInputs[0]).toBeChecked();
    expect(updatedRadioInputs[1]).not.toBeChecked();
  });
});
