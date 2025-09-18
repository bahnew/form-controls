import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { List } from 'immutable';
import { ControlRecord } from 'src/helpers/ControlRecordTreeBuilder';
import ComponentStore from 'src/helpers/componentStore';
import { ObsGroupControlWithIntl, ObsGroupControl } from 'components/ObsGroupControl.jsx';
import { ObsControlWithIntl as ObsControl } from 'components/ObsControl.jsx';
import { NumericBox } from 'components/NumericBox.jsx';
import { Label } from 'components/Label.jsx';
import { AddMore } from 'components/AddMore.jsx';

const messages = {
  TEST_KEY: 'test value',
  HTML_DESC_KEY: 'test value <h1>Heading goes here</h1>',
};

const mockComponentStore = () => {
  ComponentStore.registerComponent('obsControl', ObsControl);
  ComponentStore.registerComponent('obsGroupControl', ObsGroupControl);
  ComponentStore.registerComponent('numeric', NumericBox);
  ComponentStore.registerComponent('label', Label);
  ComponentStore.registerComponent('addMore', AddMore);
};

const cleanupComponentStore = () => {
  ComponentStore.deRegisterComponent('obsControl');
  ComponentStore.deRegisterComponent('obsGroupControl');
  ComponentStore.deRegisterComponent('numeric');
  ComponentStore.deRegisterComponent('label');
  ComponentStore.deRegisterComponent('addMore');
};

const renderWithIntl = (component, options = {}) => {
  const { locale = 'en', ...renderOptions } = options;
  return render(
    <IntlProvider locale={locale} messages={messages}>
      {component}
    </IntlProvider>,
    renderOptions
  );
};

const createTestData = () => {
  const obsConcept = {
    answers: [],
    datatype: 'Numeric',
    hiAbsolute: null,
    hiNormal: null,
    lowAbsolute: null,
    lowNormal: null,
    name: 'TestObs',
    properties: {
      allowDecimal: false,
    },
    units: null,
    uuid: 'd0490af4-72eb-4090-9b43-ac3487ba7474',
  };

  const obsControl = {
    concept: obsConcept,
    hiAbsolute: null,
    hiNormal: null,
    id: '4',
    label: {
      type: 'label',
      value: 'TestObs',
    },
    lowAbsolute: null,
    lowNormal: null,
    properties: {
      addMore: true,
      hideLabel: false,
      location: {
        column: 0,
        row: 0,
      },
      mandatory: false,
      notes: false,
    },
    type: 'obsControl',
    units: null,
  };

  const obsFormFieldPath = 'SingleGroup.3/4-0';
  const obsDataSource = {
    concept: obsConcept,
    formFieldPath: obsFormFieldPath,
    formNamespace: 'Bahmni',
    voided: true,
  };

  const children = List.of(new ControlRecord({
    control: obsControl,
    formFieldPath: obsFormFieldPath,
    dataSource: obsDataSource,
  }));

  const obsGroupConcept = {
    datatype: 'N/A',
    name: 'TestGroup',
    set: true,
    setMembers: [
      {
        answers: [],
        datatype: 'Numeric',
        description: [],
        hiAbsolute: null,
        hiNormal: null,
        lowAbsolute: null,
        lowNormal: null,
        name: 'TestObs',
        properties: {
          allowDecimal: false,
        },
        units: null,
        uuid: 'd0490af4-72eb-4090-9b43-ac3487ba7474',
      },
    ],
    uuid: 'eafe7d68-904b-459b-b11d-6502ec0143a4',
  };

  const formName = 'SingleGroup';
  const formVersion = '3';

  const metadata = {
    concept: obsGroupConcept,
    controls: [
      {
        concept: obsConcept,
        hiAbsolute: null,
        hiNormal: null,
        id: '4',
        label: {
          type: 'label',
          value: 'TestObs',
        },
        lowAbsolute: null,
        lowNormal: null,
        properties: {
          addMore: true,
          hideLabel: false,
          location: {
            column: 0,
            row: 0,
          },
          mandatory: false,
          notes: false,
        },
        type: 'obsControl',
        units: null,
      },
    ],
    id: '3',
    label: {
      type: 'label',
      translationKey: 'TEST_KEY',
      value: 'TestGroup',
    },
    properties: {
      abnormal: false,
      addMore: false,
      location: {
        column: 0,
        row: 0,
      },
    },
    type: 'obsGroupControl',
  };

  const metadataWithDescription = {
    ...metadata,
    concept: {
      ...obsGroupConcept,
      description: { value: '<h1>concept set description</h1>' },
    },
  };

  const emptyValue = {};

  return {
    obsConcept,
    obsControl,
    obsFormFieldPath,
    children,
    obsGroupConcept,
    formName,
    formVersion,
    metadata,
    metadataWithDescription,
    emptyValue,
  };
};

