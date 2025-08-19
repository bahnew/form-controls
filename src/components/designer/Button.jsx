import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import ComponentStore from 'src/helpers/componentStore';
import map from 'lodash/map';

export const ButtonDesigner = memo(({ options }) => {
  const getJsonDefinition = () => {
    return options;
  };

  const displayButtons = useMemo(() => {
    return map(options, (option, index) => (
      <button 
        key={index} 
        title={option.name}
        type="button"
        disabled
      >
        {option.name}
      </button>
    ));
  }, [options]);

  return (
    <div className="form-control-buttons">
      {displayButtons}
    </div>
  );
});

ButtonDesigner.displayName = 'ButtonDesigner';

ButtonDesigner.propTypes = {
  options: PropTypes.array.isRequired,
};

// Expose getJsonDefinition method for backward compatibility
ButtonDesigner.prototype = {
  getJsonDefinition() {
    return this.props.options;
  }
};

const descriptor = {
  control: ButtonDesigner,
  designProperties: {
    isTopLevelComponent: false,
  },
  metadata: {
    attributes: [],
  },
};

ComponentStore.registerDesignerComponent('button', descriptor);
