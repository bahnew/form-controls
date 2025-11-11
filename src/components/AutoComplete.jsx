import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { httpInterceptor } from 'src/helpers/httpInterceptor';
import ComponentStore from 'src/helpers/componentStore';
import get from 'lodash/get';
import { Validator } from 'src/helpers/Validator';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { Util } from 'src/helpers/Util';


export class AutoComplete extends Component {
  constructor(props) {
    super(props);
    this.optionsUrl = props.optionsUrl;
    this.terminologyServiceConfig = props.terminologyServiceConfig;
    this.childRef = undefined;
    this.getValue = this.getValue.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleMenuClose = this.handleMenuClose.bind(this);
    this.storeChildRef = this.storeChildRef.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.debouncedOnInputChange = Util.debounce(this.onInputChange, 300);
    const errors = this._getErrors(props.value) || [];
    const hasErrors = this._isCreateByAddMore() ? this._hasErrors(errors) : false;
    this.state = {
      value: get(props, 'value'),
      hasErrors,
      options: [],
      noResultsText: '',
    };
  }

  componentDidMount() {
    // Initialize options if conditions are met (moved from componentWillMount)
    if (
      !this.props.asynchronous &&
      this.props.minimumInput === 0 &&
      !this.props.url
    ) {
      this.setState({ options: this.props.options });
    }

    if (this.state.hasErrors || this.props.value !== undefined || this.props.validateForm) {
      this.props.onValueChange(this.props.value, this._getErrors(this.props.value));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props.value, nextProps.value) ||
      !isEqual(this.state.value, nextState.value) ||
      !isEqual(this.props.searchable, nextProps.searchable) ||
      (this.state.hasErrors !== nextState.hasErrors) ||
      !isEqual(this.state.options, nextState.options) ||
      this.state.noResultsText !== nextState.noResultsText ||
      this.props.enabled !== nextProps.enabled;
  }

  componentDidUpdate(prevProps) {
    // Update state when props change (moved from componentWillReceiveProps)
    if (!isEqual(prevProps.value, this.props.value) ||
        !isEqual(prevProps.validate, this.props.validate) ||
        (!this.props.searchable && !isEqual(prevProps.options, this.props.options))) {
      const value = get(this.props, 'value');
      const errors = this._getErrors(value);
      const hasErrors = this._hasErrors(errors);
      const options = (!isEqual(this.state.options, this.props.options) && !this.props.searchable) ?
        this.props.options : this.state.options;
      
      // Only update state if there are actual changes to prevent infinite loops
      if (!isEqual(this.state.value, value) || 
          this.state.hasErrors !== hasErrors || 
          !isEqual(this.state.options, options)) {
        this.setState({ value, hasErrors, options });
      }
    }

    // Handle error callbacks (moved from original componentDidUpdate)
    const errors = this._getErrors(this.state.value);
    if (this._hasErrors(errors)) {
      this.props.onValueChange(this.state.value, errors);
    }
  }

  onInputChange(input) {
    const { options, url } = this.props;
    const { getAnswers, formatConcepts } = Util;

    if (input.length < this.props.minimumInput) {
      this.setState({ options: [], noResultsText: 'Type to search' });
      return;
    }

    if (url) {
      getAnswers(url, input, this.terminologyServiceConfig.limit || 30)
        .then(data => {
          const responses = formatConcepts(data);
          this.setState({
            options: responses,
            noResultsText: 'No Results Found',
          });
        })
        .catch(() => {
          this.setState({ options: [], noResultsText: 'No Results Found' });
        });
    } else {
      const searchedInputs = input.trim().split(' ');
      const filteredOptions = options.filter(option =>
        searchedInputs.every(searchedInput =>
          option.name.match(new RegExp(searchedInput, 'gi'))
        )
      );
      this.setState({
        options: filteredOptions,
        noResultsText: 'No Results Found',
      });
    }
  }

  getOptions(input = '') {
    const { optionsUrl, minimumInput } = this.props;
    if (input.length >= minimumInput) {
      return httpInterceptor.get(optionsUrl + input)
        .then((data) => {
          const options = data.results;
          return { options };
        }).catch(() => {
          const options = [];
          return { options };
        });
    }
    return Promise.resolve();
  }

  getValue() {
    if (this.state.value) {
      const value = this.props.multiSelect ? this.state.value : [this.state.value];
      return value.map(val => ({ ...val, uuid: val.uuid || val.value }));
    }
    return [];
  }

  handleChange(value) {
    const errors = this._getErrors(value);
    if (!this.props.asynchronous && this.props.minimumInput !== 0) {
      this.setState({ options: [], noResultsText: '' });
    }
    if (Array.isArray(value) && value.length === 0) {
      this.setState({ value: undefined, hasErrors: this._hasErrors(errors) });
      if (this.props.onValueChange) {
        this.props.onValueChange(undefined, errors);
      }
    } else {
      this.setState({ value, hasErrors: this._hasErrors(errors) });
      if (this.props.onValueChange) {
        this.props.onValueChange(value, errors);
      }
    }
  }

  storeChildRef(ref) {
    if (ref) this.childRef = ref;
  }

  handleFocus() {
    // LoadOptions is no longer exposed via ref
    // The component handles this internally when defaultOptions is set
    // This method is kept for backward compatibility but doesn't need to do anything
  }

  handleMenuClose() {
  }

