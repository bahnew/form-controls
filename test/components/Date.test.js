import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Date } from 'components/Date.jsx';
import constants from 'src/constants';
import { Error } from 'src/Error';
import { Validator } from 'src/helpers/Validator';

describe('Date', () => {
  const onChangeMock = jest.fn();

  beforeEach(() => {
    onChangeMock.mockClear();
  });

  it('should render Date', () => {
    const { container } = render(
      <Date
        formFieldPath="test1.1/1-0"
        onChange={onChangeMock}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    const input = container.querySelector('input[type="date"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'date');
  });

  it('should render Date with default value', () => {
    render(
      <Date
        formFieldPath="test1.1/1-0"
        onChange={onChangeMock}
        validate={false}
        validateForm={false}
        validations={[]}
        value="2016-12-29"
      />
    );

    const input = screen.getByDisplayValue('2016-12-29');
    expect(input).toHaveValue('2016-12-29');
  });

  it('should get user entered value of the date', () => {
    render(
      <Date
        formFieldPath="test1.1/1-0"
        onChange={onChangeMock}
        validate={false}
        validateForm={false}
        validations={[]}
        value="2016-12-29"
      />
    );

    const input = screen.getByDisplayValue('2016-12-29');
    fireEvent.change(input, { target: { value: '2016-12-31' } });

    expect(onChangeMock).toHaveBeenCalledWith({ value: '2016-12-31', errors: [] });
  });

  it('should throw error on fail of validations', () => {
    const validations = [constants.validations.mandatory];

    render(
      <Date
        formFieldPath="test1.1/1-0"
        onChange={onChangeMock}
        validate={false}
        validateForm={false}
        validations={validations}
        value="2016-12-29"
      />
    );

    onChangeMock.mockClear();

    const mandatoryError = new Error({ message: validations[0] });
    const input = screen.getByDisplayValue('2016-12-29');
    fireEvent.change(input, { target: { value: '' } });

    expect(onChangeMock).toHaveBeenCalledWith({ value: undefined, errors: [mandatoryError] });
    expect(input).toHaveClass('form-builder-error');
  });

  it('should throw error on fail of validations during component update', () => {
    const validations = [constants.validations.mandatory];

    const { rerender, container } = render(
      <Date
        formFieldPath="test1.1/1-0"
        onChange={onChangeMock}
        validate={false}
        validateForm={false}
        validations={validations}
        value="2016-12-29"
      />
    );

    const mandatoryError = new Error({ message: validations[0] });

    rerender(
      <Date
        formFieldPath="test1.1/1-0"
        onChange={onChangeMock}
        validate
        validateForm={false}
        validations={validations}
        value={undefined}
      />
    );

    expect(onChangeMock).toHaveBeenCalledWith({ value: undefined, errors: [mandatoryError] });
    const input = container.querySelector('input[type="date"]');
    expect(input).toHaveClass('form-builder-error');
  });

  it('should check errors after mount if the formFieldPath suffix is not 0', () => {
    const validations = [constants.validations.mandatory];

    const { container } = render(
      <Date
        formFieldPath="test1.1/1-1"
        onChange={onChangeMock}
        validate={false}
        validateForm={false}
        validations={validations}
      />
    );

    const input = container.querySelector('input[type="date"]');
    expect(input).toHaveClass('form-builder-error');
  });

  it('should not check errors after mount if the formFieldPath suffix is 0', () => {
    const validations = [constants.validations.mandatory];

    render(
      <Date
        formFieldPath="test1.1/1-0"
        onChange={onChangeMock}
        validate={false}
        validateForm={false}
        validations={validations}
        value="2016-12-29"
      />
    );

    const input = screen.getByDisplayValue('2016-12-29');
    expect(input).not.toHaveClass('form-builder-error');
  });

  it('should render Date on change of props', () => {
    const { rerender } = render(
      <Date
        formFieldPath="test1.1/1-0"
        onChange={onChangeMock}
        validate={false}
        validateForm={false}
        validations={[]}
        value="2016-12-29"
      />
    );

    rerender(
      <Date
        formFieldPath="test1.1/1-0"
        onChange={onChangeMock}
        validate={false}
        validateForm={false}
        validations={[]}
        value="2016-12-31"
      />
    );

    const input = screen.getByDisplayValue('2016-12-31');
    expect(input).toHaveValue('2016-12-31');
  });

  it('should show as disabled when date is set to be disabled', () => {
    const { container } = render(
      <Date
        enabled={false}
        formFieldPath="test1.1/1-0"
        onChange={() => {}}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    const input = container.querySelector('input[type="date"]');
    expect(input).toBeDisabled();
  });

  it('should show as enabled when date is set to be enabled', () => {
    const { container } = render(
      <Date
        enabled
        formFieldPath="test1.1/1-0"
        onChange={() => {}}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    const input = container.querySelector('input[type="date"]');
    expect(input).toBeEnabled();
  });

  it('should trigger onChange when mounting component and the value is not undefined', () => {
    render(
      <Date
        enabled
        formFieldPath="test1.1-0"
        onChange={onChangeMock}
        validate={false}
        validateForm={false}
        validations={[]}
        value="2016-12-29"
      />
    );

    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        value: '2016-12-29',
        triggerControlEvent: false,
      })
    );
  });

  it('should trigger onChange when the value is changed', () => {
    const { rerender } = render(
      <Date
        formFieldPath="test1.1-0"
        onChange={onChangeMock}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    onChangeMock.mockClear();

    rerender(
      <Date
        formFieldPath="test1.1-0"
        onChange={onChangeMock}
        validate={false}
        validateForm={false}
        validations={[]}
        value="2016-12-29"
      />
    );

    expect(onChangeMock).toHaveBeenCalledWith({ value: '2016-12-29', errors: [] });
  });

  it('should handle undefined errors from validator gracefully', () => {
    const getErrorsSpy = jest.spyOn(Validator, 'getErrors').mockReturnValue(undefined);

    const { container } = render(
      <Date
        formFieldPath="test1.1/1-0"
        onChange={onChangeMock}
        validate={false}
        validateForm={false}
        validations={[constants.validations.mandatory]}
      />
    );

    expect(container.querySelector('input[type="date"]')).not.toHaveClass('form-builder-error');
    expect(container.querySelector('input[type="date"]')).toBeInTheDocument();

    getErrorsSpy.mockRestore();
  });
});
