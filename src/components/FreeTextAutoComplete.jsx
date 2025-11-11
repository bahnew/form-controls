import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/creatable';
import ComponentStore from 'src/helpers/componentStore';

export class FreeTextAutoComplete extends Component {
  constructor(props) {
    super(props);
    const { options, value } = props;
    this.state = { options, value };
    this.handleOnChange = this.handleOnChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    // Update state when props change (moved from componentWillReceiveProps)
    if (prevProps.options !== this.props.options ||
        prevProps.value !== this.props.value) {
      this.setState({ options: this.props.options, value: this.props.value });
    }
  }

  handleOnChange(value) {
    this.setState({ value });
    const { type, translationKey, locale } = this.props;
    this.props.onChange(value, type, translationKey, locale);
  }

  render() {
    const { options, value } = this.state;
    const { multi, clearable, backspaceRemoves, deleteRemoves } = this.props;
    return (
      <CreatableSelect
        backspaceRemovesValue={backspaceRemoves}
        isClearable={clearable}
        id={this.props.conceptUuid}
        isMulti={multi}
        onChange={this.handleOnChange}
        options={options}
        value={value}
      />
    );
  }
}

FreeTextAutoComplete.propTypes = {
  backspaceRemoves: PropTypes.bool.isRequired,
  clearable: PropTypes.bool.isRequired,
  conceptUuid: PropTypes.string,
  deleteRemoves: PropTypes.bool.isRequired,
  locale: PropTypes.string,
  multi: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  translationKey: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
};

FreeTextAutoComplete.defaultProps = {
  multi: false,
  clearable: false,
  backspaceRemoves: false,
  deleteRemoves: false,
};


ComponentStore.registerComponent('freeTextAutoComplete', FreeTextAutoComplete);