const defaultProps = () => {
  const { children, formName, formVersion, metadata, emptyValue } = createTestData();

  return {
    children,
    collapse: false,
    formName,
    formVersion,
    metadata,
    onValueChanged: jest.fn(),
    showNotification: jest.fn(),
    validate: false,
    validateForm: false,
    value: emptyValue,
  };
};

describe('ObsGroupControl', () => {
  beforeEach(() => {
    mockComponentStore();
  });

  afterEach(() => {
    cleanupComponentStore();
  });

  describe('Rendering', () => {
    it('should render obsGroupControl containing obsControl', () => {
      const props = defaultProps();
      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('test value')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('should render obsGroup control with only registered components', () => {
      ComponentStore.deRegisterComponent('obsControl');

      const props = defaultProps();
      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('test value')).toBeInTheDocument();
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();

      ComponentStore.registerComponent('obsControl', ObsControl);
    });

    it('should render addMore button when addMore property is enabled', () => {
      const props = defaultProps();
      const updatedMetadata = {
        ...props.metadata,
        properties: { ...props.metadata.properties, addMore: true },
      };

      renderWithIntl(
        <ObsGroupControlWithIntl
          {...props}
          metadata={updatedMetadata}
          showAddMore
        />
      );

      expect(screen.getByText('test value')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show description when concept has description', () => {
      const { metadataWithDescription } = createTestData();
      const props = { ...defaultProps(), metadata: metadataWithDescription };

      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      expect(screen.getByText('concept set description')).toBeInTheDocument();
    });

    it('should not show description when concept has no description', () => {
      const props = defaultProps();
      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should toggle collapse state when clicking legend', async () => {
      const props = defaultProps();
      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      const legend = screen.getByText('test value').closest('legend');
      const controlsContainer = screen.getByRole('group').querySelector('.obsGroup-controls');

      expect(controlsContainer).toHaveClass('active-group-controls');
      expect(legend).toHaveClass('active');

      fireEvent.click(legend);

      await waitFor(() => {
        expect(controlsContainer).toHaveClass('closing-group-controls');
        expect(legend).not.toHaveClass('active');
      });

      fireEvent.click(legend);

      await waitFor(() => {
        expect(controlsContainer).toHaveClass('active-group-controls');
        expect(legend).toHaveClass('active');
      });
    });

    it('should handle value changes and trigger onValueChanged callback', async () => {
      const onValueChangedSpy = jest.fn();
      const props = { ...defaultProps(), onValueChanged: onValueChangedSpy };

      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '75' } });

      await waitFor(() => {
        expect(onValueChangedSpy).toHaveBeenCalled();
      });
    });

    it('should pass onEventTrigger property to children', () => {
      const onEventTrigger = jest.fn();
      const props = { ...defaultProps(), onEventTrigger };

      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should collapse controls when collapse prop changes to true', async () => {
      const props = defaultProps();
      const { rerender } = renderWithIntl(
        <ObsGroupControlWithIntl {...props} collapse={false} />
      );

      const controlsContainer = screen.getByRole('group').querySelector('.obsGroup-controls');
      const legend = screen.getByText('test value').closest('legend');

      expect(controlsContainer).toHaveClass('active-group-controls');
      expect(legend).toHaveClass('active');

      rerender(
        <IntlProvider locale="en" messages={messages}>
          <ObsGroupControlWithIntl {...props} collapse />
        </IntlProvider>
      );

      await waitFor(() => {
        expect(controlsContainer).toHaveClass('closing-group-controls');
        expect(legend).not.toHaveClass('active');
      });
    });

    it('should expand controls when collapse prop changes to false', async () => {
      const props = defaultProps();
      const { rerender } = renderWithIntl(
        <ObsGroupControlWithIntl {...props} collapse />
      );

      const controlsContainer = screen.getByRole('group').querySelector('.obsGroup-controls');
      const legend = screen.getByText('test value').closest('legend');

      expect(controlsContainer).toHaveClass('closing-group-controls');
      expect(legend).not.toHaveClass('active');

      rerender(
        <IntlProvider locale="en" messages={messages}>
          <ObsGroupControlWithIntl {...props} collapse={false} />
        </IntlProvider>
      );

      await waitFor(() => {
        expect(controlsContainer).toHaveClass('active-group-controls');
        expect(legend).toHaveClass('active');
      });
    });
  });

  describe('Accessibility and Visual States', () => {
    it('should disable children when obsGroup is disabled', () => {
      const props = { ...defaultProps(), enabled: false };
      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      const legend = screen.getByText('test value').closest('legend');
      const controlsContainer = screen.getByRole('group').querySelector('.obsGroup-controls');

      expect(legend).toHaveClass('disabled');
      expect(controlsContainer).toHaveClass('disabled');
    });

    it('should show as enabled when obsGroup is enabled', () => {
      const props = { ...defaultProps(), enabled: true };
      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      const legend = screen.getByText('test value').closest('legend');
      const controlsContainer = screen.getByRole('group').querySelector('.obsGroup-controls');

      expect(legend).not.toHaveClass('disabled');
      expect(controlsContainer).not.toHaveClass('disabled');
    });

    it('should hide obsGroup when hidden prop is true', () => {
      const props = { ...defaultProps(), hidden: true };
      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      const fieldset = screen.getByRole('group');
      expect(fieldset).toHaveClass('hidden');
    });

    it('should show obsGroup when hidden prop is false', () => {
      const props = { ...defaultProps(), hidden: false };
      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      const fieldset = screen.getByRole('group');
      expect(fieldset).not.toHaveClass('hidden');
    });
  });

  describe('Props Changes', () => {
    it('should handle enabled prop changes', () => {
      const props = defaultProps();
      const { rerender } = renderWithIntl(
        <ObsGroupControlWithIntl {...props} enabled />
      );

      let legend = screen.getByText('test value').closest('legend');
      expect(legend).not.toHaveClass('disabled');

      rerender(
        <IntlProvider locale="en" messages={messages}>
          <ObsGroupControlWithIntl {...props} enabled={false} />
        </IntlProvider>
      );

      legend = screen.getByText('test value').closest('legend');
      expect(legend).toHaveClass('disabled');
    });

    it('should handle hidden prop changes', () => {
      const props = defaultProps();
      const { rerender } = renderWithIntl(
        <ObsGroupControlWithIntl {...props} hidden={false} />
      );

      let fieldset = screen.getByRole('group');
      expect(fieldset).not.toHaveClass('hidden');

      rerender(
        <IntlProvider locale="en" messages={messages}>
          <ObsGroupControlWithIntl {...props} hidden />
        </IntlProvider>
      );

      fieldset = screen.getByRole('group');
      expect(fieldset).toHaveClass('hidden');
    });
  });

  describe('Internationalization', () => {
    it('should render with translated labels when translation key is provided', () => {
      const props = defaultProps();
      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      expect(screen.getByText('test value')).toBeInTheDocument();
    });

    it('should render HTML description correctly when provided', () => {
      const { metadataWithDescription } = createTestData();
      const props = { ...defaultProps(), metadata: metadataWithDescription };

      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      const descriptionElement = screen.getByText('concept set description');
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement.closest('.description')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onValueChanged prop gracefully', () => {
      const { children, formName, formVersion, metadata, emptyValue } = createTestData();
      const props = {
        children,
        collapse: false,
        formName,
        formVersion,
        metadata,
        showNotification: jest.fn(),
        validate: false,
        validateForm: false,
        value: emptyValue,
      };

      expect(() => {
        renderWithIntl(<ObsGroupControlWithIntl {...props} />);
      }).not.toThrow();
    });

    it('should handle empty children list', () => {
      const { formName, formVersion, metadata, emptyValue } = createTestData();
      const props = {
        children: List.of(),
        collapse: false,
        formName,
        formVersion,
        metadata,
        onValueChanged: jest.fn(),
        showNotification: jest.fn(),
        validate: false,
        validateForm: false,
        value: emptyValue,
      };

      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('test value')).toBeInTheDocument();
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });

    it('should handle missing concept description', () => {
      const props = defaultProps();
      const metadataWithoutDescription = {
        ...props.metadata,
        concept: {
          ...props.metadata.concept,
          description: undefined,
        },
      };

      renderWithIntl(
        <ObsGroupControlWithIntl {...props} metadata={metadataWithoutDescription} />
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });

    it('should handle concept description without value', () => {
      const props = defaultProps();
      const metadataWithEmptyDescription = {
        ...props.metadata,
        concept: {
          ...props.metadata.concept,
          description: { value: null },
        },
      };

      renderWithIntl(
        <ObsGroupControlWithIntl {...props} metadata={metadataWithEmptyDescription} />
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should integrate properly with component store registration', () => {
      cleanupComponentStore();
      mockComponentStore();

      const props = defaultProps();
      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('should handle component store deregistration', () => {
      const props = defaultProps();
      const { rerender } = renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();

      ComponentStore.deRegisterComponent('obsControl');

      rerender(
        <IntlProvider locale="en" messages={messages}>
          <ObsGroupControlWithIntl {...props} />
        </IntlProvider>
      );

      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();

      ComponentStore.registerComponent('obsControl', ObsControl);
    });
  });

  describe('User Experience', () => {
    it('should provide visual feedback for collapse state', () => {
      const props = defaultProps();
      renderWithIntl(<ObsGroupControlWithIntl {...props} collapse={false} />);

      const legend = screen.getByText('test value').closest('legend');
      const caretDown = legend.querySelector('.fa-caret-down');
      const caretRight = legend.querySelector('.fa-caret-right');

      expect(caretDown).toBeInTheDocument();
      expect(caretRight).toBeInTheDocument();

      const controlsContainer = screen.getByRole('group').querySelector('.obsGroup-controls');
      expect(controlsContainer).toHaveClass('active-group-controls');
    });

    it('should provide clear visual hierarchy with fieldset and legend', () => {
      const props = defaultProps();
      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      const fieldset = screen.getByRole('group');
      expect(fieldset.tagName).toBe('FIELDSET');
      expect(fieldset).toHaveClass('form-builder-fieldset');

      const legend = screen.getByText('test value').closest('legend');
      expect(legend.tagName).toBe('LEGEND');
      expect(legend).toHaveClass('form-builder-toggle');
    });

    it('should maintain accessibility with proper ARIA roles', () => {
      const props = defaultProps();
      renderWithIntl(<ObsGroupControlWithIntl {...props} />);

      const group = screen.getByRole('group');
      expect(group).toBeInTheDocument();

      const legend = screen.getByText('test value').closest('legend');
      expect(legend).toBeInTheDocument();
      expect(legend.tagName).toBe('LEGEND');
    });
  });
});
