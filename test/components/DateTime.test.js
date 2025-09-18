import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { DateTime } from 'src/components/DateTime.jsx';
import constants from 'src/constants';
import { Error } from 'src/Error';

describe('DateTime', () => {
  let mockOnChange;

  beforeEach(() => {
    mockOnChange = jest.fn();
  });

  it('should render DateTime', () => {
    const { container } = render(
      <DateTime
        formFieldPath="test1.1/1-0"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    const inputs = container.querySelectorAll('input');
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveAttribute('type', 'date');
    expect(inputs[1]).toHaveAttribute('type', 'time');
  });

  it('should render Datetime with default value', () => {
    render(
      <DateTime
        formFieldPath="test1.1/1-0"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={[]}
        value={'2016-12-29 22:30'}
      />
    );

    expect(screen.getByDisplayValue('2016-12-29')).toBeInTheDocument();
    expect(screen.getByDisplayValue('22:30')).toBeInTheDocument();
  });

  it('should get user entered value of the date time', () => {
    const { container } = render(
      <DateTime
        formFieldPath="test1.1/1-0"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    const dateInput = container.querySelector('input[type="date"]');
    const timeInput = container.querySelector('input[type="time"]');
    const error = new Error({ message: 'Incorrect Date Time' });

    fireEvent.change(dateInput, { target: { value: '2016-12-31' } });
    fireEvent.change(timeInput, { target: { value: '22:10' } });

    expect(mockOnChange).toHaveBeenCalledTimes(4);
    expect(mockOnChange).toHaveBeenCalledWith({ value: '2016-12-31 ', errors: [error] });
    expect(mockOnChange).toHaveBeenCalledWith({ value: '2016-12-31 22:10', errors: [] });
  });

  it('should throw error on fail of validations', () => {
    const validations = [constants.validations.mandatory];

    const { container } = render(
      <DateTime
        formFieldPath="test1.1/1-0"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={validations}
        value={'2016-12-29 22:10'}
      />
    );

    const mandatoryError = new Error({ message: validations[0] });
    const dateTimeError = new Error({ message: 'Incorrect Date Time' });
    const dateInput = container.querySelector('input[type="date"]');
    const timeInput = container.querySelector('input[type="time"]');

    fireEvent.change(dateInput, { target: { value: '' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      value: ' 22:10',
      errors: [mandatoryError, dateTimeError],
    });
    expect(dateInput).toHaveClass('form-builder-error');
    expect(timeInput).toHaveClass('form-builder-error');
  });

  it('should throw error on fail of validations during component update', () => {
    const validations = [constants.validations.mandatory];

    const { rerender, container } = render(
      <DateTime
        formFieldPath="test1.1/1-0"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={validations}
        value={'2016-12-29 22:10'}
      />
    );

    const mandatoryError = new Error({ message: validations[0] });

    rerender(
      <DateTime
        formFieldPath="test1.1/1-0"
        onChange={mockOnChange}
        validate
        validateForm={false}
        validations={validations}
        value={undefined}
      />
    );

    expect(mockOnChange).toHaveBeenCalledWith({ value: undefined, errors: [mandatoryError] });
    expect(container.querySelector('input[type="date"]')).toHaveClass('form-builder-error');
    expect(container.querySelector('input[type="time"]')).toHaveClass('form-builder-error');
  });

  it('should render DateTime on change of props', () => {
    const { rerender } = render(
      <DateTime
        formFieldPath="test1.1/1-0"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={[]}
        value={'2016-12-29 22:10'}
      />
    );

    rerender(
      <DateTime
        formFieldPath="test1.1/1-0"
        onChange={mockOnChange}
        validate
        validateForm={false}
        validations={[]}
        value={'2016-12-31 10:10'}
      />
    );

    expect(screen.getByDisplayValue('2016-12-31')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10:10')).toBeInTheDocument();
  });

  it('should check errors after mount if the formFieldPath suffix is not 0', () => {
    const validations = [constants.validations.mandatory];

    const { container } = render(
      <DateTime
        formFieldPath="test1.1/1-1"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={validations}
      />
    );

    expect(container.querySelector('input[type="date"]')).toHaveClass('form-builder-error');
  });

  it('should not check errors after mount if the formFieldPath suffix is 0', () => {
    const validations = [constants.validations.mandatory];

    const { container } = render(
      <DateTime
        formFieldPath="test1.1/1-0"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={validations}
      />
    );

    expect(container.querySelector('input[type="date"]')).not.toHaveClass('form-builder-error');
  });

  it('should show as disabled when datetime is set to be disabled', () => {
    const { container } = render(
      <DateTime
        enabled={false}
        formFieldPath="test1.1/1-0"
        onChange={() => {}}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    expect(container.querySelector('input[type="date"]')).toBeDisabled();
    expect(container.querySelector('input[type="time"]')).toBeDisabled();
  });

  it('should show as enabled when datetime is set to be enabled', () => {
    const { container } = render(
      <DateTime
        enabled
        formFieldPath="test1.1/1-0"
        onChange={() => {}}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    expect(container.querySelector('input[type="date"]')).not.toBeDisabled();
    expect(container.querySelector('input[type="time"]')).not.toBeDisabled();
  });

  it('should trigger onChange when mounting component and the value is not undefined', () => {
    render(
      <DateTime
        enabled
        formFieldPath="test1.1-0"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={[]}
        value={'2016-12-29 22:10'}
      />
    );

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should trigger onChange when the value is changed', () => {
    const { rerender } = render(
      <DateTime
        formFieldPath="test1.1-0"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={[]}
      />
    );

    rerender(
      <DateTime
        formFieldPath="test1.1-0"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={[]}
        value={'2016-12-29 22:10'}
      />
    );

    expect(mockOnChange).toHaveBeenCalledWith({ value: '2016-12-29 22:10', errors: [] });
  });

  it('should handle componentWillReceiveProps with validate flag', () => {
    const validations = [constants.validations.mandatory];
    const { rerender, container } = render(
      <DateTime
        formFieldPath="test1.1/1-0"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={validations}
        value={'2016-12-29 22:10'}
      />
    );

    rerender(
      <DateTime
        formFieldPath="test1.1/1-0"
        onChange={mockOnChange}
        validate
        validateForm={false}
        validations={validations}
        value={''}
      />
    );

    expect(container.querySelector('input[type="date"]')).toHaveClass('form-builder-error');
  });

  it('should not trigger update when shouldComponentUpdate returns false', () => {
    const { rerender } = render(
      <DateTime
        formFieldPath="test1.1/1-0"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={[]}
        enabled
        value={'2016-12-29 22:10'}
      />
    );

    mockOnChange.mockClear();

    rerender(
      <DateTime
        formFieldPath="test1.1/1-0"
        onChange={mockOnChange}
        validate={false}
        validateForm={false}
        validations={[]}
        enabled
        value={'2016-12-29 22:10'}
      />
    );

    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
