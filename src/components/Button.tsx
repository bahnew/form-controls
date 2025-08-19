import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import ComponentStore from '../helpers/componentStore';
import map from 'lodash/map';
import classNames from 'classnames';
import { Validator } from '../helpers/Validator';
import isEmpty from 'lodash/isEmpty';
import clone from 'lodash/clone';
import find from 'lodash/find';
import filter from 'lodash/filter';
import isEqual from 'lodash/isEqual';

interface ButtonOption {
  [key: string]: any;
}

interface ButtonProps {
  conceptUuid?: string;
  enabled?: boolean;
  formFieldPath: string;
  multiSelect?: boolean;
  nameKey?: string;
  onValueChange: (value: any, errors: any[], skipValidation?: boolean) => void;
  options: ButtonOption[];
  validate: boolean;
  validateForm: boolean;
  validations: string[];
  value?: any;
  valueKey?: string;
}

export const Button: React.FC<ButtonProps> = memo(({
  conceptUuid,
  enabled = true,
  formFieldPath,
  multiSelect = false,
  nameKey = 'name',
  onValueChange,
  options,
  validate,
  validateForm,
  validations,
  value,
  valueKey = 'value'
}) => {
  // Helper functions
  const getErrors = useCallback((currentValue: any) => {
    const controlDetails = { validations, value: currentValue };
    return Validator.getErrors(controlDetails);
  }, [validations]);

  const hasErrors = useCallback((errors: any[]) => {
    return !isEmpty(errors);
  }, []);

  const isCreateByAddMore = useCallback(() => {
    return formFieldPath.split('-')[1] !== '0';
  }, [formFieldPath]);

  const getValueFromProps = useCallback(() => {
    if (value) {
      return multiSelect ? value : [value];
    }
    return undefined;
  }, [value, multiSelect]);

  const isActive = useCallback((option: ButtonOption) => {
    const currentValue = getValueFromProps();
    return find(currentValue, (val) => option[valueKey] === val[valueKey]);
  }, [getValueFromProps, valueKey]);

  // State management
  const [hasErrorsState, setHasErrorsState] = useState(() => {
    const initialErrors = getErrors(value) || [];
    return isCreateByAddMore() ? hasErrors(initialErrors) : false;
  });

  // Memoized values for performance
  const currentErrors = useMemo(() => getErrors(value), [getErrors, value]);
  const shouldShowErrors = useMemo(() => hasErrors(currentErrors), [hasErrors, currentErrors]);

  // Effect for component mount and validation
  useEffect(() => {
    if (hasErrorsState || value !== undefined || validateForm) {
      onValueChange(value, currentErrors, true);
    }
  }, []); // Only run on mount

  // Effect for validation and value changes
  useEffect(() => {
    if (validate || shouldShowErrors !== hasErrorsState) {
      setHasErrorsState(shouldShowErrors);
    }
  }, [validate, value, shouldShowErrors, hasErrorsState]);

  // Effect for triggering onValueChange when value changes
  useEffect(() => {
    if (shouldShowErrors) {
      onValueChange(value, currentErrors);
    }
  }, [value, currentErrors, shouldShowErrors, onValueChange]);

  // Value change handler
  const changeValue = useCallback((valueSelected: ButtonOption) => {
    const getValue = (selectedValue: ButtonOption) => {
      let currentValue = getValueFromProps() || [];
      
      if (isActive(selectedValue)) {
        if (multiSelect) {
          currentValue = filter(currentValue, (val) => val[valueKey] !== selectedValue[valueKey]);
        } else {
          currentValue = [];
        }
      } else {
        currentValue = multiSelect ? clone(currentValue) : [];
        currentValue.push(selectedValue);
      }
      
      return multiSelect ? currentValue : currentValue[0];
    };

    const newValue = getValue(valueSelected);
    const errors = getErrors(newValue);
    setHasErrorsState(hasErrors(errors));
    onValueChange(newValue, errors);
  }, [getValueFromProps, isActive, multiSelect, valueKey, getErrors, hasErrors, onValueChange]);

  // Render buttons
  const displayButtons = useMemo(() => {
    return map(options, (option, index) => (
      <button
        key={index}
        className={classNames('fl', { active: isActive(option) })}
        disabled={!enabled}
        id={option[nameKey]}
        onClick={() => changeValue(option)}
        title={option[nameKey]}
        type="button"
      >
        <i className="fa fa-ok" aria-hidden="true"></i>
        {option[nameKey]}
      </button>
    ));
  }, [options, isActive, enabled, nameKey, changeValue]);

  // Render component
  const className = classNames('form-control-buttons', { 
    'form-builder-error': hasErrorsState 
  });

  return (
    <div className={className} id={conceptUuid}>
      {displayButtons}
    </div>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  conceptUuid: PropTypes.string,
  enabled: PropTypes.bool,
  formFieldPath: PropTypes.string.isRequired,
  multiSelect: PropTypes.bool,
  nameKey: PropTypes.string,
  onValueChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  validate: PropTypes.bool.isRequired,
  validateForm: PropTypes.bool.isRequired,
  validations: PropTypes.array.isRequired,
  value: PropTypes.any,
  valueKey: PropTypes.string,
};

// Register component with ComponentStore
ComponentStore.registerComponent('button', Button);