  handleKeyDown(event) {
    // When backspace is pressed and there's a selected value, clear it completely
    if (event.key === 'Backspace' && this.state.value && !this.props.multiSelect) {
      // Simple approach: if there's a value selected, clear it on backspace
      event.preventDefault();
      this.handleChange(undefined);
    }
  }

  _getErrors(value) {
    const validations = this.props.validations;
    const controlDetails = { validations, value };
    return Validator.getErrors(controlDetails);
  }

  _hasErrors(errors) {
    return !isEmpty(errors);
  }

  _isCreateByAddMore() {
    return (this.props.formFieldPath.split('-')[1] !== '0');
  }

  render() {
    const { autofocus, autoload, cache, enabled, filterOptions, labelKey, valueKey,
      asynchronous, multiSelect, minimumInput, searchable, conceptUuid } = this.props;
    const props = {
      autofocus,
      backspaceRemovesValue: true,
      isClearable: true,
      isDisabled: !enabled,
      filterOption: filterOptions,
      getOptionLabel: (option) => option[labelKey],
      getOptionValue: (option) => option[valueKey],
      minimumInput,
      isMulti: multiSelect,
      onChange: this.handleChange,
      value: this.state.value,
      isSearchable: searchable,
      matchProp: 'label',
      styles: {
        container: (base) => ({
          ...base,
          width: '100%',
          minWidth: '500px',
        }),
        control: (base, state) => ({
          ...base,
          minHeight: '36px',
          maxHeight: '36px',
          height: '36px',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }),
        valueContainer: (base) => ({
          ...base,
          height: '34px',
          maxHeight: '34px',
          padding: '0 8px',
          display: 'flex',
          flexWrap: 'nowrap',
          overflow: 'hidden',
        }),
        singleValue: (base) => ({
          ...base,
          maxWidth: 'calc(100% - 8px)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }),
        input: (base) => ({
          ...base,
          margin: '0',
          padding: '0',
          height: '32px',
        }),
        indicatorsContainer: (base) => ({
          ...base,
          height: '34px',
        }),
        clearIndicator: (base, state) => ({
          ...base,
          padding: '8px',
          cursor: 'pointer',
          color: '#999',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ':hover': {
            color: '#D0021B',
          },
        }),
        dropdownIndicator: (base) => ({
          ...base,
          padding: '8px',
        }),
        menu: (base) => ({
          ...base,
          position: 'fixed',
          width: 'auto',
          minWidth: '500px',
          zIndex: 9999,
        }),
        menuList: (base) => ({
          ...base,
          maxHeight: '400px',
          minHeight: '200px',
        }),
        multiValue: (base) => ({
          ...base,
          maxWidth: '100%',
        }),
      },
    };
    const className =
      classNames('obs-control-select-wrapper', { 'form-builder-error': this.state.hasErrors });
    if (asynchronous) {
      return (
        <div className={className}>
          <AsyncSelect
            id={conceptUuid}
            {...props}
          classNamePrefix="needsclick"
          defaultOptions={autoload}
          cacheOptions={cache}
          loadOptions={this.getOptions}
          onFocus={this.handleFocus}
          onKeyDown={this.handleKeyDown}
          ref={this.storeChildRef}
          />
        </div>
      );
    }
    return (
      <div className={className}>
        <Select
          id={conceptUuid}
          {...props}
          classNamePrefix="needsclick"
          filterOption={null}
          noOptionsMessage={() => this.state.noResultsText}
          onInputChange={this.debouncedOnInputChange}
          onKeyDown={this.handleKeyDown}
          options={this.state.options}
          ref={this.storeChildRef}
        />
      </div>
    );
  }
}

AutoComplete.propTypes = {
  asynchronous: PropTypes.bool,
  autofocus: PropTypes.bool,
  autoload: PropTypes.bool,
  cache: PropTypes.bool,
  conceptUuid: PropTypes.string,
  enabled: PropTypes.bool,
  filterOptions: PropTypes.func,
  formFieldPath: PropTypes.string,
  labelKey: PropTypes.string,
  minimumInput: PropTypes.number,
  multiSelect: PropTypes.bool,
  onValueChange: PropTypes.func,
  options: PropTypes.array,
  optionsUrl: PropTypes.string,
  searchable: PropTypes.bool,
  terminologyServiceConfig: PropTypes.object,
  url: PropTypes.string,
  validate: PropTypes.bool,
  validateForm: PropTypes.bool,
  validations: PropTypes.array,
  value: PropTypes.any,
  valueKey: PropTypes.string,
};

AutoComplete.defaultProps = {
  asynchronous: true,
  autofocus: false,
  autoload: false,
  cache: false,
  enabled: true,
  formFieldPath: '-0',
  labelKey: 'display',
  minimumInput: 3,
  multiSelect: false,
  optionsUrl: '/openmrs/ws/rest/v1/concept?v=full&q=',
  url: '',
  valueKey: 'uuid',
  searchable: true,
};

const descriptor = {
  control: AutoComplete,
  designProperties: {
    isTopLevelComponent: false,
  },
  metadata: {
    attributes: [
      {
        name: 'properties',
        dataType: 'complex',
        attributes: [],
      },
    ],
  },
};


ComponentStore.registerDesignerComponent('autoComplete', descriptor);

ComponentStore.registerComponent('autoComplete', AutoComplete);
